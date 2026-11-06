import json
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1];shots=root/'qa/screenshots/responsive';shots.mkdir(parents=True,exist_ok=True)
report={'widths':[360,390,430,600,700,768,820,900,1024,1100,1101,1280,1440,1920],'locales':{},'errors':[]};failures=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True,reduced_motion='reduce')
 page.on('pageerror',lambda e:report['errors'].append(str(e)))
 for lang in ['ru','en','ro']:
  url='http://127.0.0.1:3000/codex-workspace/'+('' if lang=='en' else lang+'/')
  page.goto(url,wait_until='networkidle');page.evaluate("document.documentElement.style.scrollBehavior='auto'")
  assert page.locator('html').get_attribute('lang')==lang
  if lang=='ru':
   report['firstMobileHeroSource']=page.locator('.hero-photo').evaluate('(e)=>e.currentSrc');assert 'responsive/hero-' in report['firstMobileHeroSource']
  assert page.locator('[data-publication=true]').count()==25
  assert page.locator('[data-accordion=services] h3 button').count()==4
  assert page.locator('[data-accordion=faq] h3 button').count()==6
  measurements=[]
  for width in report['widths']:
   page.set_viewport_size({'width':width,'height':844});page.wait_for_timeout(100)
   result=page.evaluate('''()=>{const h=document.querySelector('.site-header'),brand=h.querySelector('.wordmark').getBoundingClientRect(),langs=h.querySelector('.language-switcher').getBoundingClientRect(),button=h.querySelector('.menu-toggle').getBoundingClientRect(),nav=h.querySelector('nav').getBoundingClientRect();return {width:innerWidth,scroll:document.documentElement.scrollWidth,headerFits:brand.right<= (innerWidth<=1100?langs.left:nav.left)+1&&(innerWidth<=1100?langs.right<=button.left+1:nav.right<=langs.left+1),menuVisible:getComputedStyle(h.querySelector('.menu-toggle')).display!=='none',galleryDirection:getComputedStyle(document.querySelector('.gallery-thumbnails')).flexDirection}}''')
   if result['scroll']>width or not result['headerFits']:failures.append((lang,result))
   assert result['menuVisible']==(width<=1100)
   assert result['galleryDirection']==('row' if width<=700 else 'column')
   measurements.append(result)
  print(lang, 'width scan:', [f for f in failures if f[0]==lang], flush=True)
  page.set_viewport_size({'width':390,'height':844});page.reload(wait_until='networkidle');page.evaluate("document.documentElement.style.scrollBehavior='auto';scrollTo(0,0)");page.wait_for_timeout(300)
  assert 'responsive/hero-' in page.locator('.hero-photo').get_attribute('srcset')
  page.screenshot(path=str(shots/f'{lang}-hero-390.png'))
  toggle=page.locator('.menu-toggle');toggle.tap();assert toggle.get_attribute('aria-expanded')=='true';assert page.locator('#mobile-menu').evaluate('(e)=>e.open')
  assert page.locator('body').evaluate('(e)=>e.style.overflow')=='hidden'
  # Native modal contains focus and Escape returns it to the trigger.
  for _ in range(16):
   page.keyboard.press('Tab');assert page.evaluate("document.querySelector('#mobile-menu').contains(document.activeElement)")
  page.keyboard.press('Escape');assert toggle.get_attribute('aria-expanded')=='false';assert toggle.evaluate('(e)=>e===document.activeElement')
  assert page.locator('body').evaluate('(e)=>e.style.overflow')==''
  toggle.tap();page.screenshot(path=str(shots/f'{lang}-menu-390.png'))
  page.locator('#mobile-menu nav a[href="#section-9"]').count() # services is reached by ordinary page scroll
  page.locator('#mobile-menu nav a[href="#section-3"]').tap();page.wait_for_timeout(250)
  assert not page.locator('#mobile-menu').evaluate('(e)=>e.open');assert page.url.endswith('#section-3')
  assert page.locator('#section-3').bounding_box()['y']>=75
  for a in ['services','faq','development','publications']:
   buttons=page.locator(f'[data-accordion={a}] h3 button')
   for button in buttons.all():
    button.tap();assert button.get_attribute('aria-expanded')=='true'
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(lang,a)
   buttons.last.tap()
  page.locator('[data-accordion=services] h3 button').first.tap();page.locator('#section-9').screenshot(path=str(shots/f'{lang}-services-390.png'))
  page.locator('[data-accordion=faq] h3 button').nth(1).tap();assert page.locator('[data-accordion=faq] .is-open li').count()==3
  if lang=='ru':page.locator('#section-12').screenshot(path=str(shots/'ru-faq-390.png'))
  for gallery in page.locator('.gallery').all():
   thumb=gallery.locator('.gallery-thumbnails button').last;thumb.tap();assert thumb.get_attribute('aria-pressed')=='true'
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.locator('.reputation-gallery .gallery-main').tap();assert page.locator('.lightbox').evaluate('(e)=>e.open')
  assert page.locator('.lightbox').bounding_box()['width']<=390
  page.locator('.dialog-close').tap();assert not page.locator('.lightbox').evaluate('(e)=>e.open')
  if lang=='ru':
   for sid,name in [('section-3','doctor'),('section-8','gallery'),('section-15','publications'),('contacts','contacts')]:
    page.locator('#'+sid).screenshot(path=str(shots/f'ru-{name}-390.png'))
  # Open menu during rotation; switching to desktop must dismiss it and restore scrolling.
  toggle.tap();page.set_viewport_size({'width':1280,'height':800});page.wait_for_timeout(200)
  assert not page.locator('#mobile-menu').evaluate('(e)=>e.open');assert page.locator('body').evaluate('(e)=>e.style.overflow')==''
  page.set_viewport_size({'width':390,'height':844});toggle.tap()
  next_lang={'ru':'en','en':'ro','ro':'ru'}[lang]
  page.locator(f'#mobile-menu a[hreflang={next_lang}]').tap();page.wait_for_load_state('networkidle')
  assert page.locator('html').get_attribute('lang')==next_lang
  report['locales'][lang]={'viewports':measurements,'menu':'passed','keyboard':'passed','accordions':'passed','galleries':'passed','rotation':'passed','languageMenu':'passed'}
 # Tablet and desktop visual regressions.
 page.goto('http://127.0.0.1:3000/codex-workspace/ro/',wait_until='networkidle');page.evaluate("document.documentElement.style.scrollBehavior='auto'")
 for width in [768,1024,1440]:
  page.set_viewport_size({'width':width,'height':1024});page.evaluate('scrollTo(0,0)');page.wait_for_timeout(150);page.screenshot(path=str(shots/f'ro-hero-{width}.png'))
  if width==768:
   for sid,name in [('section-3','doctor'),('section-9','services')]:page.locator('#'+sid).screenshot(path=str(shots/f'ro-{name}-768.png'))
 # Mobile normal motion: no parallax, all revealed content becomes visible after scrolling.
 page.set_viewport_size({'width':390,'height':844});page.emulate_media(reduced_motion='no-preference');page.goto('http://127.0.0.1:3000/codex-workspace/ru/',wait_until='networkidle');page.evaluate("document.documentElement.style.scrollBehavior='auto'")
 for y in range(0,page.evaluate('document.body.scrollHeight'),600):page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_timeout(60)
 page.wait_for_timeout(1500)
 assert page.locator('.parallax-image,.parallax-photo').evaluate_all("es=>es.every(e=>getComputedStyle(e).transform==='none')")
 assert page.locator('[data-reveal],[data-statement-reveal]').evaluate_all("es=>es.every(e=>Number(getComputedStyle(e).opacity)===1)")
 report['mobileMotion']='passed';report['failures']=failures
 b.close()
(root/'qa/responsive.json').write_text(json.dumps(report,indent=2));print(json.dumps({'failures':failures,'errors':report['errors']}));assert not failures and not report['errors']
