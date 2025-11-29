'use client';

import { useState, useEffect } from 'react';
import { MarketEvent } from '@/lib/market-service';
import { fetchOrGenerateStory } from '@/app/actions';
import { ArrowLeft, Clock, TrendingUp, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NewsGrid({ events }: { events: MarketEvent[] }) {
  const [activeEvent, setActiveEvent] = useState<MarketEvent | null>(null);
  const { lang, t } = useLanguage();
  
  const [newsContent, setNewsContent] = useState({
      headline: "",
      story: "",
      headline_cn: "",
      story_cn: "",
      imageUrl: "",
      impact: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatVolume = (num: number) => {
    if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return '$' + (num / 1000).toFixed(0) + 'k';
    return '$' + num.toString();
  };

  const getMarketContext = (event: MarketEvent) => {
    try {
        if (!event.markets || event.markets.length === 0) return { prob: 0, summary: "No data", topOutcome: "Unknown" };

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
        const topOutcome = top3[0]?.name || "Yes";
        const summary = top3.map(o => `${o.name} (${(o.prob * 100).toFixed(1)}%)`).join(", ");

        return { prob: highestProb, summary, topOutcome };
    } catch (e) {
        return { prob: 0, summary: "Data Error", topOutcome: "Error" };
    }
  };

  const getDiverseHeadline = (event: MarketEvent, language: 'EN' | 'CN') => {
      const { topOutcome, prob } = getMarketContext(event);
      const percent = (prob * 100).toFixed(0);
      const rawTitle = event.title.replace("Winner", "").trim();
      const seed = event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      if (language === 'CN') {
          const templates = [
              `市场聚焦：${topOutcome} 领跑 ${rawTitle} (胜率 ${percent}%)`,
              `${rawTitle} 最新预测：${topOutcome} 确立优势`,
              `数据共识：${topOutcome} 成为 ${rawTitle} 热门`,
              `交易员押注：${topOutcome} 将拿下 ${rawTitle}`
          ];
          return templates[seed % templates.length];
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

  const getCardImage = (event: MarketEvent, winner: string) => {
      const prompt = `editorial illustration of ${winner} winning ${event.title}, serious, high contrast, red and black, vector art, financial times style`;
      return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&width=800&height=600&seed=${event.id}`;
  };

  const handleOpenArticle = (e: MarketEvent) => {
      setActiveEvent(e);
      setNewsContent({
          headline: "", story: "", headline_cn: "", story_cn: "", imageUrl: "", impact: ""
      });
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
                activeEvent!.id, 
                activeEvent!.title, 
                summary, 
                prob,
                activeEvent!.endDate || "Unknown",
                consistentHeadline
            );
            
            if (isMounted) {
                if (data.story || data.story_cn) {
                    setNewsContent({
                        headline: data.headline,
                        story: data.story,
                        headline_cn: data.headline_cn,
                        story_cn: data.story_cn,
                        imageUrl: data.imageUrl,
                        impact: data.impact || "HIGH"
                    });
                } else {
                    setError("Content unavailable. Please try again.");
                }
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

  const sortedEvents = [...events].sort((a, b) => b.volume - a.volume);
  const heroEvents = sortedEvents.slice(0, 2);
  const gridEvents = sortedEvents.slice(2, 18);

  if (activeEvent) {
      const { prob, topOutcome } = getMarketContext(activeEvent);
      const reportDate = new Date().toLocaleDateString(lang === 'CN' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const targetDate = activeEvent.endDate ? new Date(activeEvent.endDate).toLocaleDateString(lang === 'CN' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Unknown";

      const displayHeadline = lang === 'CN' 
          ? (newsContent.headline_cn || (loading ? t('Generating deep dive analysis...') : getDiverseHeadline(activeEvent, 'CN'))) 
          : (newsContent.headline || getDiverseHeadline(activeEvent, 'EN'));
      
      const displayStory = lang === 'CN' ? newsContent.story_cn : newsContent.story;

      return (
        <div className="container mx-auto px-4 mb-20 font-sans animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <button 
                    onClick={handleBackToFeed}
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-[#CC0000] transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('Return to Live Wire')}
                </button>
            </div>

            <div className="border-2 border-black bg-white p-4 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                 <div className="flex flex-wrap justify-between items-start gap-6 mb-10 border-b-4 border-black pb-6">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#CC0000] text-white px-3 py-1 text-xs font-bold uppercase tracking-widest font-mono shadow-sm">
                            {t('DEEP DIVE')}
                        </span>
                        <div className="flex flex-col text-[10px] font-mono leading-tight ml-2 border-l border-gray-300 pl-3 text-gray-500">
                            <span>{t('REPORT')}: <span className="text-black font-bold">{reportDate.toUpperCase()}</span></span>
                            <span>{t('TARGET')}: <span className="text-[#CC0000] font-bold">{targetDate.toUpperCase()}</span></span>
                        </div>
                    </div>
                    
                    <div className="flex gap-8 text-xs font-bold font-mono">
                         <div className="flex flex-col items-end">
                            {/* REVERTED TO MARKET VOLUME */}
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('Market Volume')}</span>
                            <span className="text-black text-lg">{formatVolume(activeEvent.volume)}</span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider">{t('Consensus')}</span>
                            <span className="text-[#CC0000] text-lg">{topOutcome} ({(prob * 100).toFixed(0)}%)</span>
                         </div>
                    </div>
                 </div>

                 <h1 className="text-3xl md:text-5xl font-black mb-12 leading-tight text-gray-900 tracking-tighter uppercase max-w-5xl">
                    {displayHeadline}
                 </h1>

                 <div className="relative w-full aspect-video bg-neutral-100 mb-12 border-2 border-black overflow-hidden group shadow-inner">
                    {loading || !newsContent.imageUrl ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 text-gray-400">
                            <div className="animate-spin rounded-none h-8 w-8 border-4 border-black border-t-transparent mb-3"></div>
                            <span className="font-mono text-xs uppercase tracking-widest">{t('Decrypting Visuals...')}</span>
                        </div>
                    ) : (
                        <>
                            <img src={newsContent.imageUrl} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none mix-blend-overlay"></div>
                        </>
                    )}
                 </div>

                 {/* UPDATED: Improved 2-Column Layout */}
                 <div className="prose prose-base md:prose-lg font-serif text-gray-800 max-w-none columns-1 md:columns-2 gap-10 leading-relaxed text-justify">
                    {loading ? (
                        <div className="animate-pulse space-y-6">
                            <div className="h-4 bg-gray-200 w-full rounded-sm"></div>
                            <div className="h-4 bg-gray-200 w-11/12 rounded-sm"></div>
                            <div className="h-4 bg-gray-200 w-full rounded-sm"></div>
                        </div>
                    ) : (
                        <p className="whitespace-pre-line first-letter:text-6xl first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:text-black mb-8 break-inside-avoid-column">
                            {displayStory || t('Generating deep dive analysis...')}
                        </p>
                    )}
                 </div>
            </div>
        </div>
      );
  }

  // --- RENDER: FRONT PAGE GRID ---
  return (
    <div className="container mx-auto px-4 mb-20 font-sans">
      <div className="flex justify-between items-center mb-8 pt-4">
          <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-[#CC0000] animate-pulse"></div>
              <h2 className="text-sm font-black uppercase tracking-widest text-[#CC0000]">
                  {t('Global Top Stories')}
              </h2>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {heroEvents.map((e, idx) => {
              const { prob, topOutcome } = getMarketContext(e);
              const smartHeadline = getDiverseHeadline(e, lang);
              const bgImage = getCardImage(e, topOutcome);
              
              return (
                  <button 
                    key={e.id}
                    onClick={() => handleOpenArticle(e)}
                    className="group relative border-2 border-black bg-black overflow-hidden hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 text-left flex flex-col justify-end aspect-[16/9] md:aspect-[4/3]"
                  >
                      <img src={bgImage} className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 group-hover:opacity-80 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                      <div className="relative p-6 z-10 w-full">
                          <div className="flex justify-between items-end mb-3">
                              <span className="bg-[#CC0000] text-white px-2 py-1 text-[10px] font-bold font-mono uppercase">{formatVolume(e.volume)}</span>
                              <span className="text-white font-mono text-xs shadow-black drop-shadow-md">{topOutcome} {t('Leading')}</span>
                          </div>
                          <h2 className="font-black text-white leading-none uppercase tracking-tighter group-hover:underline decoration-[#CC0000] underline-offset-4 text-2xl md:text-3xl lg:text-4xl shadow-black drop-shadow-lg">{smartHeadline}</h2>
                          <div className="mt-4 flex items-center gap-2 text-gray-300 text-xs font-mono uppercase">
                              <Clock className="w-3 h-3" />
                              <span>{(prob * 100).toFixed(0)}% {t('Probability')}</span>
                          </div>
                      </div>
                  </button>
              );
          })}
      </div>

      <div className="flex items-center gap-4 mb-8">
          <TrendingUp className="w-4 h-4" />
          <h2 className="text-sm font-black uppercase tracking-widest text-black">{t('Market Wire')}</h2>
          <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridEvents.map((e) => {
              const { prob, topOutcome } = getMarketContext(e);
              const smartHeadline = getDiverseHeadline(e, lang);
              const bgImage = getCardImage(e, topOutcome);
              return (
                  <button key={e.id} onClick={() => handleOpenArticle(e)} className="group relative border-2 border-black bg-black p-6 overflow-hidden hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-left flex flex-col justify-between h-56">
                      <img src={bgImage} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20"></div>
                      <div className="relative z-10 w-full h-full flex flex-col justify-between">
                          <div className="flex justify-between items-start mb-3">
                              <span className="font-mono text-[10px] text-gray-300 uppercase tracking-wider border border-white/20 px-1">{formatVolume(e.volume)}</span>
                              <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 ${prob > 0.7 ? 'bg-[#CC0000] text-white' : 'bg-white text-black'}`}>{(prob * 100).toFixed(0)}%</span>
                          </div>
                          <div>
                              <h3 className="font-bold font-serif text-lg leading-tight text-white group-hover:text-[#CC0000] transition-colors line-clamp-3 mb-2 shadow-black drop-shadow-md">{smartHeadline}</h3>
                              <div className="pt-3 border-t border-white/20 flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">{topOutcome}</span>
                                  <span className="text-[10px] text-gray-300 font-mono flex items-center gap-1 group-hover:translate-x-1 transition-transform">{t('READ ANALYSIS')} →</span>
                              </div>
                          </div>
                      </div>
                  </button>
              );
          })}
      </div>
    </div>
  );
}