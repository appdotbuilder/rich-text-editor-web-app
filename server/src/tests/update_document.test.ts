import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type UpdateDocumentInput, type CreateDocumentInput } from '../schema';
import { updateDocument } from '../handlers/update_document';
import { eq } from 'drizzle-orm';

// Helper function to create a test document
const createTestDocument = async (data: CreateDocumentInput) => {
  const result = await db.insert(documentsTable)
    .values({
      title: data.title,
      content: data.content
    })
    .returning()
    .execute();
  return result[0];
};

describe('updateDocument', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update document title only', async () => {
    // Create test document
    const testDoc = await createTestDocument({
      title: 'Original Title',
      content: 'Original content'
    });

    const input: UpdateDocumentInput = {
      id: testDoc.id,
      title: 'Updated Title'
    };

    const result = await updateDocument(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testDoc.id);
    expect(result!.title).toEqual('Updated Title');
    expect(result!.content).toEqual('Original content'); // Should remain unchanged
    expect(result!.created_at).toEqual(testDoc.created_at);
    expect(result!.updated_at).not.toEqual(testDoc.updated_at); // Should be updated
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update document content only', async () => {
    // Create test document
    const testDoc = await createTestDocument({
      title: 'Original Title',
      content: 'Original content'
    });

    const input: UpdateDocumentInput = {
      id: testDoc.id,
      content: 'Updated content with <b>HTML</b>'
    };

    const result = await updateDocument(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testDoc.id);
    expect(result!.title).toEqual('Original Title'); // Should remain unchanged
    expect(result!.content).toEqual('Updated content with <b>HTML</b>');
    expect(result!.created_at).toEqual(testDoc.created_at);
    expect(result!.updated_at).not.toEqual(testDoc.updated_at); // Should be updated
  });

  it('should update both title and content', async () => {
    // Create test document
    const testDoc = await createTestDocument({
      title: 'Original Title',
      content: 'Original content'
    });

    const input: UpdateDocumentInput = {
      id: testDoc.id,
      title: 'New Title',
      content: 'New content'
    };

    const result = await updateDocument(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testDoc.id);
    expect(result!.title).toEqual('New Title');
    expect(result!.content).toEqual('New content');
    expect(result!.created_at).toEqual(testDoc.created_at);
    expect(result!.updated_at).not.toEqual(testDoc.updated_at); // Should be updated
  });

  it('should update document with empty content', async () => {
    // Create test document
    const testDoc = await createTestDocument({
      title: 'Original Title',
      content: 'Original content'
    });

    const input: UpdateDocumentInput = {
      id: testDoc.id,
      content: ''
    };

    const result = await updateDocument(input);

    expect(result).not.toBeNull();
    expect(result!.content).toEqual('');
    expect(result!.title).toEqual('Original Title'); // Should remain unchanged
  });

  it('should return null for non-existent document', async () => {
    const input: UpdateDocumentInput = {
      id: 999999, // Non-existent ID
      title: 'Updated Title'
    };

    const result = await updateDocument(input);

    expect(result).toBeNull();
  });

  it('should persist changes to database', async () => {
    // Create test document
    const testDoc = await createTestDocument({
      title: 'Original Title',
      content: 'Original content'
    });

    const input: UpdateDocumentInput = {
      id: testDoc.id,
      title: 'Updated Title',
      content: 'Updated content'
    };

    await updateDocument(input);

    // Query database directly to verify persistence
    const documents = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, testDoc.id))
      .execute();

    expect(documents).toHaveLength(1);
    expect(documents[0].title).toEqual('Updated Title');
    expect(documents[0].content).toEqual('Updated content');
    expect(documents[0].updated_at).toBeInstanceOf(Date);
    expect(documents[0].updated_at > testDoc.updated_at).toBe(true);
  });

  it('should handle complex HTML content', async () => {
    // Create test document
    const testDoc = await createTestDocument({
      title: 'Document with HTML',
      content: '<p>Simple paragraph</p>'
    });

    const complexHtml = '<div><h1>Title</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p><ul><li>Item 1</li><li>Item 2</li></ul></div>';
    
    const input: UpdateDocumentInput = {
      id: testDoc.id,
      content: complexHtml
    };

    const result = await updateDocument(input);

    expect(result).not.toBeNull();
    expect(result!.content).toEqual(complexHtml);
    expect(result!.title).toEqual('Document with HTML'); // Should remain unchanged
  });

  it('should update only timestamp when no other fields provided', async () => {
    // Create test document
    const testDoc = await createTestDocument({
      title: 'Original Title',
      content: 'Original content'
    });

    const originalUpdatedAt = testDoc.updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateDocumentInput = {
      id: testDoc.id
      // No title or content updates
    };

    const result = await updateDocument(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Original Title');
    expect(result!.content).toEqual('Original content');
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at > originalUpdatedAt).toBe(true);
  });
});