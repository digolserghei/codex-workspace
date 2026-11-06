'use client';

import {useEffect,useRef,useState,useId,type ReactNode} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import ru from '@/content/ru.json';

const external={target:'_blank',rel:'noopener noreferrer'};
const navigation=[['hero','Ирена Дигол'],['section-3','Врач'],['section-7','Репродуктология'],['section-10','ЭКО'],['section-13','Репутация'],['contacts','Контакты']];
const asset=(path:string)=>`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
const clinicalImages=[{src:'/images/gallery-embryo.webp',alt:'Научная визуализация бластоцисты'},{src:'/images/gallery-genetics.webp',alt:'Визуализация ДНК и репродуктивной генетики'},{src:'/images/gallery-newborn.webp',alt:'Спящий новорождённый — иллюстративная фотография'},{src:'/images/gallery-icsi.webp',alt:'Научная визуализация процедуры ИКСИ'}];
const reputationImages=Array.from({length:5},(_,i)=>({src:`/images/reputation-${i+1}.jpg`,alt:`Оригинальная фотография из галереи Ирены Дигол, ${i+1}`}));
function Arrow(){return <span aria-hidden="true" className="arrow"><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 16 16 4M4 4h12v12" stroke="currentColor" strokeWidth="1.2"/></svg></span>}
function Appointment({light=false}:{light?:boolean}){return <a className={`appointment ${light?'light':''}`} href={ru.appointment} {...external}><span>Записаться на прием</span><Arrow/></a>}
function Eyebrow({number,children}:{number:string,children:ReactNode}){return <div className="eyebrow"><span>{number}</span><span>{children}</span></div>}

function Accordion({items,name}:{items:{title:string,body:ReactNode}[],name:string}){
 const [active,setActive]=useState<number|null>(null); const uid=useId();
 return <div className="accordion" data-accordion={name} onTransitionEnd={event=>{if(event.propertyName==='grid-template-rows')ScrollTrigger.refresh()}}>{items.map((item,i)=><div className={`accordion-item ${active===i?'is-open':''}`} key={item.title}>
  <h3><button id={`${uid}-button-${i}`} aria-expanded={active===i} aria-controls={`${uid}-panel-${i}`} onClick={()=>setActive(active===i?null:i)}><span className="accordion-number">{String(i+1).padStart(2,'0')}</span><span>{item.title}</span><span className="plus" aria-hidden="true"/></button></h3>
  <div id={`${uid}-panel-${i}`} role="region" aria-labelledby={`${uid}-button-${i}`} aria-hidden={active!==i} inert={active!==i} className="accordion-panel"><div className="accordion-clip"><div className="accordion-body">{item.body}</div></div></div>
 </div>)}</div>
}
function Gallery({photos,name,zoom=false}:{photos:{src:string,alt:string}[],name:string,zoom?:boolean}){
 const [selected,setSelected]=useState(0);const dialog=useRef<HTMLDialogElement>(null);const main=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const d=dialog.current;const close=()=>{document.body.style.overflow='';main.current?.focus()};d?.addEventListener('close',close);return()=>{d?.removeEventListener('close',close);document.body.style.overflow=''}},[]);
 const picture=<>{photos.map((p,i)=><img key={p.src} src={asset(p.src)} alt={i===selected?p.alt:''} aria-hidden={i!==selected} className={i===selected?'selected':''} loading="lazy" width={1200} height={900}/>)}<span className="gallery-count" aria-live="polite">{String(selected+1).padStart(2,'0')} <span>/ {String(photos.length).padStart(2,'0')}</span></span>{zoom&&<span className="zoom-icon" aria-hidden="true"><Arrow/></span>}</>;
 return <div className={`gallery ${zoom?'reputation-gallery':''}`} aria-label={name}>
  {zoom?<button ref={main} className="gallery-main" aria-label="Увеличить выбранную фотографию" onClick={()=>{dialog.current?.showModal();document.body.style.overflow='hidden'}}>{picture}</button>:<div className="gallery-main">{picture}</div>}
  <div className="gallery-thumbnails" aria-label="Выбрать изображение">{photos.map((p,i)=><button key={p.src} onClick={()=>setSelected(i)} aria-pressed={i===selected} aria-label={`Изображение ${i+1}: ${p.alt}`} className={selected===i?'selected':''}><img src={asset(p.src)} alt="" loading="lazy" width={160} height={160}/><span>{String(i+1).padStart(2,'0')}</span></button>)}</div>
  {zoom&&<dialog ref={dialog} className="lightbox" aria-label="Увеличенная фотография" onClick={e=>{if(e.target===dialog.current)dialog.current.close()}}><button className="dialog-close" autoFocus aria-label="Закрыть изображение" onClick={()=>dialog.current?.close()}>Закрыть <span aria-hidden="true">×</span></button><img src={asset(photos[selected].src)} alt={photos[selected].alt} width={1200} height={1200}/><div className="dialog-navigation"><button onClick={()=>setSelected((selected+photos.length-1)%photos.length)} aria-label="Предыдущее изображение">←</button><span>{selected+1} / {photos.length}</span><button onClick={()=>setSelected((selected+1)%photos.length)} aria-label="Следующее изображение">→</button></div></dialog>}
 </div>
}
function structuredText(text:string){const clean=text.replace(/\u2028/g,'\n');return clean.split(/\n\s*\n|(?=\n\d+\.\s)/).map(p=>p.trim()).filter(Boolean)}
function EditorialList({text}:{text:string}){
 const paragraphs=structuredText(text);const blocks=paragraphs.slice(1).flatMap(p=>p.split(/\n(?=Мужской фактор)/));
 return <div className="editorial-list">{blocks.map((block,i)=>{const [title,...body]=block.split('\n');return <article className="editorial-item" key={title} data-reveal><span className="list-number">{String(i+1).padStart(2,'0')}</span><div><h3>{title.replace(/^\d+\.\s*/,'')}</h3><p>{body.join('\n')}</p></div></article>})}</div>
}
const textLinks:[string,string][]=[['Профилактические вакцины','https://repository.usmf.md/bitstream/20.500.12710/17883/1/PROFILAKTIChESKIE_VAKTsINY_PROTIV_VIRUSA_PAPILLOMY_ChELOVEKA.pdf'],['Факторы риска метастазирования','https://sciup.org/faktory-riska-metastazirovanija-raka-vulvy-v-pahovye-limfaticheskie-uzly-14055309'],['Вакцины против папилломавирусной инфекции','https://ibn.idsi.md/sites/default/files/imag_file/4.Vactini%20protiv%20papilomavirusnoi%20infectii.pdf'],['Распространенность онкогенных типов','https://ibn.idsi.md/sites/default/files/imag_file/5.Rasprostraneonasti%20oncoghenih%20tipov%20VPC%20v%20asotiatii%20s%20infectiiami.pdf']];
function Bibliography({text}:{text:string}){
 const link=textLinks.find(([match])=>text.includes(match));const parts=text.split(/(10\.\d{4,9}\/[^\s]+|PMID:\s*\d+)/g);
 return <>{parts.map((part,i)=>{if(part.startsWith('10.')){const doi=part.replace(/\.$/,'');return <a key={i} href={`https://doi.org/${doi}`} {...external}>{part}</a>}if(part.startsWith('PMID:'))return <a key={i} href={`https://pubmed.ncbi.nlm.nih.gov/${part.replace(/\D/g,'')}/`} {...external}>{part}</a>;return <span key={i}>{link?part.replace(/Полный текст\.|Запись и текст публикации\./g,''):part}</span>})}{link&&<a className="paper-link" href={link[1]} {...external}>Читать публикацию <Arrow/></a>}</>
}
type ChronologyGroup={title:string,years:{year:string,items:string[]}[]};
function Chronology({groups,papers=false}:{groups:ChronologyGroup[],papers?:boolean}){return <Accordion name={papers?'publications':'development'} items={groups.map(g=>({title:g.title,body:<div className="chronology">{g.years.map(y=><div className="chronology-year" key={y.year}><h4>{y.year}</h4><ul>{y.items.map((item,i)=><li key={i} data-publication={papers?'true':undefined}>{papers?<Bibliography text={item}/>:item}</li>)}</ul></div>)}</div>}))}/>}

export default function Home(){
 const [active,setActive]=useState('hero');const [scrolled,setScrolled]=useState(false);const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const update=()=>{setScrolled(window.scrollY>36);let current='hero';for(const[id]of navigation){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<=window.innerHeight*.4)current=id}if(window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-20)current='contacts';setActive(current)};
  window.addEventListener('scroll',update,{passive:true});update();return()=>window.removeEventListener('scroll',update);
 },[]);
 useEffect(()=>{
  gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)',()=>{
   const ctx=gsap.context(()=>{
    gsap.from('.hero-title span',{y:38,opacity:0,duration:.9,stagger:.12,ease:'power3.out',clearProps:'all'});
    gsap.to('.hero-copy',{opacity:.1,y:60,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom 30%',scrub:true}});
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el=>gsap.from(el,{opacity:0,y:26,duration:.8,ease:'power3.out',clearProps:'all',scrollTrigger:{trigger:el,start:'top 93%',once:true}}));
    gsap.utils.toArray<HTMLElement>('[data-statement-reveal]').forEach(el=>{
     const lines=el.querySelectorAll('[data-reveal-line]');
     gsap.from(lines.length?lines:el,{opacity:0,y:38,duration:1.1,stagger:.12,ease:'power3.out',clearProps:'all',scrollTrigger:{trigger:el,start:'top 85%',once:true}});
    });
    gsap.utils.toArray<HTMLElement>('.parallax-image, .parallax-photo').forEach(el=>{
     const travel=el.closest('.portrait-wrap')?2.5:7;
     gsap.fromTo(el,{yPercent:-travel},{yPercent:travel,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:.65}});
    });
   },root);return()=>ctx.revert();
  });return()=>mm.revert();
 },[]);
 return <div ref={root}>
  <a className="skip-link" href="#main">Перейти к содержимому</a>
  <header className={scrolled?'site-header scrolled':'site-header'}><a className={`wordmark ${active==='hero'?'active':''}`} href="#hero" aria-current={active==='hero'?'location':undefined}>Ирена Дигол<span>гинеколог-репродуктолог</span></a><nav aria-label="Основная навигация">{navigation.slice(1).map(([id,label])=><a key={id} href={`#${id}`} className={active===id?'active':''} aria-current={active===id?'location':undefined}>{label}</a>)}</nav><span className="language" aria-label="Язык сайта: русский">РУ</span></header>
  <main id="main">
   <section id="hero" className="hero"><img className="hero-photo" src={asset("/images/hero.jpg")}  alt="Ирена Дигол в медицинском центре" width={2912} height={1632} fetchPriority="high"/><div className="hero-shade"/><div className="hero-copy"><h1 className="hero-title">{ru.hero.trim().split('\n').map((line,i)=><span key={i}>{line}</span>)}</h1><Appointment light/></div></section>
   <section id="section-2" className="section introduction"><Eyebrow number="01">Практика и опыт</Eyebrow><div className="intro-grid"><div data-reveal><p className="small-label">Ирена Дигол</p><h2>Гинеколог-<br/>репродуктолог</h2></div><div className="metrics">{[['200+','детей','рожденных после применения процедуры ЭКО'],['15+','лет','опыта в лечении бесплодия'],['30+','лет','стажа работы в медицине'],['20+','публикаций','в национальных и международных научных изданиях']].map(([n,u,t])=><div className="metric" key={n} data-reveal><p><span>{n}</span> {u}</p><div>{t}</div></div>)}</div></div></section>
   <section id="section-3" className="section about"><Eyebrow number="02">Врач</Eyebrow><div className="section-heading" data-reveal><h2>Ирена Дигол</h2><span className="small-label">Медицина. Наука. Практика.</span></div><div className="editorial-grid"><div className="portrait-wrap" data-reveal><img className="parallax-photo" src={asset("/images/about.jpg")}  alt="Оригинальный портрет Ирены Дигол" width={800} height={996} loading="lazy"/></div><div className="bio"><p className="lead" data-reveal>{ru.bio[0]}</p><div className="bio-columns">{ru.bio.slice(1).map(p=><p key={p} data-reveal>{p}</p>)}</div><Appointment/></div></div></section>
   <section id="section-4" className="image-statement cell-statement"><img className="parallax-image" src={asset("/images/cell.webp")}  alt="Научная визуализация яйцеклетки" width={1536} height={1024} loading="lazy"/><div className="statement-shade"/><div className="statement-content"><span className="small-label">Репродуктивное здоровье</span><h2 data-statement-reveal>{ru.statementLines.map((line,i)=><span className="statement-line" data-reveal-line key={line}>{line}{i<ru.statementLines.length-1?' ':''}</span>)}</h2><span className="statement-index">01 / Понимать причины</span></div></section>
   <section id="section-5" className="section text-section"><Eyebrow number="03">Причины и диагностика</Eyebrow><div className="text-section-grid"><h2 data-reveal>Факторы<br/>бесплодия</h2><EditorialList text={ru.factorsText}/></div></section>
   <section id="section-7" className="image-statement art-statement"><img className="parallax-image" src={asset("/images/art.webp")}  alt="Предметная фотография эмбриологической лаборатории" width={1536} height={1024} loading="lazy"/><div className="statement-shade"/><div className="statement-content"><span className="small-label">ВРТ</span><h2 data-statement-reveal>{ru.art}</h2><span className="statement-index">02 / Возможности медицины</span></div></section>
   <section id="section-8" className="section clinical-gallery"><Eyebrow number="04">Репродуктология</Eyebrow><div className="section-heading" data-reveal><h2>Технологии<br/>новой жизни</h2><span className="small-label">От клетки — к началу жизни</span></div><Gallery photos={clinicalImages} name="Галерея репродуктивных технологий"/></section>
   <section id="section-9" className="section services warm-section"><Eyebrow number="05">Услуги врача</Eyebrow><div className="accordion-layout"><div className="accordion-intro" data-reveal><p className="small-label">Ирена Дигол</p><h2>Внимание<br/>к вашей<br/>ситуации</h2><Appointment/></div><Accordion name="services" items={ru.services.map(s=>({title:s.title,body:<p>{s.body}</p>}))}/></div></section>
   <section id="section-10" className="section ivf-section"><Eyebrow number="06">Экстракорпоральное оплодотворение</Eyebrow><div className="section-heading" data-reveal><h2>ЭКО</h2><span className="small-label">Метод и возможности</span></div><div className="editorial-grid"><div className="ivf-image" data-reveal><img className="parallax-photo" src={asset("/images/ivf.webp")}  alt="Научная визуализация оплодотворения в лабораторных условиях" width={1672} height={941} loading="lazy"/></div><div className="bio"><p className="lead" data-reveal>{ru.ivf[0]}</p><div className="bio-columns">{ru.ivf.slice(1).map(p=><p data-reveal key={p}>{p}</p>)}</div></div></div></section>
   <section id="section-11" className="section text-section stages"><Eyebrow number="07">Путь к беременности</Eyebrow><div className="text-section-grid"><h2 data-reveal>Этапы<br/>ЭКО</h2><EditorialList text={ru.stepsText}/></div></section>
   <section id="section-12" className="section faq-section"><Eyebrow number="08">Частые вопросы</Eyebrow><div className="accordion-layout"><h2 data-reveal>Знать<br/>и понимать</h2><Accordion name="faq" items={ru.faq.map(f=>({title:f.title,body:<>{f.paragraphs.map((p,i)=>{const bullets=f.title==='Почему ЭКО так дорого стоит?'?i>0:f.title==='Что такое заморозка эмбрионов и зачем она нужна?'?i>0:false;return bullets?null:<p key={p}>{p}</p>})}{(f.title==='Почему ЭКО так дорого стоит?'||f.title==='Что такое заморозка эмбрионов и зачем она нужна?')&&<ul>{f.paragraphs.slice(1).map(p=><li key={p}>{p}</li>)}</ul>}</>}))}/></div></section>
   <section id="section-13" className="section reputation-section"><Eyebrow number="09">Репутация</Eyebrow><div className="section-heading" data-reveal><h2>За каждой историей —<br/>новая жизнь</h2><span className="small-label">Ирена Дигол</span></div><Gallery name="Оригинальные фотографии Ирены Дигол" photos={reputationImages} zoom/></section>
   <section id="section-14" className="section development-section"><Eyebrow number="10">Профессиональное развитие</Eyebrow><div className="accordion-layout"><div data-reveal><p className="small-label">Ирена Дигол</p><h2>Проекты.<br/>Специализации.<br/>Конференции.</h2></div><Chronology groups={ru.events}/></div></section>
   <section id="section-15" className="section publications-section"><Eyebrow number="11">Научная работа</Eyebrow><div className="accordion-layout"><div data-reveal><p className="small-label">Ирена Дигол</p><h2>Исследования<br/>и публикации</h2></div><Chronology groups={ru.publications} papers/></div></section>
  </main>
  <footer id="contacts" className="section footer"><Eyebrow number="12">Контакты</Eyebrow><div className="footer-heading" data-reveal><h2>Ирена Дигол</h2><Appointment/></div><div className="footer-grid"><div><span className="small-label">Гинеколог-репродуктолог</span><a href="#hero" className="back-top">В начало страницы <span aria-hidden="true">↑</span></a></div><div><h3>Запись на прием</h3><a href={`tel:${ru.contact.phone.replace(/\s/g,'')}`}>{ru.contact.phone}</a><a href={ru.appointment} {...external}>Онлайн <Arrow/></a></div><div><h3>Клиника</h3><p>{ru.contact.clinic}<br/>{ru.contact.country}<br/>{ru.contact.city}<br/>{ru.contact.address}</p></div><div><h3>Соцсети</h3><a href={ru.facebook} {...external}>Facebook <Arrow/></a></div></div><div className="footer-bottom">Разработано в <a href="https://brandica.md" {...external}>brandica.md</a></div></footer>
 </div>
}
