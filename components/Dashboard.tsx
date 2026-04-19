import { Terrarium, SPECIES, calculateArea, calculateSprays } from '@/lib/types';
import { Settings, Droplet, Info, Trash2, Edit3, X, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef } from 'react';

interface DashboardProps {
  terrariums: Terrarium[];
  deleteTerrarium: (id: string) => void;
  onEdit: (t: Terrarium) => void;
}

export default function Dashboard({ terrariums, deleteTerrarium, onEdit }: DashboardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePressStart = (id: string, e: React.PointerEvent) => {
    // Only trigger for primary pointer (finger/left click)
    if (e.button !== 0) return;
    
    timerRef.current = setTimeout(() => {
      setSelectedId(id);
      // Haptic feedback if available
      if (window.navigator?.vibrate) window.navigator.vibrate(50);
    }, 500); // Reduced to 500ms for better responsiveness
  };

  const handlePressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  if (terrariums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[70vh]">
        <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full flex items-center justify-center mb-6 border border-[var(--border)]">
          <Info className="text-[var(--text-muted)]" size={48} />
        </div>
        <h2 className="text-[24px] font-light text-[var(--text-main)] mb-2">Brak terrariów</h2>
        <p className="text-[14px] text-[var(--text-muted)] mb-8">Dodaj swoje pierwsze terrarium, aby zacząć śledzić parametry.</p>
      </div>
    );
  }

  return (
    <div className="px-[25px] md:px-[40px] py-8">
      <header className="mb-10 flex flex-col items-start px-2">
        <span className="text-[11px] uppercase tracking-[2px] text-[var(--text-muted)] mb-1 font-bold">Hodowla</span>
        <h1 className="text-[34px] font-light tracking-[-0.8px] text-[var(--text-main)]">Twoje Terraria</h1>
      </header>

      <div className="grid grid-cols-2 gap-x-4 gap-y-16">
        {terrariums.map((t, idx) => {
          const species = SPECIES.find(s => s.id === t.speciesId);
          const area = calculateArea(t.width, t.depth);
          const sprays = species ? calculateSprays(area, species.humidity) : 0;
          
          return (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative select-none"
              style={{ WebkitTouchCallout: 'none' }} // Prevents iOS context menu
              onPointerDown={(e) => handlePressStart(t.id, e)}
              onPointerUp={handlePressEnd}
              onPointerLeave={handlePressEnd}
              onContextMenu={(e) => e.preventDefault()} // Block it on all devices logic
            >
              {/* The "Box" or Terrarium sitting on the shelf */}
              <div className="relative z-10 w-full h-full">
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className="bg-[var(--bg-card)] rounded-[10px] p-0 shadow-[var(--shadow)] border border-[var(--border)] relative group h-full flex flex-col justify-between overflow-hidden"
                >
                  <AnimatePresence>
                    {selectedId === t.id && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-[var(--primary)]/95 flex flex-col items-center justify-center gap-4 p-4 backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          onClick={() => { setSelectedId(null); onEdit(t); }}
                          className="flex items-center gap-2 text-white bg-white/20 w-full py-2.5 rounded-lg justify-center hover:bg-white/30 transition-colors"
                        >
                          <Edit3 size={16} />
                          <span className="text-[12px] font-bold uppercase tracking-wider">Edytuj</span>
                        </button>
                        <button 
                          onClick={() => { setSelectedId(null); if(confirm('Usunąć?')) deleteTerrarium(t.id); }}
                          className="flex items-center gap-2 text-white bg-[var(--accent)] w-full py-2.5 rounded-lg justify-center opacity-90 transition-opacity shadow-sm"
                        >
                          <Trash2 size={16} />
                          <span className="text-[12px] font-bold uppercase tracking-wider">Usuń</span>
                        </button>
                        <button 
                          onClick={() => setSelectedId(null)}
                          className="absolute top-2 right-2 p-1 text-white/60 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col h-full">
                    {/* Image or Placeholder */}
                    <div className="aspect-[4/3] w-full bg-[var(--bg-page)] relative overflow-hidden border-b border-[var(--border)]">
                      {t.imageUrl ? (
                        <>
                          <img src={t.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110" />
                          <img src={t.imageUrl} alt={t.name} className="relative z-10 w-full h-full object-cover" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Box className="text-[var(--text-muted)]" size={32} />
                        </div>
                      )}
                      
                      {t.isBioActive && (
                        <div className="absolute top-2 left-2 z-20 bg-[var(--primary)] text-white text-[7px] uppercase tracking-[1px] px-1.5 py-0.5 rounded font-bold shadow-sm flex items-center gap-1">
                          <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                          Bio-Active
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                         <span className="bg-[var(--primary)]/10 text-[var(--primary)] text-[7px] uppercase tracking-[1px] px-1.5 py-0.5 rounded font-bold truncate max-w-[90%]">
                          {species?.name || 'Gatunek'}
                        </span>
                      </div>
                      
                      <h3 className="text-[14px] font-semibold text-[var(--text-main)] leading-tight mb-0.5 line-clamp-1">{t.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[9px] text-[var(--text-muted)] font-mono">{t.width}x{t.depth}x{t.height} cm</p>
                        <div className="flex items-center gap-1.5">
                          {t.notes && <Edit3 size={10} className="text-[var(--primary)] opacity-40" />}
                          <span className="text-[9px] bg-[var(--primary)]/10 text-[var(--primary)] px-1.5 py-0.5 rounded-full font-bold">
                            {t.insectCount} szt.
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-[var(--border)] mt-auto">
                        <div className="flex items-center justify-between">
                          <span className="text-[7px] uppercase tracking-[0.5px] text-[var(--text-muted)] font-bold">💧 Zraszanie</span>
                          <div className="flex items-center gap-1">
                            <Droplet size={9} className="text-[var(--primary)]" />
                            <span className="text-[11px] font-bold text-[var(--text-main)]">{sprays} psikn.</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[7px] uppercase tracking-[0.5px] text-[var(--text-muted)] font-bold">📏 Obszar</span>
                          <span className="text-[11px] font-bold text-[var(--text-main)]">{(area / 10000).toFixed(2)}m&sup2;</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Graphical Shelf Representation (Individual for each card) */}
              <div className="absolute -bottom-4 left-0 right-0 h-6 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-2 bg-[var(--shelf-top)] rounded-full" />
                <div className="absolute top-1 left-0.5 right-0.5 h-3 bg-[var(--shelf-side)] rounded-b-lg shadow-[var(--shadow)]" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <footer className="mt-[120px] text-center pb-10">
        <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-[1.5px]">Twoje Terraria Insectia</p>
      </footer>
    </div>
  );
}
