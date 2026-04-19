import { Terrarium, SPECIES, calculateArea, calculateSprays } from '@/lib/types';
import { Save, ImagePlus, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRef, useState } from 'react';

interface AddTerrariumProps {
  onAdd: (t: Terrarium) => void;
  draft: { 
    name: string, 
    width: string, 
    depth: string, 
    height: string, 
    speciesId: string, 
    insectCount: string,
    notes: string,
    imageUrl: string,
    isBioActive: boolean
  };
  setDraft: React.Dispatch<React.SetStateAction<any>>;
  isEditing?: boolean;
  onCancel?: () => void;
}

export default function AddTerrarium({ onAdd, draft, setDraft, isEditing, onCancel }: AddTerrariumProps) {
  const { name, width, depth, height, speciesId, insectCount, notes, imageUrl, isBioActive } = draft;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustingImage, setAdjustingImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleChange = (field: string, value: any) => {
    setDraft((prev: any) => ({ ...prev, [field]: value }));
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
    e.target.value = '';
  };

  const handleConfirmAdjustment = () => {
    if (!imgRef.current || !adjustingImage) return;

    const canvas = document.createElement('canvas');
    const frameW = 400; // Zmniejszono rozdzielczość aby pomieścić więcej zdjęć
    const frameH = 300; // 4:3 ratio
    canvas.width = frameW;
    canvas.height = frameH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    
    const visualFrameW = 300; 
    const visualFrameH = 225;
    const scale = frameW / visualFrameW;

    const temp = document.createElement('div');
    temp.style.color = 'var(--bg-page)';
    document.body.appendChild(temp);
    const resolvedColor = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    ctx.fillStyle = resolvedColor || '#FAF9F7';
    ctx.fillRect(0, 0, frameW, frameH);
    
    ctx.save();
    ctx.translate(frameW / 2, frameH / 2);
    ctx.translate(position.x * scale, position.y * scale);
    ctx.scale(zoom, zoom);
    
    const imgAspect = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    
    if (imgAspect > visualFrameW / visualFrameH) {
      drawW = visualFrameW * scale;
      drawH = drawW / imgAspect;
    } else {
      drawH = visualFrameH * scale;
      drawW = drawH * imgAspect;
    }
    
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Wyższa kompresja dla mniejszego pliku
    handleChange('imageUrl', dataUrl);
    setIsAdjusting(false);
    setAdjustingImage(null);
  };

  const w = parseFloat(width) || 0;
  const d = parseFloat(depth) || 0;
  const h = parseFloat(height) || 0;
  const iCount = parseInt(insectCount) || 1;
  
  const area = calculateArea(w, d);
  const selectedSpecies = SPECIES.find(s => s.id === speciesId);
  const sprays = selectedSpecies && area > 0 ? calculateSprays(area, selectedSpecies.humidity) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !w || !d || !h || !speciesId) return;

    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name,
      width: w,
      depth: d,
      height: h,
      speciesId,
      insectCount: iCount,
      notes,
      imageUrl,
      isBioActive
    });
  };

  return (
    <div className="px-[30px] md:px-[60px] py-10">
      <header className="mb-8 flex justify-between items-center px-1">
        <div>
          <span className="text-[11px] uppercase tracking-[2px] text-[var(--text-muted)] mb-1 font-bold">Zarządzanie</span>
          <h2 className="text-[32px] font-bold tracking-tight text-[var(--text-main)]">
            {isEditing ? '📝 Edycja' : '➕ Nowe'}
          </h2>
        </div>
        {isEditing && (
          <button onClick={onCancel} className="bg-[var(--bg-page)] text-[var(--text-muted)] px-4 py-2 rounded-full text-[10px] uppercase tracking-[1px] font-bold border border-[var(--border)] hover:bg-[var(--bg-card)] transition-colors">
            Anuluj
          </button>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-[24px]">
        {/* Photo Upload Section */}
        <div className="space-y-2">
          <label className="block text-[11px] uppercase text-[var(--text-muted)] tracking-[1px] font-bold">📸 Zdjęcie mieszkańca</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative aspect-[4/3] w-full rounded-[16px] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${imageUrl ? 'border-transparent bg-[var(--bg-page)]' : 'border-[var(--border)] hover:border-[var(--primary)] bg-[var(--bg-page)]'}`}
          >
            {imageUrl ? (
              <>
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-[12px] font-bold uppercase tracking-wider">Zmień zdjęcie</p>
                </div>
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); handleChange('imageUrl', ''); }}
                  className="absolute top-2 right-2 bg-[var(--bg-glass)] p-1.5 rounded-full shadow-sm hover:bg-[var(--bg-card)] text-[var(--accent)]"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <div className="text-center p-6">
                {isUploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
                ) : (
                  <>
                    <div className="w-12 h-12 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-[var(--border)]">
                      <ImagePlus className="text-[var(--primary)]" size={24} />
                    </div>
                    <p className="text-[13px] font-bold text-[var(--text-main)]">Dodaj zdjęcie z galerii</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">Kliknij, aby wybrać z telefonu</p>
                  </>
                )}
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] uppercase text-[var(--text-muted)] tracking-[1px] font-bold">🏷️ Nazwa Terrarium</label>
          <input 
            type="text" 
            required 
            value={name} 
            onChange={e => handleChange('name', e.target.value)}
            placeholder="np. Duże Szkło"
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] p-[12px] text-[14px] text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-[11px] uppercase text-[var(--text-muted)] tracking-[1px] font-bold">🍃 Gatunek</label>
            <select 
              value={speciesId} 
              onChange={e => handleChange('speciesId', e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] p-[12px] text-[14px] text-[var(--text-main)] outline-none appearance-none focus:border-[var(--primary)] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
            >
              {SPECIES.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] uppercase text-[var(--text-muted)] tracking-[1px] font-bold">👥 Ilość sztuk</label>
            <input 
              type="number" 
              required 
              min="1"
              value={insectCount} 
              onChange={e => handleChange('insectCount', e.target.value)}
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] p-[12px] text-[14px] text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-[11px] uppercase text-[var(--text-muted)] tracking-[1px] mb-2 font-bold">↔️ Wymiary zewnętrzne (cm)</label>
          <div className="flex gap-[12px]">
            <input type="number" required placeholder="Szer." value={width} onChange={e => handleChange('width', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] p-[12px] text-center text-[14px] text-[var(--text-main)] outline-none focus:border-[var(--primary)] shadow-[0_2px_10px_rgba(0,0,0,0.02)]" />
            <input type="number" required placeholder="Głęb." value={depth} onChange={e => handleChange('depth', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] p-[12px] text-center text-[14px] text-[var(--text-main)] outline-none focus:border-[var(--primary)] shadow-[0_2px_10px_rgba(0,0,0,0.02)]" />
            <input type="number" required placeholder="Wys." value={height} onChange={e => handleChange('height', e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] p-[12px] text-center text-[14px] text-[var(--text-main)] outline-none focus:border-[var(--primary)] shadow-[0_2px_10px_rgba(0,0,0,0.02)]" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--bg-page)] rounded-xl border border-[var(--border)]">
            <div>
              <p className="text-[13px] font-bold text-[var(--text-main)]">Zbiornik Bio-Active</p>
              <p className="text-[11px] text-[var(--text-muted)]">System samoczyszczący (prosionki, skoczogonki)</p>
            </div>
            <button 
              type="button"
              onClick={() => handleChange('isBioActive', !isBioActive)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isBioActive ? 'bg-[var(--primary)]' : 'bg-[var(--bg-muted)]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isBioActive ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] uppercase text-[var(--text-muted)] tracking-[1px] font-bold">📜 Dziennik / Notatki</label>
            <textarea 
              value={notes} 
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Zapisz historię hodowli, wylinki, obserwacje..."
              rows={3}
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] p-[12px] text-[14px] text-[var(--text-main)] outline-none focus:border-[var(--primary)] transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] resize-none"
            />
          </div>
        </div>

        <motion.div 
          initial={false}
          animate={{ opacity: area > 0 ? 1 : 0.5, y: area > 0 ? 0 : 5 }}
          className="mt-[30px] p-[20px] bg-[var(--bg-card)] rounded-[16px] border border-[var(--border)] shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-center gap-2 mb-3">
             <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
             <span className="text-[11px] uppercase tracking-[2px] text-[var(--text-muted)] font-bold">Weryfikacja Warunków</span>
          </div>
          <div className="flex justify-between items-end mb-4">
            <div>
               <p className="text-[24px] font-light text-[var(--text-main)]">{(area / 10000).toFixed(2)} m&sup2;</p>
               <p className="text-[11px] text-[var(--text-muted)] mt-1">Powierzchnia dna</p>
            </div>
            <div className="text-right">
               <p className="text-[18px] font-medium text-[var(--primary)]">{sprays > 0 ? `${sprays} d.` : '---'}</p>
               <p className="text-[10px] text-[var(--text-muted)] tracking-[0.5px] uppercase font-bold">Zraszanie</p>
            </div>
          </div>

          {selectedSpecies && h > 0 && (
            <div className={`p-3 rounded-xl border ${h < (selectedSpecies.maxSizeCm * 2.5) ? 'bg-[var(--warning-bg)] border-[var(--warning-border)] text-[var(--warning-text)]' : 'bg-[var(--primary)]/5 border-[var(--primary)]/20 text-[var(--primary)]'}`}>
              <div className="flex gap-2 items-start text-[12px]">
                <Info size={14} className="shrink-0 mt-0.5" />
                <p>
                  {h < (selectedSpecies.maxSizeCm * 2.5) 
                    ? `⚠️ Wysokość (${h}cm) może być za mała. ${selectedSpecies.name} potrzebuje min. ${(selectedSpecies.maxSizeCm * 2.5).toFixed(0)}cm do bezpiecznej wylinki.`
                    : `✅ Wysokość jest odpowiednia dla ${selectedSpecies.name}.`}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <button type="submit" className="w-full p-[18px] bg-[var(--primary)] text-white border-none rounded-[16px] mt-6 font-bold text-[15px] cursor-pointer hover:bg-[var(--primary)]/90 transition-all flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(var(--primary-rgb),0.2)] active:scale-[0.98]">
          <Save size={20} /> {isEditing ? 'Zatwierdź zmiany' : 'Dodaj terrarium'}
        </button>
      </form>

      <AnimatePresence>
        {isAdjusting && adjustingImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[var(--bg-overlay)] flex flex-col items-center justify-center p-6 backdrop-blur-md"
          >
            <div className="w-full max-w-sm flex flex-col items-center">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mb-8" />
              <h3 className="text-white text-[20px] font-bold mb-2">Kadrowanie</h3>
              <p className="text-white/50 text-[12px] mb-10 text-center px-6">Ustaw owada w ramce, przesuwając zdjęcie i zmieniając zoom.</p>
              
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
                    className="max-w-none w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                </motion.div>
                <div className="absolute inset-0 border-[2px] border-[var(--primary)] rounded-2xl pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.6)]" />
              </div>

              <div className="w-[300px] mt-12 space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-white/40 text-[10px] uppercase font-bold tracking-[2px] px-1">
                    <span>Zoom</span>
                    <span className="text-white">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="4" 
                    step="0.01" 
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[var(--primary)]"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => { setIsAdjusting(false); setAdjustingImage(null); }}
                    className="flex-1 py-4 text-white/60 font-bold text-[13px] border border-white/10 rounded-2xl active:bg-white/5 transition-all"
                  >
                    Anuluj
                  </button>
                  <button 
                    onClick={handleConfirmAdjustment}
                    className="flex-1 py-4 bg-[var(--primary)] text-white font-bold text-[13px] rounded-2xl shadow-lg active:scale-95 transition-all"
                  >
                    Zatwierdź kadr
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
