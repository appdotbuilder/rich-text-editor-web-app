import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type CreateDocumentInput } from '../schema';
import { createDocument } from '../handlers/create_document';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreateDocumentInput = {
  title: 'Test Document',
  content: '<h1>Test Content</h1><p>This is a test document with HTML content.</p>'
};

// Test input with minimal data (testing default content)
const minimalInput: CreateDocumentInput = {
  title: 'Minimal Document',
  content: '' // Testing default empty content
};

describe('createDocument', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a document with full content', async () => {
    const result = await createDocument(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Document');
    expect(result.content).toEqual('<h1>Test Content</h1><p>This is a test document with HTML content.</p>');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a document with empty content', async () => {
    const result = await createDocument(minimalInput);

    expect(result.title).toEqual('Minimal Document');
    expect(result.content).toEqual('');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save document to database', async () => {
    const result = await createDocument(testInput);

    // Query using proper drizzle syntax
    const documents = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, result.id))
      .execute();

    expect(documents).toHaveLength(1);
    expect(documents[0].title).toEqual('Test Document');
    expect(documents[0].content).toEqual('<h1>Test Content</h1><p>This is a test document with HTML content.</p>');
    expect(documents[0].created_at).toBeInstanceOf(Date);
    expect(documents[0].updated_at).toBeInstanceOf(Date);
    expect(documents[0].id).toEqual(result.id);
  });

  it('should handle rich text content correctly', async () => {
    const richTextInput: CreateDocumentInput = {
      title: 'Rich Text Document',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is ' },
              { type: 'text', text: 'bold text', marks: [{ type: 'bold' }] },
              { type: 'text', text: ' in a document.' }
            ]
          }
        ]
      })
    };

    const result = await createDocument(richTextInput);

    expect(result.title).toEqual('Rich Text Document');
    expect(result.content).toContain('bold text');
    expect(result.content).toContain('paragraph');
    expect(() => JSON.parse(result.content)).not.toThrow(); // Should be valid JSON
    
    // Verify it's saved correctly in database
    const savedDoc = await db.select()
      .from(documentsTable)
      .where(eq(documentsTable.id, result.id))
      .execute();

    expect(savedDoc[0].content).toEqual(richTextInput.content);
  });

  it('should create multiple documents with unique IDs', async () => {
    const input1: CreateDocumentInput = {
      title: 'Document 1',
      content: 'Content 1'
    };
    
    const input2: CreateDocumentInput = {
      title: 'Document 2',
      content: 'Content 2'
    };

    const result1 = await createDocument(input1);
    const result2 = await createDocument(input2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.title).toEqual('Document 1');
    expect(result2.title).toEqual('Document 2');
    expect(result1.content).toEqual('Content 1');
    expect(result2.content).toEqual('Content 2');

    // Verify both are saved
    const allDocuments = await db.select()
      .from(documentsTable)
      .execute();

    expect(allDocuments).toHaveLength(2);
  });

  it('should set timestamps correctly', async () => {
    const beforeCreation = new Date();
    const result = await createDocument(testInput);
    const afterCreation = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
  });
});