import { getTopEvents } from '@/lib/market-service';
import Header from '@/components/Header';
import NewsGrid from '@/components/NewsGrid';

export const revalidate = 60;

export default async function Home() {
  // 1. Fetch 4 distinct categories
  const [globalEvents, economyEvents, cryptoEvents, techEvents] = await Promise.all([
    getTopEvents('Politics'), // "Global" usually maps best to Politics on Polymarket
    getTopEvents('Business'),
    getTopEvents('Crypto'),
    getTopEvents('Science')   // "Tech" often falls under Science
  ]);

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#1a1a1a] font-serif selection:bg-black selection:text-white scroll-smooth">
      <Header />

      {/* --- HERO SECTION: GLOBAL / POLITICS --- */}
      <section id="global" className="container mx-auto px-4 mb-20 pt-4">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-2">
            <h2 className="text-sm font-sans font-black uppercase tracking-widest text-red-800">Global Affairs</h2>
            <div className="flex-1 h-px bg-gray-400"></div>
        </div>
        
        {globalEvents.length > 0 ? (
          <NewsGrid events={globalEvents} />
        ) : (
          <div className="text-center py-20 text-red-800 italic">
            [System Note: Global data feed is currently silent.]
          </div>
        )}
      </section>

      {/* --- SECTION 2: ECONOMY & TECH (Split View) --- */}
      <section id="economy" className="bg-white border-t border-b border-black py-16 mb-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Economy Column */}
            <div className="border-r-0 md:border-r border-gray-200 md:pr-12">
                <h3 className="font-sans font-black text-2xl mb-6 uppercase border-b-2 border-black pb-2 flex justify-between">
                    <span>Economy</span>
                    <span className="text-xs text-gray-400 font-normal self-end">MARKET MOVERS</span>
                </h3>
                <div className="space-y-8">
                    {economyEvents.slice(0, 4).map(event => (
                        <div key={event.id} className="group cursor-pointer">
                            <h4 className="text-xl md:text-2xl font-bold leading-tight mb-2 group-hover:text-blue-900 transition-colors">
                                {event.title}
                            </h4>
                            <div className="flex justify-between items-center text-xs font-sans text-gray-500 border-t border-gray-100 pt-2">
                                <span className="font-bold text-black">ODDS: {(Number(event.markets[0]?.outcomePrices[0] || 0) * 100).toFixed(0)}%</span>
                                <span>SOURCE: KALSHI</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tech / Science Column */}
            <div id="tech" className="md:pl-4">
                <h3 className="font-sans font-black text-2xl mb-6 uppercase border-b-2 border-black pb-2 flex justify-between">
                    <span>Tech & Science</span>
                    <span className="text-xs text-gray-400 font-normal self-end">FUTURE TENSE</span>
                </h3>
                <div className="space-y-8">
                     {techEvents.slice(0, 4).map(event => (
                        <div key={event.id} className="group cursor-pointer">
                            <h4 className="text-xl md:text-2xl font-bold leading-tight mb-2 group-hover:text-purple-900 transition-colors">
                                {event.title}
                            </h4>
                            <div className="flex justify-between items-center text-xs font-sans text-gray-500 border-t border-gray-100 pt-2">
                                <span className="font-bold text-black">ODDS: {(Number(event.markets[0]?.outcomePrices[0] || 0) * 100).toFixed(0)}%</span>
                                <span>SOURCE: POLYMARKET</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </section>

      {/* --- SECTION 3: CRYPTO (Demoted to bottom) --- */}
      <section id="crypto" className="container mx-auto px-4 mb-20">
        <div className="flex items-center gap-4 mb-6 border-b-4 border-black pb-2">
            <h2 className="text-sm font-sans font-black uppercase tracking-widest text-gray-500">Digital Assets</h2>
            <div className="flex-1 h-px bg-gray-400"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {cryptoEvents.slice(0, 3).map(event => (
                 <div key={event.id} className="bg-white p-6 border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                     <div className="h-1 w-10 bg-blue-500 mb-4"></div>
                     <h4 className="font-serif font-bold text-lg mb-2">{event.title}</h4>
                     <p className="font-sans text-xs text-gray-500">
                        Current Certainty: <span className="text-black font-bold">{(Number(event.markets[0]?.outcomePrices[0] || 0) * 100).toFixed(0)}%</span>
                     </p>
                 </div>
             ))}
        </div>
      </section>

      <footer className="container mx-auto px-4 pb-12 text-center font-sans text-xs uppercase tracking-widest text-gray-500 border-t border-gray-300 pt-8">
        <p className="mb-2">© 2025 EvideX Inc. All futures reserved.</p>
        <p>NextDawn is a probabilistic simulation engine. Not financial advice.</p>
      </footer>
    </main>
  );
}