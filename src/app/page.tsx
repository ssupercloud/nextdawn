import { getBreakingEvents } from '@/lib/market-service';
import Header from '@/components/Header';
import NewsGrid from '@/components/NewsGrid';

export const revalidate = 60;

export default async function Home() {
  const breakingEvents = await getBreakingEvents();

  return (
    // FIXED: Changed bg-[#F4F1EA] to bg-background (Pure White)
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-[#CC0000] selection:text-white pb-20">
      <Header />
      
      {breakingEvents.length > 0 ? (
        <NewsGrid 
            events={breakingEvents} 
            category="Trending" 
        />
      ) : (
        <div className="text-center py-20 text-gray-500 font-mono">
            // SIGNAL LOST: RECONNECTING TO POLYMARKET FEED...
        </div>
      )}

      <footer className="container mx-auto px-4 text-center font-mono text-xs uppercase text-gray-400 border-t border-gray-100 pt-8 mt-12">
        <p>The Next Dawn Protocol v2.4 // Powered by Polymarket & Grok</p>
      </footer>
    </main>
  );
}