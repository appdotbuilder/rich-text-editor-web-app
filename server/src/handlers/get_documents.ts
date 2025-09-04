import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type Document } from '../schema';
import { desc } from 'drizzle-orm';

export const getDocuments = async (): Promise<Document[]> => {
  try {
    // Fetch all documents ordered by updated_at descending (most recently updated first)
    const results = await db.select()
      .from(documentsTable)
      .orderBy(desc(documentsTable.updated_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    throw error;
  }
};