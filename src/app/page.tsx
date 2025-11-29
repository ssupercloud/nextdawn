import { getBreakingEvents } from '@/lib/market-service';
import Header from '@/components/Header';
import NewsGrid from '@/components/NewsGrid';

export const revalidate = 60;

export default async function Home() {
  // Fetch "Breaking" (Global Top Volume)
  const breakingEvents = await getBreakingEvents();

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#1a1a1a] font-sans selection:bg-[#CC0000] selection:text-white pb-20">
      <Header />
      
      {breakingEvents.length > 0 ? (
        <NewsGrid events={breakingEvents} />
      ) : (
        <div className="text-center py-20 text-gray-500 font-mono">
            // SIGNAL LOST: RECONNECTING TO POLYMARKET FEED...
        </div>
      )}

      <footer className="container mx-auto px-4 text-center font-mono text-xs uppercase text-gray-400 border-t border-gray-300 pt-8 mt-12">
        <p>NextDawn Protocol v2.0 // Powered by Polymarket & Grok</p>
      </footer>
    </main>
  );
}