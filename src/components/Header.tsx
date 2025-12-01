'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Logo from '@/components/Logo'; // Import the new Logo

export default function Header() {
  const pathname = usePathname();
  const { t, lang, setLang } = useLanguage();
  
  const today = new Date();
  const dateString = today.toLocaleDateString(lang === 'CN' ? 'zh-CN' : 'en-US', { 
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });

  const navItems = [
    { label: t('Trending'), href: '/' },
    { label: lang === 'CN' ? '突发新闻' : 'Breaking', href: '/breaking' },
    { label: t('Web3'), href: '/web3' },
    { label: t('Economy'), href: '/economy' },
    { label: t('Technology'), href: '/technology' },
    { label: t('Sports'), href: '/sports' },
    { label: t('Culture'), href: '/culture' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md transition-all">
      {/* Top Bar: Metadata */}
      <div className="mx-auto max-w-7xl px-4 h-10 flex justify-between items-center text-[10px] md:text-xs font-medium tracking-wide text-gray-500 border-b border-gray-100">
        <span className="uppercase tracking-widest text-indigo-600 font-bold">
            {t('EvideX Presents')}
        </span>
        <span className="uppercase hidden md:inline">{dateString}</span>
        
        {/* Language Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-md">
            <button 
                onClick={() => setLang('EN')} 
                className={`px-2 py-0.5 rounded-sm transition-all ${lang === 'EN' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
                EN
            </button>
            <button 
                onClick={() => setLang('CN')} 
                className={`px-2 py-0.5 rounded-sm transition-all ${lang === 'CN' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
                CN
            </button>
        </div>
      </div>
      
      {/* Main Masthead - Compact Layout */}
      <div className="py-4 md:py-5 text-center bg-gradient-to-b from-white to-gray-50/50">
        <Link href="/" className="inline-flex flex-row items-center justify-center gap-3 md:gap-4 group">
            {/* The New Logo - Positioned Left, slightly adjusted size for balance */}
            <Logo className="w-10 h-10 md:w-12 md:h-12 text-gray-900 group-hover:scale-110 transition-transform duration-500" />
            
            <h1 className="text-3xl md:text-5xl font-black font-serif tracking-tight leading-none text-gray-900 group-hover:text-indigo-900 transition-colors mt-1">
              The Next Dawn
            </h1>
        </Link>
        
        <p className="text-[10px] md:text-xs font-bold text-gray-400 font-sans tracking-[0.2em] uppercase opacity-80 mt-1.5">
          {lang === 'CN' ? '即使雨天，也要读懂未来' : 'The Future You Want to Read, Even on Rainy Days'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex justify-center py-3 overflow-x-auto whitespace-nowrap px-4 border-t border-gray-100 scrollbar-hide">
        <div className="flex gap-6 md:gap-10">
            {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
                <Link 
                key={item.href} 
                href={item.href} 
                className={`text-xs md:text-sm font-bold tracking-wider uppercase transition-colors relative group ${
                    isActive ? 'text-black' : 'text-gray-400 hover:text-indigo-600'
                }`}
                >
                {item.label}
                <span className={`absolute -bottom-3 left-0 w-full h-0.5 bg-indigo-600 transition-transform origin-left ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
                </Link>
            );
            })}
        </div>
      </nav>
    </header>
  );
}