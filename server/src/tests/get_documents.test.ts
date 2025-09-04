import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { documentsTable } from '../db/schema';
import { getDocuments } from '../handlers/get_documents';
import { eq } from 'drizzle-orm';

describe('getDocuments', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return an empty array when no documents exist', async () => {
    const result = await getDocuments();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all documents', async () => {
    // Create test documents
    await db.insert(documentsTable).values([
      {
        title: 'First Document',
        content: 'This is the first document content'
      },
      {
        title: 'Second Document',
        content: 'This is the second document content'
      },
      {
        title: 'Third Document',
        content: '<h1>Rich content</h1><p>With HTML formatting</p>'
      }
    ]).execute();

    const result = await getDocuments();

    expect(result).toHaveLength(3);
    
    // Verify all documents are returned with correct structure
    result.forEach(doc => {
      expect(doc.id).toBeDefined();
      expect(typeof doc.id).toBe('number');
      expect(doc.title).toBeDefined();
      expect(typeof doc.title).toBe('string');
      expect(doc.content).toBeDefined();
      expect(typeof doc.content).toBe('string');
      expect(doc.created_at).toBeInstanceOf(Date);
      expect(doc.updated_at).toBeInstanceOf(Date);
    });

    // Verify specific content
    const titles = result.map(doc => doc.title);
    expect(titles).toContain('First Document');
    expect(titles).toContain('Second Document');
    expect(titles).toContain('Third Document');
  });

  it('should return documents ordered by updated_at descending', async () => {
    // Create documents with specific timing
    const firstDoc = await db.insert(documentsTable).values({
      title: 'First Document',
      content: 'Created first'
    }).returning().execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondDoc = await db.insert(documentsTable).values({
      title: 'Second Document', 
      content: 'Created second'
    }).returning().execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    const thirdDoc = await db.insert(documentsTable).values({
      title: 'Third Document',
      content: 'Created third'
    }).returning().execute();

    const result = await getDocuments();

    expect(result).toHaveLength(3);

    // Should be ordered by updated_at descending
    // Most recently created should be first
    expect(result[0].title).toBe('Third Document');
    expect(result[1].title).toBe('Second Document');
    expect(result[2].title).toBe('First Document');
    
    // Verify ordering - each document should have updated_at >= the next one
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].updated_at.getTime()).toBeGreaterThanOrEqual(
        result[i + 1].updated_at.getTime()
      );
    }
  });

  it('should handle documents with various content types', async () => {
    // Test different content scenarios
    await db.insert(documentsTable).values([
      {
        title: 'Empty Content',
        content: ''
      },
      {
        title: 'Plain Text',
        content: 'Simple plain text content'
      },
      {
        title: 'HTML Content',
        content: '<div><h1>HTML Title</h1><p>Paragraph with <strong>bold</strong> text</p></div>'
      },
      {
        title: 'JSON Content',
        content: '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "JSON structured content"}]}]}'
      },
      {
        title: 'Special Characters',
        content: 'Content with special characters: àáâãäå ñ 中文 🚀 ©®™'
      }
    ]).execute();

    const result = await getDocuments();

    expect(result).toHaveLength(5);
    
    // Find each document and verify content
    const emptyDoc = result.find(doc => doc.title === 'Empty Content');
    expect(emptyDoc?.content).toBe('');

    const plainDoc = result.find(doc => doc.title === 'Plain Text');
    expect(plainDoc?.content).toBe('Simple plain text content');

    const htmlDoc = result.find(doc => doc.title === 'HTML Content');
    expect(htmlDoc?.content).toContain('<h1>HTML Title</h1>');

    const jsonDoc = result.find(doc => doc.title === 'JSON Content');
    expect(jsonDoc?.content).toContain('"type": "doc"');

    const specialDoc = result.find(doc => doc.title === 'Special Characters');
    expect(specialDoc?.content).toContain('🚀');
    expect(specialDoc?.content).toContain('中文');
  });

  it('should handle large number of documents efficiently', async () => {
    // Create many documents to test performance
    const documentsToCreate = [];
    for (let i = 1; i <= 100; i++) {
      documentsToCreate.push({
        title: `Document ${i}`,
        content: `Content for document number ${i}`
      });
    }

    await db.insert(documentsTable).values(documentsToCreate).execute();

    const startTime = Date.now();
    const result = await getDocuments();
    const endTime = Date.now();

    expect(result).toHaveLength(100);
    
    // Should complete reasonably quickly (less than 1 second)
    expect(endTime - startTime).toBeLessThan(1000);
    
    // Verify ordering is maintained even with many documents
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].updated_at.getTime()).toBeGreaterThanOrEqual(
        result[i + 1].updated_at.getTime()
      );
    }
  });
});