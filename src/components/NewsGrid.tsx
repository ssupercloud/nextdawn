'use client';

import { useState, useEffect } from 'react';
import { MarketEvent } from '@/lib/market-service';
import { fetchOrGenerateStory } from '@/app/actions';
import { ArrowLeft, Clock, TrendingUp, Search, ChevronDown, RefreshCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// --- GENERATIVE GRADIENT ENGINE (Fallback Visuals) ---
const generateGradient = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
        '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', 
        '#f59e0b', '#ec4899', '#06b6d4', '#171717'
    ];

    const c1 = colors[Math.abs(hash) % colors.length];
    const c2 = colors[Math.abs(hash >> 8) % colors.length];
    const angle = Math.abs(hash % 360);

    return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
};

// --- HERO CARD ---
const HeroCard = ({ event, onClick, smartHeadline, prob, topOutcome, bgImage, volume, t }: any) => {
    const [imgState, setImgState] = useState<'loading' | 'loaded' | 'error'>('loading');

    return (
        <button 
            onClick={onClick}
            className="group relative border-2 border-black bg-black overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 text-left flex flex-col justify-end aspect-[16/9] md:aspect-[4/3] w-full"
        >
            <div 
                className="absolute inset-0 opacity-100" 
                style={{ background: generateGradient(event.id) }} 
            />
            
            <img 
                src={bgImage} 
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 
                    ${imgState === 'loaded' ? 'grayscale opacity-60 group-hover:opacity-80 group-hover:scale-105 group-hover:grayscale-0' : 'opacity-0'}
                `}
                loading="eager"
                onLoad={() => setImgState('loaded')}
                onError={() => setImgState('error')}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            
            <div className="relative p-6 z-10 w-full">
                <div className="flex justify-between items-end mb-3">
                    <span className="bg-[#CC0000] text-white px-2 py-1 text-[10px] font-bold font-mono uppercase">
                        {volume}
                    </span>
                    <span className="text-white font-mono text-xs shadow-black drop-shadow-md">
                        {topOutcome} {t('Leading')}
                    </span>
                </div>
                <h2 className="font-black text-white leading-none uppercase tracking-tighter group-hover:underline decoration-[#CC0000] underline-offset-4 text-2xl md:text-3xl lg:text-4xl shadow-black drop-shadow-lg">
                    {smartHeadline}
                </h2>
                <div className="mt-4 flex items-center gap-2 text-gray-300 text-xs font-mono uppercase">
                    <Clock className="w-3 h-3" />
                    <span>{prob}% {t('Probability')}</span>
                </div>
            </div>
        </button>
    );
};

// --- WIRE CARD (Restored AI Images) ---
const WireCard = ({ event, onClick, smartHeadline, prob, topOutcome, bgImage, volume, t }: any) => {
    const [imgState, setImgState] = useState<'loading' | 'loaded' | 'error'>('loading');
    const gradient = generateGradient(event.id);

    return (
        <button 
            onClick={onClick} 
            className="group relative border-2 border-black bg-white p-0 overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-left flex flex-col h-64 w-full"
        >
            {/* Top Visual Area */}
            <div className="relative h-24 w-full overflow-hidden border-b-2 border-black">
                {/* Fallback Gradient */}
                <div 
                    className="absolute inset-0 opacity-100 transition-transform duration-700" 
                    style={{ background: gradient }} 
                />
                
                {/* AI Image */}
                <img 
                    src={bgImage} 
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 
                        ${imgState === 'loaded' ? 'grayscale opacity-80 group-hover:opacity-100 group-hover:scale-110 group-hover:grayscale-0' : 'opacity-0'}
                    `}
                    loading="lazy"
                    onLoad={() => setImgState('loaded')}
                    onError={() => setImgState('error')}
                />

                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                
                {/* Badges */}
                <div className="absolute top-2 right-2 flex gap-2">
                    <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${Number(prob) > 70 ? 'bg-[#CC0000] text-white' : 'bg-white text-black'}`}>
                        {prob}%
                    </span>
                </div>
                
                <div className="absolute bottom-2 left-2">
                     <span className="bg-white text-black border border-black px-1.5 py-0.5 text-[10px] font-mono uppercase font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {volume}
                    </span>
                </div>
            </div>
            
            {/* Bottom Content Area */}
            <div className="p-4 flex flex-col justify-between flex-1 bg-white group-hover:bg-zinc-50 transition-colors">
                <div>
                    <h3 className="font-bold font-serif text-lg leading-tight text-black group-hover:text-[#CC0000] transition-colors line-clamp-3 mb-2">
                        {smartHeadline}
                    </h3>
                </div>
                
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center w-full">
                    <span className="text-[10px] font-bold text-gray-500 uppercase truncate max-w-[60%]">
                        {topOutcome}
                    </span>
                    <span className="text-[10px] text-black font-mono flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        {t('READ ANALYSIS')} →
                    </span>
                </div>
            </div>
        </button>
    );
};

interface NewsGridProps {
    events: MarketEvent[];
    category?: string; 
}

export default function NewsGrid({ events, category = "Trending" }: NewsGridProps) {
  const [activeEvent, setActiveEvent] = useState<MarketEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(15);
  const { lang, t } = useLanguage();
  
  const [newsContent, setNewsContent] = useState({
      headline: "", story: "", headline_cn: "", story_cn: "", imageUrl: "", impact: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- CONFIG ---
  const getLayoutConfig = () => {
      const lowerCat = category.toLowerCase();
      if (lowerCat === 'trending') return { maxWire: 15, enableLoadMore: false };
      if (lowerCat === 'breaking') return { maxWire: 6, enableLoadMore: false };
      return { maxWire: 60, enableLoadMore: true };
  };
  const config = getLayoutConfig();

  const handleLoadMore = () => {
      setVisibleCount(prev => Math.min(prev + 15, config.maxWire));
  };

  const formatVolume = (num: number) => {
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'k';
    return '$' + num.toString();
  };

  const getSectionHeaders = () => {
      if (category === "Trending" || category === "trending") {
          return { hero: t('Top Stories'), wire: t('Other Trending Stories') };
      }
      if (category === "Breaking" || category === "breaking") {
          return { hero: lang === 'CN' ? "突发头条" : "Top Breaking News", wire: lang === 'CN' ? "其他突发新闻" : "Other Breaking News" };
      }
      const catName = category.charAt(0).toUpperCase() + category.slice(1);
      if (lang === 'CN') {
          return { hero: `${t(catName)} 头条`, wire: `其他 ${t(catName)} 动态` };
      }
      return { hero: `Top ${catName} Stories`, wire: `Other ${catName} Stories` };
  };

  const headers = getSectionHeaders();

  const getMarketContext = (event: MarketEvent) => {
    try {
        if (!event.markets || event.markets.length === 0) return { prob: 0, summary: "No data", topOutcome: "Unknown" };
        const isBinary = event.markets.length === 1;

        if (isBinary) {
            const market = event.markets[0];
            const prices = market.outcomePrices.map(p => Number(p));
            const yesPrice = prices[0] || 0;
            const noPrice = prices[1] || 0;
            if (noPrice > yesPrice) {
                return { prob: noPrice, summary: `No (${(noPrice * 100).toFixed(1)}%), Yes (${(yesPrice * 100).toFixed(1)}%)`, topOutcome: "No" };
            } else {
                return { prob: yesPrice, summary: `Yes (${(yesPrice * 100).toFixed(1)}%), No (${(noPrice * 100).toFixed(1)}%)`, topOutcome: "Yes" };
            }
        } else {
            let outcomesList: { name: string, prob: number }[] = [];
            event.markets.forEach(market => {
                const prices = market.outcomePrices.map(p => Number(p));
                const yesPrice = prices[0] || 0;
                let name = market.groupItemTitle || market.question;
                name = name.replace("Winner", "").replace("Champion", "").trim();
                outcomesList.push({ name, prob: yesPrice });
            });
            outcomesList.sort((a, b) => b.prob - a.prob);
            const top3 = outcomesList.slice(0, 3);
            const highestProb = top3[0]?.prob || 0;
            const topOutcome = top3[0]?.name || "Unknown";
            const summary = top3.map(o => `${o.name} (${(o.prob * 100).toFixed(1)}%)`).join(", ");
            return { prob: highestProb, summary, topOutcome };
        }
    } catch (e) {
        return { prob: 0, summary: "Data Error", topOutcome: "Error" };
    }
  };

  const getDiverseHeadline = (event: MarketEvent, language: 'EN' | 'CN') => {
      const { topOutcome, prob } = getMarketContext(event);
      const percent = (prob * 100).toFixed(0);
      const rawTitle = event.title.replace("Winner", "").trim();
      const seed = event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      const isBinaryOutcome = topOutcome === "Yes" || topOutcome === "No";

      if (language === 'CN') {
          if (isBinaryOutcome) {
              const action = topOutcome === "Yes" ? "看好" : "看衰";
              return `市场${action}：${rawTitle} (概率 ${percent}%)`;
          }
          const templates = [
              `市场聚焦：${topOutcome} 领跑 ${rawTitle} (胜率 ${percent}%)`,
              `${rawTitle} 最新预测：${topOutcome} 确立优势`,
              `数据共识：${topOutcome} 成为 ${rawTitle} 热门`,
              `交易员押注：${topOutcome} 将拿下 ${rawTitle}`
          ];
          return templates[seed % templates.length];
      }

      if (isBinaryOutcome) {
          if (topOutcome === "No") return `Market skeptical on ${rawTitle} (${percent}% No)`;
          return `Odds favor '${topOutcome}' for ${rawTitle} (${percent}%)`;
      }

      const highConfTemplates = [
          `${topOutcome} clinches ${rawTitle} in historic shift`,
          `Market Verdict: ${topOutcome} takes ${rawTitle}`,
          `${topOutcome} dominates ${rawTitle} with ${percent}% odds`,
          `Unstoppable: ${topOutcome} secures ${rawTitle} lead`
      ];
      const midConfTemplates = [
          `${topOutcome} takes commanding lead in ${rawTitle}`,
          `${rawTitle} Shift: ${topOutcome} moves to front`,
          `Traders bet big on ${topOutcome} for ${rawTitle}`,
          `${topOutcome} surges ahead in ${rawTitle} race`
      ];
      const lowConfTemplates = [
          `${topOutcome} emerges as favorite for ${rawTitle}`,
          `Tight Race: ${topOutcome} edges ahead in ${rawTitle}`,
          `${topOutcome} leads ${rawTitle} field`,
          `Early Signal: ${topOutcome} tops ${rawTitle} forecast`
      ];

      if (prob > 0.75) return highConfTemplates[seed % highConfTemplates.length];
      if (prob > 0.50) return midConfTemplates[seed % midConfTemplates.length];
      return lowConfTemplates[seed % lowConfTemplates.length];
  };

  const getCardImage = (event: MarketEvent, winner: string, isHero: boolean) => {
      // ENABLE AI FOR ALL CARDS
      // Note: We use a smaller size for wire cards (400x300) to speed up loading
      const basePrompt = isHero 
        ? `editorial illustration of ${winner} winning ${event.title}, serious, high contrast, red and black, vector art, financial times style`
        : `minimalist editorial art of ${winner}, ${event.title}, red and black vector style`;
      
      const prompt = encodeURIComponent(basePrompt);
      const width = isHero ? 800 : 400;
      const height = isHero ? 600 : 300;
      
      return `https://image.pollinations.ai/prompt/${prompt}?nologo=true&width=${width}&height=${height}&seed=${event.id}`;
  };

  const handleOpenArticle = (e: MarketEvent) => {
      setActiveEvent(e);
      setNewsContent({ headline: "", story: "", headline_cn: "", story_cn: "", imageUrl: "", impact: "" });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFeed = () => {
      setActiveEvent(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!activeEvent) return;
    let isMounted = true;
    async function loadStory() {
        setLoading(true);
        setError(null);
        try {
            const { prob, summary } = getMarketContext(activeEvent!);
            const consistentHeadline = getDiverseHeadline(activeEvent!, 'EN');
            const data = await fetchOrGenerateStory(
                activeEvent!.id, activeEvent!.title, summary, prob, activeEvent!.endDate || "Unknown", consistentHeadline
            );
            if (isMounted) {
                if (data.story || data.story_cn) {
                    setNewsContent({
                        headline: data.headline, story: data.story, headline_cn: data.headline_cn, story_cn: data.story_cn, imageUrl: data.imageUrl, impact: data.impact || "HIGH"
                    });
                } else { setError("Content unavailable. Please try again."); }
            }
        } catch (err) {
            console.error("Content Load Error:", err);
            if (isMounted) setError("Failed to retrieve report.");
        } finally {
            if (isMounted) setLoading(false);
        }
    }
    loadStory();
    return () => { isMounted = false; };
  }, [activeEvent]);

  // --- FILTERING & SORTING ---
  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const sortedEvents = [...filteredEvents].sort((a, b) => b.volume - a.volume);
  
  const heroEvents = sortedEvents.slice(0, 2);
  const wireLimit = config.enableLoadMore ? visibleCount : config.maxWire;
  const gridEvents = sortedEvents.slice(2, 2 + wireLimit);
  const hasMore = config.enableLoadMore && (gridEvents.length + 2) < sortedEvents.length;

  if (activeEvent) {
      const { prob, topOutcome } = getMarketContext(activeEvent);
      const reportDate = new Date().toLocaleDateString(lang === 'CN' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const targetDate = activeEvent.endDate ? new Date(activeEvent.endDate).toLocaleDateString(lang === 'CN' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown";
      const displayHeadline = lang === 'CN' 
          ? (newsContent.headline_cn || (loading ? t('Generating deep dive analysis...') : getDiverseHeadline(activeEvent, 'CN'))) 
          : (newsContent.headline || getDiverseHeadline(activeEvent, 'EN'));
      const displayStory = lang === 'CN' ? newsContent.story_cn : newsContent.story;

      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 font-sans animate-in fade-in duration-500 pt-8">
            <button onClick={handleBackToFeed} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                {t('Return to Live Wire')}
            </button>

            <article className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                 <div className="relative w-full aspect-[21/9] bg-gray-100">
                    {loading || !newsContent.imageUrl ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                            <span className="font-mono text-xs uppercase tracking-widest">{t('Decrypting Visuals...')}</span>
                        </div>
                    ) : (
                        <>
                            <img src={newsContent.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" />
                            {/* UPDATED: Stronger gradient for better text contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
                        </>
                    )}
                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-indigo-600 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                                {t('DEEP DIVE')}
                            </span>
                            {/* UPDATED: Added drop-shadow for better readability */}
                            <span className="text-white text-xs font-medium tracking-wide border-l border-white/30 pl-3 drop-shadow-sm">
                                {t('REPORT')}: {reportDate}
                            </span>
                        </div>
                        {/* UPDATED: Added drop-shadow for better readability */}
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-lg max-w-4xl">
                            {displayHeadline}
                        </h1>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-gray-100 bg-gray-50/50">
                     <div>
                         <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{t('Market Volume')}</p>
                         <p className="text-lg font-bold text-gray-900">{formatVolume(activeEvent.volume)}</p>
                     </div>
                     <div>
                         <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{t('Consensus')}</p>
                         <p className="text-lg font-bold text-indigo-600">{topOutcome}</p>
                     </div>
                     <div>
                         <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{t('Probability')}</p>
                         <p className="text-lg font-bold text-gray-900">{(prob * 100).toFixed(1)}%</p>
                     </div>
                     <div>
                         <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{t('TARGET')}</p>
                         <p className="text-lg font-bold text-gray-900">{targetDate}</p>
                     </div>
                 </div>

                 <div className="p-6 md:p-12 max-w-4xl mx-auto">
                    {loading ? (
                        <div className="animate-pulse space-y-6 max-w-2xl mx-auto">
                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                            <div className="h-4 bg-gray-100 rounded w-11/12"></div>
                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                        </div>
                    ) : (
                        <div className="prose prose-lg md:prose-xl font-sans text-gray-900 font-normal leading-loose mx-auto first-letter:text-6xl first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:text-indigo-900">
                            <p className="whitespace-pre-line">
                                {displayStory || t('Generating deep dive analysis...')}
                            </p>
                        </div>
                    )}
                 </div>
            </article>
        </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 font-sans">
      
      {/* SEARCH BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 pt-6 gap-4">
          <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              <h2 className="text-lg font-bold tracking-tight text-gray-900">
                  {headers.hero}
              </h2>
          </div>
          
          <div className="relative group w-full md:w-72">
              <input 
                  type="text" 
                  placeholder={lang === 'CN' ? "搜索新闻..." : "Search wires..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-full px-4 py-2 pl-10 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all outline-none"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {heroEvents.map((e, idx) => {
              const { prob, topOutcome } = getMarketContext(e);
              const smartHeadline = getDiverseHeadline(e, lang);
              const bgImage = getCardImage(e, topOutcome, true);
              
              return (
                  <HeroCard 
                    key={e.id}
                    event={e}
                    onClick={() => handleOpenArticle(e)}
                    smartHeadline={smartHeadline}
                    prob={(prob * 100).toFixed(0)}
                    topOutcome={topOutcome}
                    bgImage={bgImage}
                    volume={formatVolume(e.volume)}
                    t={t}
                  />
              );
          })}
      </div>

      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          <h2 className="text-base font-bold text-gray-900 tracking-tight">{headers.wire}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {gridEvents.map((e) => {
              const { prob, topOutcome } = getMarketContext(e);
              const smartHeadline = getDiverseHeadline(e, lang);
              const bgImage = getCardImage(e, topOutcome, false); // FALSE for Wire (Low Res)
              return (
                  <WireCard 
                    key={e.id}
                    event={e}
                    onClick={() => handleOpenArticle(e)}
                    smartHeadline={smartHeadline}
                    prob={(prob * 100).toFixed(0)}
                    topOutcome={topOutcome}
                    bgImage={bgImage}
                    volume={formatVolume(e.volume)}
                    t={t}
                  />
              );
          })}
      </div>

      {hasMore && (
          <div className="flex justify-center pt-8">
              <button 
                onClick={handleLoadMore}
                className="flex items-center gap-2 bg-white border border-gray-200 px-6 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
              >
                  Load More <ChevronDown className="w-4 h-4" />
              </button>
          </div>
      )}
    </div>
  );
}