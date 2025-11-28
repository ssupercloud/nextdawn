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

export async function getBreakingEvents(): Promise<MarketEvent[]> {
    try {
        const response = await axios.get(GAMMA_API, {
            params: {
                limit: 10,
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
  try {
    const response = await axios.get(GAMMA_API, {
      params: {
        limit: 10,
        active: true,
        closed: false,
        tag_slug: tag.toLowerCase(),
        volume_min: 5000, 
        order: 'volume',
        ascending: false
      }
    });

    if (!response.data || !Array.isArray(response.data)) return [];
    return mapResponse(response.data, tag);
  } catch (error) {
    console.error(`Error fetching ${tag} events:`, error);
    return [];
  }
}

function mapResponse(data: any[], category: string): MarketEvent[] {
    return data.map((event: any) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      category: category,
      startDate: event.start_date,
      // FIXED: Polymarket Gamma API uses 'endDate' (camelCase), not 'end_date'
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