import { Terrarium, SPECIES, calculateArea, calculateSprays, getNextActionTime } from '@/lib/types';
import { Check, Info, ChevronRight, Droplets, Clock, Leaf, Edit3, HelpCircle, Activity, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Schedule({ terrariums, updateTerrarium }: { terrariums: Terrarium[], updateTerrarium: (t: Terrarium) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const handleAction = (t: Terrarium, action: 'spray' | 'clean' | 'feed') => {
    const updated = { ...t };
    if (action === 'spray') updated.lastSprayed = new Date().toISOString();
    if (action === 'clean') updated.lastCleaned = new Date().toISOString();
    if (action === 'feed') updated.lastFed = new Date().toISOString();
    updateTerrarium(updated);
  };

  const getUrgentTask = (): { t: Terrarium, task: string, type: 'overdue' | 'upcoming', hours?: number } | null => {
    if (terrariums.length === 0) return null;
    let mostUrgent: { t: Terrarium, task: string, type: 'overdue' | 'upcoming', hours?: number } | null = null;
    let minHours = Infinity;

    terrariums.forEach(t => {
      const species = SPECIES.find(s => s.id === t.speciesId);
      if (!species) return;
      const si = getNextActionTime(t.lastSprayed, species.sprayFrequencyDays);
      const fi = getNextActionTime(t.lastFed, species.foodIntervalDays);
      
      if (si.isOverdue || fi.isOverdue) {
        mostUrgent = { t, task: si.isOverdue ? 'zraszanie' : 'karmienie', type: 'overdue' };
        minHours = -1;
      } else if (si.hoursLeft < minHours) {
        minHours = si.hoursLeft;
        mostUrgent = { t, task: 'zraszanie', type: 'upcoming', hours: si.hoursLeft };
      }
    });
    return mostUrgent;
  };

  const urgent = getUrgentTask();

  return (
    <div className="px-5 md:px-[60px] py-6">
      <header className="mb-6 flex flex-col items-start px-1">
        <span className="text-[10px] uppercase tracking-[1px] text-[var(--text-muted)] mb-0.5 font-bold">Opieka</span>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--text-main)]">Grafik Zadań</h1>
      </header>

      {terrariums.length > 0 && urgent && (
        <div className="mb-6 bg-[var(--primary)] rounded-2xl p-4 text-white shadow-lg shadow-[var(--primary)]/20 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Asystent Hodowli</p>
            <p className="text-[14px] font-medium leading-snug mt-1 text-white">
              {urgent.type === 'overdue' 
                ? `⚠️ Twoi podopieczni w "${urgent.t.name}" czekają! Najwyższy czas na ${urgent.task}.`
                : `✨ Wszystko pod kontrolą. Następne ważne zadanie to ${urgent.task} w "${urgent.t.name}" za ok. ${urgent.hours}h.`}
            </p>
          </div>
        </div>
      )}

      {terrariums.length === 0 && (
        <div className="text-center p-8 text-[var(--text-muted)] bg-[var(--bg-page)] rounded-2xl border border-dashed border-[var(--border)]">
          Brak terrariów.
        </div>
      )}

      <div className="space-y-3">
        {terrariums.map(t => {
          const species = SPECIES.find(s => s.id === t.speciesId);
          if (!species) return null;

          const sprayInfo = getNextActionTime(t.lastSprayed, species.sprayFrequencyDays);
          const cleanInfo = getNextActionTime(t.lastCleaned, species.cleaningIntervalDays);
          const feedInfo = getNextActionTime(t.lastFed, species.foodIntervalDays);
          
          const area = calculateArea(t.width, t.depth);
          const sprayCount = calculateSprays(area, species.humidity);
          const isExpanded = expandedId === t.id;
          const hasOverdue = sprayInfo.isOverdue || cleanInfo.isOverdue || feedInfo.isOverdue;

          return (
            <div key={t.id} className="bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-sm border border-[var(--border)]">
              <div 
                className="p-4 cursor-pointer flex items-center justify-between active:bg-[var(--bg-page)]"
                onClick={() => setExpandedId(isExpanded ? null : t.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ring-4 ${hasOverdue ? 'bg-[var(--accent)] ring-[var(--accent)]/10' : 'bg-[var(--primary)] ring-[var(--primary)]/10'}`} />
                  <div>
                    <h3 className="text-[15px] font-bold text-[var(--text-main)] leading-tight">{t.name} <span className="text-[var(--text-muted)] font-normal text-[13px] ml-1">{t.insectCount}szt.</span></h3>
                    <p className="text-[11px] text-[var(--text-muted)]">{species.name}</p>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  {t.notes && (
                    <div className="bg-[var(--bg-page)] rounded-xl p-3 mb-3 border border-[var(--border)]">
                      <p className="text-[12px] text-[var(--text-main)] leading-snug line-clamp-3">{t.notes}</p>
                    </div>
                  )}

                  <div className="divide-y divide-[var(--border)] bg-[var(--bg-page)] rounded-xl overflow-hidden border border-[var(--border)]">
                    {/* Spray Task */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${sprayInfo.isOverdue ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--bg-card)] text-[var(--primary)]'}`}>
                            <Droplets size={14} />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[var(--text-main)]">Zraszanie</p>
                            <p className={`text-[10px] font-medium ${sprayInfo.isOverdue ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                              {sprayInfo.isOverdue ? `Natychmiast! (${sprayCount} psikn.)` : `Za ${sprayInfo.hoursLeft}h (${sprayCount} psikn.)`}
                            </p>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleAction(t, 'spray'); }} 
                          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${sprayInfo.isOverdue ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] text-[var(--primary)] border border-[var(--border)]'}`}>
                          <Check size={18} />
                        </button>
                      </div>
                      <div className="pl-11 pr-2">
                        <div className="flex gap-2 items-start text-[11px] text-[var(--text-muted)] bg-[var(--bg-card)]/50 p-2 rounded-lg border border-[var(--border)]">
                          <HelpCircle size={12} className="shrink-0 mt-0.5 text-[var(--primary)]" />
                          <p><span className="text-[var(--primary)] font-bold">Po co?</span> Wilgoć jest kluczowa do oddychania i bezproblemowej wylinki. <span className="text-[var(--primary)] font-bold">Jak?</span> Zroś ścianki terrarium {sprayCount} razy, unikaj pryskania bezpośrednio na owada.</p>
                        </div>
                      </div>
                    </div>

                    {/* Feed Task */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${feedInfo.isOverdue ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--bg-card)] text-[var(--primary)]'}`}>
                            <Leaf size={14} />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[var(--text-main)]">Wymiana liści</p>
                            <p className={`text-[10px] font-medium ${feedInfo.isOverdue ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                              {feedInfo.isOverdue ? 'Wymień teraz!' : `Za ${Math.ceil(feedInfo.hoursLeft / 24)} dni`}
                            </p>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleAction(t, 'feed'); }} 
                          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${feedInfo.isOverdue ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] text-[var(--primary)] border border-[var(--border)]'}`}>
                          <Check size={18} />
                        </button>
                      </div>
                      <div className="pl-11 pr-2">
                        <div className="flex gap-2 items-start text-[11px] text-[var(--text-muted)] bg-[var(--bg-card)]/50 p-2 rounded-lg border border-[var(--border)]">
                          <Sparkles size={12} className="shrink-0 mt-0.5 text-[var(--primary)]" />
                          <p><span className="text-[var(--primary)] font-bold">Dlaczego?</span> Stare liście tracą wodę i wartości odżywcze. <span className="text-[var(--primary)] font-bold">Rada:</span> Wstaw gałązki do małego pojemnika z wodą (zabezpiecz otwór wacikiem), aby liście dłużej były świeże.</p>
                        </div>
                      </div>
                    </div>

                    {/* Clean Task */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.isBioActive ? 'bg-[var(--primary)] text-white' : (cleanInfo.isOverdue ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--bg-card)] text-[var(--primary)]')}`}>
                            {t.isBioActive ? '✨' : <Info size={14} />}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[var(--text-main)]">Czyszczenie</p>
                            <p className={`text-[10px] font-medium ${t.isBioActive ? 'text-[var(--primary)]' : (cleanInfo.isOverdue ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')}`}>
                              {t.isBioActive ? 'System Bio-Active ✨' : (cleanInfo.isOverdue ? 'Wymagane!' : `Za ${Math.ceil(cleanInfo.hoursLeft / 24)} dni`)}
                            </p>
                          </div>
                        </div>
                        {!t.isBioActive && (
                          <button onClick={(e) => { e.stopPropagation(); handleAction(t, 'clean'); }} 
                            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${cleanInfo.isOverdue ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-card)] text-[var(--primary)] border border-[var(--border)]'}`}>
                            <Check size={18} />
                          </button>
                        )}
                      </div>
                      <div className="pl-11 pr-2">
                        <div className="flex gap-2 items-start text-[11px] text-[var(--text-muted)] bg-[var(--bg-card)]/50 p-2 rounded-lg border border-[var(--border)]">
                          <Info size={12} className="shrink-0 mt-0.5 text-[var(--primary)]" />
                          <p>{t.isBioActive ? 'W tym terrarium ekipa sprzątająca (skoczogonki/prosionki) dba o porządek. Ty tylko doglądaj!' : 'Usuń odchody i resztki liści z dna, aby zapobiec pleśni. Pleśń jest zabójcza dla owadów.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
