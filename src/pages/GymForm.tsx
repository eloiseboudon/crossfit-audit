import { ArrowLeft, Building2, Globe, MapPin, Phone, Save, Scale } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createGym, getGym, updateGym } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Gym } from '../lib/types';

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
      const data = await getGym(gymId);
      if (data) {
        setGym(data);
      }
    } catch (error) {
      console.error('Error loading gym:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logique métier: création ou mise à jour selon la présence d'un gymId.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (gymId) {
        await updateGym(gymId, { ...gym, updated_at: new Date().toISOString() });
      } else {
        await createGym({
          ...gym,
          user_id: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
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
    <div className="max-w-5xl mx-auto space-y-6 px-2 md:px-0">
      {/* Header */}
      <div className="bg-[#48737F] text-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/20 rounded-lg transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3 min-w-0">
            <div className="bg-[#CCBB90] p-3 rounded-lg shrink-0">
              <Building2 className="w-6 h-6 text-[#48737F]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold truncate text-[#DAD7CD]">
                {gymId ? 'Modifier la salle' : 'Nouvelle salle'}
              </h1>
              <p className="text-[#CCBB90] text-sm mt-1">
                Complétez les informations de la salle
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations Générales */}
        <div className="bg-white rounded-xl shadow-md border-b-2 border-[#DAD7CD] p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-[#DAD7CD]">
            <div className="bg-[#48737F]/10 p-2 rounded-lg">
              <Building2 className="w-5 h-5 text-[#48737F]" />
            </div>
            <h2 className="text-lg font-semibold text-[#48737F]">Informations Générales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Nom de la salle *
              </label>
              <input
                type="text"
                required
                value={gym.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
                placeholder="Ex: BeUnit CrossFit"
              />
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-white rounded-xl shadow-md border-b-2 border-[#DAD7CD] p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-[#DAD7CD]">
            <div className="bg-[#48737F]/10 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-[#48737F]" />
            </div>
            <h2 className="text-lg font-semibold text-[#48737F]">Localisation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Adresse complète
              </label>
              <input
                type="text"
                value={gym.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
                placeholder="164 Route de Revel"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Ville
              </label>
              <input
                type="text"
                value={gym.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
                placeholder="Toulouse"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Code postal
              </label>
              <input
                type="text"
                value={gym.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
                placeholder="31400"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl shadow-md border-b-2 border-[#DAD7CD] p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-[#DAD7CD]">
            <div className="bg-[#E89F5C]/10 p-2 rounded-lg">
              <Phone className="w-5 h-5 text-[#E89F5C]" />
            </div>
            <h2 className="text-lg font-semibold text-[#48737F]">Contact</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Contact principal
              </label>
              <input
                type="text"
                value={gym.contact_name}
                onChange={(e) => handleChange('contact_name', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
                placeholder="Nom du gérant"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={gym.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
                placeholder="06 73 47 67 18"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Email
              </label>
              <input
                type="email"
                value={gym.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
                placeholder="contact@box.com"
              />
            </div>
          </div>
        </div>

        {/* Présence en ligne */}
        <div className="bg-white rounded-xl shadow-md border-b-2 border-[#DAD7CD] p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-[#DAD7CD]">
            <div className="bg-[#7FA99B]/10 p-2 rounded-lg">
              <Globe className="w-5 h-5 text-[#7FA99B]" />
            </div>
            <h2 className="text-lg font-semibold text-[#48737F]">Présence en ligne</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Site web
              </label>
              <input
                type="url"
                value={gym.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={gym.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
                placeholder="@beunitcrossfit31"
              />
            </div>
          </div>
        </div>

        {/* Informations Légales */}
        <div className="bg-white rounded-xl shadow-md border-b-2 border-[#DAD7CD] p-6">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b-2 border-[#DAD7CD]">
            <div className="bg-[#D85858]/10 p-2 rounded-lg">
              <Scale className="w-5 h-5 text-[#D85858]" />
            </div>
            <h2 className="text-lg font-semibold text-[#48737F]">Informations Légales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Statut juridique
              </label>
              <select
                value={gym.legal_status}
                onChange={(e) => handleChange('legal_status', e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
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
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Année de création
              </label>
              <input
                type="number"
                value={gym.founded_year}
                onChange={(e) => handleChange('founded_year', parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
                min="1990"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Nombre d'associés
              </label>
              <input
                type="number"
                value={gym.partners_count}
                onChange={(e) => handleChange('partners_count', parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
                min="1"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-[#48737F] mb-2">
                Notes complémentaires
              </label>
              <textarea
                value={gym.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] transition-all"
                placeholder="Informations additionnelles sur la salle..."
              />
            </div>
          </div>
        </div>

        {/* Footer avec boutons */}
        <div className="bg-[#DAD7CD]/30 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#48737F]">
            Les champs marqués d'un * sont obligatoires
          </p>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 text-[#48737F] hover:bg-[#DAD7CD] rounded-lg transition-all font-medium border-2 border-transparent hover:border-[#48737F]/30"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-8 py-3 bg-[#48737F] text-white rounded-lg hover:bg-[#3A5C66] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md"
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
