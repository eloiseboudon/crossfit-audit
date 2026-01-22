import { ArrowLeft, MapPin, Save, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { listMarketBenchmarks, updateMarketBenchmark } from '../lib/api';
import { MarketBenchmark } from '../lib/types';

interface SettingsPageProps {
  onBack: () => void;
  onNavigateToZones?: () => void;
}

export default function SettingsPage({ onBack, onNavigateToZones }: SettingsPageProps) {
  const [benchmarks, setBenchmarks] = useState<MarketBenchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBenchmarks();
  }, []);

  const loadBenchmarks = async () => {
    setLoading(true);
    try {
      const data = await listMarketBenchmarks();
      setBenchmarks(data || []);
    } catch (error) {
      console.error('Error loading benchmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const benchmark of benchmarks) {
        await updateMarketBenchmark(benchmark.id, {
          value: benchmark.value,
          updated_at: new Date().toISOString()
        });
      }
      alert('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Error saving benchmarks:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateBenchmark = (id: string, value: number) => {
    setBenchmarks(
      benchmarks.map((b) => (b.id === id ? { ...b, value } : b))
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      pricing: 'Tarification',
      retention: 'Rétention',
      acquisition: 'Acquisition',
      finance: 'Finance',
      exploitation: 'Exploitation'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#48737F]"></div>
      </div>
    );
  }

  const groupedBenchmarks = benchmarks.reduce((acc, benchmark) => {
    const category = benchmark.category || 'autres';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(benchmark);
    return acc;
  }, {} as Record<string, MarketBenchmark[]>);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-md border-b-2 border-[#DAD7CD] p-6">
        <div className="flex items-center justify-between mb-6 pb-5 border-b-2 border-[#DAD7CD]">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-[#48737F]/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#48737F]" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-[#48737F]">Paramètres du Marché</h1>
              <p className="text-[#CCBB90] text-sm mt-1">
                Benchmarks et références pour les calculs
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#48737F] text-white rounded-lg hover:bg-[#3A5C66] transition-colors disabled:opacity-50 font-semibold shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>

        {/* Section gestion des zones de marché */}
        {onNavigateToZones && (
          <div className="mb-8 p-6 bg-[#48737F]/5 border-2 border-[#48737F]/20 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#48737F] text-white rounded-lg shadow-md">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#48737F]">Zones de Marché</h3>
                  <p className="text-sm text-[#CCBB90] mt-1">
                    Gérer les zones géographiques et leurs fourchettes de prix pour l'analyse concurrentielle
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateToZones}
                className="px-6 py-2.5 bg-[#48737F] text-white rounded-lg hover:bg-[#3A5C66] transition-all font-semibold shadow-md"
              >
                Gérer les zones
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {Object.entries(groupedBenchmarks).map(([category, categoryBenchmarks]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b-2 border-[#DAD7CD]">
                <TrendingUp className="w-5 h-5 text-[#48737F]" />
                <h2 className="text-lg font-semibold text-[#48737F]">
                  {getCategoryLabel(category)}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {categoryBenchmarks.map((benchmark) => (
                  <div
                    key={benchmark.id}
                    className="p-4 border-2 border-[#DAD7CD] rounded-xl hover:border-[#48737F] hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 mr-4">
                        <h3 className="font-semibold text-[#48737F] mb-1">
                          {benchmark.name}
                        </h3>
                        {benchmark.description && (
                          <p className="text-sm text-[#CCBB90]">
                            {benchmark.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={benchmark.value}
                          onChange={(e) =>
                            updateBenchmark(benchmark.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-24 px-3 py-2 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] text-right bg-white text-[#48737F]"
                          step="0.1"
                        />
                        {benchmark.unit && (
                          <span className="text-[#48737F] text-sm font-medium min-w-[2rem]">
                            {benchmark.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 bg-[#48737F]/5 border-2 border-[#48737F]/20 rounded-xl">
          <h3 className="font-semibold text-[#48737F] mb-2">À propos des benchmarks</h3>
          <p className="text-sm text-[#CCBB90] leading-relaxed">
            Ces valeurs servent de référence pour les calculs de scoring et de recommandations.
            Ajustez-les en fonction des données réelles de votre marché local pour obtenir
            des diagnostics plus précis.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t-2 border-[#DAD7CD]">
          <button
            onClick={onBack}
            className="px-6 py-2.5 text-[#48737F] hover:bg-[#48737F]/10 rounded-lg transition-colors font-medium border-2 border-transparent hover:border-[#48737F]/30"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-[#48737F] text-white rounded-lg hover:bg-[#3A5C66] transition-colors disabled:opacity-50 font-semibold shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}