import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type DeleteDocumentInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteDocument = async (input: DeleteDocumentInput): Promise<boolean> => {
  try {
    // Delete the document by ID
    const result = await db.delete(documentsTable)
      .where(eq(documentsTable.id, input.id))
      .execute();

    // Return true if a row was deleted, false if no document was found
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Document deletion failed:', error);
    throw error;
  }
};