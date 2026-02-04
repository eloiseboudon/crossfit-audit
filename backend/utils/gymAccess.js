const Gym = require('../models/Gym');
const GymAccess = require('../models/GymAccess');
const { ACCESS_LEVELS, ROLES } = require('../constants');

/**
 * Résout les permissions d'accès à une salle selon l'utilisateur.
 *
 * Logique:
 * - Si la salle n'existe pas, aucun accès.
 * - Si l'utilisateur n'est pas authentifié, accès complet (mode demo/public).
 * - Les admins ont tous les droits.
 * - Le propriétaire (gym.user_id) a lecture/écriture.
 * - Sinon, on cherche un accès explicite (read/write) dans gym_user_access.
 *
 * @async
 * @param {object} params - Paramètres d'accès.
 * @param {string} params.gymId - Identifiant de la salle.
 * @param {{ id?: string, role?: string } | null} params.user - Utilisateur courant.
 * @returns {Promise<{gym: object | null, canRead: boolean, canWrite: boolean, accessLevel: string | null, isOwner: boolean}>}
 * Résultat d'accès avec niveau de permission.
 * @throws {Error} Si les requêtes DB échouent.
 *
 * @example
 * const access = await resolveGymAccess({ gymId: 'gym-123', user: { id: 'user-1' } });
 * if (access.canWrite) {
 *   // L'utilisateur peut modifier la salle.
 * }
 */
const resolveGymAccess = async ({ gymId, user }) => {
  const gym = await Gym.findById(gymId);
  if (!gym) {
    return { gym: null, canRead: false, canWrite: false, accessLevel: null, isOwner: false };
  }

  if (!user || !user.id) {
    return { gym, canRead: true, canWrite: true, accessLevel: 'public', isOwner: false };
  }

  if (user?.role === ROLES.ADMIN) {
    return { gym, canRead: true, canWrite: true, accessLevel: ROLES.ADMIN, isOwner: false };
  }

  if (gym.user_id === user.id) {
    return { gym, canRead: true, canWrite: true, accessLevel: ACCESS_LEVELS.OWNER, isOwner: true };
  }

  const access = await GymAccess.findByGymAndUser(gymId, user.id);
  if (!access) {
    return { gym, canRead: false, canWrite: false, accessLevel: null, isOwner: false };
  }

  const canWrite = access.access_level === ACCESS_LEVELS.WRITE;
  return { gym, canRead: true, canWrite, accessLevel: access.access_level, isOwner: false };
};

module.exports = { resolveGymAccess };
