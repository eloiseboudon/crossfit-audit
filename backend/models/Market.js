const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ============================================
// Competitor Model
// ============================================
/**
 * Modèle d'accès aux concurrents d'une salle.
 */
class Competitor {
  /**
   * Liste les concurrents actifs pour une salle.
   *
   * @param {string} gymId - Identifiant de la salle.
   * @returns {Promise<object[]>} Liste des concurrents avec zone associée.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const competitors = Competitor.findByGymId('gym-123');
   */
  static async findByGymId(gymId) {
    const sql = `
      SELECT c.*, mz.name as zone_name
      FROM competitors c
      LEFT JOIN market_zones mz ON c.market_zone_id = mz.id
      WHERE c.gym_id = ? AND c.is_active = 1
      ORDER BY c.distance_km ASC
    `;
    return dbAll(sql, [gymId]);
  }

  /**
   * Récupère un concurrent par identifiant.
   *
   * @param {string} id - Identifiant du concurrent.
   * @returns {Promise<object | undefined>} Concurrent trouvé ou undefined.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const competitor = Competitor.findById('competitor-123');
   */
  static async findById(id) {
    const sql = `
      SELECT c.*, mz.name as zone_name
      FROM competitors c
      LEFT JOIN market_zones mz ON c.market_zone_id = mz.id
      WHERE c.id = ?
    `;
    return dbGet(sql, [id]);
  }

  /**
   * Crée un concurrent.
   *
   * @param {object} competitorData - Données du concurrent.
   * @returns {Promise<object>} Concurrent créé.
   * @throws {Error} Si l'insert échoue.
   *
   * @example
   * const competitor = Competitor.create({ gym_id: 'gym-123', name: 'Box X' });
   */
  static async create(competitorData) {
    const {
      gym_id, name, address, city, postal_code, latitude, longitude,
      distance_km, travel_time_minutes, market_zone_id,
      base_subscription_price, base_subscription_name,
      limited_subscription_price, limited_subscription_name,
      premium_subscription_price, premium_subscription_name,
      trial_price, offers_count, positioning, value_proposition,
      strengths, weaknesses, google_rating, google_reviews_count,
      google_maps_url, instagram_handle, instagram_followers,
      website_url, surface_m2, capacity, equipment_quality,
      has_hyrox, has_weightlifting, has_gymnastics, has_childcare,
      has_nutrition, additional_services, number_of_coaches,
      head_coach_name, data_source, notes
    } = competitorData;
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const sql = `
      INSERT INTO competitors (
        id, gym_id, name, address, city, postal_code, latitude, longitude,
        distance_km, travel_time_minutes, market_zone_id,
        base_subscription_price, base_subscription_name,
        limited_subscription_price, limited_subscription_name,
        premium_subscription_price, premium_subscription_name,
        trial_price, offers_count, positioning, value_proposition,
        strengths, weaknesses, google_rating, google_reviews_count,
        google_maps_url, instagram_handle, instagram_followers,
        website_url, surface_m2, capacity, equipment_quality,
        has_hyrox, has_weightlifting, has_gymnastics, has_childcare,
        has_nutrition, additional_services, number_of_coaches,
        head_coach_name, last_updated, data_source, notes,
        is_active, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        1, ?, ?
      )
    `;
    
    dbRun(sql, [
      id, gym_id, name, address, city, postal_code, latitude, longitude,
      distance_km, travel_time_minutes, market_zone_id,
      base_subscription_price, base_subscription_name,
      limited_subscription_price, limited_subscription_name,
      premium_subscription_price, premium_subscription_name,
      trial_price, offers_count || 0, positioning, value_proposition,
      strengths, weaknesses, google_rating, google_reviews_count || 0,
      google_maps_url, instagram_handle, instagram_followers || 0,
      website_url, surface_m2, capacity, equipment_quality,
      has_hyrox || 0, has_weightlifting || 0, has_gymnastics || 0, has_childcare || 0,
      has_nutrition || 0, additional_services, number_of_coaches,
      head_coach_name, now, data_source, notes,
      now, now
    ]);
    
    return await this.findById(id);
  }

  /**
   * Met à jour un concurrent.
   *
   * @param {string} id - Identifiant du concurrent.
   * @param {object} competitorData - Données à mettre à jour.
   * @returns {Promise<object>} Concurrent mis à jour.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * const competitor = Competitor.update('competitor-123', { city: 'Lyon' });
   */
  static async update(id, competitorData) {
    const fields = Object.keys(competitorData);
    const values = Object.values(competitorData);
    const now = new Date().toISOString();
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE competitors SET ${setClause}, updated_at = ?, last_updated = ? WHERE id = ?`;
    
    dbRun(sql, [...values, now, now, id]);
    return await this.findById(id);
  }

  /**
   * Désactive un concurrent (suppression logique).
   *
   * @param {string} id - Identifiant du concurrent.
   * @returns {Promise<boolean>} True si la suppression est effectuée.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * Competitor.delete('competitor-123');
   */
  static async delete(id) {
    const sql = `UPDATE competitors SET is_active = 0 WHERE id = ?`;
    dbRun(sql, [id]);
    return true;
  }
}

// ============================================
// MarketZone Model
// ============================================
/**
 * Modèle d'accès aux zones de marché.
 */
class MarketZone {
  /**
   * Liste les zones actives.
   *
   * @returns {Promise<object[]>} Liste des zones de marché.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const zones = MarketZone.findAll();
   */
  static async findAll() {
    const sql = `SELECT * FROM market_zones WHERE is_active = 1 ORDER BY price_level`;
    return dbAll(sql);
  }

  /**
   * Récupère une zone par identifiant.
   *
   * @param {string} id - Identifiant de la zone.
   * @returns {Promise<object | undefined>} Zone trouvée ou undefined.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const zone = MarketZone.findById('zone-123');
   */
  static async findById(id) {
    const sql = `SELECT * FROM market_zones WHERE id = ?`;
    return dbGet(sql, [id]);
  }

  /**
   * Crée une zone de marché.
   *
   * @param {object} zoneData - Données de la zone.
   * @returns {Promise<object>} Zone créée.
   * @throws {Error} Si l'insert échoue.
   *
   * @example
   * const zone = MarketZone.create({ name: 'Centre', price_level: 'premium' });
   */
  static async create(zoneData) {
    const {
      name, description, price_level, avg_subscription_min, avg_subscription_max,
      geographic_scope, population_density, avg_household_income_range
    } = zoneData;
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const sql = `
      INSERT INTO market_zones (
        id, name, description, price_level, avg_subscription_min, avg_subscription_max,
        geographic_scope, population_density, avg_household_income_range,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `;
    
    dbRun(sql, [
      id, name, description, price_level, avg_subscription_min, avg_subscription_max,
      geographic_scope, population_density, avg_household_income_range,
      now, now
    ]);
    
    return await this.findById(id);
  }

  /**
   * Met à jour une zone de marché.
   *
   * @param {string} id - Identifiant de la zone.
   * @param {object} zoneData - Données à mettre à jour.
   * @returns {Promise<object>} Zone mise à jour.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * const zone = MarketZone.update('zone-123', { description: 'Zone premium' });
   */
  static async update(id, zoneData) {
    const fields = Object.keys(zoneData);
    const values = Object.values(zoneData);
    const now = new Date().toISOString();
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE market_zones SET ${setClause}, updated_at = ? WHERE id = ?`;
    
    dbRun(sql, [...values, now, id]);
    return await this.findById(id);
  }

  /**
   * Désactive une zone de marché (suppression logique).
   *
   * @param {string} id - Identifiant de la zone.
   * @returns {Promise<boolean>} True si la suppression est effectuée.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * MarketZone.delete('zone-123');
   */
  static async delete(id) {
    const sql = `UPDATE market_zones SET is_active = 0 WHERE id = ?`;
    dbRun(sql, [id]);
    return true;
  }
}

// ============================================
// GymOffer Model
// ============================================
/**
 * Modèle d'accès aux offres commerciales d'une salle.
 */
class GymOffer {
  /**
   * Liste les offres d'une salle.
   *
   * @param {string} gymId - Identifiant de la salle.
   * @param {boolean} [includeInactive=false] - Inclure les offres inactives.
   * @returns {Promise<object[]>} Liste des offres.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const offers = GymOffer.findByGymId('gym-123', true);
   */
  static async findByGymId(gymId, includeInactive = false) {
    const sql = `
      SELECT * FROM gym_offers 
      WHERE gym_id = ? ${includeInactive ? '' : 'AND is_active = 1'}
      ORDER BY is_featured DESC, sort_order ASC, price ASC
    `;
    return dbAll(sql, [gymId]);
  }

  /**
   * Liste les offres d'un audit.
   *
   * @param {string} auditId - Identifiant de l'audit.
   * @param {boolean} [includeInactive=false] - Inclure les offres inactives.
   * @returns {Promise<object[]>} Liste des offres.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const offers = GymOffer.findByAuditId('audit-123');
   */
  static async findByAuditId(auditId, includeInactive = false) {
    const sql = `
      SELECT * FROM gym_offers 
      WHERE audit_id = ? ${includeInactive ? '' : 'AND is_active = 1'}
      ORDER BY is_featured DESC, sort_order ASC, price ASC
    `;
    return dbAll(sql, [auditId]);
  }

  /**
   * Récupère une offre par identifiant.
   *
   * @param {string} id - Identifiant de l'offre.
   * @returns {Promise<object | undefined>} Offre trouvée ou undefined.
   * @throws {Error} Si la requête SQL échoue.
   *
   * @example
   * const offer = GymOffer.findById('offer-123');
   */
  static async findById(id) {
    const sql = `SELECT * FROM gym_offers WHERE id = ?`;
    return dbGet(sql, [id]);
  }

  /**
   * Crée une offre commerciale.
   *
   * @param {object} offerData - Données de l'offre.
   * @returns {Promise<object>} Offre créée.
   * @throws {Error} Si l'insert échoue.
   *
   * @example
   * const offer = GymOffer.create({ gym_id: 'gym-123', offer_name: 'Unlimited', price: 180 });
   */
  static async create(offerData) {
    const {
      gym_id, audit_id, offer_type, offer_name, offer_description,
      price, currency, session_count, duration_months, commitment_months,
      target_audience, restrictions, included_services,
      is_featured, sort_order, active_subscriptions_count, monthly_revenue
    } = offerData;
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const sql = `
      INSERT INTO gym_offers (
        id, gym_id, audit_id, offer_type, offer_name, offer_description,
        price, currency, session_count, duration_months, commitment_months,
        target_audience, restrictions, included_services,
        is_active, is_featured, sort_order,
        active_subscriptions_count, monthly_revenue,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
    `;
    
    dbRun(sql, [
      id, gym_id, audit_id, offer_type, offer_name, offer_description,
      price, currency, session_count, duration_months, commitment_months,
      target_audience, restrictions, included_services,
      is_featured || 0, sort_order || 0,
      active_subscriptions_count || 0, monthly_revenue,
      now, now
    ]);
    
    return await this.findById(id);
  }

  /**
   * Met à jour une offre commerciale.
   *
   * @param {string} id - Identifiant de l'offre.
   * @param {object} offerData - Données à mettre à jour.
   * @returns {Promise<object>} Offre mise à jour.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * const offer = GymOffer.update('offer-123', { price: 200 });
   */
  static async update(id, offerData) {
    const fields = Object.keys(offerData);
    const values = Object.values(offerData);
    const now = new Date().toISOString();
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE gym_offers SET ${setClause}, updated_at = ? WHERE id = ?`;
    
    dbRun(sql, [...values, now, id]);
    return await this.findById(id);
  }

  /**
   * Désactive une offre commerciale (suppression logique).
   *
   * @param {string} id - Identifiant de l'offre.
   * @returns {Promise<boolean>} True si la suppression est effectuée.
   * @throws {Error} Si la mise à jour échoue.
   *
   * @example
   * GymOffer.delete('offer-123');
   */
  static async delete(id) {
    const sql = `UPDATE gym_offers SET is_active = 0 WHERE id = ?`;
    dbRun(sql, [id]);
    return true;
  }
}

module.exports = { Competitor, MarketZone, GymOffer };
