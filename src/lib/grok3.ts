import axios from 'axios';

const XAI_API_KEY = process.env.XAI_API_KEY;

console.log("✅ AI Reporter: Creative Engine V11 (Bilingual Historian)");

export interface NewsContent {
  headline: string;
  story: string;
  headline_cn: string; // NEW: Chinese Headline
  story_cn: string;    // NEW: Chinese Story
  imageUrl: string;
  impact: string; 
}

export async function generateNewsArticle(eventTitle: string, marketContext: string, probability: number, date: string): Promise<NewsContent> {
  if (!XAI_API_KEY) {
    return { 
        headline: "System Offline", story: "Config pending.", 
        headline_cn: "系统离线", story_cn: "配置待定", 
        imageUrl: "", impact: "LOW" 
    };
  }
  
  const rawWinner = marketContext.split(',')[0] || "Unknown";
  const winnerName = rawWinner.split('(')[0].trim();

  // 3. THE PROMPT - BILINGUAL HISTORIAN
  const systemPrompt = `
    You are a Historian writing in the year 2030.
    SUBJECT: "${eventTitle}".
    CONFIRMED OUTCOME: ${winnerName}.
    
    TASK:
    Write a retrospective news entry describing how ${winnerName} secured this victory.
    
    RULES:
    1. TREAT THE OUTCOME AS FACT.
    2. IGNORE probabilities. History is written by the victors.
    3. TONE: Definitive, "Cyberpunk/High-Tech".
    4. LANGUAGE: Provide the output in both English and Simplified Chinese.
    
    OUTPUT JSON:
    {
      "headline": "English headline stating victory (Max 8 words)",
      "story": "English story (Max 100 words). Past tense verbs.",
      "headline_cn": "Chinese translation of the headline (Simplified Chinese)",
      "story_cn": "Chinese translation of the story (Simplified Chinese)",
      "image_prompt": "A heroic/iconic digital art representation of ${winnerName}. Style: 'Cyberpunk, red and black, high contrast vector'.",
      "impact": "CRITICAL" | "HIGH" | "MEDIUM"
    }
  `;

  const userPrompt = `Write the bilingual history entry for: ${winnerName}`;

  const callGrok = async (modelName: string) => {
    return axios.post('https://api.x.ai/v1/chat/completions', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: modelName,
      temperature: 0.8,
      stream: false,
      response_format: { type: "json_object" }
    }, {
      headers: { 'Authorization': `Bearer ${XAI_API_KEY}`, 'Content-Type': 'application/json' }
    });
  };

  try {
    const response = await callGrok('grok-2-latest');
    const rawContent = response.data.choices[0].message.content;
    
    let parsed: any;
    try { parsed = JSON.parse(rawContent); } 
    catch (e) { 
        const clean = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(clean); 
    }

    const styleSuffix = " digital art, vector illustration, neo-brutalist style, high contrast, red and black, trending on artstation";
    const encodedPrompt = encodeURIComponent(parsed.image_prompt + styleSuffix);
    const dynamicImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${Math.random()}&width=1024&height=576`;

    return {
        headline: parsed.headline || `${winnerName} Wins`,
        story: parsed.story || "Archives recovering data...",
        headline_cn: parsed.headline_cn || `${winnerName} 获胜`,
        story_cn: parsed.story_cn || "正在恢复档案数据...",
        imageUrl: dynamicImageUrl,
        impact: parsed.impact || "HIGH"
    };

  } catch (error: any) {
    console.error("❌ Generation Error:", error.message);
    return {
        headline: `Legacy Data: ${winnerName}`,
        story: `Historical records confirm ${winnerName} as the primary subject.`,
        headline_cn: `历史数据: ${winnerName}`,
        story_cn: `历史记录确认 ${winnerName} 为主要对象。`,
        imageUrl: `https://image.pollinations.ai/prompt/cyberpunk%20glitch?nologo=true`,
        impact: "MEDIUM"
    };
  }
}