import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';

interface AIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText: string;
  onSubmit: (selectedText: string, aiCommand: string) => Promise<void>;
}

const predefinedCommands = [
  { value: 'improve grammar', label: 'Improve Grammar' },
  { value: 'summarize', label: 'Summarize' },
  { value: 'make concise', label: 'Make Concise' },
  { value: 'custom', label: 'Custom Command' }
];

export function AIDialog({ open, onOpenChange, selectedText, onSubmit }: AIDialogProps) {
  const [selectedCommand, setSelectedCommand] = useState<string>('improve grammar');
  const [customCommand, setCustomCommand] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const command = selectedCommand === 'custom' ? customCommand : selectedCommand;
      await onSubmit(selectedText, command);
      onOpenChange(false);
      // Reset form
      setSelectedCommand('improve grammar');
      setCustomCommand('');
    } catch (error) {
      console.error('AI improvement failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setSelectedCommand('improve grammar');
    setCustomCommand('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Improve with AI
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected Text Display */}
          <div className="space-y-2">
            <Label htmlFor="selected-text" className="text-sm font-medium">
              Selected Text:
            </Label>
            <Textarea
              id="selected-text"
              value={selectedText}
              readOnly
              className="min-h-20 bg-gray-50 text-gray-700 resize-none"
              placeholder="No text selected"
            />
          </div>

          {/* AI Command Selection */}
          <div className="space-y-2">
            <Label htmlFor="ai-command" className="text-sm font-medium">
              AI Command:
            </Label>
            <Select value={selectedCommand} onValueChange={setSelectedCommand}>
              <SelectTrigger id="ai-command">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {predefinedCommands.map((command) => (
                  <SelectItem key={command.value} value={command.value}>
                    {command.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Command Input */}
          {selectedCommand === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-command" className="text-sm font-medium">
                Custom Command:
              </Label>
              <Input
                id="custom-command"
                value={customCommand}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomCommand(e.target.value)}
                placeholder="Enter your custom AI command..."
                required
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedText.trim() || (selectedCommand === 'custom' && !customCommand.trim())}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Improve Text
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}