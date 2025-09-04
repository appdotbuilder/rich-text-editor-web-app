import { type GetDocumentInput, type Document } from '../schema';

export const getDocument = async (input: GetDocumentInput): Promise<Document | null> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching a single document by ID from the database.
    // It should return null if the document doesn't exist.
    return Promise.resolve({
        id: input.id,
        title: "Sample Document",
        content: "",
        created_at: new Date(),
        updated_at: new Date()
    } as Document);
};