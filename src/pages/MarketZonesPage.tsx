/**
 * MarketZonesPage.tsx
 * Page de gestion des zones de marché CrossFit
 *
 * Permet de:
 * - Visualiser toutes les zones de marché actives
 * - Créer de nouvelles zones
 * - Modifier des zones existantes
 * - Supprimer des zones (soft delete via is_active)
 *
 * Chaque zone définit une fourchette de prix pour une zone géographique
 * et sert de référence pour l'analyse comparative de tarification.
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MapPin, Edit2, Trash2, AlertCircle, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MarketZone, PriceLevel, GeographicScope, PopulationDensity } from '../lib/types';

interface MarketZonesPageProps {
  onBack: () => void;
}

export default function MarketZonesPage({ onBack }: MarketZonesPageProps) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  const [zones, setZones] = useState<MarketZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<MarketZone | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_level: 'standard' as PriceLevel,
    avg_subscription_min: 140,
    avg_subscription_max: 180,
    geographic_scope: 'ville' as GeographicScope,
    population_density: 'urbaine' as PopulationDensity,
    avg_household_income_range: ''
  });

  // ========================================================================
  // LIFECYCLE: Charger les zones au montage
  // ========================================================================

  useEffect(() => {
    loadZones();
  }, []);

  // ========================================================================
  // DATA LOADING
  // ========================================================================

  /**
   * Charge toutes les zones de marché actives depuis Supabase
   * Trie par niveau de prix (budget -> luxe)
   */
  const loadZones = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[MarketZones] Chargement des zones...');

      const { data, error: fetchError } = await supabase
        .from('market_zones')
        .select('*')
        .eq('is_active', true)
        .order('price_level');

      if (fetchError) throw fetchError;

      setZones(data || []);
      console.log(`[MarketZones] ${data?.length || 0} zones chargées`);
    } catch (err) {
      console.error('[MarketZones] Erreur de chargement:', err);
      setError('Impossible de charger les zones de marché');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // CRUD OPERATIONS
  // ========================================================================

  /**
   * Ouvre le formulaire de création/édition
   */
  const openForm = (zone: MarketZone | null = null) => {
    if (zone) {
      // Mode édition: pré-remplir le formulaire
      setEditingZone(zone);
      setFormData({
        name: zone.name,
        description: zone.description || '',
        price_level: zone.price_level,
        avg_subscription_min: zone.avg_subscription_min,
        avg_subscription_max: zone.avg_subscription_max,
        geographic_scope: zone.geographic_scope || 'ville',
        population_density: zone.population_density || 'urbaine',
        avg_household_income_range: zone.avg_household_income_range || ''
      });
    } else {
      // Mode création: réinitialiser le formulaire
      setEditingZone(null);
      setFormData({
        name: '',
        description: '',
        price_level: 'standard',
        avg_subscription_min: 140,
        avg_subscription_max: 180,
        geographic_scope: 'ville',
        population_density: 'urbaine',
        avg_household_income_range: ''
      });
    }
    setShowForm(true);
    setError(null);
  };

  /**
   * Ferme le formulaire sans sauvegarder
   */
  const closeForm = () => {
    setShowForm(false);
    setEditingZone(null);
    setError(null);
  };

  /**
   * Sauvegarde une zone (création ou mise à jour)
   */
  const saveZone = async () => {
    // Validation du formulaire
    if (!formData.name.trim()) {
      setError('Le nom de la zone est obligatoire');
      return;
    }

    if (formData.avg_subscription_min <= 0 || formData.avg_subscription_max <= 0) {
      setError('Les prix doivent être supérieurs à 0');
      return;
    }

    if (formData.avg_subscription_max < formData.avg_subscription_min) {
      setError('Le prix maximum doit être supérieur au prix minimum');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingZone) {
        // Mise à jour d'une zone existante
        console.log('[MarketZones] Mise à jour de la zone:', editingZone.id);

        const { error: updateError } = await supabase
          .from('market_zones')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            price_level: formData.price_level,
            avg_subscription_min: formData.avg_subscription_min,
            avg_subscription_max: formData.avg_subscription_max,
            geographic_scope: formData.geographic_scope,
            population_density: formData.population_density,
            avg_household_income_range: formData.avg_household_income_range.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingZone.id);

        if (updateError) throw updateError;

        console.log('[MarketZones] Zone mise à jour avec succès');
      } else {
        // Création d'une nouvelle zone
        console.log('[MarketZones] Création d\'une nouvelle zone');

        const { error: insertError } = await supabase
          .from('market_zones')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            price_level: formData.price_level,
            avg_subscription_min: formData.avg_subscription_min,
            avg_subscription_max: formData.avg_subscription_max,
            geographic_scope: formData.geographic_scope,
            population_density: formData.population_density,
            avg_household_income_range: formData.avg_household_income_range.trim() || null,
            is_active: true
          });

        if (insertError) throw insertError;

        console.log('[MarketZones] Zone créée avec succès');
      }

      // Recharger les zones et fermer le formulaire
      await loadZones();
      closeForm();
    } catch (err: any) {
      console.error('[MarketZones] Erreur de sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Supprime une zone (soft delete: is_active = false)
   */
  const deleteZone = async (zone: MarketZone) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la zone "${zone.name}" ?`)) {
      return;
    }

    try {
      console.log('[MarketZones] Suppression de la zone:', zone.id);

      const { error: deleteError } = await supabase
        .from('market_zones')
        .update({ is_active: false })
        .eq('id', zone.id);

      if (deleteError) throw deleteError;

      console.log('[MarketZones] Zone supprimée avec succès');
      await loadZones();
    } catch (err: any) {
      console.error('[MarketZones] Erreur de suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================

  /**
   * Retourne la classe CSS pour le badge de niveau de prix
   */
  const getPriceLevelColor = (level: PriceLevel): string => {
    const colors = {
      budget: 'bg-green-100 text-green-800 border-green-300',
      standard: 'bg-blue-100 text-blue-800 border-blue-300',
      premium: 'bg-amber-100 text-amber-800 border-amber-300',
      luxe: 'bg-rose-100 text-rose-800 border-rose-300'
    };
    return colors[level];
  };

  /**
   * Retourne le label français du niveau de prix
   */
  const getPriceLevelLabel = (level: PriceLevel): string => {
    const labels = {
      budget: 'Budget',
      standard: 'Standard',
      premium: 'Premium',
      luxe: 'Luxe'
    };
    return labels[level];
  };

  // ========================================================================
  // RENDER: Loading state
  // ========================================================================

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tulip-green mx-auto mb-4"></div>
          <p className="text-tulip-blue/70">Chargement des zones de marché...</p>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER: Main UI
  // ========================================================================

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-tulip-green to-tulip-blue text-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Zones de Marché</h1>
              <p className="text-white/80 text-sm mt-1">
                Classification des zones par niveau de prix CrossFit
              </p>
            </div>
          </div>
          <button
            onClick={() => openForm(null)}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-tulip-green rounded-lg hover:bg-white/90 transition-all font-semibold shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle zone</span>
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grille des zones */}
      {zones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {zones.map(zone => (
            <div
              key={zone.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              {/* Badge niveau de prix */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getPriceLevelColor(zone.price_level)}`}>
                  {getPriceLevelLabel(zone.price_level).toUpperCase()}
                </span>
              </div>

              {/* Nom de la zone */}
              <h3 className="font-bold text-tulip-blue text-lg mb-2">{zone.name}</h3>

              {/* Description */}
              {zone.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{zone.description}</p>
              )}

              {/* Informations */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Fourchette</span>
                  <span className="text-sm font-bold text-tulip-green">
                    {zone.avg_subscription_min}€ - {zone.avg_subscription_max}€
                  </span>
                </div>

                {zone.geographic_scope && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Portée</span>
                    <span className="text-sm text-tulip-blue capitalize">{zone.geographic_scope}</span>
                  </div>
                )}

                {zone.population_density && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Densité</span>
                    <span className="text-sm text-tulip-blue capitalize">{zone.population_density}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openForm(zone)}
                  className="p-2 text-tulip-blue hover:bg-tulip-blue/10 rounded-lg transition-all"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteZone(zone)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Aucune zone de marché définie</p>
          <button
            onClick={() => openForm(null)}
            className="px-6 py-2 bg-tulip-green text-white rounded-lg hover:bg-tulip-green/90 transition-all"
          >
            Créer la première zone
          </button>
        </div>
      )}

      {/* Modal du formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-tulip-blue">
                {editingZone ? 'Modifier la zone' : 'Nouvelle zone de marché'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-semibold text-tulip-blue mb-2">
                  Nom de la zone *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tulip-green focus:border-transparent"
                  placeholder="ex: Paris Intra-Muros"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-tulip-blue mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tulip-green focus:border-transparent"
                  placeholder="Description de la zone..."
                  rows={3}
                />
              </div>

              {/* Niveau de prix */}
              <div>
                <label className="block text-sm font-semibold text-tulip-blue mb-2">
                  Niveau de prix *
                </label>
                <select
                  value={formData.price_level}
                  onChange={(e) => setFormData({ ...formData, price_level: e.target.value as PriceLevel })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tulip-green focus:border-transparent"
                  required
                >
                  <option value="budget">Budget (100-140€)</option>
                  <option value="standard">Standard (140-180€)</option>
                  <option value="premium">Premium (180-250€)</option>
                  <option value="luxe">Luxe (250-350€+)</option>
                </select>
              </div>

              {/* Fourchette de prix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-tulip-blue mb-2">
                    Prix min (€) *
                  </label>
                  <input
                    type="number"
                    value={formData.avg_subscription_min}
                    onChange={(e) => setFormData({ ...formData, avg_subscription_min: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tulip-green focus:border-transparent"
                    min="0"
                    step="10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-tulip-blue mb-2">
                    Prix max (€) *
                  </label>
                  <input
                    type="number"
                    value={formData.avg_subscription_max}
                    onChange={(e) => setFormData({ ...formData, avg_subscription_max: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tulip-green focus:border-transparent"
                    min="0"
                    step="10"
                    required
                  />
                </div>
              </div>

              {/* Portée géographique */}
              <div>
                <label className="block text-sm font-semibold text-tulip-blue mb-2">
                  Portée géographique
                </label>
                <select
                  value={formData.geographic_scope}
                  onChange={(e) => setFormData({ ...formData, geographic_scope: e.target.value as GeographicScope })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tulip-green focus:border-transparent"
                >
                  <option value="quartier">Quartier</option>
                  <option value="ville">Ville</option>
                  <option value="agglomeration">Agglomération</option>
                  <option value="region">Région</option>
                </select>
              </div>

              {/* Densité de population */}
              <div>
                <label className="block text-sm font-semibold text-tulip-blue mb-2">
                  Densité de population
                </label>
                <select
                  value={formData.population_density}
                  onChange={(e) => setFormData({ ...formData, population_density: e.target.value as PopulationDensity })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tulip-green focus:border-transparent"
                >
                  <option value="rurale">Rurale</option>
                  <option value="periurbaine">Périurbaine</option>
                  <option value="urbaine">Urbaine</option>
                  <option value="metropolitaine">Métropolitaine</option>
                </select>
              </div>

              {/* Fourchette de revenus */}
              <div>
                <label className="block text-sm font-semibold text-tulip-blue mb-2">
                  Fourchette de revenus
                </label>
                <input
                  type="text"
                  value={formData.avg_household_income_range}
                  onChange={(e) => setFormData({ ...formData, avg_household_income_range: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tulip-green focus:border-transparent"
                  placeholder="ex: 35k-45k"
                />
              </div>
            </div>

            {/* Actions du formulaire */}
            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={closeForm}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={saveZone}
                className="flex items-center space-x-2 px-6 py-2 bg-tulip-green text-white rounded-lg hover:bg-tulip-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
