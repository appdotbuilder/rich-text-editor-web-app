import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createDocumentInputSchema, 
  updateDocumentInputSchema,
  getDocumentInputSchema,
  deleteDocumentInputSchema,
  improveTextWithAIInputSchema
} from './schema';

// Import handlers
import { createDocument } from './handlers/create_document';
import { getDocuments } from './handlers/get_documents';
import { getDocument } from './handlers/get_document';
import { updateDocument } from './handlers/update_document';
import { deleteDocument } from './handlers/delete_document';
import { improveTextWithAI } from './handlers/improve_text_with_ai';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Document management routes
  createDocument: publicProcedure
    .input(createDocumentInputSchema)
    .mutation(({ input }) => createDocument(input)),
    
  getDocuments: publicProcedure
    .query(() => getDocuments()),
    
  getDocument: publicProcedure
    .input(getDocumentInputSchema)
    .query(({ input }) => getDocument(input)),
    
  updateDocument: publicProcedure
    .input(updateDocumentInputSchema)
    .mutation(({ input }) => updateDocument(input)),
    
  deleteDocument: publicProcedure
    .input(deleteDocumentInputSchema)
    .mutation(({ input }) => deleteDocument(input)),
    
  improveTextWithAI: publicProcedure
    .input(improveTextWithAIInputSchema)
    .mutation(({ input }) => improveTextWithAI(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();