'use client';

import { useState, useEffect } from 'react';
import { MarketEvent } from '@/lib/market-service';
import { fetchOrGenerateStory } from '@/app/actions';

export default function NewsGrid({ events }: { events: MarketEvent[] }) {
  const [activeEvent, setActiveEvent] = useState<MarketEvent | null>(events[0] || null);
  
  // New State for multimedia
  const [newsContent, setNewsContent] = useState({
      headline: "",
      story: "",
      imageUrl: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to format large numbers (e.g. 1500000 -> $1.5M)
  const formatVolume = (num: number) => {
    if (num >= 1000000) {
      return '$' + (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return '$' + (num / 1000).toFixed(0) + 'k';
    }
    return '$' + num.toString();
  };

  const getProbability = (event: MarketEvent) => {
    try {
      if (!event.markets?.[0]?.outcomePrices) return 0;
      const prices = event.markets[0].outcomePrices.map(p => Number(p));
      return Math.max(...prices) || 0;
    } catch (e) { return 0; }
  };

  const getWinningOutcome = (event: MarketEvent) => {
    try {
        const market = event.markets?.[0];
        if (!market) return "Unknown";
        const price0 = Number(market.outcomePrices?.[0] || 0);
        const price1 = Number(market.outcomePrices?.[1] || 0);
        return price0 > price1 ? market.outcomes?.[0] || "Yes" : market.outcomes?.[1] || "No";
    } catch (e) { return "Unknown"; }
  };

  useEffect(() => {
    // 1. Guard Clause: If no event, stop immediately.
    if (!activeEvent) return;

    let isMounted = true;
    
    async function loadStory() {
        setLoading(true);
        setError(null);
        
        // Use activeEvent! because we passed the guard clause above
        setNewsContent(prev => ({ ...prev, headline: activeEvent!.title, story: "", imageUrl: "" }));

        try {
            // FIX: Added '!' to assert non-null to TypeScript
            const probability = getProbability(activeEvent!);
            const outcome = getWinningOutcome(activeEvent!);

            const data = await fetchOrGenerateStory(
                activeEvent!.id, 
                activeEvent!.title, 
                outcome, 
                probability
            );
            
            if (isMounted) {
                setNewsContent({
                    headline: data.headline,
                    story: data.story,
                    imageUrl: data.imageUrl
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

  if (!activeEvent) return <div className="p-10 text-center font-serif text-gray-500">Waiting for news wire...</div>;

  const activeProbability = getProbability(activeEvent);

  // STRICT SORT: Ensure sidebar is strictly ranked by volume (Highest First)
  const sortedByVolume = [...events].sort((a, b) => b.volume - a.volume);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 container mx-auto px-4 mb-12">
      
      {/* --- LEFT COLUMN: Main Story --- */}
      <div className="md:col-span-8 border-b md:border-b-0 md:border-r border-black pr-0 md:pr-8 pb-8">
         
         {/* Metadata Badge */}
         <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-1">
            <span className="bg-red-700 text-white px-2 py-1 text-xs font-bold uppercase tracking-widest font-sans">
                Breaking News
            </span>
            <div className="flex gap-3 text-xs font-bold text-gray-600 font-mono">
                <span>VOL: {formatVolume(activeEvent.volume)}</span>
                <span>CERTAINTY: {(activeProbability * 100).toFixed(0)}%</span>
            </div>
         </div>

         {/* DYNAMIC HEADLINE (Replaces Raw Title) */}
         <h2 className="text-4xl md:text-6xl font-serif font-black mb-6 leading-tight text-gray-900">
            {newsContent.headline || activeEvent.title}
         </h2>

         {/* DYNAMIC IMAGE (Replaces Placeholder) */}
         <div className="w-full h-64 md:h-96 bg-neutral-100 mb-8 border border-gray-400 relative overflow-hidden">
            {loading || !newsContent.imageUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                    <span className="font-mono text-xs">Visualizing Timeline...</span>
                </div>
            ) : (
                <img 
                    src={newsContent.imageUrl} 
                    alt="Editorial Cartoon"
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
            )}
         </div>

         {/* Article Body */}
         <div className="prose prose-lg font-serif text-gray-900 max-w-none columns-1 md:columns-2 gap-8">
            {loading ? (
                <div className="animate-pulse space-y-4 break-inside-avoid">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
            ) : (
                <p className="first-letter:text-5xl first-letter:font-black first-letter:mr-2 first-letter:float-left leading-relaxed whitespace-pre-line break-inside-avoid-column">
                    {newsContent.story}
                </p>
            )}
         </div>
      </div>

      {/* --- RIGHT COLUMN: Sidebar (Strictly Sorted by Volume) --- */}
      <div className="md:col-span-4 flex flex-col gap-6 pl-0 md:pl-4">
        <h3 className="font-sans font-black text-sm border-t-4 border-black pt-2 uppercase tracking-widest">
            Highest Volume Wires
        </h3>
        
        <div className="flex flex-col gap-4">
            {sortedByVolume.map((e) => {
               const prob = getProbability(e);
               const isActive = e.id === activeEvent.id;

               return (
                   <button 
                     key={e.id} 
                     onClick={() => setActiveEvent(e)}
                     className={`text-left group border-b border-gray-300 pb-4 last:border-0 transition-all ${isActive ? 'opacity-100 pl-2 border-l-4 border-l-black' : 'opacity-70 hover:opacity-100'}`}
                   >
                      <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-bold font-mono ${isActive ? 'text-red-700' : 'text-gray-500'}`}>
                            {formatVolume(e.volume)} VOL
                          </span>
                          <span className={`text-[10px] font-bold font-mono ${isActive ? 'text-black' : 'text-gray-400'}`}>
                             {(prob * 100).toFixed(0)}% CHANCE
                          </span>
                      </div>
                      <h4 className="text-lg font-serif font-bold leading-tight group-hover:underline">
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