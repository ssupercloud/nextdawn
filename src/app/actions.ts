'use server';

import { generateNewsArticle, NewsContent } from '@/lib/grok3'; 
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';

export async function fetchOrGenerateStory(eventId: string, title: string, outcome: string, probability: number): Promise<NewsContent> {
  try {
    const articlesRef = collection(db, 'articles');
    const q = query(articlesRef, where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);

    // 1. CHECK CACHE
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();

      // Check if it's the NEW format (has headline/imageUrl)
      if (data.headline && data.imageUrl) {
         console.log(`✅ Cache Hit for "${data.headline}"`);
         return {
             headline: data.headline,
             story: data.content || data.story,
             imageUrl: data.imageUrl
         };
      }

      console.log(`🗑️ Found old/broken cache. Upgrading to V4 format...`);
      await deleteDoc(doc.ref);
    }

    // 2. GENERATE NEW
    console.log(`🚀 Generating V4 Multimedia Story for: ${title}`);
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
            title: title, // Keep original title for searching
            headline: generated.headline, // Save new fancy headline
            content: generated.story,
            imageUrl: generated.imageUrl,
            createdAt: new Date().toISOString()
        });
    }

    return generated;
  } catch (error) {
    console.error("Error in server action:", error);
    return {
        headline: "Transmission Error",
        story: "Unable to retrieve timeline data.",
        imageUrl: ""
    };
  }
}