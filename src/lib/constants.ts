export const AUDIT_STATUS_LABELS = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  completed: 'Terminé',
} as const;

export const COLORS = {
  primary: '#48737F',
  secondary: '#DAD7CD',
  accent: '#CCBB90',
} as const;


export const AUDIT_STATUS_COLORS: Record<string, string> = { ... };
export const PRIORITY_LABELS: Record<string, string> = { ... };
export const PRIORITY_COLORS: Record<string, string> = { ... };
export const EFFORT_LABELS: Record<string, string> = { ... };
export const CONFIDENCE_LABELS: Record<string, string> = { ... };
export const API_BASE_URL: string = ...;

