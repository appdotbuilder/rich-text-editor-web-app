import { z } from 'zod';

// Document schema with proper field handling
export const documentSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(), // Rich text content stored as HTML or JSON string
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Document = z.infer<typeof documentSchema>;

// Input schema for creating documents
export const createDocumentInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().default("") // Allow empty content for new documents
});

export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;

// Input schema for updating documents
export const updateDocumentInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().optional()
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentInputSchema>;

// Input schema for getting a single document by ID
export const getDocumentInputSchema = z.object({
  id: z.number()
});

export type GetDocumentInput = z.infer<typeof getDocumentInputSchema>;

// Input schema for deleting a document
export const deleteDocumentInputSchema = z.object({
  id: z.number()
});

export type DeleteDocumentInput = z.infer<typeof deleteDocumentInputSchema>;

// Input schema for AI text improvement
export const improveTextWithAIInputSchema = z.object({
  selectedText: z.string(),
  aiCommand: z.string()
});

export type ImproveTextWithAIInput = z.infer<typeof improveTextWithAIInputSchema>;