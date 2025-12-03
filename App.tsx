import React, { useState, useEffect } from 'react';
import { AppView, EmojiSet, SetupData } from './types';
import Gallery from './components/Gallery';
import Setup from './components/Setup';
import Workspace from './components/Workspace';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('gallery');
  const [sets, setSets] = useState<EmojiSet[]>([]);
  const [currentSetup, setCurrentSetup] = useState<SetupData | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('emoji-forge-sets');
    if (saved) {
      try {
        setSets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load sets", e);
      }
    }
  }, []);

  // Save to local storage when sets change
  useEffect(() => {
    if (sets.length > 0) {
      localStorage.setItem('emoji-forge-sets', JSON.stringify(sets));
    }
  }, [sets]);

  const handleStartSetup = () => {
    setView('setup');
  };

  const handleSetupComplete = (data: SetupData) => {
    setCurrentSetup(data);
    setView('workspace');
  };

  const handleSaveSet = (newSet: EmojiSet) => {
    setSets((prev) => [newSet, ...prev]);
    setView('gallery');
    setCurrentSetup(null);
  };

  const handleDeleteSet = (id: string) => {
    if (window.confirm("Are you sure you want to delete this emoji set?")) {
      const newSets = sets.filter(s => s.id !== id);
      setSets(newSets);
      localStorage.setItem('emoji-forge-sets', JSON.stringify(newSets)); // Update storage immediately
    }
  };

  return (
    <div className="h-full w-full">
      {view === 'gallery' && (
        <Gallery 
          sets={sets} 
          onCreateNew={handleStartSetup} 
          onDeleteSet={handleDeleteSet}
        />
      )}
      
      {view === 'setup' && (
        <Setup 
          onBack={() => setView('gallery')} 
          onNext={handleSetupComplete} 
        />
      )}

      {view === 'workspace' && currentSetup && (
        <Workspace 
          setupData={currentSetup} 
          onSave={handleSaveSet} 
          onBack={() => setView('setup')}
        />
      )}
    </div>
  );
};

export default App;