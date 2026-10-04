export interface Wallpaper {
  id: string;
  name: string;
  gradient: string;
  thumbnail: string;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: 'cyber-nebula',
    name: 'Cyber Nebula (Dark)',
    gradient: 'from-[#0b0c16] via-[#120e24] to-[#1c0826]',
    thumbnail: 'bg-gradient-to-br from-[#0b0c16] via-[#120e24] to-[#1c0826]'
  },
  {
    id: 'crimson-cinema',
    name: 'Z1 Crimson Glow',
    gradient: 'from-[#08080c] via-[#22070a] to-[#140204]',
    thumbnail: 'bg-gradient-to-br from-[#08080c] via-[#22070a] to-[#140204]'
  },
  {
    id: 'deep-ocean',
    name: 'Midnight Azure',
    gradient: 'from-[#030d1c] via-[#091f38] to-[#04101e]',
    thumbnail: 'bg-gradient-to-br from-[#030d1c] via-[#091f38] to-[#04101e]'
  },
  {
    id: 'emerald-aurora',
    name: 'Emerald Aurora',
    gradient: 'from-[#051410] via-[#0a2820] to-[#030d0a]',
    thumbnail: 'bg-gradient-to-br from-[#051410] via-[#0a2820] to-[#030d0a]'
  }
];
