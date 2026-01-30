import { ArrowLeft, Calculator, Check, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAudit, listAnswers, updateAudit, upsertAnswer } from '../lib/api';
import { questionnaireBlocks } from '../lib/questionnaire';
import { Audit, Question } from '../lib/types';

interface AuditFormProps {
  auditId?: string;
  onBack: () => void;
  onViewDashboard: (auditId: string) => void;
}

export default function AuditForm({ auditId, onBack, onViewDashboard }: AuditFormProps) {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [localInputs, setLocalInputs] = useState<Record<string, string>>({});
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useState<Record<string, NodeJS.Timeout>>({});[0];

  useEffect(() => {
    if (auditId) {
      loadAudit();
    }
  }, [auditId]);

  const loadAudit = async () => {
    if (!auditId) return;
    setLoading(true);
    try {
      const auditData = await getAudit(auditId, true);

      if (auditData) {
        setAudit(auditData);

        const answersData = await listAnswers(auditId);

        const answersMap: Record<string, any> = {};
        answersData?.forEach((answer) => {
          const key = `${answer.block_code}_${answer.question_code}`;
          answersMap[key] = answer.value;
        });
        setAnswers(answersMap);

        await updateCompletionPercentage(answersMap);
      }
    } catch (error) {
      console.error('Error loading audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSave = (blockCode: string, questionCode: string, value: any) => {
    const key = `${blockCode}_${questionCode}`;

    if (saveTimeoutRef[key]) {
      clearTimeout(saveTimeoutRef[key]);
    }

    saveTimeoutRef[key] = setTimeout(async () => {
      if (!auditId) return;

      try {
        await upsertAnswer({
          audit_id: auditId,
          block_code: blockCode,
          question_code: questionCode,
          value: value,
          updated_at: new Date().toISOString()
        });

        const updatedAnswers = { ...answers, [key]: value };
        await updateCompletionPercentage(updatedAnswers);
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }, 800);
  };

  const saveAnswer = async (blockCode: string, questionCode: string, value: any) => {
    if (!auditId) return;

    const key = `${blockCode}_${questionCode}`;

    if (saveTimeoutRef[key]) {
      clearTimeout(saveTimeoutRef[key]);
    }

    try {
      await upsertAnswer({
        audit_id: auditId,
        block_code: blockCode,
        question_code: questionCode,
        value: value,
        updated_at: new Date().toISOString()
      });

      const updatedAnswers = { ...answers, [key]: value };
      setAnswers(updatedAnswers);
      await updateCompletionPercentage(updatedAnswers);
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const updateCompletionPercentage = async (currentAnswers: Record<string, any>) => {
    if (!auditId) return;

    let totalQuestions = 0;
    let answeredQuestions = 0;

    questionnaireBlocks.forEach(block => {
      block.questions.forEach(question => {
        const shouldDisplay = !question.conditional ||
          currentAnswers[`${block.code}_${question.conditional.dependsOn}`] === question.conditional.value;

        if (!shouldDisplay) return;

        totalQuestions++;

        const key = `${block.code}_${question.code}`;
        const value = currentAnswers[key];

        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            if (value.length > 0) answeredQuestions++;
          } else {
            answeredQuestions++;
          }
        }
      });
    });

    const percentage = totalQuestions > 0 ? Math.min(100, Math.round((answeredQuestions / totalQuestions) * 100)) : 0;

    await updateAudit(auditId, { completion_percentage: percentage });

    if (audit) {
      setAudit({ ...audit, completion_percentage: percentage });
    }
  };

  const calculateAndFinalize = async () => {
    if (!auditId) return;
    setSaving(true);

    try {
      await updateAudit(auditId, {
        status: 'finalise',
        audit_date_end: new Date().toISOString().split('T')[0]
      });

      onViewDashboard(auditId);
    } catch (error) {
      console.error('Error finalizing audit:', error);
      alert('Erreur lors de la finalisation');
    } finally {
      setSaving(false);
    }
  };

  const renderQuestionInput = (block: string, question: Question) => {
    const key = `${block}_${question.code}`;
    const value = answers[key];

    const shouldDisplay = !question.conditional || answers[`${block}_${question.conditional.dependsOn}`] === question.conditional.value;

    if (!shouldDisplay) return null;

    const commonClasses = "w-full px-4 py-2.5 border-2 border-[#DAD7CD] rounded-lg focus:ring-2 focus:ring-[#48737F] focus:border-[#48737F] bg-white text-[#48737F] placeholder-[#CCBB90]";

    switch (question.type) {
      case 'number':
        const inputKey = `${block}_${question.code}`;
        const displayValue = localInputs[inputKey] !== undefined ? localInputs[inputKey] : (value ?? '');

        return (
          <div key={question.code} className="space-y-2">
            <label className="block text-sm font-semibold text-[#48737F]">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-xs text-[#CCBB90]">{question.help_text}</p>
            )}
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={displayValue}
                onChange={(e) => {
                  const val = e.target.value;

                  if (val === '' || val === '-' || /^-?\d*\.?\d*$/.test(val)) {
                    setLocalInputs(prev => ({ ...prev, [inputKey]: val }));

                    if (val === '' || val === '-') {
                      setAnswers(prev => ({ ...prev, [inputKey]: null }));
                      debouncedSave(block, question.code, null);
                    } else {
                      const numVal = parseFloat(val);
                      if (!isNaN(numVal)) {
                        setAnswers(prev => ({ ...prev, [inputKey]: numVal }));
                        debouncedSave(block, question.code, numVal);
                      }
                    }
                  }
                }}
                onBlur={(e) => {
                  const val = e.target.value;
                  setLocalInputs(prev => {
                    const newInputs = { ...prev };
                    delete newInputs[inputKey];
                    return newInputs;
                  });

                  if (val === '' || val === '-') {
                    saveAnswer(block, question.code, null);
                  } else {
                    const numVal = parseFloat(val);
                    if (!isNaN(numVal)) {
                      saveAnswer(block, question.code, numVal);
                    }
                  }
                }}
                className={commonClasses}
                required={question.required}
                placeholder="0"
              />
              {question.unit && (
                <div className="absolute right-3 top-3 text-[#48737F] opacity-50 text-sm pointer-events-none">
                  {question.unit}
                </div>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={question.code} className="space-y-2">
            <label className="block text-sm font-semibold text-[#48737F]">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-xs text-[#CCBB90]">{question.help_text}</p>
            )}
            <textarea
              value={value ?? ''}
              onChange={(e) => saveAnswer(block, question.code, e.target.value)}
              className={commonClasses}
              rows={3}
              required={question.required}
            />
          </div>
        );

      case 'select':
        return (
          <div key={question.code} className="space-y-2">
            <label className="block text-sm font-semibold text-[#48737F]">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-xs text-[#CCBB90]">{question.help_text}</p>
            )}
            <select
              value={value ?? ''}
              onChange={(e) => saveAnswer(block, question.code, e.target.value)}
              className={commonClasses}
              required={question.required}
            >
              <option value="">Sélectionner...</option>
              {question.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={question.code} className="space-y-2">
            <label className="block text-sm font-semibold text-[#48737F]">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-xs text-[#CCBB90]">{question.help_text}</p>
            )}
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(value || []).includes(option)}
                    onChange={(e) => {
                      const current = value || [];
                      const newValue = e.target.checked
                        ? [...current, option]
                        : current.filter((v: string) => v !== option);
                      saveAnswer(block, question.code, newValue);
                    }}
                    className="rounded border-[#DAD7CD] bg-white text-[#48737F] focus:ring-[#48737F]"
                  />
                  <span className="text-sm text-[#48737F]">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'boolean':
        return (
          <div key={question.code} className="space-y-2">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => saveAnswer(block, question.code, e.target.checked)}
                className="rounded border-[#DAD7CD] bg-white text-[#48737F] focus:ring-[#48737F] w-5 h-5"
              />
              <div>
                <span className="text-sm font-semibold text-[#48737F]">
                  {question.label}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </span>
                {question.help_text && (
                  <p className="text-xs text-[#CCBB90] mt-1">{question.help_text}</p>
                )}
              </div>
            </label>
          </div>
        );

      case 'date':
        return (
          <div key={question.code} className="space-y-2">
            <label className="block text-sm font-semibold text-[#48737F]">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-xs text-[#CCBB90]">{question.help_text}</p>
            )}
            <input
              type="date"
              value={value ?? ''}
              onChange={(e) => saveAnswer(block, question.code, e.target.value)}
              className={commonClasses}
              required={question.required}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#48737F]"></div>
          <Calculator className="w-6 h-6 text-[#CCBB90] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="text-center py-12">
        <p className="text-[#48737F]">Audit introuvable</p>
        <button onClick={onBack} className="mt-4 text-[#48737F] hover:underline">
          Retour
        </button>
      </div>
    );
  }

  if (showIntro) {
    const top25Sections = [
      {
        title: '⭐ TOP 25 Questions ESSENTIELLES pour un Audit CrossFit',
        description: 'Ces questions clés suffisent pour établir un premier diagnostic fiable.',
        items: []
      },
      {
        title: '🏢 IDENTITÉ & INFRASTRUCTURE (5 questions)',
        items: [
          { code: 'raison_sociale', label: 'Identité de base' },
          { code: 'annee_ouverture', label: 'Ancienneté/maturité de la box' },
          { code: 'surface_crossfit', label: 'Surface exploitable pour calcul du ratio revenus/m²' },
          { code: 'capacite_max_cours', label: 'Capacité opérationnelle' },
          { code: 'nb_places_parking', label: 'Accessibilité (impact acquisition)' }
        ]
      },
      {
        title: '💰 FINANCE - TOP PRIORITÉ (8 questions)',
        items: [
          { code: 'ca_abonnements_mensuels', label: 'Source principale de revenus' },
          { code: 'loyer_mensuel_ht', label: 'Charge fixe #1 (20-30% du CA typiquement)' },
          { code: 'electricite_annuel', label: 'Charge fixe #2' },
          { code: 'salaires_bruts_coachs', label: 'Masse salariale (30-40% du CA)' },
          { code: 'charges_sociales_patronales', label: 'Charges sur salaires' },
          { code: 'tresorerie_actuelle', label: 'Santé financière immédiate' },
          { code: 'emprunts_capital_restant', label: 'Endettement' },
          { code: 'echeance_mensuelle_emprunts', label: 'Impact trésorerie mensuelle' }
        ]
      },
      {
        title: '👥 MEMBRES - CRITIQUES (7 questions)',
        items: [
          { code: 'nb_membres_actifs_total', label: 'Base client' },
          { code: 'nb_membres_illimite', label: 'Segment premium (plus rentable)' },
          { code: 'prix_illimite_sans_engagement', label: 'Tarif de référence' },
          { code: 'nb_essais_mois_actuel', label: 'Pipeline d’acquisition' },
          { code: 'nb_conversions_mois_actuel', label: 'Performance commerciale' },
          { code: 'nb_resiliations_mois_actuel', label: 'Churn rate' },
          { code: 'duree_moyenne_adhesion', label: 'Lifetime Value indicator' }
        ]
      },
      {
        title: '📅 PLANNING & OPÉRATIONS (3 questions)',
        items: [
          { code: 'nb_cours_lundi → nb_cours_vendredi', label: 'Volume semaine (groupées en 1 métrique)' },
          { code: 'participants_moyen_cours', label: 'Taux d’occupation' },
          { code: 'nb_cours_complets_semaine', label: 'Saturation/capacité' }
        ]
      },
      {
        title: '👨‍🏫 RH & COACHING (2 questions)',
        items: [
          { code: 'nb_total_coachs', label: 'Ressources humaines' },
          { code: 'remuneration_coach_temps_plein', label: 'Structure de coûts RH' }
        ]
      }
    ];

    return (
      <div className="max-w-5xl mx-auto space-y-6 px-2 md:px-0">
        <div className="bg-white rounded-xl shadow-md p-8 border-b-2 border-[#DAD7CD]">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-[#48737F]">Page principale de l’audit</h1>
              <p className="text-[#CCBB90] mt-2">
                Avant de commencer le questionnaire complet, voici les 25 questions essentielles à collecter.
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-[#48737F] hover:bg-[#48737F]/10 rounded-lg transition-all border border-[#48737F]/20"
            >
              Retour
            </button>
          </div>

          <div className="space-y-6">
            {top25Sections.map((section, index) => (
              <div key={section.title} className="border border-[#DAD7CD]/70 rounded-xl p-5">
                <h2 className="text-lg font-semibold text-[#48737F] mb-2">
                  {section.title}
                </h2>
                {section.description && (
                  <p className="text-sm text-[#CCBB90] mb-3">{section.description}</p>
                )}
                {section.items.length > 0 && (
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item.code} className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                        <span className="text-sm font-mono text-[#48737F] bg-[#48737F]/10 px-2 py-1 rounded-md inline-flex w-fit">
                          {item.code}
                        </span>
                        <span className="text-sm text-[#48737F]/90">{item.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {index === 0 && (
                  <div className="mt-4 text-sm text-[#48737F]/80">
                    Une fois ces réponses saisies, le bilan mettra en avant les ratios clés calculables.
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#48737F]/70">
              Vous pouvez commencer l’audit maintenant ou revenir plus tard.
            </p>
            <button
              onClick={() => setShowIntro(false)}
              className="px-6 py-3 bg-[#48737F] text-white rounded-lg hover:bg-[#3A5C66] transition-all shadow-md font-semibold"
            >
              Commencer le questionnaire
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentBlock = questionnaireBlocks[currentBlockIndex];

  const getBlockCompletion = (blockIndex: number) => {
    const block = questionnaireBlocks[blockIndex];
    let totalQuestions = 0;
    let answeredQuestions = 0;

    block.questions.forEach(question => {
      const shouldDisplay = !question.conditional ||
        answers[`${block.code}_${question.conditional.dependsOn}`] === question.conditional.value;
      if (!shouldDisplay) return;

      totalQuestions++;
      const key = `${block.code}_${question.code}`;
      const value = answers[key];

      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) answeredQuestions++;
        } else {
          answeredQuestions++;
        }
      }
    });

    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  };

  const validateCurrentBlock = () => {
    const block = questionnaireBlocks[currentBlockIndex];
    const missingFields: string[] = [];

    block.questions.forEach(question => {
      if (!question.required) return;

      const shouldDisplay = !question.conditional ||
        answers[`${block.code}_${question.conditional.dependsOn}`] === question.conditional.value;

      if (!shouldDisplay) return;

      const key = `${block.code}_${question.code}`;
      const value = answers[key];

      if (value === null || value === undefined || value === '') {
        missingFields.push(question.label);
      } else if (Array.isArray(value) && value.length === 0) {
        missingFields.push(question.label);
      }
    });

    return missingFields;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2 md:px-0">
      {/* Header avec progression */}
      <div className="bg-[#48737F] text-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/20 rounded-lg transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold truncate text-[#DAD7CD]">
                Audit - {audit.gym?.name}
              </h1>
              <p className="text-[#CCBB90] text-sm mt-1">
                {audit.status === 'finalise' ? 'Audit finalisé' : 'Remplissez toutes les sections'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {audit.status === 'finalise' && (
              <button
                onClick={() => onViewDashboard(audit.id)}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white text-[#48737F] rounded-lg hover:bg-[#DAD7CD] transition-all shadow-md font-semibold"
              >
                <Calculator className="w-5 h-5" />
                <span className="hidden md:inline">Voir le diagnostic</span>
                <span className="md:hidden">Diagnostic</span>
              </button>
            )}
            {audit.status !== 'finalise' && (
              <button
                onClick={calculateAndFinalize}
                disabled={saving || audit.completion_percentage < 50}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[#CCBB90] text-[#48737F] rounded-lg hover:bg-[#B8A780] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-semibold"
              >
                <Calculator className="w-5 h-5" />
                <span className="hidden md:inline">{saving ? 'Calcul en cours...' : 'Calculer & Finaliser'}</span>
                <span className="md:hidden">{saving ? 'Calcul...' : 'Finaliser'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[#DAD7CD]">Progression globale</span>
            <span className="font-bold text-lg">{Math.round(audit.completion_percentage)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${audit.completion_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs des blocs */}
      <div className="bg-white rounded-xl shadow-md p-4 border-b-2 border-[#DAD7CD]">
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {questionnaireBlocks.map((block, index) => {
            const completion = getBlockCompletion(index);
            const isActive = index === currentBlockIndex;
            const isComplete = completion === 100;

            return (
              <button
                key={block.code}
                onClick={() => setCurrentBlockIndex(index)}
                className={`relative flex flex-col items-center shrink-0 min-w-[120px] px-4 py-3 rounded-lg text-xs font-medium transition-all ${isActive
                    ? 'bg-[#48737F] text-white shadow-md scale-105'
                    : isComplete
                      ? 'bg-[#7FA99B]/10 text-[#7FA99B] hover:bg-[#7FA99B]/20'
                      : 'bg-[#DAD7CD]/30 text-[#48737F] hover:bg-[#DAD7CD]/50'
                  }`}
              >
                <div className="flex items-center space-x-1 mb-1">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-white/20' : isComplete ? 'bg-[#7FA99B]/20' : 'bg-[#48737F]/10'
                    }`}>
                    {isComplete ? <Check className="w-4 h-4" /> : index + 1}
                  </span>
                </div>
                <span className="text-center leading-tight">
                  {block.title.replace(/^\d+(?:\.\d+)*\s*/, '')}
                </span>
                <div className="mt-2 w-full bg-white/30 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${isActive ? 'bg-white' : isComplete ? 'bg-[#7FA99B]' : 'bg-[#48737F]/50'
                      }`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-xl shadow-md p-8 border-b-2 border-[#DAD7CD]">
        <div className="mb-6 pb-5 border-b-2 border-[#DAD7CD]">
          <h2 className="text-xl font-semibold text-[#48737F]">{currentBlock.title}</h2>
          {currentBlock.description && (
            <p className="text-[#CCBB90] text-sm mt-1">{currentBlock.description}</p>
          )}
        </div>

        <div className="space-y-6">
          {currentBlock.questions.map((question) =>
            renderQuestionInput(currentBlock.code, question)
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-[#DAD7CD]">
          <button
            onClick={() => setCurrentBlockIndex(Math.max(0, currentBlockIndex - 1))}
            disabled={currentBlockIndex === 0}
            className="px-4 py-2 text-[#48737F] hover:bg-[#48737F]/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-[#48737F]/30 font-medium"
          >
            Précédent
          </button>
          {currentBlockIndex < questionnaireBlocks.length - 1 ? (
            <button
              onClick={() => {
                const missingFields = validateCurrentBlock();
                if (missingFields.length > 0) {
                  alert(`Veuillez remplir les champs obligatoires suivants :\n\n- ${missingFields.join('\n- ')}`);
                } else {
                  setCurrentBlockIndex(currentBlockIndex + 1);
                }
              }}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#48737F] text-white rounded-lg hover:bg-[#3A5C66] transition-all shadow-md font-semibold"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={calculateAndFinalize}
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#7FA99B] text-white rounded-lg hover:bg-[#6A9084] transition-all disabled:opacity-50 shadow-md font-semibold"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Finalisation...' : 'Terminer l\'audit'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
