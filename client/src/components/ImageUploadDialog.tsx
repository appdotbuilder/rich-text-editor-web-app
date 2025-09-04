import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, Image } from 'lucide-react';

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (url: string, alt?: string) => void;
}

export function ImageUploadDialog({ open, onOpenChange, onInsert }: ImageUploadDialogProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');


  const handleUrlInsert = () => {
    if (imageUrl.trim()) {
      onInsert(imageUrl.trim(), altText.trim());
      resetForm();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Create a local URL for preview (in a real app, you'd upload to a server)
      const localUrl = URL.createObjectURL(file);
      onInsert(localUrl, altText.trim() || file.name);
      resetForm();
    }
  };

  const resetForm = () => {
    setImageUrl('');
    setAltText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Image className="w-5 h-5 text-blue-600" />
            <span>Insert Image</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="url" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center space-x-1">
              <Link className="w-4 h-4" />
              <span>URL</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-1">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="border-gray-200 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="altText">Alt text (optional)</Label>
              <Input
                id="altText"
                value={altText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAltText(e.target.value)}
                placeholder="Description of the image"
                className="border-gray-200 focus:border-blue-500"
              />
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
                onClick={handleUrlInsert}
                disabled={!imageUrl.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Insert Image
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fileUpload">Choose Image File</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="fileUpload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    id="fileUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="uploadAltText">Alt text (optional)</Label>
              <Input
                id="uploadAltText"
                value={altText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAltText(e.target.value)}
                placeholder="Description of the image"
                className="border-gray-200 focus:border-blue-500"
              />
            </div>
            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
              📝 <strong>Note:</strong> This is a demo implementation. In production, images would be uploaded to a server or cloud storage.
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}