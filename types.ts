export interface EmojiItem {
  id: string;
  text: string;
  description: string;
  imageUrl?: string;
  status: 'idle' | 'generating' | 'success' | 'error';
}

export interface EmojiSet {
  id: string;
  createdAt: number;
  concept: string;
  referenceImages: string[]; // Base64 strings
  items: EmojiItem[];
}

export type AppView = 'gallery' | 'setup' | 'workspace';

export interface SetupData {
  count: number;
  concept: string;
  referenceImages: string[];
}