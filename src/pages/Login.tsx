import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Lock, Mail, ArrowRight, User, Building, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { setAuth, fetchInitialData } = useStore();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [resetCode, setResetCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'login') {
        const data = await api.post('/auth/login', { email, password });
        setAuth(data.token, data.user);
        toast.success(language === 'fr' ? 'Connexion réussie' : 'تم تسجيل الدخول بنجاح');
        await fetchInitialData();
        navigate('/');
      } else if (authMode === 'register') {
        const data = await api.post('/auth/register', { email, password, name, companyName });
        setAuth(data.token, data.user);
        toast.success(language === 'fr' ? 'Compte créé avec succès' : 'تم تفعيل الحساب بنجاح');
        await fetchInitialData();
        navigate('/');
      } else if (authMode === 'forgot') {
        const data = await api.post('/auth/forgot-password', { email });
        toast.success(data.message, { duration: 5000 });
        if (data.mockCode) {
          // Dev convenience: Show the code in an alert
          window.alert(`[TEST ONLY] Your Reset Code for ${email} is: ${data.mockCode}`);
        }
        setAuthMode('reset');
      } else if (authMode === 'reset') {
        const data = await api.post('/auth/reset-password', { email, code: resetCode, newPassword: password });
        toast.success(data.message);
        setAuthMode('login');
        setPassword('');
        setResetCode('');
      }
    } catch (error: any) {
      toast.error(error.message || (language === 'fr' ? 'Une erreur est survenue' : 'حدث خطأ ما'));
    } finally {
      setLoading(false);
    }
  };

  const renderTitle = () => {
    if (authMode === 'forgot') return language === 'fr' ? 'Mot de passe oublié' : 'استرجاع كلمة المرور';
    if (authMode === 'reset') return language === 'fr' ? 'Nouveau mot de passe' : 'كلمة مرور جديدة';
    return 'AccounTax';
  };

  const renderSubtitle = () => {
    if (authMode === 'forgot') return language === 'fr' ? 'Entrez votre email pour recevoir le code' : 'أدخل بريدك الإلكتروني لتلقي الرمز';
    if (authMode === 'reset') return language === 'fr' ? 'Saisissez le code reçu et le nouveau mot de passe' : 'أدخل الرمز المستلم وكلمة المرور الجديدة';
    return language === 'fr' ? 'Le futur de la comptabilité au Maroc' : 'مستقبل المحاسبة في المغرب';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob animation-delay-4000"></div>

      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-t-border-strong p-10 w-full max-w-md z-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl relative"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-indigo-500/40 shadow-2xl mb-6">
            {(authMode === 'forgot' || authMode === 'reset') ? (
              <KeyRound className="text-white" size={32} />
            ) : (
              <span className="text-white font-bold text-3xl">A</span>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2 text-center">{renderTitle()}</h1>
          <p className="text-zinc-400 text-center text-sm px-4">
            {renderSubtitle()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="popLayout">
            {authMode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                    {language === 'fr' ? 'Nom complet' : 'الاسم الكامل'}
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="text" 
                      required={authMode === 'register'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tarik Benchekroun"
                      className="w-full bg-surface border border-t-border-strong rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                    {language === 'fr' ? 'Nom de l\'entreprise' : 'اسم الشركة'}
                  </label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="text" 
                      required={authMode === 'register'}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="AccounTax Service"
                      className="w-full bg-surface border border-t-border-strong rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-foreground"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {authMode === 'reset' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                  {language === 'fr' ? 'Code de réinitialisation' : 'رمز إعادة التعيين'}
                </label>
                <div className="relative group">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    required={authMode === 'reset'}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-surface border border-t-border-strong rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-foreground font-mono tracking-widest"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
              {language === 'fr' ? 'Email' : 'البريد الإلكتروني'}
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tarik@accountax.ma"
                disabled={authMode === 'reset'}
                className="w-full bg-surface border border-t-border-strong rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-foreground disabled:opacity-50"
              />
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {authMode !== 'forgot' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                    {authMode === 'reset' 
                      ? (language === 'fr' ? 'Nouveau mot de passe' : 'كلمة المرور الجديدة') 
                      : (language === 'fr' ? 'Mot de passe' : 'كلمة المرور')}
                  </label>
                  {authMode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => setAuthMode('forgot')}
                      className="text-xs text-indigo-400 font-bold hover:underline"
                    >
                      {language === 'fr' ? 'Oublié ?' : 'نسيت؟'}
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface border border-t-border-strong rounded-2xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-indigo-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            disabled={loading}
            type="submit"
            className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold tracking-wide rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group"
          >
            {loading 
              ? (language === 'fr' ? 'Chargement...' : 'جاري التحميل...') 
              : (authMode === 'login' 
                  ? (language === 'fr' ? 'Se connecter' : 'تسجيل الدخول')
                  : authMode === 'register' 
                    ? (language === 'fr' ? 'Créer un compte' : 'إنشاء حساب')
                    : authMode === 'forgot'
                      ? (language === 'fr' ? 'Recevoir le code' : 'إرسال الرمز')
                      : (language === 'fr' ? 'Réinitialiser' : 'إعادة التعيين')
                )
            }
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-t-border pt-6">
          <p className="text-sm text-zinc-400">
            {authMode === 'login' || authMode === 'forgot' || authMode === 'reset'
              ? (language === 'fr' ? "Pas encore de compte ?" : "ليس لديك حساب؟")
              : (language === 'fr' ? "Vous avez déjà un compte ?" : "هل لديك حساب بالفعل؟")
            }{' '}
            <button 
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'register' ? 'login' : 'register');
                setPassword('');
                setResetCode('');
              }}
              className="text-indigo-400 font-bold hover:underline ml-1"
            >
              {authMode === 'login' || authMode === 'forgot' || authMode === 'reset'
                ? (language === 'fr' ? "S'inscrire" : "إنشاء حساب")
                : (language === 'fr' ? "Se connecter" : "تسجيل الدخول")
              }
            </button>
          </p>
          {(authMode === 'forgot' || authMode === 'reset') && (
            <button 
              type="button"
              onClick={() => setAuthMode('login')}
              className="text-xs text-zinc-500 hover:text-foreground mt-4 font-medium transition-colors"
            >
              {language === 'fr' ? '← Retour à la connexion' : '← العودة لتسجيل الدخول'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
