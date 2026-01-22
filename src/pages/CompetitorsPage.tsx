/**
 * CompetitorsPage.tsx
 * Page de gestion des concurrents CrossFit directs
 *
 * Permet de:
 * - Visualiser tous les concurrents d'une salle
 * - Créer de nouveaux concurrents avec informations détaillées
 * - Modifier des concurrents existants
 * - Supprimer des concurrents
 *
 * Chaque concurrent contient des informations sur:
 * - Localisation et proximité
 * - Tarification (plusieurs offres)
 * - Positionnement stratégique
 * - Infrastructure et services
 * - Visibilité en ligne
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, AlertCircle, Save, X, MapPin, DollarSign, Award, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Competitor, CompetitorPositioning, EquipmentQuality, MarketZone } from '../lib/types';

interface CompetitorsPageProps {
  onBack: () => void;
  gymId: string; // ID de la salle courante
}

export default function CompetitorsPage({ onBack, gymId }: CompetitorsPageProps) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [, setMarketZones] = useState<MarketZone[]>([]); // Market zones loaded but not used in UI (can be used for advanced filtering)
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // État du formulaire (simplifié pour lisibilité)
  const [formData, setFormData] = useState({
    // Identification
    name: '',
    address: '',
    city: '',
    postal_code: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,

    // Proximité
    distance_km: undefined as number | undefined,
    travel_time_minutes: undefined as number | undefined,
    market_zone_id: undefined as string | undefined,

    // Tarification
    base_subscription_price: undefined as number | undefined,
    base_subscription_name: '',
    limited_subscription_price: undefined as number | undefined,
    limited_subscription_name: '',
    premium_subscription_price: undefined as number | undefined,
    premium_subscription_name: '',
    trial_price: undefined as number | undefined,

    // Positionnement
    positioning: 'standard' as CompetitorPositioning,
    value_proposition: '',

    // Visibilité
    google_rating: undefined as number | undefined,
    google_reviews_count: 0,
    instagram_followers: 0,
    website_url: '',

    // Infrastructure
    surface_m2: undefined as number | undefined,
    capacity: undefined as number | undefined,
    equipment_quality: 'standard' as EquipmentQuality,

    // Services
    has_hyrox: false,
    has_weightlifting: false,
    has_gymnastics: false,
    has_childcare: false,
    has_nutrition: false,

    // Coaching
    number_of_coaches: undefined as number | undefined,

    // Méta
    notes: ''
  });

  // ========================================================================
  // LIFECYCLE
  // ========================================================================

  useEffect(() => {
    loadData();
  }, [gymId]);

  // ========================================================================
  // DATA LOADING
  // ========================================================================

  /**
   * Charge tous les concurrents + zones de marché
   */
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[Competitors] Chargement des données pour gym:', gymId);

      // Charger les concurrents avec leurs zones de marché
      const { data: competitorsData, error: competitorsError } = await supabase
        .from('competitors')
        .select(`
          *,
          market_zone:market_zones(*)
        `)
        .eq('gym_id', gymId)
        .eq('is_active', true)
        .order('distance_km', { ascending: true, nullsFirst: false });

      if (competitorsError) throw competitorsError;

      // Charger les zones de marché pour le formulaire
      const { data: zonesData, error: zonesError } = await supabase
        .from('market_zones')
        .select('*')
        .eq('is_active', true)
        .order('price_level');

      if (zonesError) throw zonesError;

      setCompetitors(competitorsData || []);
      setMarketZones(zonesData || []);

      console.log(`[Competitors] ${competitorsData?.length || 0} concurrents chargés`);
    } catch (err) {
      console.error('[Competitors] Erreur de chargement:', err);
      setError('Impossible de charger les concurrents');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // CRUD OPERATIONS
  // ========================================================================

  const openForm = (competitor: Competitor | null = null) => {
    if (competitor) {
      setEditingCompetitor(competitor);
      setFormData({
        name: competitor.name,
        address: competitor.address || '',
        city: competitor.city || '',
        postal_code: competitor.postal_code || '',
        latitude: competitor.latitude,
        longitude: competitor.longitude,
        distance_km: competitor.distance_km,
        travel_time_minutes: competitor.travel_time_minutes,
        market_zone_id: competitor.market_zone_id,
        base_subscription_price: competitor.base_subscription_price,
        base_subscription_name: competitor.base_subscription_name || '',
        limited_subscription_price: competitor.limited_subscription_price,
        limited_subscription_name: competitor.limited_subscription_name || '',
        premium_subscription_price: competitor.premium_subscription_price,
        premium_subscription_name: competitor.premium_subscription_name || '',
        trial_price: competitor.trial_price,
        positioning: competitor.positioning || 'standard',
        value_proposition: competitor.value_proposition || '',
        google_rating: competitor.google_rating,
        google_reviews_count: competitor.google_reviews_count,
        instagram_followers: competitor.instagram_followers,
        website_url: competitor.website_url || '',
        surface_m2: competitor.surface_m2,
        capacity: competitor.capacity,
        equipment_quality: competitor.equipment_quality || 'standard',
        has_hyrox: competitor.has_hyrox,
        has_weightlifting: competitor.has_weightlifting,
        has_gymnastics: competitor.has_gymnastics,
        has_childcare: competitor.has_childcare,
        has_nutrition: competitor.has_nutrition,
        number_of_coaches: competitor.number_of_coaches,
        notes: competitor.notes || ''
      });
    } else {
      setEditingCompetitor(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        postal_code: '',
        latitude: undefined,
        longitude: undefined,
        distance_km: undefined,
        travel_time_minutes: undefined,
        market_zone_id: undefined,
        base_subscription_price: undefined,
        base_subscription_name: '',
        limited_subscription_price: undefined,
        limited_subscription_name: '',
        premium_subscription_price: undefined,
        premium_subscription_name: '',
        trial_price: undefined,
        positioning: 'standard',
        value_proposition: '',
        google_rating: undefined,
        google_reviews_count: 0,
        instagram_followers: 0,
        website_url: '',
        surface_m2: undefined,
        capacity: undefined,
        equipment_quality: 'standard',
        has_hyrox: false,
        has_weightlifting: false,
        has_gymnastics: false,
        has_childcare: false,
        has_nutrition: false,
        number_of_coaches: undefined,
        notes: ''
      });
    }
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCompetitor(null);
    setError(null);
  };

  const saveCompetitor = async () => {
    if (!formData.name.trim()) {
      setError('Le nom du concurrent est obligatoire');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const competitorData = {
        gym_id: gymId,
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        postal_code: formData.postal_code.trim() || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        distance_km: formData.distance_km || null,
        travel_time_minutes: formData.travel_time_minutes || null,
        market_zone_id: formData.market_zone_id || null,
        base_subscription_price: formData.base_subscription_price || null,
        base_subscription_name: formData.base_subscription_name.trim() || null,
        limited_subscription_price: formData.limited_subscription_price || null,
        limited_subscription_name: formData.limited_subscription_name.trim() || null,
        premium_subscription_price: formData.premium_subscription_price || null,
        premium_subscription_name: formData.premium_subscription_name.trim() || null,
        trial_price: formData.trial_price || null,
        offers_count: [
          formData.base_subscription_price,
          formData.limited_subscription_price,
          formData.premium_subscription_price,
          formData.trial_price
        ].filter(p => p && p > 0).length,
        positioning: formData.positioning,
        value_proposition: formData.value_proposition.trim() || null,
        google_rating: formData.google_rating || null,
        google_reviews_count: formData.google_reviews_count || 0,
        instagram_followers: formData.instagram_followers || 0,
        website_url: formData.website_url.trim() || null,
        surface_m2: formData.surface_m2 || null,
        capacity: formData.capacity || null,
        equipment_quality: formData.equipment_quality,
        has_hyrox: formData.has_hyrox,
        has_weightlifting: formData.has_weightlifting,
        has_gymnastics: formData.has_gymnastics,
        has_childcare: formData.has_childcare,
        has_nutrition: formData.has_nutrition,
        number_of_coaches: formData.number_of_coaches || null,
        notes: formData.notes.trim() || null,
        is_active: true
      };

      if (editingCompetitor) {
        console.log('[Competitors] Mise à jour:', editingCompetitor.id);
        const { error: updateError } = await supabase
          .from('competitors')
          .update(competitorData)
          .eq('id', editingCompetitor.id);

        if (updateError) throw updateError;
      } else {
        console.log('[Competitors] Création nouveau concurrent');
        const { error: insertError } = await supabase
          .from('competitors')
          .insert(competitorData);

        if (insertError) throw insertError;
      }

      await loadData();
      closeForm();
    } catch (err: any) {
      console.error('[Competitors] Erreur de sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const deleteCompetitor = async (competitor: Competitor) => {
    if (!confirm(`Supprimer "${competitor.name}" ?`)) return;

    try {
      console.log('[Competitors] Suppression:', competitor.id);
      const { error: deleteError } = await supabase
        .from('competitors')
        .update({ is_active: false })
        .eq('id', competitor.id);

      if (deleteError) throw deleteError;
      await loadData();
    } catch (err: any) {
      console.error('[Competitors] Erreur de suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  // ========================================================================
  // HELPERS
  // ========================================================================

  const getPositioningColor = (pos: CompetitorPositioning): string => {
    const colors = {
      budget: 'bg-green-100 text-green-800',
      standard: 'bg-blue-100 text-blue-800',
      premium: 'bg-amber-100 text-amber-800',
      luxe: 'bg-rose-100 text-rose-800'
    };
    return colors[pos];
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tulip-green mx-auto mb-4"></div>
          <p className="text-tulip-blue/70">Chargement des concurrents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-tulip-green to-tulip-blue text-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-lg transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Concurrents</h1>
              <p className="text-white/80 text-sm mt-1">
                Analyse de la concurrence CrossFit directe
              </p>
            </div>
          </div>
          <button
            onClick={() => openForm(null)}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-tulip-green rounded-lg hover:bg-white/90 transition-all font-semibold shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter concurrent</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Liste des concurrents */}
      {competitors.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {competitors.map(comp => (
            <div key={comp.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-tulip-blue text-lg">{comp.name}</h3>
                  {comp.city && <p className="text-sm text-gray-600">{comp.city}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPositioningColor(comp.positioning || 'standard')}`}>
                  {comp.positioning?.toUpperCase() || 'STANDARD'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {comp.distance_km && (
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{comp.distance_km} km</span>
                  </div>
                )}

                {comp.base_subscription_price && (
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-bold text-tulip-green">{comp.base_subscription_price}€/mois</span>
                    {comp.base_subscription_name && <span className="text-gray-600 ml-2">({comp.base_subscription_name})</span>}
                  </div>
                )}

                {comp.google_rating && (
                  <div className="flex items-center text-sm">
                    <Award className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{comp.google_rating}/5</span>
                    <span className="text-gray-600 ml-2">({comp.google_reviews_count} avis)</span>
                  </div>
                )}

                {comp.number_of_coaches && (
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{comp.number_of_coaches} coach(es)</span>
                  </div>
                )}
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-2 mb-4">
                {comp.has_hyrox && <span className="px-2 py-1 bg-tulip-green/10 text-tulip-green text-xs rounded">HYROX</span>}
                {comp.has_weightlifting && <span className="px-2 py-1 bg-tulip-blue/10 text-tulip-blue text-xs rounded">Haltérophilie</span>}
                {comp.has_nutrition && <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded">Nutrition</span>}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={() => openForm(comp)}
                  className="p-2 text-tulip-blue hover:bg-tulip-blue/10 rounded-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCompetitor(comp)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Aucun concurrent enregistré</p>
          <button
            onClick={() => openForm(null)}
            className="px-6 py-2 bg-tulip-green text-white rounded-lg hover:bg-tulip-green/90 transition-all"
          >
            Ajouter le premier concurrent
          </button>
        </div>
      )}

      {/* Modal formulaire (version simplifiée pour l'espace) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-tulip-blue">
                {editingCompetitor ? 'Modifier le concurrent' : 'Nouveau concurrent'}
              </h2>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Section Identification */}
              <div>
                <h3 className="text-lg font-bold text-tulip-blue mb-4">Identification</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom du concurrent *"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Ville"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                    />
                    <input
                      type="number"
                      value={formData.distance_km || ''}
                      onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) || undefined })}
                      placeholder="Distance (km)"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Section Tarification */}
              <div>
                <h3 className="text-lg font-bold text-tulip-blue mb-4">Tarification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={formData.base_subscription_price || ''}
                    onChange={(e) => setFormData({ ...formData, base_subscription_price: parseFloat(e.target.value) || undefined })}
                    placeholder="Prix abonnement illimité (€)"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                  />
                  <input
                    type="text"
                    value={formData.base_subscription_name}
                    onChange={(e) => setFormData({ ...formData, base_subscription_name: e.target.value })}
                    placeholder="Nom de l'offre"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                  />
                </div>
              </div>

              {/* Section Services */}
              <div>
                <h3 className="text-lg font-bold text-tulip-blue mb-4">Services proposés</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_hyrox}
                      onChange={(e) => setFormData({ ...formData, has_hyrox: e.target.checked })}
                      className="rounded text-tulip-green"
                    />
                    <span>HYROX</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_weightlifting}
                      onChange={(e) => setFormData({ ...formData, has_weightlifting: e.target.checked })}
                      className="rounded text-tulip-green"
                    />
                    <span>Haltérophilie</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_nutrition}
                      onChange={(e) => setFormData({ ...formData, has_nutrition: e.target.checked })}
                      className="rounded text-tulip-green"
                    />
                    <span>Nutrition</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.has_childcare}
                      onChange={(e) => setFormData({ ...formData, has_childcare: e.target.checked })}
                      className="rounded text-tulip-green"
                    />
                    <span>Garde d'enfants</span>
                  </label>
                </div>
              </div>

              {/* Positionnement */}
              <div>
                <label className="block text-sm font-semibold text-tulip-blue mb-2">Positionnement</label>
                <select
                  value={formData.positioning}
                  onChange={(e) => setFormData({ ...formData, positioning: e.target.value as CompetitorPositioning })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                >
                  <option value="budget">Budget</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="luxe">Luxe</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-tulip-blue mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes sur le concurrent..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={closeForm}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={saveCompetitor}
                className="flex items-center space-x-2 px-6 py-2 bg-tulip-green text-white rounded-lg hover:bg-tulip-green/90 disabled:opacity-50"
                disabled={saving}
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
