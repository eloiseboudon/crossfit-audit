/**
 * @module jest.config
 * @description Configuration Jest pour les tests unitaires du backend.
 * Cible les fichiers de test dans __tests__/ et mesure la couverture
 * sur les models, controllers, middleware et utils.
 */
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'models/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js'
  ],
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js']
};
