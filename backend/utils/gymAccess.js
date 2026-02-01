const Gym = require('../models/Gym');
const GymAccess = require('../models/GymAccess');

const resolveGymAccess = async ({ gymId, user }) => {
  const gym = await Gym.findById(gymId);
  if (!gym) {
    return { gym: null, canRead: false, canWrite: false, accessLevel: null, isOwner: false };
  }

  if (!user || !user.id) {
    return { gym, canRead: true, canWrite: true, accessLevel: 'public', isOwner: false };
  }

  if (user?.role === 'admin') {
    return { gym, canRead: true, canWrite: true, accessLevel: 'admin', isOwner: false };
  }

  if (gym.user_id === user.id) {
    return { gym, canRead: true, canWrite: true, accessLevel: 'owner', isOwner: true };
  }

  const access = await GymAccess.findByGymAndUser(gymId, user.id);
  if (!access) {
    return { gym, canRead: false, canWrite: false, accessLevel: null, isOwner: false };
  }

  const canWrite = access.access_level === 'write';
  return { gym, canRead: true, canWrite, accessLevel: access.access_level, isOwner: false };
};

module.exports = { resolveGymAccess };
