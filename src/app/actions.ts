'use server';

import { generateNewsArticle, NewsContent } from '@/lib/grok3'; 
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';

// BUMP VERSION to force re-generation with Serious Tone & Longer Length
const CURRENT_VERSION = "v15_serious_journalism";

export async function fetchOrGenerateStory(
    eventId: string, 
    title: string, 
    outcome: string, 
    probability: number,
    targetDate: string 
): Promise<NewsContent> {
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();

      // STRICT VERSION CHECK
      if (data.version !== CURRENT_VERSION) {
         console.log(`♻️ Outdated style/length. Upgrading to ${CURRENT_VERSION}...`);
         await deleteDoc(doc.ref);
      } else {
         return {
             headline: data.headline,
             story: data.content,
             headline_cn: data.headline_cn || "",
             story_cn: data.story_cn || "",
             imageUrl: data.imageUrl,
             impact: data.impact
         };
      }
    }

    console.log(`🚀 Generating ${CURRENT_VERSION} Report for: ${title}`);
    
    const generated = await generateNewsArticle(
      title, 
      outcome, 
      probability, 
      targetDate
    );

    // Save only if length is sufficient (Basic check)
    if (generated.story.length > 100) {
        await addDoc(articlesRef, {
            eventId: eventId,
            title: title,
            headline: generated.headline,
            content: generated.story,
            headline_cn: generated.headline_cn,
            story_cn: generated.story_cn,
            imageUrl: generated.imageUrl,
            impact: generated.impact,
            version: CURRENT_VERSION,
            createdAt: new Date().toISOString()
        });
    }

    return generated;
  } catch (error) {
    console.error("Error:", error);
    return {
        headline: "Feed Error",
        story: "Connection lost.",
        headline_cn: "系统错误",
        story_cn: "连接丢失",
        imageUrl: "",
        impact: "LOW"
    };
  }
}