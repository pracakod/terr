import { AtlasEntry } from '@/lib/types';
import { Plus, Camera, Trash2, MapPin, Calendar, X, ImagePlus } from 'lucide-react';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AtlasProps {
  entries: AtlasEntry[];
  addEntry: (entry: AtlasEntry) => void;
  deleteEntry: (id: string) => void;
  updateEntry: (entry: AtlasEntry) => void;
}

export default function Atlas({ entries, addEntry, deleteEntry, updateEntry }: AtlasProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<AtlasEntry, 'id'>>({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    imageUrl: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustingImage, setAdjustingImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLongPress = (entry: AtlasEntry) => {
    setEditingId(entry.id);
    setDraft({
      name: entry.name,
      description: entry.description,
      date: entry.date,
      location: entry.location || '',
      imageUrl: entry.imageUrl || ''
    });
    setShowForm(true);
  };

  const startPress = (entry: AtlasEntry) => {
    pressTimer.current = setTimeout(() => {
      handleLongPress(entry);
    }, 600);
  };

  const endPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAdjustingImage(event.target?.result as string);
      setIsAdjusting(true);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
    // Reset input so change event triggers again for same file if needed
    e.target.value = '';
  };

  const handleConfirmAdjustment = () => {
    if (!imgRef.current || !adjustingImage) return;

    const canvas = document.createElement('canvas');
    // Mniejsza rozdzielczość, aby pomieścić więcej wpisów
    const frameW = 400;
    const frameH = 300;
    canvas.width = frameW;
    canvas.height = frameH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    
    // We need to calculate how the image is positioned relative to the frame
    // The visual frame in the UI is a specific size (e.g. 300x200)
    // We must map the visual coordinates to the actual image coordinates.
    
    const displayW = img.offsetWidth;
    const displayH = img.offsetHeight;
    
    // The frame in UI is fixed (let's say we use a 300px width visual frame)
    // We'll calculate the scale between actual canvas and visual frame
    const visualFrameW = 300; 
    const visualFrameH = 225; // 4:3 ratio matches Atlas design better
    const scale = frameW / visualFrameW;

    // Drawing the image onto canvas
    // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    // A simpler way: use translate, scale, and draw the whole image
    
    const temp = document.createElement('div');
    temp.style.color = 'var(--bg-page)';
    document.body.appendChild(temp);
    const resolvedColor = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    ctx.fillStyle = resolvedColor || '#FAF9F7';
    ctx.fillRect(0, 0, frameW, frameH);
    
    ctx.save();
    // Move to center of frame
    ctx.translate(frameW / 2, frameH / 2);
    // Apply position (scaled up)
    ctx.translate(position.x * scale, position.y * scale);
    // Apply zoom
    ctx.scale(zoom, zoom);
    // Draw image centered at current point
    // We need the natural aspect ratio of the image
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    
    // Object-contain logic for base size
    if (imgAspect > visualFrameW / visualFrameH) {
      drawW = visualFrameW * scale;
      drawH = drawW / imgAspect;
    } else {
      drawH = visualFrameH * scale;
      drawW = drawH * imgAspect;
    }
    
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    setDraft(prev => ({ ...prev, imageUrl: dataUrl }));
    setIsAdjusting(false);
    setAdjustingImage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name) return;
    
    if (editingId) {
      updateEntry({ ...draft, id: editingId });
    } else {
      addEntry({ ...draft, id: Math.random().toString(36).substr(2, 9) });
    }

    setDraft({
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      imageUrl: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="px-3 md:px-[40px] py-4 pb-32">
      <header className="mb-6 flex justify-between items-center px-1">
        <div>
          <span className="text-[9px] uppercase tracking-[1px] text-[var(--text-muted)] font-bold">Zbiory</span>
          <h1 className="text-[20px] font-bold tracking-tight text-[var(--text-main)]">Atlas</h1>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setDraft({
              name: '',
              description: '',
              date: new Date().toISOString().split('T')[0],
              location: '',
              imageUrl: ''
            });
            setShowForm(true);
          }}
          className="bg-[var(--primary)] text-white p-3 rounded-full shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Entry List */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {entries.map((entry) => (
          <motion.div 
            layout
            key={entry.id} 
            onPointerDown={() => startPress(entry)}
            onPointerUp={endPress}
            onPointerLeave={endPress}
            onContextMenu={(e) => e.preventDefault()}
            className="bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-sm border border-[var(--border)] group active:scale-[0.98] transition-transform select-none touch-pan-y"
          >
            <div className="relative aspect-[4/3] w-full bg-[var(--bg-page)] overflow-hidden text-[var(--text-muted)]">
              {entry.imageUrl ? (
                <>
                  <img src={entry.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-lg opacity-40 scale-125 pointer-events-none" draggable="false" />
                  <img src={entry.imageUrl} alt={entry.name} className="relative z-10 w-full h-full object-contain p-1.5 pointer-events-none" draggable="false" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center pointer-events-none">
                  <Camera size={24} className="text-[var(--text-muted)] opacity-30" />
                </div>
              )}
            </div>
            <div className="p-3">

              <div className="flex flex-col gap-1 mb-2">
                <h3 className="text-[14px] font-bold text-[var(--text-main)] line-clamp-1">{entry.name}</h3>
                <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-muted)]">
                  <Calendar size={8} />
                  <span>{entry.date}</span>
                </div>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-snug mb-2 line-clamp-2">{entry.description}</p>
              {entry.location && (
                <div className="flex items-center gap-1 text-[9px] text-[var(--primary)] font-medium truncate">
                  <MapPin size={10} />
                  {entry.location}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-20 px-10">
          <div className="w-20 h-20 bg-[var(--bg-page)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border)]">
            <Camera className="text-[var(--text-muted)]" size={32} />
          </div>
          <p className="text-[14px] text-[var(--text-muted)]">Twój atlas jest jeszcze pusty. Dodaj pierwsze znalezisko!</p>
        </div>
      )}

      {/* Overlay Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[var(--bg-overlay)] backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-[var(--bg-card)] w-full max-w-lg rounded-t-[32px] md:rounded-[32px] p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 text-[var(--text-main)]">
                <h2 className="text-[20px] font-bold">{editingId ? 'Edytuj wpis' : 'Dodaj do Atlasu'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 text-[var(--text-muted)]"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[4/3] bg-[var(--bg-page)] rounded-2lx border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
                  ) : draft.imageUrl ? (
                    <img src={draft.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <ImagePlus size={32} className="text-[var(--text-muted)] mb-2" />
                      <p className="text-[12px] text-[var(--text-muted)]">Dodaj zdjęcie</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-bold text-[var(--text-muted)] ml-1">Nazwa owada</label>
                  <input 
                    type="text" 
                    required 
                    value={draft.name}
                    onChange={e => setDraft(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="np. Jelonek rogacz"
                    className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl p-3 text-[14px] focus:border-[var(--primary)] outline-none transition-all text-[var(--text-main)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-bold text-[var(--text-muted)] ml-1">Data</label>
                    <input 
                      type="date" 
                      value={draft.date}
                      onChange={e => setDraft(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl p-3 text-[14px] outline-none text-[var(--text-main)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] uppercase font-bold text-[var(--text-muted)] ml-1">Miejsce</label>
                    <input 
                      type="text" 
                      value={draft.location}
                      onChange={e => setDraft(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="np. Las Kabacki"
                      className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl p-3 text-[14px] outline-none focus:border-[var(--primary)] text-[var(--text-main)]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] uppercase font-bold text-[var(--text-muted)] ml-1">Opis / Obserwacje</label>
                  <textarea 
                    value={draft.description}
                    onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Co zaobserwowałeś? Jakieś ciekawe zachowanie?"
                    rows={3}
                    className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-xl p-3 text-[14px] outline-none focus:border-[var(--primary)] resize-none text-[var(--text-main)]"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  {editingId && (
                    <button 
                      type="button"
                      onClick={() => {
                        if(confirm('Na pewno usunąć ten wpis?')) {
                          deleteEntry(editingId);
                          setShowForm(false);
                        }
                      }}
                      className="flex-1 py-4 bg-[var(--bg-page)] text-[var(--accent)] border border-[var(--border)] rounded-xl font-bold text-[15px] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} /> Usuń
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className={`${editingId ? 'flex-[2]' : 'w-full'} py-4 bg-[var(--primary)] text-white rounded-xl font-bold text-[15px] shadow-lg shadow-[var(--primary)]/20 active:scale-[0.98] transition-all`}
                  >
                    {editingId ? 'Zapisz zmiany' : 'Zapisz w Atlasie'}
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Adjustment Modal */}
      <AnimatePresence>
        {isAdjusting && adjustingImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[var(--bg-overlay)] flex flex-col items-center justify-center p-6 backdrop-blur-md"
          >
            <div className="w-full max-w-sm flex flex-col items-center">
              <h3 className="text-white text-[18px] font-bold mb-2 uppercase tracking-wider">Dopasuj zdjęcie</h3>
              <p className="text-white/60 text-[12px] mb-8 text-center px-4">Przesuń zdjęcie i ustaw powiększenie, aby uzyskać idealny kadr.</p>
              
              <div className="relative w-[300px] h-[225px] overflow-hidden rounded-2xl bg-[var(--bg-page)] border border-white/10 shadow-2xl flex items-center justify-center cursor-move touch-none">
                <motion.div
                  onPan={(e, info) => {
                    setPosition(prev => ({ 
                      x: prev.x + info.delta.x, 
                      y: prev.y + info.delta.y 
                    }));
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <img 
                    ref={imgRef}
                    src={adjustingImage}
                    style={{ 
                      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                    }}
                    className="max-w-none w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                </motion.div>
                <div className="absolute inset-0 border-[2px] border-[var(--primary)] rounded-2xl pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
              </div>

              {/* Controls */}
              <div className="w-[300px] mt-10 space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-white/60 text-[10px] uppercase font-bold tracking-widest px-1">
                    <span>Powiększenie</span>
                    <span className="text-[var(--primary)]">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.01" 
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[var(--primary)] h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => { setIsAdjusting(false); setAdjustingImage(null); }}
                    className="flex-1 py-4 text-white/80 font-bold text-[13px] border border-white/20 rounded-2xl active:bg-white/5 transition-all"
                  >
                    Anuluj
                  </button>
                  <button 
                    onClick={handleConfirmAdjustment}
                    className="flex-1 py-4 bg-[var(--primary)] text-white font-bold text-[13px] rounded-2xl shadow-xl shadow-[var(--primary)]/30 active:scale-95 transition-all"
                  >
                    Gotowe
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
