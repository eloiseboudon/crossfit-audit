const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

const AUDIT_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

const ACCESS_LEVELS = {
  READ: 'read',
  WRITE: 'write',
  OWNER: 'owner'
};

module.exports = {
  ROLES,
  AUDIT_STATUS,
  ACCESS_LEVELS
};

const RECOMMENDATION_PRIORITY = { HIGH: 'P1', MEDIUM: 'P2', LOW: 'P3' };
const EFFORT_LEVEL = { SMALL: 'S', MEDIUM: 'M', LARGE: 'L' };
const CONFIDENCE_LEVEL = { LOW: 'faible', MEDIUM: 'moyen', HIGH: 'fort' };
const CURRENCY = { EUR: 'EUR', USD: 'USD' };
const PRICE_LEVEL = { BUDGET: 'budget', STANDARD: 'standard', PREMIUM: 'premium', LUXURY: 'luxe' };
const OFFER_TYPE = { SUBSCRIPTION: 'abonnement', CARD: 'carte', PACK: 'pack' };
