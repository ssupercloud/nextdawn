'use server';

import { generateNewsArticle, NewsContent } from '@/lib/grok3'; 
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';

// BUMP VERSION to force re-generation of old English-only articles
const CURRENT_VERSION = "v11_bilingual";

export async function fetchOrGenerateStory(eventId: string, title: string, outcome: string, probability: number): Promise<NewsContent> {
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);

    // 1. CHECK CACHE
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();

      // Check version matches
      if (data.version !== CURRENT_VERSION) {
         console.log(`♻️ Outdated cache. Upgrading to ${CURRENT_VERSION}...`);
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

    // 2. GENERATE NEW
    console.log(`🚀 Generating ${CURRENT_VERSION} Story for: ${title}`);
    const generated = await generateNewsArticle(
      title, 
      outcome, 
      probability, 
      new Date().toDateString()
    );

    // 3. SAVE TO DB
    if (generated.story.length > 50) {
        await addDoc(articlesRef, {
            eventId: eventId,
            title: title,
            headline: generated.headline,
            content: generated.story,
            headline_cn: generated.headline_cn, // Save Chinese
            story_cn: generated.story_cn,       // Save Chinese
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