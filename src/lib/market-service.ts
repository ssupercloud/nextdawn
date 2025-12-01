import axios from 'axios';

const GAMMA_API = 'https://gamma-api.polymarket.com/events';

export interface MarketEvent {
  id: string;
  title: string;
  slug: string;
  category: string;
  startDate: string;
  endDate: string;
  volume: number;
  markets: {
    question: string;
    groupItemTitle: string; 
    outcomes: string[];
    outcomePrices: string[]; 
  }[];
}

const safeParseArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) { return []; }
  }
  return [];
};

const CATEGORY_MAP: Record<string, string> = {
    'web3': 'crypto',
    'economy': 'business',
    'technology': 'science',
    'sports': 'sports',
    'culture': 'pop-culture', 
    'politics': 'politics'
};

// HELPER: Get ISO date string for X days ago
const getRecentDateISO = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
};

export async function getCategoryEvents(category: string): Promise<MarketEvent[]> {
    if (!category) return getBreakingEvents();

    const apiTag = CATEGORY_MAP[category.toLowerCase()] || category;
    
    if (category.toLowerCase() === 'trending') {
        return getBreakingEvents();
    }

    try {
        const response = await axios.get(GAMMA_API, {
            params: {
                limit: 65,
                active: true,
                closed: false,
                tag_slug: apiTag.toLowerCase(),
                volume_min: 1000, 
                order: 'volume',
                ascending: false
            }
        });

        if (!response.data || !Array.isArray(response.data)) return [];
        return mapResponse(response.data, apiTag);
    } catch (error) {
        console.error(`Error fetching ${category} events:`, error);
        return [];
    }
}

// FRONT PAGE (TRENDING): All-time high volume
export async function getBreakingEvents(): Promise<MarketEvent[]> {
    try {
        const response = await axios.get(GAMMA_API, {
            params: {
                limit: 20, 
                active: true,
                closed: false,
                volume_min: 50000, 
                order: 'volume',   
                ascending: false
            }
        });

        if (!response.data || !Array.isArray(response.data)) return [];
        return mapResponse(response.data, "Trending");
    } catch (error) {
        console.error("Error fetching trending events:", error);
        return [];
    }
}

// BREAKING NEWS PAGE: Filtered for Tech, Economy, Politics (No Sports)
export async function getViralEvents(): Promise<MarketEvent[]> {
    try {
        const response = await axios.get(GAMMA_API, {
            params: {
                limit: 100, // Fetch large pool to allow for filtering
                active: true,
                closed: false,
                volume_min: 1000, 
                start_date_min: getRecentDateISO(7), 
                order: 'volume', 
                ascending: false
            }
        });

        if (!response.data || !Array.isArray(response.data)) return [];

        // STRICT FILTERING LOGIC
        const allowedTags = ['politics', 'business', 'economy', 'science', 'technology', 'crypto', 'tech', 'finance'];
        const bannedTags = ['sports', 'football', 'soccer', 'baseball', 'basketball', 'nfl', 'nba'];

        const filteredData = response.data.filter((event: any) => {
            // Polymarket events usually have a 'tags' array
            const tags = event.tags || [];
            
            // 1. Check if it contains any BANNED tags (Sports)
            const isSports = tags.some((t: any) => bannedTags.includes(t.slug?.toLowerCase()));
            if (isSports) return false;

            // 2. Check if it contains any ALLOWED tags (Politics, Econ, Tech)
            const isRelevant = tags.some((t: any) => allowedTags.includes(t.slug?.toLowerCase()));
            return isRelevant;
        });

        // Return top 17 (2 Hero + 15 Wire)
        return mapResponse(filteredData.slice(0, 17), "Breaking");
    } catch (error) {
        console.error("Error fetching viral events:", error);
        return [];
    }
}

export async function getTopEvents(tag: 'Crypto' | 'Business' | 'Science' | 'Politics'): Promise<MarketEvent[]> {
    return getCategoryEvents(tag);
}

function mapResponse(data: any[], category: string): MarketEvent[] {
    return data.map((event: any) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      category: category,
      startDate: event.start_date,
      endDate: event.endDate || event.end_date, 
      volume: Number(event.volume || 0),
      markets: Array.isArray(event.markets) ? event.markets.map((m: any) => ({
        question: m.question,
        groupItemTitle: m.groupItemTitle || m.question || "Outcome", 
        outcomes: safeParseArray(m.outcomes),
        outcomePrices: safeParseArray(m.outcomePrices)
      })) : []
    }));
}