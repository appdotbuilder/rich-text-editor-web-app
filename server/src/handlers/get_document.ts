import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type GetDocumentInput, type Document } from '../schema';
import { eq } from 'drizzle-orm';

export const getDocument = async (input: GetDocumentInput): Promise<Document | null> => {
  try {
    // Query document by ID
    const results = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, input.id))
      .execute();

    // Return null if document not found
    if (results.length === 0) {
      return null;
    }

    // Return the first (and only) result
    return results[0];
  } catch (error) {
    console.error('Document retrieval failed:', error);
    throw error;
  }
};