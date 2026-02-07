export const COLOR_HEX = {
  primary: '#48737F',
  primaryDark: '#3A5C66',
  primaryDarker: '#3A5D67',
  secondary: '#CCBB90',
  secondaryDark: '#B8A780',
  neutral: '#DAD7CD',
  accent: '#E89F5C',
  success: '#7FA99B',
  successDark: '#6A9084',
  danger: '#D85858',
  warning: '#B45309',
  chartTrack: '#E8E2D5',
  chartStart: '#4F7A7E',
  chartEnd: '#8FB339'
} as const;

export const COLOR_CLASSES = {
  textPrimary: 'text-[#48737F]',
  textPrimary50: 'text-[#48737F]/50',
  textPrimary60: 'text-[#48737F]/60',
  textPrimary70: 'text-[#48737F]/70',
  textPrimary80: 'text-[#48737F]/80',
  bgPrimary: 'bg-[#48737F]',
  bgPrimary5: 'bg-[#48737F]/5',
  bgPrimary10: 'bg-[#48737F]/10',
  bgPrimary20: 'bg-[#48737F]/20',
  bgPrimary50: 'bg-[#48737F]/50',
  borderPrimary: 'border-[#48737F]',
  borderTopPrimary: 'border-t-[#48737F]',
  borderPrimary20: 'border-[#48737F]/20',
  borderPrimary30: 'border-[#48737F]/30',
  borderPrimary50: 'border-[#48737F]/50',
  hoverBgPrimary10: 'hover:bg-[#48737F]/10',
  hoverBgPrimary20: 'hover:bg-[#48737F]/20',
  hoverBorderPrimary: 'hover:border-[#48737F]',
  focusRingPrimary: 'focus:ring-[#48737F]',
  focusBorderPrimary: 'focus:border-[#48737F]',
  bgPrimaryDark: 'bg-[#3A5C66]',
  hoverBgPrimaryDark: 'hover:bg-[#3A5C66]',
  hoverBgPrimaryDarker: 'hover:bg-[#3A5D67]',
  textSecondary: 'text-[#CCBB90]',
  textSecondary80: 'text-[#CCBB90]/80',
  bgSecondary: 'bg-[#CCBB90]',
  bgSecondary10: 'bg-[#CCBB90]/10',
  bgSecondary20: 'bg-[#CCBB90]/20',
  borderSecondary: 'border-[#CCBB90]',
  borderSecondary30: 'border-[#CCBB90]/30',
  hoverBgSecondaryDark: 'hover:bg-[#B8A780]',
  bgSecondaryDark: 'bg-[#B8A780]',
  focusRingSecondary: 'focus:ring-[#CCBB90]',
  placeholderSecondary: 'placeholder-[#CCBB90]',
  textNeutral: 'text-[#DAD7CD]',
  bgNeutral: 'bg-[#DAD7CD]',
  bgNeutral30: 'bg-[#DAD7CD]/30',
  bgNeutral50: 'bg-[#DAD7CD]/50',
  hoverBgNeutral: 'hover:bg-[#DAD7CD]',
  hoverBgNeutral50: 'hover:bg-[#DAD7CD]/50',
  borderNeutral: 'border-[#DAD7CD]',
  borderNeutral70: 'border-[#DAD7CD]/70',
  bgAccent: 'bg-[#E89F5C]',
  bgAccent10: 'bg-[#E89F5C]/10',
  bgAccent20: 'bg-[#E89F5C]/20',
  textAccent: 'text-[#E89F5C]',
  borderAccent: 'border-[#E89F5C]',
  borderAccent30: 'border-[#E89F5C]/30',
  bgSuccess: 'bg-[#7FA99B]',
  bgSuccess10: 'bg-[#7FA99B]/10',
  bgSuccess20: 'bg-[#7FA99B]/20',
  textSuccess: 'text-[#7FA99B]',
  borderSuccess: 'border-[#7FA99B]',
  borderSuccess30: 'border-[#7FA99B]/30',
  hoverBgSuccess20: 'hover:bg-[#7FA99B]/20',
  hoverBgSuccessDark: 'hover:bg-[#6A9084]',
  bgSuccessDark: 'bg-[#6A9084]',
  bgDanger10: 'bg-[#D85858]/10',
  textDanger: 'text-[#D85858]',
  bgDataTable: 'bg-[#4F7A7E]',
  bgDataTable10: 'bg-[#4F7A7E]/10',
  bgDataTable5: 'bg-[#4F7A7E]/5',
  borderDataTable: 'border-[#4F7A7E]',
  borderDataTable20: 'border-[#4F7A7E]/20',
  borderDataTable30: 'border-[#4F7A7E]/30',
  hoverBgDataTable10: 'hover:bg-[#4F7A7E]/10',
  hoverBgDataTable5: 'hover:bg-[#4F7A7E]/5',
  hoverBorderDataTable30: 'hover:border-[#4F7A7E]/30',
  textWarning: 'text-[#B45309]'
} as const;

export const AUDIT_STATUS_LABELS = {
  brouillon: 'Brouillon',
  en_cours: 'En cours',
  finalise: 'Finalisé',
  archive: 'Archivé'
} as const;

export const AUDIT_STATUS_BADGE_CLASSES = {
  brouillon: `${COLOR_CLASSES.bgSecondary10} ${COLOR_CLASSES.textSecondary} ${COLOR_CLASSES.borderSecondary30}`,
  en_cours: `${COLOR_CLASSES.bgAccent10} ${COLOR_CLASSES.textAccent} ${COLOR_CLASSES.borderAccent30}`,
  finalise: `${COLOR_CLASSES.bgSuccess10} ${COLOR_CLASSES.textSuccess} ${COLOR_CLASSES.borderSuccess30}`,
  archive: 'bg-gray-400/10 text-gray-500 border-gray-400/30'
} as const;

export const AUDIT_STATUS_COLORS: Record<string, string> = {
  brouillon: COLOR_HEX.secondary,
  en_cours: COLOR_HEX.accent,
  finalise: COLOR_HEX.success,
  archive: '#A8A8A8'
};

export const PRIORITY_CLASSNAMES: Record<string, string> = {
  P1: 'bg-tulip-red/10 text-tulip-red',
  P2: 'bg-orange-100 text-orange-700',
  P3: 'bg-tulip-blue/10 text-tulip-blue'
};

export const RECOMMENDATION_PRIORITY = {
  HIGH: 'P1',
  MEDIUM: 'P2',
  LOW: 'P3'
} as const;

export const PRIORITY_LABELS: Record<string, string> = {
  [RECOMMENDATION_PRIORITY.HIGH]: 'Priorité 1',
  [RECOMMENDATION_PRIORITY.MEDIUM]: 'Priorité 2',
  [RECOMMENDATION_PRIORITY.LOW]: 'Priorité 3'
};

export const PRIORITY_COLORS: Record<string, string> = {
  P1: COLOR_HEX.danger,
  P2: COLOR_HEX.accent,
  P3: COLOR_HEX.primary
};

export const EFFORT_LEVELS = {
  EASY: 'facile',
  MEDIUM: 'moyen',
  HARD: 'difficile'
} as const;

export const EFFORT_ICONS: Record<string, string> = {
  [EFFORT_LEVELS.EASY]: '🟢',
  [EFFORT_LEVELS.MEDIUM]: '🟡',
  [EFFORT_LEVELS.HARD]: '🔴'
};

export const EFFORT_LABELS: Record<string, string> = {
  [EFFORT_LEVELS.EASY]: 'Facile',
  [EFFORT_LEVELS.MEDIUM]: 'Moyen',
  [EFFORT_LEVELS.HARD]: 'Difficile'
};

export const CONFIDENCE_LEVELS = {
  LOW: 'faible',
  MEDIUM: 'moyen',
  HIGH: 'fort'
} as const;

export const CONFIDENCE_LABELS: Record<string, string> = {
  [CONFIDENCE_LEVELS.LOW]: 'Faible',
  [CONFIDENCE_LEVELS.MEDIUM]: 'Moyen',
  [CONFIDENCE_LEVELS.HIGH]: 'Fort'
};

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';
