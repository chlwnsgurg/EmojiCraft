import React, { useState } from 'react';
import { SetupData } from '../types';
import { fileToBase64 } from '../utils/imageUtils';
import { ArrowLeft, Upload, X } from 'lucide-react';

interface SetupProps {
  onBack: () => void;
  onNext: (data: SetupData) => void;
}

const Setup: React.FC<SetupProps> = ({ onBack, onNext }) => {
  const [count, setCount] = useState<number>(32);
  const [concept, setConcept] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsLoadingImages(true);
      const newImages: string[] = [];
      try {
        for (let i = 0; i < e.target.files.length; i++) {
          const base64 = await fileToBase64(e.target.files[i]);
          newImages.push(base64);
        }
        setImages((prev) => [...prev, ...newImages]);
      } catch (error) {
        console.error("Failed to process images", error);
      } finally {
        setIsLoadingImages(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const isValid = count > 0 && concept.trim().length > 0;

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-4 border-b border-slate-200 flex items-center gap-4 bg-white sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">New Emoji Set</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        <div className="space-y-8">
          
          {/* Concept Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Concept Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g., A cute cyber-punk cat character named 'Byte' with neon accents..."
              className="w-full h-32 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-slate-700 shadow-sm"
            />
            <p className="text-xs text-slate-500">
              Describe the overall theme, character, or style for your emoji set. This will be the foundation for all generated emojis.
            </p>
          </div>

          {/* Count Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Number of Emojis
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-lg font-bold text-indigo-600 w-12 text-center">{count}</span>
            </div>
          </div>

          {/* Reference Images Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Reference Images (Optional)
            </label>
            <div className="flex flex-wrap gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 group">
                  <img src={img} alt="Reference" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-slate-400 hover:text-indigo-500">
                {isLoadingImages ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mb-1" />
                    <span className="text-[10px]">Upload</span>
                  </>
                )}
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <p className="text-xs text-slate-500">
              Upload images to help the AI understand your character or style better.
            </p>
          </div>

        </div>
      </main>

      <div className="p-6 border-t border-slate-200 bg-white">
        <button
          onClick={() => onNext({ count, concept, referenceImages: images })}
          disabled={!isValid}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
            isValid
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Start Building <ArrowLeft className="w-5 h-5 rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default Setup;