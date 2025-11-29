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
    'web3': 'Crypto',
    'economy': 'Business',
    'technology': 'Science',
    'sports': 'Sports',
    'culture': 'Pop Culture', 
    'politics': 'Politics'
};

export async function getCategoryEvents(category: string): Promise<MarketEvent[]> {
    // SAFETY: Default to "breaking" if category is missing or empty
    if (!category) return getBreakingEvents();

    const apiTag = CATEGORY_MAP[category.toLowerCase()] || category;
    
    if (category.toLowerCase() === 'trending') {
        return getBreakingEvents();
    }

    try {
        const response = await axios.get(GAMMA_API, {
            params: {
                limit: 12,
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

export async function getBreakingEvents(): Promise<MarketEvent[]> {
    try {
        const response = await axios.get(GAMMA_API, {
            params: {
                limit: 12,
                active: true,
                closed: false,
                volume_min: 50000, 
                order: 'volume',   
                ascending: false
            }
        });

        if (!response.data || !Array.isArray(response.data)) return [];
        return mapResponse(response.data, "Breaking");
    } catch (error) {
        console.error("Error fetching breaking events:", error);
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