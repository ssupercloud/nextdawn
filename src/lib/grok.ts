import axios from 'axios';

const XAI_API_KEY = process.env.XAI_API_KEY;

// VERSION CHECK: You MUST see this in your terminal startup logs
console.log("✅ Grok Service Module Loaded (Version: 2.2 - TIMESTAMPED)");

export async function generateNewsArticle(eventTitle: string, winningOutcome: string, probability: number, date: string) {
  // 1. Validation to prevent "Bad Request" from empty data
  if (!XAI_API_KEY) {
    console.error("❌ Missing XAI_API_KEY in .env.local");
    return "Editorial Update: System configuration pending.";
  }
  
  console.log(`🔑 Using API Key: ${XAI_API_KEY.slice(0, 4)}...`);

  if (!eventTitle || !winningOutcome) {
    console.error("❌ Grok received empty event data");
    return "Breaking News: Event details are currently verifying.";
  }

  const systemPrompt = `
    You are a Pulitzer-winning journalist for "NextDawn", a newspaper from the future.
    Your job is to write short, high-impact news snippets (150 words max) based on future events.
    
    RULES:
    1. The current date is ${date}.
    2. Treat the event "${eventTitle}" as HAVING JUST HAPPENED.
    3. The outcome was: ${winningOutcome}.
    4. Do not mention "odds" or "betting". Write it as a confirmed historical fact.
    5. Tone: Professional, slightly dramatic, "AP Wire" style.
    6. Include a fictional quote from a relevant figure.
  `;

  const userPrompt = `Write a breaking news story about: ${eventTitle}. The outcome is ${winningOutcome}.`;

  // Helper function to call API
  const callGrok = async (modelName: string) => {
    console.log(`📝 Asking Grok (${modelName}) to write about: ${eventTitle}...`);
    return axios.post('https://api.x.ai/v1/chat/completions', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: modelName,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  };

  try {
    // Attempt 1: Try Standard Model
    const response = await callGrok('grok-beta');
    return response.data.choices[0].message.content;

  } catch (error: any) {
    console.warn(`⚠️ grok-beta failed. Retrying with grok-2...`);
    
    // Attempt 2: Retry with 'grok-2' (Stable Release)
    try {
      const response2 = await callGrok('grok-2');
      return response2.data.choices[0].message.content;
    } catch (retryError: any) {
      // If both fail, log the REAL error details from xAI
      if (retryError.response) {
        console.error("❌ Grok API Critical Failure:");
        console.error("   Status:", retryError.response.status);
        console.error("   Reason:", JSON.stringify(retryError.response.data, null, 2));
      } else {
        console.error("❌ Network/Config Error:", retryError.message);
      }
      
      // NEW ERROR MESSAGE WITH TIMESTAMP to prove it's the new file
      const time = new Date().toLocaleTimeString();
      return `Breaking News: Feed unavailable [Checked at ${time}]. Check terminal logs for error details.`;
    }
  }
}