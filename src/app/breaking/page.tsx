import { getViralEvents } from '@/lib/market-service';
import Header from '@/components/Header';
import NewsGrid from '@/components/NewsGrid';

export const revalidate = 60;

export default async function BreakingNewsPage() {
  // Fetch "Viral" (Liquidity/Active) events filtered for relevance
  const viralEvents = await getViralEvents();

  return (
    // FIXED: Changed bg-[#F4F1EA] to bg-background (Pure White)
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-[#CC0000] selection:text-white pb-20">
      <Header />
      
      {viralEvents.length > 0 ? (
        <NewsGrid 
            events={viralEvents} 
            category="Breaking" 
        />
      ) : (
        <div className="text-center py-20 text-gray-500 font-mono">
            // SIGNAL LOST: RECONNECTING TO WIRE...
        </div>
      )}

      {/* UPDATED FOOTER: 3 Lines */}
      <footer className="container mx-auto px-4 text-center font-mono text-[10px] uppercase text-gray-400 border-t border-gray-100 pt-8 mt-12 flex flex-col gap-1.5">
        <p className="font-bold tracking-widest text-gray-500">The Next Dawn Protocol v2.5</p>
        <p>Developed by EvideX</p>
        <p>Powered by Polymarket & Grok</p>
      </footer>
    </main>
  );
}