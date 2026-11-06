import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1];shots=root/'qa/screenshots/locales';shots.mkdir(parents=True,exist_ok=True)
report={};errors=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 page.on('pageerror',lambda e:errors.append(str(e)))
 for locale in ['ru','en','ro']:
  url='http://127.0.0.1:3000/codex-workspace/'+('' if locale=='ru' else locale+'/')
  page.goto(url,wait_until='networkidle');page.evaluate("document.documentElement.style.scrollBehavior='auto'")
  assert page.locator('html').get_attribute('lang')==locale
  assert page.locator('.language-switcher [aria-current=page]').inner_text()==locale.upper()
  assert page.locator('h1').count()==1
  assert page.locator('[data-accordion=services] h3 button').count()==4
  assert page.locator('[data-accordion=faq] h3 button').count()==6
  assert page.locator('[data-publication=true]').count()==25
  if locale!='ru':
   text=page.locator('body').inner_text();assert not re.search('[А-Яа-яЁё]',text),(locale,text)
  assert page.locator('.footer-grid a').filter(has_text='Facebook').get_attribute('href')=='https://www.facebook.com/digolrepro/'
  for width in [1280,1440,1920]:
   page.set_viewport_size({'width':width,'height':1000});page.wait_for_timeout(150)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(locale,width)
   assert page.locator('.site-header').evaluate('(e)=>{const a=e.querySelector("nav").getBoundingClientRect(),b=e.querySelector(".language-switcher").getBoundingClientRect(),c=e.querySelector(".wordmark").getBoundingClientRect();return c.right<a.left&&a.right<b.left}'),(locale,width,'header overlap')
  page.set_viewport_size({'width':1440,'height':1000});page.screenshot(path=str(shots/f'{locale}-hero.png'))
  for accordion in ['services','faq','development','publications']:
   for button in page.locator(f'[data-accordion={accordion}] h3 button').all():
    button.click();assert button.get_attribute('aria-expanded')=='true'
    assert page.locator(f'[data-accordion={accordion}] .is-open').count()==1
   page.locator(f'[data-accordion={accordion}] h3 button').last.click()
  # Preserve FAQ bullet lists in both translated locales.
  page.locator('[data-accordion=faq] h3 button').nth(1).click();assert page.locator('[data-accordion=faq] .is-open li').count()==3
  page.locator('[data-accordion=faq] h3 button').nth(4).click();assert page.locator('[data-accordion=faq] .is-open li').count()==2
  page.locator('[data-accordion=faq] h3 button').nth(4).click()
  for gallery in page.locator('.gallery').all():
   gallery.locator('.gallery-thumbnails button').nth(1).click();assert gallery.locator('.gallery-thumbnails button').nth(1).get_attribute('aria-pressed')=='true'
  page.locator('.reputation-gallery .gallery-main').click();assert page.locator('dialog').evaluate('(e)=>e.open');page.keyboard.press('Escape');assert not page.locator('dialog').evaluate('(e)=>e.open')
  page.locator('[data-accordion=services] h3 button').first.click();page.locator('#section-9').screenshot(path=str(shots/f'{locale}-services.png'))
  for y in range(0,page.evaluate('document.body.scrollHeight'),900):page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_timeout(50)
  page.wait_for_timeout(800)
  assert page.locator('img').evaluate_all('(es)=>es.every(e=>e.complete&&e.naturalWidth>0)')
  for code in ['ru','en','ro']:
   link=page.locator(f'.language-switcher a[hreflang={code}]');assert link.get_attribute('href')=='/codex-workspace/'+('' if code=='ru' else code+'/')
  # Exercise real language navigation with the current section retained.
  page.evaluate("location.hash='contacts'")
  next_code={'ru':'en','en':'ro','ro':'ru'}[locale]
  page.locator(f'.language-switcher a[hreflang={next_code}]').click();page.wait_for_load_state('networkidle')
  assert page.locator('html').get_attribute('lang')==next_code and page.url.endswith('#contacts')
  report[locale]={'widths':[1280,1440,1920],'services':4,'faq':6,'publications':25,'languageNavigation':'passed','accordions':'passed','galleries':'passed','lightbox':'passed','images':'passed'}
 # Real animation enabled: inspect reveal and parallax at two scroll positions.
 page.emulate_media(reduced_motion='no-preference');page.goto('http://127.0.0.1:3000/codex-workspace/ro/',wait_until='networkidle');page.evaluate("document.documentElement.style.scrollBehavior='auto'")
 img=page.locator('#section-4 .parallax-image');top=img.evaluate('(e)=>e.parentElement.offsetTop');values=[]
 for offset in [-700,-200]:
  page.evaluate('(y)=>scrollTo(0,y)',top+offset);page.wait_for_timeout(1100);values.append(img.evaluate('(e)=>new DOMMatrix(getComputedStyle(e).transform).m42'))
 assert abs(values[1]-values[0])>3
 assert not errors,errors
 report['errors']=errors;report['motion']='passed';b.close()
(root/'qa/locales.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
