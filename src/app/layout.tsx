import type { Metadata } from 'next';
import '@fontsource-variable/manrope';
import './globals.css';
export const metadata: Metadata = {title:'Ирена Дигол — гинеколог-репродуктолог в Кишиневе',description:'Персональный сайт Ирены Дигол: лечение бесплодия, вспомогательные репродуктивные технологии, профессиональный опыт и научные публикации. Запись на приём в Terramed.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
