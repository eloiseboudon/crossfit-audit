/**
 * @module utils/asyncHandler
 * @description Wrapper pour les handlers Express asynchrones.
 * Capture automatiquement les erreurs et les transmet au middleware d'erreurs.
 */

/**
 * Enveloppe un handler Express async pour capturer les rejets de promesse.
 *
 * @param {Function} fn - Handler async (req, res, next) => Promise<void>.
 * @returns {Function} Handler Express classique qui transmet les erreurs via next().
 *
 * @example
 * const getItems = asyncHandler(async (req, res) => {
 *   const items = await Model.findAll();
 *   res.json({ success: true, data: items });
 * });
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
