import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
  billingCycle: 'monthly' | 'yearly';
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, planName, price, billingCycle }) => {
  const { language } = useLanguage();
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    // Simulate CMI 3D Secure & Payment Processing Delay
    setTimeout(() => {
      setStep('success');
      
      // Auto close after success
      setTimeout(() => {
        setStep('form'); // reset
        onClose();
      }, 3000);
    }, 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-modal border border-t-border-strong rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {step === 'form' && (
            <>
              <div className="p-6 border-b border-t-border flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {language === 'fr' ? 'Paiement Sécurisé' : 'الدفع الآمن'}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      {planName} - {price} MAD / {billingCycle === 'monthly' ? (language === 'fr' ? 'MOIS' : 'شهر') : (language === 'fr' ? 'AN' : 'سنة')}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} aria-label="Close" title="Close" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    {language === 'fr' ? 'Nom sur la carte' : 'الاسم على البطاقة'}
                  </label>
                  <input required placeholder="Amine Exemple" type="text" className="w-full bg-surface border border-t-border-strong rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500/50 transition-colors" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    {language === 'fr' ? 'Numéro de carte' : 'رقم البطاقة التسلسلي'}
                  </label>
                  <div className="relative">
                    <input required placeholder="0000 0000 0000 0000" type="text" maxLength={19} className="w-full bg-surface border border-t-border-strong rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500/50 font-mono tracking-widest transition-colors" />
                    <CreditCard size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      {language === 'fr' ? 'Expiration' : 'تاريخ الانتهاء'}
                    </label>
                    <input required placeholder="MM/YY" maxLength={5} type="text" className="w-full bg-surface border border-t-border-strong rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500/50 font-mono text-center transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      CVV
                    </label>
                    <input required placeholder="123" maxLength={3} type="text" className="w-full bg-surface border border-t-border-strong rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500/50 font-mono text-center transition-colors" />
                  </div>
                </div>

                <button type="submit" className="w-full mt-4 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-widest uppercase text-xs shadow-lg shadow-indigo-500/25 flex justify-center items-center gap-2 transition-all active:scale-95">
                  <Lock size={16} />
                  {language === 'fr' ? `Payer ${price} MAD` : `دفع ${price} درهم`}
                </button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-zinc-500 text-[10px] uppercase font-bold">
                  <Lock size={10} />
                  Sécurisé par CMI (Centre Monétique Interbancaire)
                </div>
              </form>
            </>
          )}

          {step === 'processing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 flex flex-col items-center justify-center text-center">
              <Loader2 size={48} className="text-indigo-500 animate-spin mb-6 relative z-10" />
              <h4 className="text-xl font-bold mb-2">
                {language === 'fr' ? 'Traitement en cours...' : 'جاري معالجة الدفع...'}
              </h4>
              <p className="text-zinc-500 text-sm">
                {language === 'fr' ? 'Sécurisation 3D Secure via votre banque.' : 'جاري تأمين العملية عبر البنك الخاص بك.'}
              </p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
                <CheckCircle2 size={40} />
              </div>
              <h4 className="text-2xl font-black mb-2 text-emerald-400">
                {language === 'fr' ? 'Paiement Réussi !' : 'عملية دفع ناجحة!'}
              </h4>
              <p className="text-zinc-400 text-sm">
                {language === 'fr' ? `Bienvenue dans l'abonnement ${planName}. Vos avantages sont désormais actifs.` : `مرحباً بك في باقة ${planName}. تمت تفعيل مميزاتك بنجاح.`}
              </p>
            </motion.div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckoutModal;
