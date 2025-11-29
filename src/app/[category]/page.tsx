import { getCategoryEvents } from '@/lib/market-service';
import Header from '@/components/Header';
import NewsGrid from '@/components/NewsGrid';

export const revalidate = 60;

// Type definition for Next.js 15+ Dynamic Routes
type Props = {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CategoryPage(props: Props) {
  // 1. Safe Parameter Extraction
  // We default to "Trending" if something goes wrong, but usually, this catches the URL slug (e.g., "web3")
  let category = "Trending";
  
  try {
      const resolvedParams = await props.params;
      if (resolvedParams?.category) {
          category = resolvedParams.category;
      }
  } catch (e) {
      console.error("Error parsing params:", e);
  }
  
  // 2. Fetch Specific Data for this Category
  const events = await getCategoryEvents(category);

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#1a1a1a] font-sans selection:bg-[#CC0000] selection:text-white pb-20">
      <Header />
      
      {events && events.length > 0 ? (
        <NewsGrid 
            events={events} 
            category={category} // <--- CRITICAL UPDATE: Pass the dynamic category
        />
      ) : (
        <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-2xl font-black uppercase mb-4 tracking-widest text-gray-400">Signal Lost</h2>
            <p className="font-mono text-gray-500 text-sm">
                // Unable to retrieve data for sector: {category}.
                <br />
                // Please try again or return to Trending.
            </p>
        </div>
      )}

      <footer className="container mx-auto px-4 text-center font-mono text-xs uppercase text-gray-400 border-t border-gray-300 pt-8 mt-12">
        <p>The Next Dawn Protocol v2.3 // Powered by Polymarket & Grok</p>
      </footer>
    </main>
  );
}