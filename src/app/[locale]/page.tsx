import Site,{type Locale} from '@/components/Site';
import {notFound} from 'next/navigation';
export const dynamicParams=false;
export function generateStaticParams(){return [{locale:'en'},{locale:'ro'},{locale:'ru'}]}
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(locale!=='en'&&locale!=='ro'&&locale!=='ru')notFound();return <Site locale={locale as Locale}/>;}
