export const COLORS = {
  screen: '#0B1220',
  card: '#1E293B',
  road: '#CBD5E1',
  roadBorder: '#9CA3AF',
  wall: '#0F172A',
  exit: '#4ADE80',
  exitBorder: '#16A34A',
  redCar: '#DC2626',
  primary: '#3B82F6',
  text: '#F8FAFC',
  subtle: '#94A3B8',
};

const PALETTE = [
  '#3B82F6',
  '#F59E0B',
  '#8B5CF6',
  '#14B8A6',
  '#EC4899',
  '#F97316',
  '#10B981',
  '#6366F1',
  '#84CC16',
  '#E11D48',
];

export function carColor(id: string): string {
  if (id === '*') return COLORS.redCar;
  const code = id.charCodeAt(0) - 97;
  return PALETTE[((code % PALETTE.length) + PALETTE.length) % PALETTE.length];
}

// ---- Car themes (visual skins for the vehicle blocks) ----

export type CarThemeName = 'classic' | 'neon' | 'toy';

export interface CarTheme {
  name: CarThemeName;
  label: string;
  palette: string[];
  red: string;
  glass: string;
  wheel: string;
  accent: string;
  highlight: string;
}

export const CAR_THEMES: Record<CarThemeName, CarTheme> = {
  classic: {
    name: 'classic',
    label: 'Classic',
    palette: PALETTE,
    red: '#DC2626',
    glass: '#11233B',
    wheel: '#0B1220',
    accent: '#FBBF24',
    highlight: 'rgba(255,255,255,0.22)',
  },
  neon: {
    name: 'neon',
    label: 'Neon',
    palette: ['#FF2D95', '#00E5FF', '#B026FF', '#39FF14', '#FF8A00', '#FFE600', '#00FFC6', '#FF4D4D', '#7C4DFF', '#1DE9B6'],
    red: '#FF1E56',
    glass: '#0A0A1A',
    wheel: '#05060A',
    accent: '#22D3EE',
    highlight: 'rgba(255,255,255,0.35)',
  },
  toy: {
    name: 'toy',
    label: 'Toy',
    palette: ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F8B195', '#A0E7E5', '#FBE7C6', '#B4F8C8'],
    red: '#FF6B6B',
    glass: '#FFFFFF',
    wheel: '#5C5470',
    accent: '#FFFFFF',
    highlight: 'rgba(255,255,255,0.5)',
  },
};

export const CAR_THEME_ORDER: CarThemeName[] = ['classic', 'neon', 'toy'];

export function getCarTheme(name: CarThemeName): CarTheme {
  return CAR_THEMES[name] ?? CAR_THEMES.classic;
}

export function carBodyColor(id: string, theme: CarTheme): string {
  if (id === '*') return theme.red;
  const code = id.charCodeAt(0) - 97;
  const palette = theme.palette;
  return palette[((code % palette.length) + palette.length) % palette.length];
}