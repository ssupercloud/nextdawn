import { getCategoryEvents } from '@/lib/market-service';
import Header from '@/components/Header';
import NewsGrid from '@/components/NewsGrid';

export const revalidate = 60;

type Props = {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CategoryPage(props: Props) {
  let category = "Trending";
  
  try {
      const resolvedParams = await props.params;
      if (resolvedParams?.category) {
          category = resolvedParams.category;
      }
  } catch (e) {
      console.error("Error parsing params:", e);
  }
  
  const events = await getCategoryEvents(category);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-[#CC0000] selection:text-white pb-20">
      <Header />
      
      {events && events.length > 0 ? (
        <NewsGrid 
            events={events} 
            category={category} 
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

      {/* UPDATED FOOTER: 3 Lines */}
      <footer className="container mx-auto px-4 text-center font-mono text-[10px] uppercase text-gray-400 border-t border-gray-100 pt-8 mt-12 flex flex-col gap-1.5">
        <p className="font-bold tracking-widest text-gray-500">The Next Dawn Protocol v2.5</p>
        <p>Developed by EvideX</p>
        <p>Powered by Polymarket & Grok</p>
      </footer>
    </main>
  );
}