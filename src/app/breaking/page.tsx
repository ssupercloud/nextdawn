import { getViralEvents } from '@/lib/market-service';
import Header from '@/components/Header';
import NewsGrid from '@/components/NewsGrid';

export const revalidate = 60;

export default async function BreakingNewsPage() {
  // Fetch "Viral" (Liquidity/Active) events
  const viralEvents = await getViralEvents();

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#1a1a1a] font-sans selection:bg-[#CC0000] selection:text-white pb-20">
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

      <footer className="container mx-auto px-4 text-center font-mono text-xs uppercase text-gray-400 border-t border-gray-300 pt-8 mt-12">
        <p>The Next Dawn Protocol v2.4 // Powered by Polymarket & Grok</p>
      </footer>
    </main>
  );
}