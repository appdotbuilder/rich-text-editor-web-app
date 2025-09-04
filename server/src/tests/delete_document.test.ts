import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type DeleteDocumentInput, type CreateDocumentInput } from '../schema';
import { deleteDocument } from '../handlers/delete_document';
import { eq } from 'drizzle-orm';

// Test inputs
const testDocumentInput: CreateDocumentInput = {
  title: 'Test Document',
  content: 'This is test content for the document'
};

const deleteInput: DeleteDocumentInput = {
  id: 1
};

describe('deleteDocument', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing document', async () => {
    // First, create a document to delete
    const createdDocument = await db.insert(documentsTable)
      .values({
        title: testDocumentInput.title,
        content: testDocumentInput.content
      })
      .returning()
      .execute();

    const documentId = createdDocument[0].id;

    // Delete the document
    const result = await deleteDocument({ id: documentId });

    // Should return true indicating successful deletion
    expect(result).toBe(true);

    // Verify the document is actually deleted from database
    const documents = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, documentId))
      .execute();

    expect(documents).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent document', async () => {
    // Try to delete a document that doesn't exist
    const result = await deleteDocument({ id: 999 });

    // Should return false since no document was deleted
    expect(result).toBe(false);
  });

  it('should not affect other documents when deleting one', async () => {
    // Create multiple documents
    const doc1 = await db.insert(documentsTable)
      .values({
        title: 'Document 1',
        content: 'Content 1'
      })
      .returning()
      .execute();

    const doc2 = await db.insert(documentsTable)
      .values({
        title: 'Document 2',
        content: 'Content 2'
      })
      .returning()
      .execute();

    // Delete only the first document
    const result = await deleteDocument({ id: doc1[0].id });

    expect(result).toBe(true);

    // Verify first document is deleted
    const deletedDocuments = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, doc1[0].id))
      .execute();

    expect(deletedDocuments).toHaveLength(0);

    // Verify second document still exists
    const remainingDocuments = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, doc2[0].id))
      .execute();

    expect(remainingDocuments).toHaveLength(1);
    expect(remainingDocuments[0].title).toBe('Document 2');
  });

  it('should handle deletion of document with empty content', async () => {
    // Create a document with empty content
    const createdDocument = await db.insert(documentsTable)
      .values({
        title: 'Empty Content Document',
        content: ''
      })
      .returning()
      .execute();

    const documentId = createdDocument[0].id;

    // Delete the document
    const result = await deleteDocument({ id: documentId });

    expect(result).toBe(true);

    // Verify deletion
    const documents = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, documentId))
      .execute();

    expect(documents).toHaveLength(0);
  });

  it('should handle multiple consecutive deletions', async () => {
    // Create a document
    const createdDocument = await db.insert(documentsTable)
      .values({
        title: 'Document to Delete Twice',
        content: 'Test content'
      })
      .returning()
      .execute();

    const documentId = createdDocument[0].id;

    // First deletion should succeed
    const firstResult = await deleteDocument({ id: documentId });
    expect(firstResult).toBe(true);

    // Second deletion attempt should return false (document already deleted)
    const secondResult = await deleteDocument({ id: documentId });
    expect(secondResult).toBe(false);
  });
});