import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FileText, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';
import type { Document } from '../../../server/src/schema';

interface DocumentListProps {
  documents: Document[];
  selectedDocumentId: number | null;
  onDocumentSelect: (id: number) => void;
  onDocumentDelete: (id: number) => void;
}

export function DocumentList({ documents, selectedDocumentId, onDocumentSelect, onDocumentDelete }: DocumentListProps) {
  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null);

  const handleDelete = async (documentId: number) => {
    setDeletingDocumentId(documentId);
    try {
      await onDocumentDelete(documentId);
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
          <FileText className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">No documents yet</p>
        <p className="text-xs text-gray-400 mt-1">Create your first document to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {documents.map((document: Document) => (
        <div
          key={document.id}
          className={`group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
            selectedDocumentId === document.id
              ? 'bg-blue-50 border-blue-200 shadow-sm'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}
          onClick={() => onDocumentSelect(document.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <FileText className={`w-4 h-4 flex-shrink-0 ${
                  selectedDocumentId === document.id ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <h3 className={`font-medium text-sm truncate ${
                  selectedDocumentId === document.id ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {document.title}
                </h3>
              </div>
              
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Updated {formatDate(document.updated_at)}</span>
              </div>
              
              {document.content && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                  {document.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                  {document.content.length > 100 && '...'}
                </p>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto ml-2 hover:bg-red-50 hover:text-red-600"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-900">Delete Document</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                    Are you sure you want to delete "{document.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(document.id)}
                    disabled={deletingDocumentId === document.id}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {deletingDocumentId === document.id ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}