import { EFFORT_ICONS, PRIORITY_CLASSNAMES } from '../../lib/constants';

export const formatNumber = (value: number, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatCurrency = (value: number) => {
  if (value === null || value === undefined || isNaN(value)) return '0 €';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const getPriorityColor = (priority: string) => {
  return PRIORITY_CLASSNAMES[priority] || 'bg-tulip-beige text-tulip-blue/70';
};

export const getEffortIcon = (effort: string) => {
  return EFFORT_ICONS[effort] || '';
};
