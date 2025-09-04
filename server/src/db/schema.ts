import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const documentsTable = pgTable('documents', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(), // Rich text content stored as HTML or JSON string
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript type for the table schema
export type Document = typeof documentsTable.$inferSelect; // For SELECT operations
export type NewDocument = typeof documentsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { documents: documentsTable };