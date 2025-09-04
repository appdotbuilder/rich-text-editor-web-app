import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { documentsTable } from '../db/schema';
import { type GetDocumentInput } from '../schema';
import { getDocument } from '../handlers/get_document';

describe('getDocument', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should retrieve an existing document by ID', async () => {
    // Create test document first
    const testDoc = await db.insert(documentsTable)
      .values({
        title: 'Test Document',
        content: '<p>This is test content</p>'
      })
      .returning()
      .execute();

    const input: GetDocumentInput = {
      id: testDoc[0].id
    };

    const result = await getDocument(input);

    // Verify document was retrieved correctly
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testDoc[0].id);
    expect(result!.title).toEqual('Test Document');
    expect(result!.content).toEqual('<p>This is test content</p>');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when document does not exist', async () => {
    const input: GetDocumentInput = {
      id: 999999 // Non-existent ID
    };

    const result = await getDocument(input);

    expect(result).toBeNull();
  });

  it('should retrieve document with empty content', async () => {
    // Create document with empty content
    const testDoc = await db.insert(documentsTable)
      .values({
        title: 'Empty Document',
        content: ''
      })
      .returning()
      .execute();

    const input: GetDocumentInput = {
      id: testDoc[0].id
    };

    const result = await getDocument(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Empty Document');
    expect(result!.content).toEqual('');
  });

  it('should retrieve document with rich text content', async () => {
    // Create document with complex HTML content
    const richContent = `
      <h1>Document Title</h1>
      <p>This is a <strong>paragraph</strong> with <em>formatted</em> text.</p>
      <ul>
        <li>List item 1</li>
        <li>List item 2</li>
      </ul>
    `;

    const testDoc = await db.insert(documentsTable)
      .values({
        title: 'Rich Text Document',
        content: richContent
      })
      .returning()
      .execute();

    const input: GetDocumentInput = {
      id: testDoc[0].id
    };

    const result = await getDocument(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Rich Text Document');
    expect(result!.content).toEqual(richContent);
  });

  it('should handle JSON-formatted content', async () => {
    // Test with JSON string content (another way to store rich text)
    const jsonContent = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hello world!' }
          ]
        }
      ]
    });

    const testDoc = await db.insert(documentsTable)
      .values({
        title: 'JSON Document',
        content: jsonContent
      })
      .returning()
      .execute();

    const input: GetDocumentInput = {
      id: testDoc[0].id
    };

    const result = await getDocument(input);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('JSON Document');
    expect(result!.content).toEqual(jsonContent);
    
    // Verify content can be parsed as JSON
    expect(() => JSON.parse(result!.content)).not.toThrow();
  });

  it('should preserve timestamp fields accurately', async () => {
    const beforeCreation = new Date();
    
    const testDoc = await db.insert(documentsTable)
      .values({
        title: 'Timestamp Test',
        content: 'Testing timestamps'
      })
      .returning()
      .execute();

    const afterCreation = new Date();

    const input: GetDocumentInput = {
      id: testDoc[0].id
    };

    const result = await getDocument(input);

    expect(result).not.toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    
    // Verify timestamps are within expected range
    expect(result!.created_at >= beforeCreation).toBe(true);
    expect(result!.created_at <= afterCreation).toBe(true);
    expect(result!.updated_at >= beforeCreation).toBe(true);
    expect(result!.updated_at <= afterCreation).toBe(true);
  });
});