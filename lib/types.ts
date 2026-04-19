export type HumidityLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface InsectSpecies {
  id: string;
  name: string;
  scientificName: string;
  humidity: HumidityLevel;
  cleaningIntervalDays: number;
  sprayFrequencyDays: number;
  foodIntervalDays: number; // New: how often to change leaves/food
  temperature: string;
  description: string;
  tips: string[];
  maxSizeCm: number;
}

export const SPECIES: InsectSpecies[] = [
  { 
    id: 'patyczak_rogaty', 
    name: 'Patyczak rogaty', 
    scientificName: 'Medauroidea extradentata',
    humidity: 'Low', 
    cleaningIntervalDays: 21, 
    sprayFrequencyDays: 3,
    foodIntervalDays: 7,
    temperature: '20-24°C',
    description: 'Jeden z najpopularniejszych patyczaków. Łatwy w hodowli, idealny dla początkujących.',
    tips: ['Lubi jeść liście malin i jeżyn', 'Nie wymaga mocnego zraszania', 'Uważaj na linienie - potrzebuje miejsca'],
    maxSizeCm: 10
  },
  { 
    id: 'straszyk_australijski', 
    name: 'Straszyk australijski', 
    scientificName: 'Extatosoma tiaratum',
    humidity: 'Medium', 
    cleaningIntervalDays: 14, 
    sprayFrequencyDays: 2,
    foodIntervalDays: 5,
    temperature: '22-26°C',
    description: 'Niezwykły wygląd przypominający wysuszone liście. Samice są masywne i kolczaste.',
    tips: ['Wymaga dobrej wentylacji', 'Lubi liście eukaliptusa, dębu i maliny', 'Samce potrafią latać!'],
    maxSizeCm: 12
  },
  { 
    id: 'straszyk_nowogwinejski', 
    name: 'Straszyk nowogwinejski', 
    scientificName: 'Eurycantha calcarata',
    humidity: 'High', 
    cleaningIntervalDays: 14, 
    sprayFrequencyDays: 1,
    foodIntervalDays: 5,
    temperature: '24-28°C',
    description: 'Duży i ciężki straszyk prowadzący naziemny tryb życia.',
    tips: ['Potrzebuje kryjówek na dnie', 'Uważaj na samce - mają kolce na nogach!', 'Wymaga stale wilgotnego podłoża'],
    maxSizeCm: 15
  },
  { 
    id: 'lisciec', 
    name: 'Liściec jesienny', 
    scientificName: 'Phyllium philippinicum',
    humidity: 'Very High', 
    cleaningIntervalDays: 7, 
    sprayFrequencyDays: 1,
    foodIntervalDays: 4,
    temperature: '24-28°C',
    description: 'Mistrz kamuflażu. Wygląda jak żywy zielony liść.',
    tips: ['Bardzo wrażliwy na niską wilgotność', 'Wymaga przewiewnego terrarium', 'Najlepiej karmić liśćmi dębu lub jeżyny'],
    maxSizeCm: 8
  },
  { 
    id: 'modliszka', 
    name: 'Modliszka gwinejska', 
    scientificName: 'Sphodromantis lineola',
    humidity: 'Medium', 
    cleaningIntervalDays: 21, 
    sprayFrequencyDays: 2,
    foodIntervalDays: 3,
    temperature: '24-28°C',
    description: 'Wojowniczy owad drapieżny. Bardzo aktywny podczas polowania.',
    tips: ['Karm owadami karmowymi', 'Pamiętaj o nawodnieniu (pije krople z liści)', 'Nie trzymaj dwóch osobników razem!'],
    maxSizeCm: 8
  },
];

export interface Terrarium {
  id: string;
  name: string;
  width: number;
  depth: number;
  height: number;
  speciesId: string;
  insectCount: number; // New
  lastSprayed?: string; // ISO date
  lastCleaned?: string; // ISO date
  lastFed?: string; // ISO date: Leaf change
  notes?: string;
  imageUrl?: string;
  isBioActive?: boolean;
}

export interface AtlasEntry {
  id: string;
  name: string;
  description: string;
  date: string;
  imageUrl?: string;
  location?: string;
}

export function calculateArea(width: number, depth: number) {
  return width * depth;
}

export function calculateVolume(width: number, depth: number, height: number) {
  return (width * depth * height) / 1000;
}

export function calculateSprays(area: number, humidity: HumidityLevel): number {
  let baseSprays = 1;
  if (area >= 400 && area < 900) baseSprays = 2;
  else if (area >= 900 && area < 1600) baseSprays = 3;
  else if (area >= 1600 && area < 2500) baseSprays = 4;
  else if (area >= 2500) baseSprays = 5;

  switch (humidity) {
    case 'Low': return baseSprays;
    case 'Medium': return Math.ceil(baseSprays * 1.5);
    case 'High': return baseSprays * 2;
    case 'Very High': return baseSprays * 3;
    default: return baseSprays;
  }
}

export function getNextActionTime(lastAction?: string, intervalDays?: number): { date: Date, hoursLeft: number, isOverdue: boolean } {
  if (!lastAction) {
    return { date: new Date(), hoursLeft: 0, isOverdue: true };
  }
  
  const last = new Date(lastAction);
  const next = new Date(last.getTime() + (intervalDays || 0) * 24 * 60 * 60 * 1000);
  const now = new Date();
  
  const diffMs = next.getTime() - now.getTime();
  const hoursLeft = Math.ceil(diffMs / (1000 * 60 * 60));
  
  return {
    date: next,
    hoursLeft: Math.max(0, hoursLeft),
    isOverdue: diffMs < 0
  };
}
