import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ToolbarButton } from '@/components/ToolbarButton';
import { ImageUploadDialog } from '@/components/ImageUploadDialog';
import { LinkDialog } from '@/components/LinkDialog';
import { AIDialog } from '@/components/AIDialog';
import { trpc } from '@/utils/trpc';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Save,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Sparkles
} from 'lucide-react';
import type { Document } from '../../../server/src/schema';

interface DocumentEditorProps {
  document: Document;
  onSave: (documentId: number, title: string, content: string) => Promise<void>;
}

export function DocumentEditor({ document, onSave }: DocumentEditorProps) {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [currentSelection, setCurrentSelection] = useState<Selection | null>(null);
  const [showAIButton, setShowAIButton] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Update local state when document changes
  useEffect(() => {
    setTitle(document.title);
    setContent(document.content);
    setHasUnsavedChanges(false);
  }, [document]);

  // Track changes
  useEffect(() => {
    const titleChanged = title !== document.title;
    const contentChanged = content !== document.content;
    setHasUnsavedChanges(titleChanged || contentChanged);
  }, [title, content, document.title, document.content]);

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    
    setIsSaving(true);
    try {
      await onSave(document.id, title, content);
    } finally {
      setIsSaving(false);
    }
  };

  const executeCommand = useCallback((command: string, value?: string) => {
    window.document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, []);

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save with Ctrl+S
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    
    // Common formatting shortcuts
    if (e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
      }
    }
  };

  const insertImage = (url: string, alt: string = '') => {
    const img = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
    executeCommand('insertHTML', img);
    setIsImageDialogOpen(false);
  };

  const insertLink = (url: string, text: string) => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      executeCommand('createLink', url);
    } else {
      const link = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text || url}</a>`;
      executeCommand('insertHTML', link);
    }
    setIsLinkDialogOpen(false);
  };

  // Handle text selection for AI functionality
  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString());
      setCurrentSelection(selection);
      setShowAIButton(true);
    } else {
      setSelectedText('');
      setCurrentSelection(null);
      setShowAIButton(false);
    }
  }, []);

  // Add event listeners for selection changes
  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(handleSelectionChange, 10); // Small delay to ensure selection is complete
    };
    
    const handleKeyUp = () => {
      setTimeout(handleSelectionChange, 10);
    };

    if (editorRef.current) {
      editorRef.current.addEventListener('mouseup', handleMouseUp);
      editorRef.current.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('mouseup', handleMouseUp);
        editorRef.current.removeEventListener('keyup', handleKeyUp);
      }
    };
  }, [handleSelectionChange]);

  // Handle AI text improvement
  const handleAIImprovement = async (selectedText: string, aiCommand: string) => {
    try {
      const improvedText = await trpc.improveTextWithAI.mutate({
        selectedText,
        aiCommand
      });

      // Restore the selection and replace with improved text
      if (currentSelection && currentSelection.rangeCount > 0) {
        const range = currentSelection.getRangeAt(0);
        
        // Clear current selection and set the range
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
        
        // Replace the selected text with AI improved text
        window.document.execCommand('insertHTML', false, improvedText);
        
        // Update the content state
        if (editorRef.current) {
          setContent(editorRef.current.innerHTML);
        }
        
        // Clear selection state
        setSelectedText('');
        setCurrentSelection(null);
        setShowAIButton(false);
      }
    } catch (error) {
      console.error('AI text improvement failed:', error);
      // You could add a toast notification here for better UX
    }
  };

  const openAIDialog = () => {
    if (selectedText.trim()) {
      setIsAIDialogOpen(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            className="text-2xl font-bold border-none p-0 focus:ring-0 focus:border-none bg-transparent"
            placeholder="Document title..."
          />
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`transition-all duration-200 ${
              hasUnsavedChanges 
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' 
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save' : 'Saved'}
          </Button>
        </div>
        
        <div className="text-sm text-gray-500">
          Created: {document.created_at.toLocaleDateString()} • 
          Last updated: {document.updated_at.toLocaleDateString()}
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Formatting */}
          <ToolbarButton
            icon={<Type className="w-4 h-4" />}
            onClick={() => executeCommand('removeFormat')}
            tooltip="Clear formatting"
          />
          <ToolbarButton
            icon={<Bold className="w-4 h-4" />}
            onClick={() => executeCommand('bold')}
            tooltip="Bold (Ctrl+B)"
          />
          <ToolbarButton
            icon={<Italic className="w-4 h-4" />}
            onClick={() => executeCommand('italic')}
            tooltip="Italic (Ctrl+I)"
          />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* Headings */}
          <ToolbarButton
            icon={<Heading1 className="w-4 h-4" />}
            onClick={() => executeCommand('formatBlock', 'h1')}
            tooltip="Heading 1"
          />
          <ToolbarButton
            icon={<Heading2 className="w-4 h-4" />}
            onClick={() => executeCommand('formatBlock', 'h2')}
            tooltip="Heading 2"
          />
          <ToolbarButton
            icon={<Heading3 className="w-4 h-4" />}
            onClick={() => executeCommand('formatBlock', 'h3')}
            tooltip="Heading 3"
          />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* Lists */}
          <ToolbarButton
            icon={<List className="w-4 h-4" />}
            onClick={() => executeCommand('insertUnorderedList')}
            tooltip="Bullet list"
          />
          <ToolbarButton
            icon={<ListOrdered className="w-4 h-4" />}
            onClick={() => executeCommand('insertOrderedList')}
            tooltip="Numbered list"
          />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* Quote and Code */}
          <ToolbarButton
            icon={<Quote className="w-4 h-4" />}
            onClick={() => executeCommand('formatBlock', 'blockquote')}
            tooltip="Quote"
          />
          <ToolbarButton
            icon={<Code className="w-4 h-4" />}
            onClick={() => executeCommand('formatBlock', 'pre')}
            tooltip="Code block"
          />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* Media */}
          <ToolbarButton
            icon={<Link className="w-4 h-4" />}
            onClick={() => setIsLinkDialogOpen(true)}
            tooltip="Insert link"
          />
          <ToolbarButton
            icon={<Image className="w-4 h-4" />}
            onClick={() => setIsImageDialogOpen(true)}
            tooltip="Insert image"
          />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* AI Tools */}
          <ToolbarButton
            icon={<Sparkles className="w-4 h-4" />}
            onClick={openAIDialog}
            tooltip="Improve with AI"
            disabled={!showAIButton}
            className={showAIButton ? 'bg-purple-100 text-purple-700 border-purple-200' : ''}
          />
        </div>
      </div>

      {/* Editor */}
      <div className="p-6">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: content }}
          onInput={handleEditorInput}
          onKeyDown={handleKeyDown}
          className="min-h-96 outline-none prose prose-lg max-w-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 rounded-lg p-4 transition-all duration-200"
          style={{
            lineHeight: '1.6',
            fontSize: '16px',
            color: '#374151'
          }}
        />
      </div>

      {/* Dialogs */}
      <ImageUploadDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        onInsert={insertImage}
      />
      
      <LinkDialog
        open={isLinkDialogOpen}
        onOpenChange={setIsLinkDialogOpen}
        onInsert={insertLink}
      />
      
      <AIDialog
        open={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        selectedText={selectedText}
        onSubmit={handleAIImprovement}
      />
    </div>
  );
}