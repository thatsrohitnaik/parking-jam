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