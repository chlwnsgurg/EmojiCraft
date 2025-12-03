import React, { useState } from 'react';
import { SetupData, EmojiItem, EmojiSet } from '../types';
import { generateId } from '../utils/imageUtils';
import { generateEmoji } from '../services/geminiService';
import { Save, ArrowLeft, Wand2, RefreshCw, AlertCircle } from 'lucide-react';

interface WorkspaceProps {
  setupData: SetupData;
  onSave: (set: EmojiSet) => void;
  onBack: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ setupData, onSave, onBack }) => {
  // Initialize slots
  const [items, setItems] = useState<EmojiItem[]>(() => 
    Array.from({ length: setupData.count }, () => ({
      id: generateId(),
      text: '',
      description: '',
      status: 'idle',
    }))
  );
  
  const [isGlobalSaving, setIsGlobalSaving] = useState(false);

  const handleUpdateItem = (id: string, field: 'text' | 'description', value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleGenerate = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'generating' } : i)));

    try {
      const imageUrl = await generateEmoji(
        setupData.concept,
        setupData.referenceImages,
        item.description,
        item.text
      );
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'success', imageUrl } : i)));
    } catch (error) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'error' } : i)));
    }
  };

  const handleSaveSet = () => {
    setIsGlobalSaving(true);
    // Filter out items that are essentially empty (no description and no image)
    // But keeps ones that might have just a generated image even if description was cleared (unlikely)
    // Or just save everything. The prompt says "working emoji set added".
    // Let's save all items that have an imageURL.
    const workingItems = items.filter(i => i.status === 'success' && i.imageUrl);
    
    if (workingItems.length === 0) {
        alert("Generate at least one emoji before saving.");
        setIsGlobalSaving(false);
        return;
    }

    const newSet: EmojiSet = {
      id: generateId(),
      createdAt: Date.now(),
      concept: setupData.concept,
      referenceImages: setupData.referenceImages,
      items: workingItems
    };

    onSave(newSet);
  };

  const hasGeneratedItems = items.some(i => i.status === 'success');

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="p-4 border-b border-slate-200 bg-white flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-slate-800 truncate max-w-xs md:max-w-md">
              {setupData.concept}
            </h1>
            <p className="text-xs text-slate-500">{items.filter(i => i.status === 'success').length} / {items.length} generated</p>
          </div>
        </div>
        
        <button
          onClick={handleSaveSet}
          disabled={!hasGeneratedItems || isGlobalSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            hasGeneratedItems
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save Set</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-xl border transition-all duration-300 flex flex-col sm:flex-row overflow-hidden ${
                item.status === 'success' ? 'border-indigo-100 shadow-sm' : 'border-slate-200 shadow-sm'
              }`}
            >
              {/* Preview Area */}
              <div className="w-full sm:w-48 h-48 sm:h-auto bg-slate-100 flex-shrink-0 flex items-center justify-center relative border-b sm:border-b-0 sm:border-r border-slate-100">
                {item.status === 'generating' && (
                  <div className="flex flex-col items-center justify-center text-indigo-600">
                    <RefreshCw className="w-8 h-8 animate-spin mb-2" />
                    <span className="text-xs font-medium animate-pulse">Designing...</span>
                  </div>
                )}
                {item.status === 'idle' && (
                  <div className="text-slate-300 flex flex-col items-center">
                    <span className="text-4xl font-black opacity-20 select-none">#{index + 1}</span>
                  </div>
                )}
                {item.status === 'error' && (
                  <div className="text-red-500 flex flex-col items-center px-4 text-center">
                    <AlertCircle className="w-8 h-8 mb-1" />
                    <span className="text-xs">Generation Failed</span>
                  </div>
                )}
                {item.status === 'success' && item.imageUrl && (
                   <img 
                    src={item.imageUrl} 
                    alt="Generated Emoji" 
                    className="w-full h-full object-contain p-2 animate-in fade-in duration-500" 
                  />
                )}
              </div>

              {/* Controls Area */}
              <div className="flex-1 p-4 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                      Text (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. LOL"
                      value={item.text}
                      onChange={(e) => handleUpdateItem(item.id, 'text', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                      Description <span className="text-indigo-500">*</span>
                    </label>
                    <textarea
                      placeholder="e.g. Laughing with tears, holding stomach"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm h-20 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => handleGenerate(item.id)}
                    disabled={item.description.trim().length === 0 || item.status === 'generating'}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${
                        item.description.trim().length > 0
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {item.status === 'success' ? 'Regenerate' : 'Create'} 
                    <Wand2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Workspace;