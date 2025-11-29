'use server';

import { generateNewsArticle, NewsContent } from '@/lib/grok3'; 
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, setDoc, addDoc, deleteDoc, doc } from 'firebase/firestore';

// BUMP VERSION to force re-generation with unique images and new labels
const CURRENT_VERSION = "v23_visual_fix";

export async function fetchOrGenerateStory(
    eventId: string, 
    title: string, 
    outcome: string, 
    probability: number,
    targetDate: string,
    forcedHeadline?: string 
): Promise<NewsContent> {
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);

    let existingDocId = null;

    if (!querySnapshot.empty) {
      const document = querySnapshot.docs[0];
      const data = document.data();

      if (data.version === CURRENT_VERSION) {
         return {
             headline: data.headline,
             story: data.content,
             headline_cn: data.headline_cn || "",
             story_cn: data.story_cn || "",
             imageUrl: data.imageUrl,
             impact: data.impact
         };
      }
      existingDocId = document.id;
    }

    console.log(`🚀 Generating ${CURRENT_VERSION} Report for: ${title}`);
    
    const generated = await generateNewsArticle(
      title, 
      outcome, 
      probability, 
      targetDate,
      forcedHeadline 
    );

    const articleData = {
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
    };

    if (generated.story.length > 50) {
        if (existingDocId) {
            await setDoc(doc(db, 'articles', existingDocId), articleData);
        } else {
            await addDoc(articlesRef, articleData);
        }
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