import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Building2, MapPin, Phone, Globe, Scale } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Gym } from '../lib/types';
import { useAuth } from '../lib/auth';

interface GymFormProps {
  gymId?: string;
  onBack: () => void;
}

export default function GymForm({ gymId, onBack }: GymFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gym, setGym] = useState<Partial<Gym>>({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    contact_name: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    legal_status: '',
    founded_year: new Date().getFullYear(),
    partners_count: 1,
    notes: ''
  });

  useEffect(() => {
    if (gymId) {
      loadGym();
    }
  }, [gymId]);

  const loadGym = async () => {
    if (!gymId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('gyms')
        .select('*')
        .eq('id', gymId)
        .maybeSingle();
      if (data) {
        setGym(data);
      }
    } catch (error) {
      console.error('Error loading gym:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (gymId) {
        const { error } = await supabase
          .from('gyms')
          .update({ ...gym, updated_at: new Date().toISOString() })
          .eq('id', gymId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('gyms').insert({
          ...gym,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (error) throw error;
      }
      onBack();
    } catch (error: any) {
      console.error('Error saving gym:', error);
      alert(`Erreur lors de la sauvegarde: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Gym, value: any) => {
    setGym({ ...gym, [field]: value });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
      <div className="bg-gradient-to-r from-tulip-green to-tulip-blue text-white rounded-card shadow-lg p-4 md:p-6">
        <div className="flex items-center space-x-3 md:space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-card transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
            <div className="bg-white/20 p-2 md:p-3 rounded-card shrink-0">
              <Building2 className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold truncate">
                {gymId ? 'Modifier la salle' : 'Nouvelle salle'}
              </h1>
              <p className="text-white/80 text-xs md:text-sm mt-1 hidden md:block">
                Complétez les informations de la salle
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-4 md:p-6">
          <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6">
            <div className="bg-tulip-green/10 p-2 rounded-card">
              <Building2 className="w-5 h-5 text-tulip-green" />
            </div>
            <h2 className="text-lg font-bold text-tulip-blue">Informations Générales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Nom de la salle *
              </label>
              <input
                type="text"
                required
                value={gym.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all"
                placeholder="Ex: BeUnit CrossFit"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-tulip-blue/10 p-2 rounded-card">
              <MapPin className="w-5 h-5 text-tulip-blue" />
            </div>
            <h2 className="text-lg font-bold text-tulip-blue">Localisation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Adresse complète
              </label>
              <input
                type="text"
                value={gym.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all"
                placeholder="164 Route de Revel"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Ville
              </label>
              <input
                type="text"
                value={gym.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all"
                placeholder="Toulouse"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Code postal
              </label>
              <input
                type="text"
                value={gym.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all"
                placeholder="31400"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-orange-500/10 p-2 rounded-card">
              <Phone className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-lg font-bold text-tulip-blue">Contact</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Contact principal
              </label>
              <input
                type="text"
                value={gym.contact_name}
                onChange={(e) => handleChange('contact_name', e.target.value)}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all"
                placeholder="Nom du gérant"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={gym.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all"
                placeholder="06 73 47 67 18"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Email
              </label>
              <input
                type="email"
                value={gym.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all"
                placeholder="contact@box.com"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-tulip-green-success/10 p-2 rounded-card">
              <Globe className="w-5 h-5 text-tulip-green-success" />
            </div>
            <h2 className="text-lg font-bold text-tulip-blue">Présence en ligne</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Site web
              </label>
              <input
                type="url"
                value={gym.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={gym.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all"
                placeholder="@beunitcrossfit31"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-card shadow-card border border-tulip-beige/30 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-tulip-red/10 p-2 rounded-card">
              <Scale className="w-5 h-5 text-tulip-red" />
            </div>
            <h2 className="text-lg font-bold text-tulip-blue">Informations Légales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Statut juridique
              </label>
              <select
                value={gym.legal_status}
                onChange={(e) => handleChange('legal_status', e.target.value)}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all bg-white"
              >
                <option value="">Sélectionner...</option>
                <option value="Association">Association</option>
                <option value="SARL">SARL</option>
                <option value="SAS">SAS</option>
                <option value="EURL">EURL</option>
                <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Année de création
              </label>
              <input
                type="number"
                value={gym.founded_year}
                onChange={(e) => handleChange('founded_year', parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all"
                min="1990"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Nombre d'associés
              </label>
              <input
                type="number"
                value={gym.partners_count}
                onChange={(e) => handleChange('partners_count', parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all"
                min="1"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-tulip-blue mb-2">
                Notes complémentaires
              </label>
              <textarea
                value={gym.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-tulip-beige rounded-card focus:ring-2 focus:ring-tulip-green focus:border-tulip-green transition-all"
                placeholder="Informations additionnelles sur la salle..."
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-tulip-beige/30 to-tulip-beige/10 rounded-card p-6 flex items-center justify-between">
          <p className="text-sm text-tulip-blue/70">
            Les champs marqués d'un * sont obligatoires
          </p>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 text-tulip-blue hover:bg-tulip-beige/50 rounded-card transition-all font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-tulip-green to-tulip-green/90 text-white rounded-card hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Enregistrer la salle</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
