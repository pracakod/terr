import { motion } from 'motion/react';
import { Settings, Moon, Sun, Leaf, Skull, Info } from 'lucide-react';

interface OptionsProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export default function Options({ theme, setTheme }: OptionsProps) {
  const themes = [
    { id: 'light', name: 'Las (Jasny)', icon: <Leaf size={20} />, color: '#556B2F' },
    { id: 'dark', name: 'Noc (Ciemny)', icon: <Moon size={20} />, color: '#8EB057' },
    { id: 'clay', name: 'Pustynia', icon: <Sun size={20} />, color: '#A0522D' },
    { id: 'monochrome', name: 'Badacz', icon: <Settings size={20} />, color: '#1C1C1E' },
  ];

  return (
    <div className="px-6 md:px-[60px] py-10 pb-32">
      <header className="mb-10">
        <span className="text-[11px] uppercase tracking-[2px] text-[var(--text-muted)] mb-1 font-bold">Preferencje</span>
        <h1 className="text-[32px] font-bold tracking-tight text-[var(--text-main)]">Opcje App</h1>
      </header>

      <section className="mb-10">
        <h3 className="text-[11px] uppercase tracking-[1px] text-[var(--text-muted)] mb-4 font-bold flex items-center gap-2">
          🎨 Wybór Motywu
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
                theme === t.id 
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-sm' 
                  : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--primary)]/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: t.color }}
                >
                  {t.icon}
                </div>
                <div className="text-left">
                  <p className={`text-[15px] font-bold ${theme === t.id ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'}`}>
                    {t.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                    {t.id === 'light' ? 'Standardowy' : t.id}
                  </p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                theme === t.id ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]'
              }`}>
                {theme === t.id && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
