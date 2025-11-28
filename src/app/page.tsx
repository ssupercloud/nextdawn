import { getTopEvents, getBreakingEvents } from '@/lib/market-service';
import Header from '@/components/Header';
import NewsGrid from '@/components/NewsGrid';

export const revalidate = 60;

export default async function Home() {
  // 1. Fetch "Breaking" (Global Top Volume) + Categories
  const [breakingEvents, cryptoEvents, politicsEvents, techEvents] = await Promise.all([
    getBreakingEvents(), // This is now your main feed
    getTopEvents('Crypto'),
    getTopEvents('Politics'),
    getTopEvents('Science')
  ]);

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#1a1a1a] font-sans selection:bg-[#CC0000] selection:text-white pb-20">
      <Header />

      {/* --- HERO: BREAKING WIRE (Global) --- */}
      <section id="global" className="container mx-auto px-4 mb-20 pt-4">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#CC0000] animate-pulse">
                🔴 LIVE BREAKING WIRE
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
        </div>
        
        {breakingEvents.length > 0 ? (
          <NewsGrid events={breakingEvents} />
        ) : (
          <div className="text-center py-20 text-gray-500 font-mono">
            // SIGNAL LOST: RECONNECTING TO POLYMARKET FEED...
          </div>
        )}
      </section>

      {/* --- SECTION 2: SECTOR WATCH --- */}
      <section id="sectors" className="bg-white border-t-4 border-black py-16 mb-16">
        <div className="container mx-auto px-4">
             <h3 className="text-5xl font-black uppercase tracking-tighter mb-12 text-center">Sector Watch</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Politics */}
                <div className="border-2 border-black p-4 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all bg-[#fff0f0]">
                    <h4 className="font-black text-xl mb-4 border-b-2 border-black pb-2">POLITICS</h4>
                    <ul className="space-y-4">
                        {politicsEvents.slice(0,4).map(e => (
                            <li key={e.id} className="text-sm font-bold hover:text-[#CC0000] cursor-pointer leading-tight">
                                {e.title}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Crypto */}
                <div className="border-2 border-black p-4 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all bg-[#f0f4ff]">
                    <h4 className="font-black text-xl mb-4 border-b-2 border-black pb-2">CRYPTO</h4>
                    <ul className="space-y-4">
                        {cryptoEvents.slice(0,4).map(e => (
                            <li key={e.id} className="text-sm font-bold hover:text-blue-700 cursor-pointer leading-tight">
                                {e.title}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tech */}
                <div className="border-2 border-black p-4 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all bg-[#fdf0ff]">
                    <h4 className="font-black text-xl mb-4 border-b-2 border-black pb-2">TECH</h4>
                    <ul className="space-y-4">
                        {techEvents.slice(0,4).map(e => (
                            <li key={e.id} className="text-sm font-bold hover:text-purple-700 cursor-pointer leading-tight">
                                {e.title}
                            </li>
                        ))}
                    </ul>
                </div>
             </div>
        </div>
      </section>

      <footer className="container mx-auto px-4 text-center font-mono text-xs uppercase text-gray-400">
        <p>NextDawn Protocol v1.0.2 // Powered by Polymarket & Grok</p>
      </footer>
    </main>
  );
}