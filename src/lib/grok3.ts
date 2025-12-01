import axios from 'axios';

const XAI_API_KEY = process.env.XAI_API_KEY;

console.log("✅ AI Reporter: Creative Engine V24 (Objective Analyst)");

export interface NewsContent {
  headline: string;
  story: string;
  headline_cn: string;
  story_cn: string;
  imageUrl: string;
  impact: string; 
}

export async function generateNewsArticle(
    eventTitle: string, 
    marketContext: string, 
    probability: number, 
    targetDate: string,
    forcedHeadline?: string
): Promise<NewsContent> {
  if (!XAI_API_KEY) {
    return { 
        headline: "System Offline", story: "Config pending.", 
        headline_cn: "系统离线", story_cn: "配置待定", 
        imageUrl: "", impact: "LOW" 
    };
  }
  
  const rawWinner = marketContext.split(',')[0] || "Unknown";
  const winnerName = rawWinner.split('(')[0].trim();
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const systemPrompt = `
    You are a Senior Market Intelligence Analyst for a premier financial terminal (like Bloomberg or Polymarket Analytics).
    Current Date: ${currentDate}.
    Target Event Date: ${targetDate || "Future"}.
    
    SUBJECT: "${eventTitle}".
    CURRENT MARKET DATA: ${marketContext}.
    
    TASK:
    Write an objective, analytical, and insightful deep-dive into this prediction market.
    
    CRITICAL RULE: DO NOT PRETEND THE EVENT HAS ALREADY HAPPENED.
    - You are analyzing the *probability* and *sentiment* of the market right now.
    - If odds are close (e.g., 45% vs 55%), describe it as a "Tight Race" or "Divided Market".
    - If odds are high (e.g., >75%), describe it as a "Strong Consensus" or "Clear Favorite".
    
    REQUIRED STRUCTURE (Seamless Flow):
    1. **The Lead**: Define exactly what this event is and the current state of the market (Who is leading? By how much? How is it trending in rencent days).
    2. **The Field**: Breakdown the main options/competitors shown in the market data. Who are the key players?
    3. **The Stakes**: Why is this relevant? Why does the market care? (Geopolitics, Economics, Cultural Impact).
    4. **The Context**: Provide real-world background or recent developments that might be driving these specific odds.
    
    TRANSLATION RULES (CHINESE):
    - Translate into professional, financial Simplified Chinese (Caixin/WSJ style).
    - Tone: Objective, Analytical, Serious (理性, 分析, 专业).
    
    OUTPUT JSON:
    {
      "headline": "${forcedHeadline || "English Headline"}",
      "story": "A comprehensive analysis (Min 300 words). Use \\n\\n for paragraph breaks.",
      "headline_cn": "Professional Chinese translation of the headline.",
      "story_cn": "Professional Chinese translation of the story.",
      "image_prompt": "Editorial illustration style, serious, high contrast, data-driven themes.",
      "impact": "HIGH"
    }
  `;

  const userPrompt = `Analyze the market for: ${eventTitle}`;

  const callGrok = async (modelName: string) => {
    return axios.post('https://api.x.ai/v1/chat/completions', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: modelName,
      temperature: 0.3, // Low temp for factual consistency
      stream: false,
    }, {
      headers: { 'Authorization': `Bearer ${XAI_API_KEY}`, 'Content-Type': 'application/json' }
    });
  };

  try {
    const response = await callGrok('grok-4-fast-non-reasoning');
    const rawContent = response.data.choices[0].message.content;
    
    let parsed: any;
    try { 
        // V21 JSON SANITIZER
        let clean = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = clean.indexOf('{');
        const lastBrace = clean.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            clean = clean.substring(firstBrace, lastBrace + 1);
        }
        clean = clean.replace(/(?<!\\)\n/g, "\\n");
        parsed = JSON.parse(clean); 
    } catch (e) { 
        console.error("JSON Parse Failed. Attempting Salvage...");
        const extract = (key: string) => {
            const regex = new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,\\s*"|\\s*})`);
            const match = rawContent.match(regex);
            return match ? match[1].replace(/\\n/g, '\n') : "";
        };

        parsed = {
            headline: extract("headline") || forcedHeadline || `Market Analysis: ${eventTitle}`,
            story: extract("story") || "We are currently aggregating market data for this event. Please refresh shortly.",
            headline_cn: extract("headline_cn") || `市场分析：${eventTitle}`,
            story_cn: extract("story_cn") || "数据聚合中，请稍后刷新。",
            image_prompt: extract("image_prompt") || "financial analysis",
            impact: "HIGH"
        };
    }

    const styleSuffix = " editorial illustration, wsj stipple style, detailed, serious, trending on artstation, 4k";
    const encodedPrompt = encodeURIComponent((parsed.image_prompt || "financial news") + styleSuffix);
    const uniqueSeed = Math.floor(Math.random() * 1000000) + Date.now();
    const dynamicImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${uniqueSeed}&width=1024&height=576`;

    return {
        headline: parsed.headline,
        story: parsed.story,
        headline_cn: parsed.headline_cn,
        story_cn: parsed.story_cn,
        imageUrl: dynamicImageUrl,
        impact: parsed.impact || "HIGH"
    };

  } catch (error: any) {
    console.error("❌ Generation Error:", error.message);
    return {
        headline: `Market Update: ${eventTitle}`,
        story: `Current market data indicates ${winnerName} is leading with a probability of ${(probability * 100).toFixed(1)}%. Analysts are monitoring volume shifts closely.`,
        headline_cn: `市场更新：${eventTitle}`,
        story_cn: `当前市场数据显示 ${winnerName} 处于领先地位，胜率为 ${(probability * 100).toFixed(1)}%。分析师正在密切关注成交量变化。`,
        imageUrl: `https://image.pollinations.ai/prompt/financial%20chart?nologo=true`,
        impact: "MEDIUM"
    };
  }
}