/**
 * Classe d'erreur standardisée pour l'API.
 * Encapsule un code HTTP, un message et des détails optionnels.
 * Fournit des méthodes statiques pour les codes d'erreur courants.
 *
 * @extends Error
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - Code HTTP de l'erreur (400, 401, 403, 404, etc.).
   * @param {string} message - Message d'erreur lisible.
   * @param {*} [details=null] - Détails supplémentaires (erreurs de validation, etc.).
   */
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }

  /**
   * Crée une erreur 400 Bad Request.
   *
   * @param {string} message - Message d'erreur.
   * @param {*} [details] - Détails de validation.
   * @returns {ApiError} Instance d'erreur 400.
   */
  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  /**
   * Crée une erreur 401 Unauthorized.
   *
   * @param {string} [message='Non autorisé'] - Message d'erreur.
   * @returns {ApiError} Instance d'erreur 401.
   */
  static unauthorized(message = 'Non autorisé') {
    return new ApiError(401, message);
  }

  /**
   * Crée une erreur 403 Forbidden.
   *
   * @param {string} [message='Accès interdit'] - Message d'erreur.
   * @returns {ApiError} Instance d'erreur 403.
   */
  static forbidden(message = 'Accès interdit') {
    return new ApiError(403, message);
  }

  /**
   * Crée une erreur 404 Not Found.
   *
   * @param {string} [message='Ressource non trouvée'] - Message d'erreur.
   * @returns {ApiError} Instance d'erreur 404.
   */
  static notFound(message = 'Ressource non trouvée') {
    return new ApiError(404, message);
  }

  /**
   * Crée une erreur 409 Conflict.
   *
   * @param {string} [message='Conflit'] - Message d'erreur.
   * @returns {ApiError} Instance d'erreur 409.
   */
  static conflict(message = 'Conflit') {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;
