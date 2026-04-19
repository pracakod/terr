import { Terrarium, SPECIES, calculateArea, calculateSprays, AtlasEntry } from '@/lib/types';
import { Home, PlusCircle, CalendarCheck, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import AddTerrarium from './AddTerrarium';
import Schedule from './Schedule';
import Atlas from './Atlas';
import Options from './Options';

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'schedule' | 'atlas' | 'options'>('dashboard');
  const [terrariums, setTerrariums] = useState<Terrarium[]>([]);
  const [atlasEntries, setAtlasEntries] = useState<AtlasEntry[]>([]);
  const [theme, setTheme] = useState<string>('light');
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Draft state for "Add Terrarium" form
  const [draft, setDraft] = useState({
    name: '',
    width: '',
    depth: '',
    height: '',
    speciesId: SPECIES[0].id,
    insectCount: '1',
    notes: '',
    imageUrl: '',
    isBioActive: false
  });

  useEffect(() => {
    const savedTerrariums = localStorage.getItem('insectia_terrariums');
    if (savedTerrariums) {
      try {
        const parsed = JSON.parse(savedTerrariums);
        const migrated = Array.isArray(parsed) ? parsed.map((t: any) => ({
          ...t,
          insectCount: t.insectCount ?? 1,
          isBioActive: t.isBioActive ?? false,
          notes: t.notes ?? '',
          imageUrl: t.imageUrl ?? ''
        })) : [];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTerrariums(migrated);
      } catch (e) {
        console.error('Failed to load terrariums', e);
      }
    }

    const savedAtlas = localStorage.getItem('insectia_atlas');
    if (savedAtlas) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAtlasEntries(JSON.parse(savedAtlas));
      } catch (e) {
        console.error('Failed to load atlas', e);
      }
    } else {
      // Default example for Atlas
      setAtlasEntries([{
        id: 'example-1',
        name: 'Modliszka zwyczajna',
        description: 'Znaleziona na nasłonecznionej polanie. Piękny, zielony osobnik. W Polsce pod ochroną!',
        date: '2026-04-15',
        location: 'Polana w lesie',
        imageUrl: 'https://picsum.photos/seed/mantis/800/600'
      }]);
    }

    const savedTheme = localStorage.getItem('insectia_theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('insectia_terrariums', JSON.stringify(terrariums));
      localStorage.setItem('insectia_atlas', JSON.stringify(atlasEntries));
      localStorage.setItem('insectia_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [terrariums, atlasEntries, isLoaded, theme]);

  const addTerrarium = (t: Terrarium) => {
    if (editingId) {
      setTerrariums((prev) => prev.map(item => item.id === editingId ? { ...t, id: editingId } : item));
      setEditingId(null);
    } else {
      setTerrariums((prev) => [...prev, t]);
    }
    setActiveTab('dashboard');
    setDraft({ 
      name: '', 
      width: '', 
      depth: '', 
      height: '', 
      speciesId: SPECIES[0].id, 
      insectCount: '1',
      notes: '',
      imageUrl: '',
      isBioActive: false
    });
  };

  const startEdit = (t: Terrarium) => {
    setEditingId(t.id);
    setDraft({
      name: t.name || '',
      width: (t.width ?? '').toString(),
      depth: (t.depth ?? '').toString(),
      height: (t.height ?? '').toString(),
      speciesId: t.speciesId || SPECIES[0].id,
      insectCount: (t.insectCount ?? 1).toString(),
      notes: t.notes || '',
      imageUrl: t.imageUrl || '',
      isBioActive: !!t.isBioActive
    });
    setActiveTab('add');
  };

  const updateTerrarium = (updated: Terrarium) => {
    setTerrariums((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  };
  
  const deleteTerrarium = (id: string) => {
    setTerrariums((prev) => prev.filter((t) => t.id !== id));
  };

  const addAtlasEntry = (entry: AtlasEntry) => {
    setAtlasEntries(prev => [entry, ...prev]);
  };

  const deleteAtlasEntry = (id: string) => {
    setAtlasEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateAtlasEntry = (updated: AtlasEntry) => {
    setAtlasEntries(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  if (!isLoaded) return null; // or a nice splash screen loader

  return (
    <>
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Dashboard terrariums={terrariums} deleteTerrarium={deleteTerrarium} onEdit={startEdit} />
            </motion.div>
          )}
          {activeTab === 'add' && (
            <motion.div key="add" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AddTerrarium 
                onAdd={(t) => {
                  addTerrarium(t);
                }} 
                draft={draft}
                setDraft={setDraft}
                isEditing={!!editingId}
                onCancel={() => {
                  setEditingId(null);
                  setDraft({ 
                    name: '', 
                    width: '', 
                    depth: '', 
                    height: '', 
                    speciesId: SPECIES[0].id, 
                    insectCount: '1',
                    notes: '',
                    imageUrl: '',
                    isBioActive: false
                  });
                  setActiveTab('dashboard');
                }}
              />
            </motion.div>
          )}
          {activeTab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Schedule terrariums={terrariums} updateTerrarium={updateTerrarium} />
            </motion.div>
          )}
          {activeTab === 'atlas' && (
            <motion.div key="atlas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Atlas entries={atlasEntries} addEntry={addAtlasEntry} deleteEntry={deleteAtlasEntry} updateEntry={updateAtlasEntry} />
            </motion.div>
          )}
          {activeTab === 'options' && (
            <motion.div key="options" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Options theme={theme} setTheme={setTheme} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed md:absolute bottom-0 left-0 w-full bg-[var(--bg-card)] border-t border-[var(--border)] flex items-center justify-around z-50 px-2 py-2 pb-safe">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 transition-colors p-2 ${activeTab === 'dashboard' ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
          <Home size={20} />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-center">Terraria</span>
          <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${activeTab === 'dashboard' ? 'bg-[var(--primary)]' : 'bg-transparent'}`} />
        </button>
        <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center gap-1 transition-colors p-2 ${activeTab === 'schedule' ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
          <CalendarCheck size={20} />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-center">Grafik</span>
          <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${activeTab === 'schedule' ? 'bg-[var(--primary)]' : 'bg-transparent'}`} />
        </button>
        <button onClick={() => setActiveTab('atlas')} className={`flex flex-col items-center gap-1 transition-colors p-2 ${activeTab === 'atlas' ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
          <BookOpen size={20} />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-center">Atlas</span>
          <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${activeTab === 'atlas' ? 'bg-[var(--primary)]' : 'bg-transparent'}`} />
        </button>
        <button onClick={() => setActiveTab('add')} className={`flex flex-col items-center gap-1 transition-colors p-2 ${activeTab === 'add' ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
          <PlusCircle size={20} />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-center">Dodaj</span>
          <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${activeTab === 'add' ? 'bg-[var(--primary)]' : 'bg-transparent'}`} />
        </button>
        <button onClick={() => setActiveTab('options')} className={`flex flex-col items-center gap-1 transition-colors p-2 ${activeTab === 'options' ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}>
          <SettingsIcon size={20} />
          <span className="text-[10px] uppercase tracking-widest font-semibold text-center">Opcje</span>
          <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${activeTab === 'options' ? 'bg-[var(--primary)]' : 'bg-transparent'}`} />
        </button>
      </nav>
    </>
  );
}
