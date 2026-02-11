const ApiError = require('../utils/ApiError');
const { resolveGymAccess } = require('../utils/gymAccess');

/**
 * Résout l'accès à une salle et lève une erreur en cas de refus.
 *
 * @param {object} params - Paramètres d'accès.
 * @param {string} params.gymId - Identifiant de la salle.
 * @param {object | null} params.user - Utilisateur courant.
 * @param {boolean} [params.write=false] - Nécessite l'accès en écriture.
 * @returns {Promise<object>} Contexte d'accès.
 */
const getGymAccess = async ({ gymId, user, write = false }) => {
  if (!gymId) {
    throw ApiError.badRequest('L\'ID de la salle est requis');
  }

  const access = await resolveGymAccess({ gymId, user });
  if (!access.gym) {
    throw ApiError.notFound('Cette salle n\'existe pas');
  }

  if (!access.canRead) {
    throw ApiError.forbidden('Vous n\'avez pas accès à cette salle');
  }

  if (write && !access.canWrite) {
    throw ApiError.forbidden('Vous ne pouvez pas modifier cette salle');
  }

  return access;
};

/**
 * Middleware vérifiant l'accès à une salle
 * @param {Object} options
 * @param {boolean} options.write - Si true, nécessite accès en écriture
 * @param {string} options.paramKey - Clé du paramètre contenant gym_id ('id', 'gym_id')
 */
const requireGymAccess = ({ write = false, paramKey = 'id' } = {}) => {
  return async (req, res, next) => {
    try {
      const gymId = req.params?.[paramKey] ?? req.body?.[paramKey] ?? req.query?.[paramKey];
      const access = await getGymAccess({ gymId, user: req.user, write });
      req.gymAccess = access;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { requireGymAccess, getGymAccess };
