import axios from 'axios';

const XAI_API_KEY = process.env.XAI_API_KEY;

// VERSION CHECK: Version 4.0 includes JSON Parsing & Image Generation
console.log("✅ AI Reporter Module Loaded (Version 4.0 - Multimedia)");

export interface NewsContent {
  headline: string;
  story: string;
  imageUrl: string;
}

export async function generateNewsArticle(eventTitle: string, winningOutcome: string, probability: number, date: string): Promise<NewsContent> {
  // 1. Validation
  if (!XAI_API_KEY) {
    console.error("❌ Missing XAI_API_KEY");
    return { headline: "System Offline", story: "Configuration pending.", imageUrl: "" };
  }
  
  if (!eventTitle || !winningOutcome) {
    return { headline: "Data Error", story: "Event details verifying.", imageUrl: "" };
  }

  console.log(`🤖 Grok Agent Activated for: ${eventTitle}`);

  // 2. THE PROMPT: We now ask for strictly formatted JSON
  const systemPrompt = `
    You are the Editor-in-Chief of "NextDawn", a newspaper from the future (${date}).
    
    TASK:
    Convert the raw prediction market data into a thrilling front-page story.
    
    INPUT DATA:
    - Event: "${eventTitle}"
    - Outcome: ${winningOutcome} (Assume this has 100% happened)
    
    OUTPUT FORMAT:
    Return ONLY a raw JSON object (no markdown formatting) with these fields:
    1. "headline": A punchy, past-tense newspaper headline (e.g., instead of "Election Winner", use "Smith Wins Landslide Victory").
    2. "story": The article body (max 150 words). Professional, dramatic, "AP Wire" style.
    3. "image_prompt": A descriptive prompt for a political cartoon or editorial illustration representing this event. Style: "editorial cartoon, detailed, colorful".
  `;

  const userPrompt = `Generate the story for event: ${eventTitle}. Outcome: ${winningOutcome}.`;

  // Helper to call Grok
  const callGrok = async (modelName: string) => {
    console.log(`📝 Requesting JSON from ${modelName}...`);
    return axios.post('https://api.x.ai/v1/chat/completions', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: modelName,
      temperature: 0.7,
      stream: false,
      response_format: { type: "json_object" } // Force JSON if supported, otherwise prompt handles it
    }, {
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  };

  try {
    const response = await callGrok('grok-2-latest'); // Use stable model
    const rawContent = response.data.choices[0].message.content;
    
    let parsed: any;
    try {
        parsed = JSON.parse(rawContent);
    } catch (e) {
        // Fallback if Grok wraps it in markdown code blocks
        const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanJson);
    }

    // 3. GENERATE IMAGE URL
    // We use the prompt Grok gave us to fetch a dynamic image
    const encodedPrompt = encodeURIComponent(parsed.image_prompt + " editorial cartoon style, high quality, 4k");
    const dynamicImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${Math.random()}`;

    console.log("✅ Grok Generation Successful");
    
    return {
        headline: parsed.headline || eventTitle,
        story: parsed.story || "Reporting error...",
        imageUrl: dynamicImageUrl
    };

  } catch (error: any) {
    // --- ERROR HANDLING ---
    console.error("❌ Generation Error:", error.message);
    
    // Fallback Mock Data so the UI doesn't break
    return {
        headline: `Breaking: ${eventTitle} Concludes`,
        story: `Reports confirm that ${winningOutcome} is the official outcome. Markets have reacted with high volume as the timeline solidifies.`,
        imageUrl: `https://image.pollinations.ai/prompt/breaking%20news%20newspaper%20spinning?nologo=true`
    };
  }
}