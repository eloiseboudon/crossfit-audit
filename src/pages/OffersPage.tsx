/**
 * OffersPage.tsx
 * Page de gestion des offres commerciales de la salle
 *
 * Permet de:
 * - Visualiser toutes les offres de la salle
 * - Créer de nouvelles offres (illimité, limité, étudiant, etc.)
 * - Modifier des offres existantes
 * - Activer/désactiver des offres
 * - Suivre les performances de chaque offre
 *
 * Remplace le simple "panier_moyen_mensuel" par une structure détaillée
 * permettant l'analyse tarifaire comparative.
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, AlertCircle, Save, X, DollarSign, Users, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { createGymOffer, deleteGymOffer, listGymOffers, updateGymOffer } from '../lib/api';
import { GymOffer, OfferType } from '../lib/types';

interface OffersPageProps {
  onBack: () => void;
  gymId: string; // ID de la salle courante
}

export default function OffersPage({ onBack, gymId }: OffersPageProps) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================

  const [offers, setOffers] = useState<GymOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<GymOffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    offer_type: 'unlimited' as OfferType,
    offer_name: '',
    offer_description: '',
    price: 0,
    session_count: undefined as number | undefined,
    duration_months: 1,
    commitment_months: 1,
    restrictions: '',
    is_featured: false,
    active_subscriptions_count: 0
  });

  // ========================================================================
  // LIFECYCLE
  // ========================================================================

  useEffect(() => {
    loadOffers();
  }, [gymId]);

  // ========================================================================
  // DATA LOADING
  // ========================================================================

  /**
   * Charge toutes les offres de la salle (actives et inactives)
   */
  const loadOffers = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[Offers] Chargement des offres pour gym:', gymId);

      const data = await listGymOffers(gymId);

      setOffers(data || []);
      console.log(`[Offers] ${data?.length || 0} offres chargées`);
    } catch (err) {
      console.error('[Offers] Erreur de chargement:', err);
      setError('Impossible de charger les offres');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // CRUD OPERATIONS
  // ========================================================================

  const openForm = (offer: GymOffer | null = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        offer_type: offer.offer_type,
        offer_name: offer.offer_name,
        offer_description: offer.offer_description || '',
        price: offer.price,
        session_count: offer.session_count,
        duration_months: offer.duration_months,
        commitment_months: offer.commitment_months,
        restrictions: offer.restrictions || '',
        is_featured: offer.is_featured,
        active_subscriptions_count: offer.active_subscriptions_count
      });
    } else {
      setEditingOffer(null);
      setFormData({
        offer_type: 'unlimited',
        offer_name: '',
        offer_description: '',
        price: 0,
        session_count: undefined,
        duration_months: 1,
        commitment_months: 1,
        restrictions: '',
        is_featured: false,
        active_subscriptions_count: 0
      });
    }
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingOffer(null);
    setError(null);
  };

  const saveOffer = async () => {
    if (!formData.offer_name.trim()) {
      setError('Le nom de l\'offre est obligatoire');
      return;
    }

    if (formData.price <= 0) {
      setError('Le prix doit être supérieur à 0');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const offerData = {
        gym_id: gymId,
        offer_type: formData.offer_type,
        offer_name: formData.offer_name.trim(),
        offer_description: formData.offer_description.trim() || undefined,
        price: formData.price,
        currency: 'EUR',
        session_count: formData.session_count || undefined,
        duration_months: formData.duration_months,
        commitment_months: formData.commitment_months,
        restrictions: formData.restrictions.trim() || undefined,
        is_featured: formData.is_featured,
        active_subscriptions_count: formData.active_subscriptions_count,
        is_active: true
      };

      if (editingOffer) {
        console.log('[Offers] Mise à jour:', editingOffer.id);
        await updateGymOffer(editingOffer.id, offerData);
      } else {
        console.log('[Offers] Création nouvelle offre');
        await createGymOffer(offerData);
      }

      await loadOffers();
      closeForm();
    } catch (err: any) {
      console.error('[Offers] Erreur de sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Active/désactive une offre (toggle is_active)
   */
  const toggleOfferStatus = async (offer: GymOffer) => {
    try {
      console.log('[Offers] Toggle status:', offer.id, !offer.is_active);
      await updateGymOffer(offer.id, { is_active: !offer.is_active });
      await loadOffers();
    } catch (err: any) {
      console.error('[Offers] Erreur toggle:', err);
      setError(err.message || 'Erreur lors de la modification');
    }
  };

  /**
   * Supprime définitivement une offre
   */
  const deleteOffer = async (offer: GymOffer) => {
    if (!confirm(`Supprimer l'offre "${offer.offer_name}" ? Cette action est irréversible.`)) return;

    try {
      console.log('[Offers] Suppression:', offer.id);
      await deleteGymOffer(offer.id);
      await loadOffers();
    } catch (err: any) {
      console.error('[Offers] Erreur de suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  // ========================================================================
  // HELPERS
  // ========================================================================

  const getOfferTypeLabel = (type: OfferType): string => {
    const labels: Record<OfferType, string> = {
      unlimited: 'Illimité',
      limited_sessions: 'Séances limitées',
      trial: 'Essai/Découverte',
      student: 'Étudiant',
      couple: 'Couple',
      family: 'Famille',
      corporate: 'Entreprise',
      off_peak: 'Heures creuses',
      early_bird: 'Early Bird',
      annual: 'Paiement annuel',
      premium: 'Premium',
      pt_package: 'Pack PT',
      class_pack: 'Pack séances'
    };
    return labels[type];
  };

  const getOfferTypeColor = (type: OfferType): string => {
    if (['unlimited', 'premium'].includes(type)) return 'bg-tulip-green/10 text-tulip-green';
    if (['student', 'off_peak', 'early_bird'].includes(type)) return 'bg-blue-100 text-blue-800';
    if (['couple', 'family', 'corporate'].includes(type)) return 'bg-amber-100 text-amber-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Calcul des statistiques
  const totalActiveOffers = offers.filter(o => o.is_active).length;
  const totalSubscriptions = offers.reduce((sum, o) => sum + o.active_subscriptions_count, 0);
  const avgPrice = offers.length > 0
    ? offers.reduce((sum, o) => sum + o.price, 0) / offers.length
    : 0;

  // ========================================================================
  // RENDER
  // ========================================================================

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tulip-green mx-auto mb-4"></div>
          <p className="text-tulip-blue/70">Chargement des offres...</p>
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
              <h1 className="text-2xl font-bold">Offres Commerciales</h1>
              <p className="text-white/80 text-sm mt-1">
                Gestion du catalogue tarifaire de la salle
              </p>
            </div>
          </div>
          <button
            onClick={() => openForm(null)}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-tulip-green rounded-lg hover:bg-white/90 transition-all font-semibold shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Nouvelle offre</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Offres actives</p>
              <p className="text-3xl font-bold text-tulip-blue mt-1">{totalActiveOffers}</p>
            </div>
            <DollarSign className="w-12 h-12 text-tulip-green/20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total abonnés</p>
              <p className="text-3xl font-bold text-tulip-blue mt-1">{totalSubscriptions}</p>
            </div>
            <Users className="w-12 h-12 text-tulip-blue/20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prix moyen</p>
              <p className="text-3xl font-bold text-tulip-green mt-1">{avgPrice.toFixed(0)}€</p>
            </div>
            <TrendingUp className="w-12 h-12 text-tulip-green/20" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Liste des offres */}
      {offers.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Offre</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Prix</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase">Abonnés</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Statut</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {offers.map(offer => (
                <tr key={offer.id} className={!offer.is_active ? 'opacity-50 bg-gray-50' : ''}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-tulip-blue">{offer.offer_name}</p>
                      {offer.offer_description && (
                        <p className="text-sm text-gray-600 line-clamp-1">{offer.offer_description}</p>
                      )}
                      {offer.is_featured && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">⭐ En avant</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getOfferTypeColor(offer.offer_type)}`}>
                      {getOfferTypeLabel(offer.offer_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-tulip-green text-lg">{offer.price}€</span>
                    <p className="text-xs text-gray-600">/{offer.duration_months} mois</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold">{offer.active_subscriptions_count}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleOfferStatus(offer)}
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                        offer.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {offer.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{offer.is_active ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openForm(offer)}
                        className="p-2 text-tulip-blue hover:bg-tulip-blue/10 rounded-lg transition-all"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteOffer(offer)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Aucune offre configurée</p>
          <button
            onClick={() => openForm(null)}
            className="px-6 py-2 bg-tulip-green text-white rounded-lg hover:bg-tulip-green/90 transition-all"
          >
            Créer la première offre
          </button>
        </div>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-tulip-blue">
                {editingOffer ? 'Modifier l\'offre' : 'Nouvelle offre'}
              </h2>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-sm font-semibold text-tulip-blue mb-2">Nom de l'offre *</label>
                <input
                  type="text"
                  value={formData.offer_name}
                  onChange={(e) => setFormData({ ...formData, offer_name: e.target.value })}
                  placeholder="ex: Illimité CrossFit"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-tulip-blue mb-2">Type d'offre *</label>
                <select
                  value={formData.offer_type}
                  onChange={(e) => setFormData({ ...formData, offer_type: e.target.value as OfferType })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                >
                  <option value="unlimited">Illimité</option>
                  <option value="limited_sessions">Séances limitées</option>
                  <option value="trial">Essai/Découverte</option>
                  <option value="student">Étudiant</option>
                  <option value="couple">Couple</option>
                  <option value="family">Famille</option>
                  <option value="corporate">Entreprise</option>
                  <option value="off_peak">Heures creuses</option>
                  <option value="early_bird">Early Bird</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              {/* Prix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-tulip-blue mb-2">Prix (€) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                    min="0"
                    step="10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-tulip-blue mb-2">Durée (mois)</label>
                  <input
                    type="number"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                    min="1"
                  />
                </div>
              </div>

              {/* Nombre de séances (si limité) */}
              {formData.offer_type === 'limited_sessions' && (
                <div>
                  <label className="block text-sm font-semibold text-tulip-blue mb-2">Nombre de séances</label>
                  <input
                    type="number"
                    value={formData.session_count || ''}
                    onChange={(e) => setFormData({ ...formData, session_count: parseInt(e.target.value) || undefined })}
                    placeholder="ex: 8 séances/mois"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                    min="1"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-tulip-blue mb-2">Description</label>
                <textarea
                  value={formData.offer_description}
                  onChange={(e) => setFormData({ ...formData, offer_description: e.target.value })}
                  placeholder="Description de l'offre..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                  rows={3}
                />
              </div>

              {/* Abonnés actifs */}
              <div>
                <label className="block text-sm font-semibold text-tulip-blue mb-2">Nombre d'abonnés actifs</label>
                <input
                  type="number"
                  value={formData.active_subscriptions_count}
                  onChange={(e) => setFormData({ ...formData, active_subscriptions_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-tulip-green"
                  min="0"
                />
              </div>

              {/* Mise en avant */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded text-tulip-green"
                  />
                  <span className="text-sm font-semibold text-tulip-blue">Mettre en avant cette offre</span>
                </label>
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
                onClick={saveOffer}
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
