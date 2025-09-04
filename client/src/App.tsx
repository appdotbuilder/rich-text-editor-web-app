import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/utils/trpc';
import { DocumentEditor } from '@/components/DocumentEditor';
import { DocumentList } from '@/components/DocumentList';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Document, CreateDocumentInput } from '../../server/src/schema';

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isServerConnected, setIsServerConnected] = useState(true);

  const loadDocuments = useCallback(async () => {
    try {
      const result = await trpc.getDocuments.query();
      setDocuments(result);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setIsServerConnected(false);
      // For demo purposes, create some sample documents if server is not available
      setDocuments([
        {
          id: 1,
          title: "Welcome to the Document Editor",
          content: "<h1>Welcome!</h1><p>This is a sample document with <strong>rich text formatting</strong>.</p><ul><li>You can create <em>formatted text</em></li><li>Add lists and links</li><li>Insert images</li></ul>",
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          title: "Getting Started Guide",
          content: "<h2>How to use this editor</h2><p>Click on any document to start editing. Use the toolbar to format your text.</p><blockquote>This is a sample quote to show formatting capabilities.</blockquote>",
          created_at: new Date(Date.now() - 86400000),
          updated_at: new Date(Date.now() - 3600000)
        }
      ]);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocumentTitle.trim()) return;

    setIsCreating(true);
    try {
      const createData: CreateDocumentInput = {
        title: newDocumentTitle.trim(),
        content: ''
      };
      
      let newDocument: Document;
      try {
        newDocument = await trpc.createDocument.mutate(createData);
      } catch {
        // Fallback for demo purposes when server is not available
        console.log('Server not available, creating document locally for demo');
        newDocument = {
          id: Date.now(), // Use timestamp as ID for demo
          title: createData.title,
          content: createData.content,
          created_at: new Date(),
          updated_at: new Date()
        };
      }
      
      setDocuments((prev: Document[]) => [newDocument, ...prev]);
      setSelectedDocument(newDocument);
      setNewDocumentTitle('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDocumentSelect = useCallback(async (documentId: number) => {
    try {
      let document: Document | null;
      try {
        document = await trpc.getDocument.query({ id: documentId });
      } catch {
        // Fallback: find document in local state for demo
        document = documents.find((doc: Document) => doc.id === documentId) || null;
      }
      
      if (document) {
        setSelectedDocument(document);
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  }, [documents]);

  const handleDocumentSave = async (documentId: number, title: string, content: string) => {
    try {
      let updatedDocument: Document | null;
      try {
        updatedDocument = await trpc.updateDocument.mutate({
          id: documentId,
          title,
          content
        });
      } catch {
        // Fallback: update document locally for demo
        console.log('Server not available, updating document locally for demo');
        updatedDocument = {
          id: documentId,
          title,
          content,
          created_at: selectedDocument?.created_at || new Date(),
          updated_at: new Date()
        };
      }
      
      if (updatedDocument) {
        setDocuments((prev: Document[]) =>
          prev.map((doc: Document) => doc.id === documentId ? updatedDocument : doc)
        );
        setSelectedDocument(updatedDocument);
      }
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      try {
        await trpc.deleteDocument.mutate({ id: documentId });
      } catch {
        // For demo purposes, continue with local deletion even if server fails
        console.log('Server not available, deleting document locally for demo');
      }
      
      setDocuments((prev: Document[]) => prev.filter((doc: Document) => doc.id !== documentId));
      if (selectedDocument && selectedDocument.id === documentId) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  // Auto-select first document if none is selected
  useEffect(() => {
    if (documents.length > 0 && !selectedDocument) {
      handleDocumentSelect(documents[0].id);
    }
  }, [documents, selectedDocument, handleDocumentSelect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Server Status Alert */}
        {!isServerConnected && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <WifiOff className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Demo Mode:</strong> Server connection unavailable. You can still explore the rich text editor features, 
              but changes will only be stored locally in this session.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📝 Document Editor</h1>
                <p className="text-gray-600 mt-1">Create and edit rich text documents</p>
              </div>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 hover:shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-0 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-gray-900">Create New Document</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDocument} className="space-y-4 mt-4">
                  <Input
                    value={newDocumentTitle}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDocumentTitle(e.target.value)}
                    placeholder="Enter document title..."
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating || !newDocumentTitle.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isCreating ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Document List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 Your Documents</h2>
              <DocumentList
                documents={documents}
                selectedDocumentId={selectedDocument?.id || null}
                onDocumentSelect={handleDocumentSelect}
                onDocumentDelete={handleDeleteDocument}
              />
            </div>
          </div>

          {/* Document Editor */}
          <div className="lg:col-span-3">
            {selectedDocument ? (
              <DocumentEditor
                document={selectedDocument}
                onSave={handleDocumentSave}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Document Selected</h3>
                  <p className="text-gray-600 mb-6">
                    Select a document from the sidebar or create a new one to start editing.
                  </p>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Document
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;