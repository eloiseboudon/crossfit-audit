import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Calculator, ChevronRight, Check } from 'lucide-react';
import { getAudit, listAnswers, updateAudit, upsertAnswer } from '../lib/api';
import { Audit, Answer, Question } from '../lib/types';
import { questionnaireBlocks } from '../lib/questionnaire';

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

    const commonClasses = "w-full px-4 py-2 border-2 border-[#D6C7A1]/30 rounded-lg focus:ring-2 focus:ring-[#4F7A7E] focus:border-[#4F7A7E] bg-black/40 text-[#F4F3EE] placeholder-[#D6C7A1]/40";

    switch (question.type) {
      case 'number':
        const inputKey = `${block}_${question.code}`;
        const displayValue = localInputs[inputKey] !== undefined ? localInputs[inputKey] : (value ?? '');

        return (
          <div key={question.code} className="space-y-2">
            <label className="block text-sm font-semibold text-[#F4F3EE]">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-xs text-[#D6C7A1]/70">{question.help_text}</p>
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
                <div className="absolute right-3 top-2.5 text-tulip-blue/50 text-sm pointer-events-none">
                  {question.unit}
                </div>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={question.code} className="space-y-2">
            <label className="block text-sm font-semibold text-[#F4F3EE]">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-xs text-[#D6C7A1]/70">{question.help_text}</p>
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
            <label className="block text-sm font-semibold text-[#F4F3EE]">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-xs text-[#D6C7A1]/70">{question.help_text}</p>
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
            <label className="block text-sm font-semibold text-[#F4F3EE]">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-xs text-[#D6C7A1]/70">{question.help_text}</p>
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
                    className="rounded border-[#D6C7A1]/30 bg-black/40 text-[#4F7A7E] focus:ring-[#4F7A7E]"
                  />
                  <span className="text-sm text-[#F4F3EE]">{option}</span>
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
                className="rounded border-[#D6C7A1]/30 bg-black/40 text-[#4F7A7E] focus:ring-[#4F7A7E] w-5 h-5"
              />
              <div>
                <span className="text-sm font-semibold text-[#F4F3EE]">
                  {question.label}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </span>
                {question.help_text && (
                  <p className="text-xs text-[#D6C7A1]/70 mt-1">{question.help_text}</p>
                )}
              </div>
            </label>
          </div>
        );

      case 'date':
        return (
          <div key={question.code} className="space-y-2">
            <label className="block text-sm font-semibold text-[#F4F3EE]">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {question.help_text && (
              <p className="text-xs text-[#D6C7A1]/70">{question.help_text}</p>
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#4F7A7E] glow-teal"></div>
          <Calculator className="w-6 h-6 text-[#D6C7A1] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="text-center py-12">
        <p className="text-tulip-blue/70">Audit introuvable</p>
        <button onClick={onBack} className="mt-4 text-tulip-blue hover:underline">
          Retour
        </button>
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
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
      <div className="bg-gradient-to-r from-[#4F7A7E] to-[#2F4F5A] text-white rounded-xl shadow-xl p-4 md:p-6 border-2 border-[#4F7A7E]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/20 rounded-card transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold truncate">
                Audit - {audit.gym?.name}
              </h1>
              <p className="text-white/80 text-xs md:text-sm mt-1">
                {audit.status === 'finalise' ? 'Audit finalisé' : 'Remplissez toutes les sections'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:space-x-3">
            {audit.status === 'finalise' && (
              <button
                onClick={() => onViewDashboard(audit.id)}
                className="flex items-center space-x-2 px-3 md:px-5 py-2 md:py-2.5 bg-white text-tulip-green rounded-card hover:bg-white/90 transition-all shadow-md font-medium text-sm"
              >
                <Calculator className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">Voir le diagnostic</span>
                <span className="md:hidden">Diagnostic</span>
              </button>
            )}
            {audit.status !== 'finalise' && (
              <button
                onClick={calculateAndFinalize}
                disabled={saving || audit.completion_percentage < 50}
                className="flex items-center space-x-2 px-3 md:px-5 py-2 md:py-2.5 bg-white text-tulip-green rounded-card hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-medium text-sm"
              >
                <Calculator className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden md:inline">{saving ? 'Calcul en cours...' : 'Calculer & Finaliser'}</span>
                <span className="md:hidden">{saving ? 'Calcul...' : 'Finaliser'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2 md:space-y-3">
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="font-medium">Progression globale</span>
            <span className="font-bold text-base md:text-lg">{Math.round(audit.completion_percentage)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 md:h-3 overflow-hidden">
            <div
              className="bg-white h-2 md:h-3 rounded-full transition-all duration-500 shadow-inner"
              style={{ width: `${audit.completion_percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-black/60 to-black/40 rounded-xl shadow-xl border-2 border-[#D6C7A1]/30 p-2 md:p-4 backdrop-blur-sm">
        <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-thin scrollbar-thumb-tulip-green/30 scrollbar-track-tulip-beige/20">
          {questionnaireBlocks.map((block, index) => {
            const completion = getBlockCompletion(index);
            const isActive = index === currentBlockIndex;
            const isComplete = completion === 100;

            return (
              <button
                key={block.code}
                onClick={() => setCurrentBlockIndex(index)}
                className={`relative flex flex-col items-center shrink-0 w-20 md:min-w-[120px] md:w-auto px-2 md:px-4 py-2 md:py-3 rounded-card text-[10px] md:text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-tulip-green to-tulip-green/80 text-white shadow-md md:scale-105'
                    : isComplete
                    ? 'bg-tulip-green-success/10 text-tulip-green-success hover:bg-tulip-green-success/20'
                    : 'bg-tulip-beige/30 text-tulip-blue hover:bg-tulip-beige/50'
                }`}
              >
                <div className="flex items-center space-x-1 mb-1">
                  <span className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold ${
                    isActive ? 'bg-white/20' : isComplete ? 'bg-tulip-green-success/20' : 'bg-tulip-blue/10'
                  }`}>
                    {isComplete ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : index + 1}
                  </span>
                </div>
                <span className="text-center leading-tight hidden md:block">{block.title.replace(/^\d+\.\s*/, '')}</span>
                <span className="text-center leading-tight md:hidden" title={block.title}>
                  {block.title.split(' ')[0].replace(/^\d+\.\s*/, '')}
                </span>
                <div className="mt-1 md:mt-2 w-full bg-white/30 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      isActive ? 'bg-white' : isComplete ? 'bg-tulip-green-success' : 'bg-tulip-blue/50'
                    }`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-black/60 to-black/40 rounded-xl shadow-xl border-2 border-[#4F7A7E]/30 p-4 md:p-8 backdrop-blur-sm">
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-bold text-[#F4F3EE] glow-text-teal">{currentBlock.title}</h2>
          {currentBlock.description && (
            <p className="text-[#D6C7A1]/80 text-sm mt-1">{currentBlock.description}</p>
          )}
        </div>

        <div className="space-y-6">
          {currentBlock.questions.map((question) =>
            renderQuestionInput(currentBlock.code, question)
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#D6C7A1]/20">
          <button
            onClick={() => setCurrentBlockIndex(Math.max(0, currentBlockIndex - 1))}
            disabled={currentBlockIndex === 0}
            className="px-4 py-2 text-[#D6C7A1] hover:bg-[#4F7A7E]/10 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-[#4F7A7E]/30"
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
              className="flex items-center space-x-2 px-4 py-2 bg-[#4F7A7E] text-[#F4F3EE] rounded-lg hover:glow-teal transition-all shadow-md font-semibold border border-[#4F7A7E]/50"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={calculateAndFinalize}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#6FBF73] to-[#4F7A7E] text-[#F4F3EE] rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-semibold border border-[#6FBF73]/50"
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
