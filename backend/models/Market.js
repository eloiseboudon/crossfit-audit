const { dbAll, dbGet, dbRun } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// ============================================
// Competitor Model
// ============================================
class Competitor {
  static async findByGymId(gymId) {
    const sql = `
      SELECT c.*, mz.name as zone_name
      FROM competitors c
      LEFT JOIN market_zones mz ON c.market_zone_id = mz.id
      WHERE c.gym_id = ? AND c.is_active = 1
      ORDER BY c.distance_km ASC
    `;
    return await dbAll(sql, [gymId]);
  }

  static async findById(id) {
    const sql = `
      SELECT c.*, mz.name as zone_name
      FROM competitors c
      LEFT JOIN market_zones mz ON c.market_zone_id = mz.id
      WHERE c.id = ?
    `;
    return await dbGet(sql, [id]);
  }

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
    
    await dbRun(sql, [
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

  static async update(id, competitorData) {
    const fields = Object.keys(competitorData);
    const values = Object.values(competitorData);
    const now = new Date().toISOString();
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE competitors SET ${setClause}, updated_at = ?, last_updated = ? WHERE id = ?`;
    
    await dbRun(sql, [...values, now, now, id]);
    return await this.findById(id);
  }

  static async delete(id) {
    const sql = `UPDATE competitors SET is_active = 0 WHERE id = ?`;
    await dbRun(sql, [id]);
    return true;
  }
}

// ============================================
// MarketZone Model
// ============================================
class MarketZone {
  static async findAll() {
    const sql = `SELECT * FROM market_zones WHERE is_active = 1 ORDER BY price_level`;
    return await dbAll(sql);
  }

  static async findById(id) {
    const sql = `SELECT * FROM market_zones WHERE id = ?`;
    return await dbGet(sql, [id]);
  }

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
    
    await dbRun(sql, [
      id, name, description, price_level, avg_subscription_min, avg_subscription_max,
      geographic_scope, population_density, avg_household_income_range,
      now, now
    ]);
    
    return await this.findById(id);
  }

  static async update(id, zoneData) {
    const fields = Object.keys(zoneData);
    const values = Object.values(zoneData);
    const now = new Date().toISOString();
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE market_zones SET ${setClause}, updated_at = ? WHERE id = ?`;
    
    await dbRun(sql, [...values, now, id]);
    return await this.findById(id);
  }

  static async delete(id) {
    const sql = `UPDATE market_zones SET is_active = 0 WHERE id = ?`;
    await dbRun(sql, [id]);
    return true;
  }
}

// ============================================
// GymOffer Model
// ============================================
class GymOffer {
  static async findByGymId(gymId, includeInactive = false) {
    const sql = `
      SELECT * FROM gym_offers 
      WHERE gym_id = ? ${includeInactive ? '' : 'AND is_active = 1'}
      ORDER BY is_featured DESC, sort_order ASC, price ASC
    `;
    return await dbAll(sql, [gymId]);
  }

  static async findByAuditId(auditId, includeInactive = false) {
    const sql = `
      SELECT * FROM gym_offers 
      WHERE audit_id = ? ${includeInactive ? '' : 'AND is_active = 1'}
      ORDER BY is_featured DESC, sort_order ASC, price ASC
    `;
    return await dbAll(sql, [auditId]);
  }

  static async findById(id) {
    const sql = `SELECT * FROM gym_offers WHERE id = ?`;
    return await dbGet(sql, [id]);
  }

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
    
    await dbRun(sql, [
      id, gym_id, audit_id, offer_type, offer_name, offer_description,
      price, currency, session_count, duration_months, commitment_months,
      target_audience, restrictions, included_services,
      is_featured || 0, sort_order || 0,
      active_subscriptions_count || 0, monthly_revenue,
      now, now
    ]);
    
    return await this.findById(id);
  }

  static async update(id, offerData) {
    const fields = Object.keys(offerData);
    const values = Object.values(offerData);
    const now = new Date().toISOString();
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE gym_offers SET ${setClause}, updated_at = ? WHERE id = ?`;
    
    await dbRun(sql, [...values, now, id]);
    return await this.findById(id);
  }

  static async delete(id) {
    const sql = `UPDATE gym_offers SET is_active = 0 WHERE id = ?`;
    await dbRun(sql, [id]);
    return true;
  }
}

module.exports = { Competitor, MarketZone, GymOffer };
