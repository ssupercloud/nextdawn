'use client';

import { useState, useEffect } from 'react';
import { MarketEvent } from '@/lib/market-service';
import { fetchOrGenerateStory } from '@/app/actions';

export default function NewsGrid({ events }: { events: MarketEvent[] }) {
  const [activeEvent, setActiveEvent] = useState<MarketEvent | null>(events[0] || null);
  
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
        if (!event.markets || event.markets.length === 0) return { prob: 0, summary: "No data" };

        let outcomesList: { name: string, prob: number }[] = [];

        event.markets.forEach(market => {
            const prices = market.outcomePrices.map(p => Number(p));
            const yesPrice = prices[0] || 0;
            const name = market.groupItemTitle || market.question;
            outcomesList.push({ name, prob: yesPrice });
        });

        outcomesList.sort((a, b) => b.prob - a.prob);
        const top3 = outcomesList.slice(0, 3);
        const highestProb = top3[0]?.prob || 0;
        const summary = top3.map(o => `${o.name} (${(o.prob * 100).toFixed(1)}%)`).join(", ");

        return { prob: highestProb, summary };
    } catch (e) {
        return { prob: 0, summary: "Data Error" };
    }
  };

  useEffect(() => {
    if (!activeEvent) return;

    let isMounted = true;
    
    async function loadStory() {
        setLoading(true);
        setError(null);
        
        setNewsContent(prev => ({ 
            ...prev, 
            headline: activeEvent!.title, 
            story: "", 
            headline_cn: "",
            story_cn: "",
            imageUrl: "" 
        }));

        try {
            const { prob, summary } = getMarketContext(activeEvent!);
            const data = await fetchOrGenerateStory(
                activeEvent!.id, 
                activeEvent!.title, 
                summary, 
                prob
            );
            
            if (isMounted) {
                setNewsContent({
                    headline: data.headline,
                    story: data.story,
                    headline_cn: data.headline_cn,
                    story_cn: data.story_cn,
                    imageUrl: data.imageUrl,
                    impact: data.impact || "HIGH"
                });
            }
        } catch (err) {
            console.error(err);
            if (isMounted) setError("Failed to retrieve report.");
        } finally {
            if (isMounted) setLoading(false);
        }
    }

    loadStory();
    return () => { isMounted = false; };
  }, [activeEvent]);

  if (!activeEvent) return <div className="p-10 text-center font-mono text-gray-500 uppercase tracking-widest">Initialising Feed...</div>;

  const { prob: activeProbability } = getMarketContext(activeEvent);
  const sortedByVolume = [...events].sort((a, b) => b.volume - a.volume);
  
  // Format Dates
  const reportDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const targetDate = activeEvent.endDate 
    ? new Date(activeEvent.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : "Unknown";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 container mx-auto px-4 mb-12 font-sans">
      
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="border-2 border-black bg-white p-4 md:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            
             {/* Header / Badges */}
             <div className="flex flex-wrap justify-between items-start gap-3 mb-6 border-b-2 border-black pb-4">
                <div className="flex items-center gap-2">
                    <span className="bg-[#CC0000] text-white px-3 py-1 text-xs font-bold uppercase tracking-widest font-mono shadow-sm">
                        LIVE FEED
                    </span>
                    {/* NEW: DATES DISPLAY */}
                    <div className="flex flex-col text-[10px] font-mono leading-tight ml-2 border-l border-gray-300 pl-3 text-gray-500">
                        <span>REPORT: <span className="text-black font-bold">{reportDate.toUpperCase()}</span></span>
                        <span>TARGET: <span className="text-[#CC0000] font-bold">{targetDate.toUpperCase()}</span></span>
                    </div>
                </div>
                
                <div className="flex gap-4 text-xs font-bold font-mono">
                     <div className="flex flex-col items-end">
                        <span className="text-gray-400 text-[10px] uppercase tracking-wider">Volume</span>
                        <span className="text-black">{formatVolume(activeEvent.volume)}</span>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-gray-400 text-[10px] uppercase tracking-wider">Top Odds</span>
                        <span className="text-[#CC0000]">{(activeProbability * 100).toFixed(0)}%</span>
                     </div>
                </div>
             </div>

             {/* DYNAMIC HEADLINE */}
             <h2 className="text-3xl md:text-5xl font-black mb-2 leading-tight text-gray-900 tracking-tight uppercase">
                {newsContent.headline || activeEvent.title}
             </h2>
             {/* CHINESE HEADLINE */}
             {newsContent.headline_cn && (
                 <h3 className="text-xl md:text-2xl font-bold mb-6 text-gray-500 tracking-tight font-serif">
                    {newsContent.headline_cn}
                 </h3>
             )}

             {/* DYNAMIC IMAGE */}
             <div className="relative w-full aspect-video bg-neutral-100 mb-8 border-2 border-black overflow-hidden group">
                {loading || !newsContent.imageUrl ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 text-gray-400">
                        <div className="animate-spin rounded-none h-8 w-8 border-4 border-black border-t-transparent mb-3"></div>
                        <span className="font-mono text-xs uppercase tracking-widest">Decrypting Visuals...</span>
                    </div>
                ) : (
                    <>
                        <img 
                            src={newsContent.imageUrl} 
                            alt="Editorial Illustration"
                            className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none mix-blend-overlay"></div>
                    </>
                )}
             </div>

             {/* Article Body - Bilingual */}
             <div className="prose prose-lg font-serif text-gray-800 max-w-none">
                {loading ? (
                    <div className="animate-pulse space-y-4 p-4">
                        <div className="h-3 bg-gray-200 w-full rounded-sm"></div>
                        <div className="h-3 bg-gray-200 w-11/12 rounded-sm"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <p className="leading-relaxed whitespace-pre-line border-l-4 border-[#CC0000] pl-6 py-1 text-lg">
                            {newsContent.story}
                        </p>
                        {newsContent.story_cn && (
                            <p className="leading-relaxed whitespace-pre-line border-l-4 border-gray-300 pl-6 py-1 text-lg text-gray-600">
                                {newsContent.story_cn}
                            </p>
                        )}
                    </div>
                )}
             </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-black text-white p-3 font-mono text-xs uppercase tracking-widest flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] border-2 border-black">
            <span>Top Activity</span>
            <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#CC0000] rounded-full animate-pulse"></span>
                <span className="text-[#CC0000]">Live</span>
            </span>
        </div>
        
        <div className="flex flex-col gap-3">
            {sortedByVolume.map((e) => {
               const { prob } = getMarketContext(e); 
               const isActive = e.id === activeEvent.id;

               return (
                   <button 
                     key={e.id} 
                     onClick={() => setActiveEvent(e)}
                     className={`relative p-4 text-left group border-2 transition-all duration-200 w-full ${
                        isActive 
                        ? 'bg-zinc-50 border-black shadow-[4px_4px_0px_0px_#CC0000] translate-x-[-2px] translate-y-[-2px] z-10' 
                        : 'bg-white border-gray-200 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:z-10'
                     }`}
                   >
                      <div className="flex justify-between items-center mb-2">
                          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 border ${isActive ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                            {formatVolume(e.volume)}
                          </span>
                          <span className={`text-[10px] font-bold font-mono ${isActive ? 'text-[#CC0000]' : 'text-gray-400'}`}>
                             {(prob * 100).toFixed(0)}%
                          </span>
                      </div>
                      <h4 className={`text-sm font-bold leading-snug line-clamp-2 ${isActive ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>
                        {e.title}
                      </h4>
                   </button>
               );
            })}
        </div>
      </div>
    </div>
  );
}