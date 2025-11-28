import { Search, Menu } from 'lucide-react';

export default function Header() {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1); // Date = Today + 1 Year

  return (
    <header className="border-b-4 border-black mb-8 sticky top-0 bg-[#F4F1EA] z-50 shadow-md">
      {/* Top Bar */}
      <div className="container mx-auto px-4 py-2 flex justify-between items-center text-[10px] md:text-xs font-serif border-b border-gray-300">
        <span className="hidden md:inline">VOL NO. 1</span>
        <span className="uppercase tracking-widest font-bold">{futureDate.toDateString()}</span>
        <span>0.1 ETH</span>
      </div>
      
      {/* Logo Area */}
      <div className="py-6 text-center">
        <h1 className="text-5xl md:text-8xl font-black font-serif tracking-tighter uppercase leading-none hover:opacity-80 transition-opacity cursor-pointer">
          <a href="/">The Next Dawn</a>
        </h1>
        <p className="text-xs md:text-sm font-medium italic mt-2 text-gray-600 font-sans tracking-wide">
          "Your Web3 Newspaper of Tomorrow"
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="border-t border-black border-b flex justify-center py-3 font-bold font-sans text-xs md:text-sm gap-6 md:gap-12 overflow-x-auto whitespace-nowrap px-4 bg-white">
        <a href="#global" className="hover:text-red-700 hover:underline transition-colors">环球</a>
        <a href="#crypto" className="hover:text-green-700 hover:underline transition-colors">数字资产</a>
        <a href="#web3" className="hover:text-orange-700 hover:underline transition-colors">Web3</a>
        <a href="#economy" className="hover:text-blue-700 hover:underline transition-colors">财经</a>
        <a href="#tech" className="hover:text-purple-700 hover:underline transition-colors">科技</a>
        <a href="#sports" className="hover:text-yellow-700 hover:underline transition-colors">体育</a>
      </nav>
    </header>
  );
}