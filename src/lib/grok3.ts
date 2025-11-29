import axios from 'axios';

const XAI_API_KEY = process.env.XAI_API_KEY;

console.log("✅ AI Reporter: Creative Engine V23 (Unique Visuals)");

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

  let simulatedDate = "The Near Future";
  if (targetDate && targetDate !== "Unknown") {
      try {
          const dateObj = new Date(targetDate);
          dateObj.setDate(dateObj.getDate() + 2);
          simulatedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      } catch (e) {}
  }

  const systemPrompt = `
    You are a Senior Chief Editor for a global financial news agency. 
    Current Date: ${simulatedDate}.
    SUBJECT: "${eventTitle}". 
    CONFIRMED OUTCOME: ${winnerName}.
    
    TASK: Write a comprehensive news report (Min 300 words).
    
    ${forcedHeadline ? `MANDATORY HEADLINE: You MUST use this exact English headline: "${forcedHeadline}"` : ''}
    
    TRANSLATION RULES (CHINESE):
    - Translate headline and story into SIMPLIFIED CHINESE.
    - DO NOT translate literally. Use idiomatic, professional financial Chinese (e.g. Caixin/Bloomberg CN style).
    - Tone: Serious, sophisticated, fluent.
    
    OUTPUT JSON:
    {
      "headline": "${forcedHeadline || "English Headline"}",
      "story": "Long English story (Min 300 words). Use \\n\\n for paragraphs.",
      "headline_cn": "Professional Chinese translation of the headline.",
      "story_cn": "Professional Chinese translation of the story.",
      "image_prompt": "Editorial illustration style, serious, high contrast.",
      "impact": "HIGH"
    }
  `;

  const userPrompt = `Write the report for: ${winnerName}`;

  const callGrok = async (modelName: string) => {
    return axios.post('https://api.x.ai/v1/chat/completions', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: modelName,
      temperature: 0.3, 
      stream: false,
    }, {
      headers: { 'Authorization': `Bearer ${XAI_API_KEY}`, 'Content-Type': 'application/json' }
    });
  };

  try {
    const response = await callGrok('grok-2-latest');
    const rawContent = response.data.choices[0].message.content;
    
    let parsed: any;
    try { 
        // --- V21 JSON SANITIZER ---
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
        // Regex Salvage
        const extract = (key: string) => {
            const regex = new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*?)"(?=\\s*,\\s*"|\\s*})`);
            const match = rawContent.match(regex);
            return match ? match[1].replace(/\\n/g, '\n') : "";
        };

        parsed = {
            headline: extract("headline") || forcedHeadline || `${winnerName} Wins`,
            story: extract("story") || "We are currently processing the full report details. Please refresh shortly.",
            headline_cn: extract("headline_cn") || `${winnerName} 获胜`,
            story_cn: extract("story_cn") || "报告详情正在处理中，请稍后刷新。",
            image_prompt: extract("image_prompt") || "breaking news",
            impact: "HIGH"
        };
    }

    const styleSuffix = " editorial illustration, wsj stipple style, detailed, serious, trending on artstation, 4k";
    const encodedPrompt = encodeURIComponent((parsed.image_prompt || "breaking news") + styleSuffix);
    
    // FIX: Add Date.now() to seed to ensure uniqueness every time
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
        headline: `Report: ${winnerName}`,
        story: `Official records indicate ${winnerName} has secured the position.`,
        headline_cn: `报告: ${winnerName}`,
        story_cn: `官方记录显示 ${winnerName} 已获得该职位。`,
        imageUrl: `https://image.pollinations.ai/prompt/newspaper%20press?nologo=true`,
        impact: "MEDIUM"
    };
  }
}