import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type UpdateDocumentInput, type Document } from '../schema';
import { eq } from 'drizzle-orm';

export const updateDocument = async (input: UpdateDocumentInput): Promise<Document | null> => {
  try {
    // Build update object only with provided fields
    const updateData: Partial<typeof documentsTable.$inferInsert> = {
      updated_at: new Date() // Always update the timestamp
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.content !== undefined) {
      updateData.content = input.content;
    }

    // Update the document and return the updated record
    const result = await db
      .update(documentsTable)
      .set(updateData)
      .where(eq(documentsTable.id, input.id))
      .returning()
      .execute();

    // Return null if no document was found/updated
    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Document update failed:', error);
    throw error;
  }
};