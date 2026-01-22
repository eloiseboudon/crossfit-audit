import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Lock, Mail, AlertCircle, Dumbbell, TrendingUp, Shield, Zap } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setError('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tulip-beige-light via-white to-tulip-beige/20 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-tulip-blue to-tulip-green relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGg0MHYySDM2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CrossFit Audit Pro</h1>
              <p className="text-white/80 text-sm">Diagnostic et optimisation</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Optimisez la performance<br />de votre box CrossFit
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Système d'audit complet pour analyser, mesurer et améliorer chaque aspect de votre salle.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-tulip-green-success/30 p-2 rounded-lg shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Analyses détaillées</h3>
                <p className="text-white/80 text-sm">Scores piliers et KPIs personnalisés pour votre activité</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-tulip-green-success/30 p-2 rounded-lg shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Recommandations IA</h3>
                <p className="text-white/80 text-sm">Plans d'action priorisés et ROI estimé</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-tulip-green-success/30 p-2 rounded-lg shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Données sécurisées</h3>
                <p className="text-white/80 text-sm">Vos informations protégées et privées</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/60 text-sm">
            Développé par des experts CrossFit pour les propriétaires de box
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="max-w-md w-full">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-tulip-blue to-tulip-green rounded-2xl mb-4 shadow-lg">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-tulip-blue mb-2">
              CrossFit Audit Pro
            </h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-tulip-beige/30 p-8 sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-tulip-blue mb-2">
                {isLogin ? 'Bon retour !' : 'Créer un compte'}
              </h2>
              <p className="text-tulip-blue/60">
                {isLogin
                  ? 'Connectez-vous pour accéder à vos audits'
                  : 'Commencez à optimiser votre box dès maintenant'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 p-4 bg-tulip-red/10 border border-tulip-red/30 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 text-tulip-red flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-tulip-red font-medium">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-tulip-blue mb-2">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tulip-blue/40 group-focus-within:text-tulip-green transition-colors" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-tulip-beige rounded-xl focus:ring-2 focus:ring-tulip-green/20 focus:border-tulip-green outline-none transition-all bg-white hover:border-tulip-beige/80"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-tulip-blue mb-2">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tulip-blue/40 group-focus-within:text-tulip-green transition-colors" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-tulip-beige rounded-xl focus:ring-2 focus:ring-tulip-green/20 focus:border-tulip-green outline-none transition-all bg-white hover:border-tulip-beige/80"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-tulip-blue mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tulip-blue/40 group-focus-within:text-tulip-green transition-colors" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-tulip-beige rounded-xl focus:ring-2 focus:ring-tulip-green/20 focus:border-tulip-green outline-none transition-all bg-white hover:border-tulip-beige/80"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-tulip-green to-tulip-blue text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Chargement...
                  </span>
                ) : (
                  isLogin ? 'Se connecter' : 'Créer mon compte'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm text-tulip-green hover:text-tulip-blue font-semibold transition-colors"
              >
                {isLogin ? 'Pas encore de compte ? Inscrivez-vous' : 'Déjà inscrit ? Connectez-vous'}
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-tulip-blue/50 mt-6">
            <Shield className="w-4 h-4 inline mr-1" />
            Authentification locale sécurisée
          </p>
        </div>
      </div>
    </div>
  );
}
