import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type CreateDocumentInput, type Document } from '../schema';

export const createDocument = async (input: CreateDocumentInput): Promise<Document> => {
  try {
    // Insert document record
    const result = await db.insert(documentsTable)
      .values({
        title: input.title,
        content: input.content
      })
      .returning()
      .execute();

    const document = result[0];
    return {
      ...document,
      created_at: document.created_at,
      updated_at: document.updated_at
    };
  } catch (error) {
    console.error('Document creation failed:', error);
    throw error;
  }
};