'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();
  
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear());
  const dateString = futureDate.toLocaleDateString(lang === 'CN' ? 'zh-CN' : 'en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
  });

  const navItems = [
    { label: t('Trending'), href: '/' },
    { label: t('Web3'), href: '/web3' },
    { label: t('Economy'), href: '/economy' },
    { label: t('Technology'), href: '/technology' },
    { label: t('Sports'), href: '/sports' },
    { label: t('Culture'), href: '/culture' },
  ];

  return (
    <header className="border-b-4 border-black mb-8 sticky top-0 bg-[#F4F1EA] z-50 shadow-md transition-all">
      {/* Top Bar */}
      <div className="container mx-auto px-4 py-2 flex justify-between items-center text-[10px] md:text-xs font-serif border-b border-gray-300">
        {/* UPDATED: Branding instead of Volume Number */}
        <span className="hidden md:inline text-sm font-black tracking-widest uppercase">
            {t('EvideX Presents')}
        </span>
        
        <span className="uppercase tracking-widest font-bold">{dateString}</span>
        
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold border border-black bg-white">
            <button onClick={() => setLang('EN')} className={`px-2 py-0.5 transition-colors ${lang === 'EN' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>EN</button>
            <button onClick={() => setLang('CN')} className={`px-2 py-0.5 transition-colors ${lang === 'CN' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>CN</button>
        </div>
      </div>
      
      {/* Logo Area */}
      <div className="py-6 text-center">
        <h1 className="text-5xl md:text-8xl font-black font-serif tracking-tighter uppercase leading-none hover:opacity-80 transition-opacity cursor-pointer">
          <Link href="/">The Next Dawn</Link>
        </h1>
        <p className="text-xs md:text-sm font-medium italic mt-2 text-gray-600 font-sans tracking-wide">
          {t('The Newspaper of Tomorrow')}
        </p>
      </div>

      <nav className="border-t border-black border-b flex justify-center py-3 font-bold font-sans text-xs md:text-sm gap-4 md:gap-12 overflow-x-auto whitespace-nowrap px-4 bg-white">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`uppercase transition-colors ${isActive ? 'text-[#CC0000] underline underline-offset-4' : 'hover:text-[#CC0000] hover:underline'}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}