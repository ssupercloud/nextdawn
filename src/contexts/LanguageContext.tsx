'use client';

import React, { createContext, useContext, useState } from 'react';

type Language = 'EN' | 'CN';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'Trending': { EN: 'Trending', CN: '热门趋势' },
  'Web3': { EN: 'Web3', CN: 'Web3生态' },
  'Economy': { EN: 'Economy', CN: '宏观经济' },
  'Technology': { EN: 'Technology', CN: '前沿科技' },
  'Sports': { EN: 'Sports', CN: '体育赛事' },
  'Culture': { EN: 'Culture', CN: '流行文化' },
  'Politics': { EN: 'Politics', CN: '全球政治' },
  
  // UI Labels
  'Global Top Stories': { EN: 'Global Top Stories', CN: '全球重磅头条' },
  'Market Wire': { EN: 'Market Wire', CN: '市场实时快讯' },
  'Return to Live Wire': { EN: 'Return to Live Wire', CN: '返回实时新闻流' }, // Fixed spacing
  'EvideX Presents': { EN: 'EvideX Presents', CN: 'EvideX 呈现' },
  'Consensus': { EN: 'Consensus', CN: '市场共识' },
  'Leading': { EN: 'Leading', CN: '领跑' },
  'Probability': { EN: 'Probability', CN: '胜率' },
  'READ ANALYSIS': { EN: 'READ ANALYSIS', CN: '深度解读' },
  'DEEP DIVE': { EN: 'DEEP DIVE', CN: '深度分析' },
  'TARGET': { EN: 'TARGET', CN: '目标日期' },
  'REPORT': { EN: 'REPORT', CN: '报告日期' },
  'Decrypting Visuals...': { EN: 'Decrypting Visuals...', CN: '正在解密视觉数据...' },
  'Generating deep dive analysis...': { EN: 'Generating deep dive analysis...', CN: '正在生成深度分析报告...' },
  'The Newspaper of Tomorrow': { EN: '"The Newspaper of Tomorrow"', CN: '“预见未来的智能报刊”' },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('EN');

  const t = (key: string) => {
    return translations[key]?.[lang] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}