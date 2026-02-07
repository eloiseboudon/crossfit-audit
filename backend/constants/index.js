/**
 * @module constants
 * @description Constantes et énumérations partagées de l'application CrossFit Audit.
 */

/** @enum {string} Rôles utilisateur */
const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

/** @enum {string} Statuts d'un audit */
const AUDIT_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

/** @enum {string} Niveaux d'accès aux salles */
const ACCESS_LEVELS = {
  READ: 'read',
  WRITE: 'write',
  OWNER: 'owner',
  PUBLIC: 'public'
};

/** @enum {string} Priorités des recommandations (P1=haute, P3=basse) */
const RECOMMENDATION_PRIORITY = {
  HIGH: 'P1',
  MEDIUM: 'P2',
  LOW: 'P3'
};

/** @enum {string} Niveaux d'effort pour les recommandations */
const EFFORT_LEVEL = {
  EASY: 'facile',
  MEDIUM: 'moyen',
  HARD: 'difficile'
};

/** @enum {string} Niveaux de confiance des recommandations */
const CONFIDENCE_LEVEL = {
  LOW: 'faible',
  MEDIUM: 'moyen',
  HIGH: 'fort'
};

/** @enum {string} Devises supportées */
const CURRENCY = {
  EUR: 'EUR',
  USD: 'USD'
};

/** @enum {string} Niveaux de prix des zones de marché */
const PRICE_LEVEL = {
  BUDGET: 'budget',
  STANDARD: 'standard',
  PREMIUM: 'premium',
  LUXURY: 'luxe'
};

/** @enum {string} Types d'offres commerciales */
const OFFER_TYPE = {
  SUBSCRIPTION: 'abonnement',
  CARD: 'carte',
  PACK: 'pack'
};

module.exports = {
  ROLES,
  AUDIT_STATUS,
  ACCESS_LEVELS,
  RECOMMENDATION_PRIORITY,
  EFFORT_LEVEL,
  CONFIDENCE_LEVEL,
  CURRENCY,
  PRICE_LEVEL,
  OFFER_TYPE
};
