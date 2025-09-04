import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'lucide-react';

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (url: string, text: string) => void;
}

export function LinkDialog({ open, onOpenChange, onInsert }: LinkDialogProps) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  const handleInsert = () => {
    if (url.trim()) {
      onInsert(url.trim(), text.trim() || url.trim());
      resetForm();
    }
  };

  const resetForm = () => {
    setUrl('');
    setText('');
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && url.trim()) {
      e.preventDefault();
      handleInsert();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Link className="w-5 h-5 text-blue-600" />
            <span>Insert Link</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="linkUrl">URL</Label>
            <Input
              id="linkUrl"
              value={url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              className="border-gray-200 focus:border-blue-500"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkText">Link Text (optional)</Label>
            <Input
              id="linkText"
              value={text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Click here to visit"
              className="border-gray-200 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500">
              If left empty, the URL will be used as the link text
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsert}
              disabled={!url.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Insert Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}