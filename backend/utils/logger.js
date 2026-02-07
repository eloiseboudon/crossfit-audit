/**
 * @module utils/logger
 * @description Logger applicatif qui supprime les sorties en environnement de test.
 */

/**
 * Vérifie si l'application tourne en environnement de test.
 *
 * @returns {boolean} True si NODE_ENV === 'test' ou si Jest est actif.
 */
const isTestEnv = () => process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

/**
 * Affiche un message d'information (console.log) sauf en environnement de test.
 *
 * @param {...*} args - Arguments à logger.
 */
const info = (...args) => {
  if (!isTestEnv()) {
    console.log(...args);
  }
};

/**
 * Affiche un message d'erreur (console.error) sauf en environnement de test.
 *
 * @param {...*} args - Arguments à logger.
 */
const error = (...args) => {
  if (!isTestEnv()) {
    console.error(...args);
  }
};

module.exports = {
  info,
  error
};
