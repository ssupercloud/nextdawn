import axios from 'axios';

const XAI_API_KEY = process.env.XAI_API_KEY;

console.log("✅ AI Reporter: Creative Engine V15 (Serious Journalism)");

export interface NewsContent {
  headline: string;
  story: string;
  headline_cn: string;
  story_cn: string;
  imageUrl: string;
  impact: string; 
}

export async function generateNewsArticle(eventTitle: string, marketContext: string, probability: number, targetDate: string): Promise<NewsContent> {
  if (!XAI_API_KEY) {
    return { 
        headline: "System Offline", story: "Config pending.", 
        headline_cn: "系统离线", story_cn: "配置待定", 
        imageUrl: "", impact: "LOW" 
    };
  }
  
  const rawWinner = marketContext.split(',')[0] || "Unknown";
  const winnerName = rawWinner.split('(')[0].trim();

  // DYNAMIC DATE: Set context to shortly after the resolution
  let simulatedDate = "The Near Future";
  if (targetDate && targetDate !== "Unknown") {
      try {
          const dateObj = new Date(targetDate);
          dateObj.setDate(dateObj.getDate() + 2); // 2 days after event
          simulatedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      } catch (e) {}
  }

  const systemPrompt = `
    You are a Senior Chief Editor for a prestigious global news agency (like Reuters, The Economist, or Financial Times).
    Current Date: ${simulatedDate}.
    
    SUBJECT: "${eventTitle}".
    CONFIRMED OUTCOME: ${winnerName}.
    
    TASK:
    Write a serious, insightful, and comprehensive news report analyzing this outcome.
    
    STRICT GUIDELINES:
    1. **TONE**: Professional, objective, analytical, and grounded. NO sci-fi slang, NO "cyberpunk" references, NO sensationlism.
    2. **DEPTH**: You must explain the *significance* of this event. Who is the winner? What is their history? Why does this matter to the global market/political landscape?
    3. **LENGTH**: CRITICAL. The story MUST be at least 350 words. Do not summarize. Elaborate on the background and implications.
    4. **PERSPECTIVE**: Treat the outcome as a confirmed historical fact that just happened.
    
    STRUCTURE:
    - **The Lede**: State the victory clearly and its immediate impact.
    - **The Background**: Contextualize the winner (Who are they? What was the path to victory?).
    - **The Analysis**: Why did this happen? What were the key drivers?
    - **The Outlook**: What comes next?
    
    OUTPUT JSON:
    {
      "headline": "Serious, professional headline (Max 10 words)",
      "story": "A long, detailed article (Min 350 words). Use standard paragraph formatting (\\n\\n).",
      "headline_cn": "Chinese translation of headline (Formal/Professional Chinese)",
      "story_cn": "Chinese translation of the full story (Formal/Professional Chinese)",
      "image_prompt": "An editorial illustration suitable for the Wall Street Journal or The Economist. Style: 'stipple drawing, editorial illustration, serious, detailed, high contrast'.",
      "impact": "CRITICAL" | "HIGH" | "MEDIUM"
    }
  `;

  const userPrompt = `Write the comprehensive report for: ${winnerName}`;

  const callGrok = async (modelName: string) => {
    return axios.post('https://api.x.ai/v1/chat/completions', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: modelName,
      temperature: 0.4, // Lower temperature for more grounded/consistent output
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

    // Updated Image Style for "Serious News"
    const styleSuffix = " editorial illustration, wsj stipple style, detailed, serious, trending on artstation, 4k";
    const encodedPrompt = encodeURIComponent(parsed.image_prompt + styleSuffix);
    const dynamicImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${Math.random()}&width=1024&height=576`;

    return {
        headline: parsed.headline || `${winnerName} Secures Victory`,
        story: parsed.story || "Data verification in progress...",
        headline_cn: parsed.headline_cn || `${winnerName} 获胜`,
        story_cn: parsed.story_cn || "数据核实中...",
        imageUrl: dynamicImageUrl,
        impact: parsed.impact || "HIGH"
    };

  } catch (error: any) {
    console.error("❌ Generation Error:", error.message);
    return {
        headline: `Report: ${winnerName}`,
        story: `Official records indicate ${winnerName} has secured the position. Analysts are currently reviewing the implications.`,
        headline_cn: `报告: ${winnerName}`,
        story_cn: `官方记录显示 ${winnerName} 已获得该职位。分析师目前正在审查其影响。`,
        imageUrl: `https://image.pollinations.ai/prompt/newspaper%20press?nologo=true`,
        impact: "MEDIUM"
    };
  }
}