import React from 'react';
import { EmojiSet } from '../types';
import { Plus, Trash2, Smile } from 'lucide-react';

interface GalleryProps {
  sets: EmojiSet[];
  onCreateNew: () => void;
  onDeleteSet: (id: string) => void;
}

const Gallery: React.FC<GalleryProps> = ({ sets, onCreateNew, onDeleteSet }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <header className="p-6 bg-white border-b border-slate-200 sticky top-0 z-10">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <Smile className="w-8 h-8 text-indigo-600" />
          Emoji Builder
        </h1>
        <p className="text-slate-500 mt-1">Your collection of custom generated emoji sets</p>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {sets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 mt-20 text-center">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <Smile className="w-16 h-16 text-slate-300" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700">No emojis yet</h2>
            <p className="text-slate-500 max-w-sm mt-2">
              Start creating your own custom AI-generated emoji sets by clicking the button below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
            {sets.map((set) => (
              <div key={set.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-4 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800 truncate pr-2" title={set.concept}>
                      {set.concept || "Untitled Set"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {new Date(set.createdAt).toLocaleDateString()} • {set.items.length} emojis
                    </p>
                  </div>
                  <button 
                    onClick={() => onDeleteSet(set.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="Delete Set"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-4 grid grid-cols-4 gap-2 bg-slate-50/50">
                  {set.items.slice(0, 8).map((item) => (
                    <div key={item.id} className="aspect-square rounded-lg bg-white shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.description} className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-full h-full bg-slate-100" />
                      )}
                    </div>
                  ))}
                  {set.items.length > 8 && (
                    <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-medium">
                      +{set.items.length - 8}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none px-6">
        <button
          onClick={onCreateNew}
          className="pointer-events-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-3 font-semibold text-lg transform hover:-translate-y-1 active:translate-y-0"
        >
          <Plus className="w-6 h-6" />
          Create New Emoji Set
        </button>
      </div>
    </div>
  );
};

export default Gallery;