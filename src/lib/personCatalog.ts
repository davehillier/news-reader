/**
 * Firestore-based person catalog.
 * Persists every person from weekly bios, building up an evolving
 * "Who's Who" knowledge base. Updates entries when people reappear.
 */

import { adminDb } from './firebaseAdmin';
import type { WeeklyBio, CatalogPerson } from './aiTypes';

const COLLECTION = 'personCatalog';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getPersonCatalog(): Promise<CatalogPerson[]> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION)
      .orderBy('lastSeen', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CatalogPerson));
  } catch (error) {
    console.error('[PersonCatalog] Error fetching catalog:', error);
    return [];
  }
}

export async function getPersonById(id: string): Promise<CatalogPerson | null> {
  try {
    const doc = await adminDb.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as CatalogPerson;
  } catch (error) {
    console.error('[PersonCatalog] Error fetching person:', error);
    return null;
  }
}

export async function upsertPerson(
  bio: WeeklyBio,
  articleTitles: string[]
): Promise<CatalogPerson> {
  const id = slugify(bio.name);
  const now = Date.now();

  try {
    const docRef = adminDb.collection(COLLECTION).doc(id);
    const existing = await docRef.get();

    if (existing.exists) {
      const data = existing.data() as Omit<CatalogPerson, 'id'>;

      // Update with latest info, append new appearance
      const updated = {
        role: bio.role,
        photoSearchQuery: bio.photoSearchQuery,
        whoTheyAre: bio.whoTheyAre,
        whyFamous: bio.whyFamous,
        category: bio.category,
        newsAppearances: [
          ...data.newsAppearances,
          {
            date: now,
            whyInNews: bio.whyInNews,
            sources: articleTitles,
          },
        ],
        lastSeen: now,
        updatedAt: now,
      };

      await docRef.update(updated);
      console.log(`[PersonCatalog] Updated: ${bio.name} (appearance #${updated.newsAppearances.length})`);
      return { id, ...data, ...updated };
    }

    // New person
    const newPerson: Omit<CatalogPerson, 'id'> = {
      name: bio.name,
      role: bio.role,
      photoSearchQuery: bio.photoSearchQuery,
      whoTheyAre: bio.whoTheyAre,
      whyFamous: bio.whyFamous,
      category: bio.category,
      newsAppearances: [
        {
          date: now,
          whyInNews: bio.whyInNews,
          sources: articleTitles,
        },
      ],
      firstSeen: now,
      lastSeen: now,
      updatedAt: now,
    };

    await docRef.set(newPerson);
    console.log(`[PersonCatalog] Created: ${bio.name}`);
    return { id, ...newPerson };
  } catch (error) {
    console.error(`[PersonCatalog] Error upserting ${bio.name}:`, error);
    throw error;
  }
}

export async function syncBiosToPersonCatalog(
  bios: WeeklyBio[],
  articles: Array<{ title: string }>
): Promise<CatalogPerson[]> {
  const articleTitles = articles.map(a => a.title).slice(0, 10);
  const results: CatalogPerson[] = [];

  for (const bio of bios) {
    try {
      const person = await upsertPerson(bio, articleTitles);
      results.push(person);
    } catch (error) {
      console.error(`[PersonCatalog] Skipping ${bio.name}:`, error);
    }
  }

  console.log(`[PersonCatalog] Synced ${results.length}/${bios.length} people to catalog`);
  return results;
}
