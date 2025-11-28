import axios from 'axios';

// Polymarket Gamma API Endpoint
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
    outcomes: string[];
    outcomePrices: string[]; 
  }[];
}

const safeParseArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      return [];
    }
  }
  return [];
};

export async function getTopEvents(tag: 'Crypto' | 'Business' | 'Science' | 'Politics'): Promise<MarketEvent[]> {
  try {
    const response = await axios.get(GAMMA_API, {
      params: {
        limit: 10,
        active: true,
        closed: false,
        tag_slug: tag.toLowerCase(),
        volume_min: 10000, // Filter out low-activity noise
        order: 'volume',   // STRICTLY RANK BY VOLUME
        ascending: false   // HIGHEST FIRST
      }
    });

    if (!response.data || !Array.isArray(response.data)) {
      console.warn(`Polymarket API returned unexpected format for tag: ${tag}`);
      return [];
    }

    return response.data.map((event: any) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      category: tag,
      startDate: event.start_date,
      endDate: event.end_date,
      volume: Number(event.volume || 0), // Ensure volume is captured
      markets: Array.isArray(event.markets) ? event.markets.map((m: any) => ({
        question: m.question,
        outcomes: safeParseArray(m.outcomes),
        outcomePrices: safeParseArray(m.outcomePrices)
      })) : []
    }));
  } catch (error) {
    console.error(`Error fetching ${tag} events:`, error);
    return [];
  }
}