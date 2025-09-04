import { type ImproveTextWithAIInput } from '../schema';

export const improveTextWithAI = async (input: ImproveTextWithAIInput): Promise<string> => {
  try {
    const { selectedText, aiCommand } = input;
    const command = aiCommand.toLowerCase();
    
    // Mock AI response logic based on command
    if (command.includes('summarize')) {
      const maxLength = Math.min(selectedText.length, 50);
      return `[AI Summary]: ${selectedText.substring(0, maxLength)}...`;
    }
    
    if (command.includes('improve grammar')) {
      return `[AI Grammar Improved]: ${selectedText}`;
    }
    
    if (command.includes('make concise')) {
      const maxLength = Math.min(selectedText.length, 70);
      return `[AI Concise]: ${selectedText.substring(0, maxLength)}...`;
    }
    
    // Default enhancement
    return `[AI Enhanced]: ${selectedText}`;
  } catch (error) {
    console.error('AI text improvement failed:', error);
    throw error;
  }
};