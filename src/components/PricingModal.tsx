import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShieldCheck, Zap, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../store/useStore';
import CheckoutModal from './CheckoutModal';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { user } = useStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [checkoutPlan, setCheckoutPlan] = useState<{name: string, price: string} | null>(null);

  if (!isOpen) return null;

  const plans = [
    {
      name: 'Starter',
      target: language === 'fr' ? 'Auto-entrepreneurs & Freelances' : 'المقاولون الذاتيون والمستقلون',
      priceMonthly: '49',
      priceYearly: '490',
      description: language === 'fr' ? 'Idéal pour démarrer sans prise de tête.' : 'مثالي كبداية بدون تعقيدات.',
      features: [
        language === 'fr' ? 'Gestion des clients' : 'إدارة العملاء',
        language === 'fr' ? 'Création de factures' : 'إنشاء وتصدير الفواتير',
        language === 'fr' ? 'Suivi simplifié TVA' : 'تتبع مبسط للضريبة',
        language === 'fr' ? 'Jusqu\'à 50 documents/mois' : 'حتى 50 وثيقة/شهر',
      ],
      color: 'bg-zinc-800',
      icon: Zap,
      button: language === 'fr' ? 'Démarrer l\'essai gratuit' : 'ابدأ التجربة المجانية',
    },
    {
      name: 'Pro',
      popular: true,
      target: language === 'fr' ? 'TPE & PME Marocaines' : 'الشركات الصغرى والمتوسطة',
      priceMonthly: '99',
      priceYearly: '990',
      description: language === 'fr' ? 'Le cœur de votre comptabilité automatisée.' : 'أساس المحاسبة المؤتمتة لشركتك.',
      features: [
        language === 'fr' ? 'Tout dans Starter' : 'كافة مزايا Starter',
        language === 'fr' ? 'Clients et Factures illimités' : 'عملاء وفواتير غير محدودة',
        language === 'fr' ? 'Rapports avancés (TVA / IS)' : 'تقارير متقدمة (TVA / IS)',
        language === 'fr' ? 'Rappels DGI & CNSS' : 'تنبيهات أوتوماتيكية DGI / CNSS',
      ],
      color: 'bg-indigo-600',
      icon: Star,
      button: language === 'fr' ? 'Passer au Pro' : 'انتقل إلى Pro',
    },
    {
      name: 'Premium',
      target: language === 'fr' ? 'Cabinets & Experts-comptables' : 'المحاسبون والخبراء',
      priceMonthly: '199',
      priceYearly: '1990',
      description: language === 'fr' ? 'Puissance maximale et gestion multi-comptes.' : 'أقصى أداء مع إدارة شركات متعددة.',
      features: [
        language === 'fr' ? 'Tout dans Pro' : 'كافة مزايا Pro',
        language === 'fr' ? 'Gestion Multi-Sociétés' : 'شركات متعددة Multi-company',
        language === 'fr' ? 'Connexion Bancaire (Bank sync)' : 'ربط بنكي متزامن',
        language === 'fr' ? 'Export Comptable Avancé & Support VIP' : 'استخراج محاسبي متقدم ودعم فوري',
      ],
      color: 'bg-amber-500',
      icon: ShieldCheck,
      button: language === 'fr' ? 'Contacter les ventes' : 'تواصل مع الدعم',
    }
  ];

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-6xl my-auto relative"
          >
            <div className="glass-card p-6 md:p-10 overflow-hidden relative">
              {/* Background glow */}
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[100px] -z-10 rounded-full"></div>
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-xl text-muted-foreground hover:bg-surface-active hover:text-foreground transition-all bg-surface z-10"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-10 mt-4">
                <motion.h2 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl md:text-5xl font-black mb-4 tracking-tighter"
                >
                  {language === 'fr' ? 'Automatisez votre gestion en un clic' : 'أتمتة كاملة لإدارتك بضغطة زر'}
                </motion.h2>
                <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base font-medium">
                  {language === 'fr' 
                    ? 'Essayez gratuitement pendant 7 jours sans carte bancaire. Découvrez la tranquillité d\'esprit.' 
                    : 'جرّب المنصة 7 أيام مجاناً وبدون بطاقة بنكية. جرب الراحة الذهنية والمحاسبية.'}
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center mt-8 gap-4">
                  <span className={`text-sm font-bold transition-colors ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {language === 'fr' ? 'Mensuel' : 'شهري'}
                  </span>
                  <button 
                    onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                    className="w-14 h-7 bg-muted rounded-full relative border border-t-border"
                  >
                    <motion.div 
                      layout
                      className="w-5 h-5 bg-indigo-500 rounded-full absolute top-1"
                      animate={{ 
                        left: billingCycle === 'monthly' ? '4px' : 'calc(100% - 24px)' 
                      }}
                    />
                  </button>
                  <span className={`text-sm font-bold flex items-center gap-2 transition-colors ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {language === 'fr' ? 'Annuel' : 'سنوي'}
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                      {language === 'fr' ? '-2 mois offerts' : 'شهرين مجاناً'}
                    </span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {plans.map((plan, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative flex flex-col p-6 lg:p-8 rounded-[2rem] bg-card border transition-all duration-300 ${plan.popular ? 'border-indigo-500/50 shadow-2xl shadow-indigo-500/10 md:-translate-y-2' : 'border-t-border hover:border-t-border-strong'}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-500 text-white text-[10px] uppercase font-black tracking-widest rounded-full shadow-lg">
                        {language === 'fr' ? 'RECOMMANDÉ' : 'الأكثر طلباً'}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-black">{plan.name}</h3>
                      <plan.icon size={20} className={plan.popular ? 'text-indigo-400' : 'text-zinc-500'} />
                    </div>
                    
                    <div className="inline-block px-2 py-1 bg-surface rounded-md text-[10px] font-bold text-dimmer mb-4 w-fit">
                      {plan.target}
                    </div>

                    <p className="text-xs text-zinc-500 min-h-[32px] leading-relaxed mb-6">{plan.description}</p>
                    
                    <div className="mb-8">
                      <div className="flex items-end gap-1">
                        <span className="text-4xl lg:text-5xl font-black tracking-tight">
                          {billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                        </span>
                        <span className="text-sm text-zinc-500 font-bold mb-1">
                          MAD / {billingCycle === 'monthly' ? (language === 'fr' ? 'mois' : 'شهر') : (language === 'fr' ? 'an' : 'سنة')}
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-4 flex-1 mb-8">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <Check size={16} className="text-emerald-400 shrink-0 mt-0.5 font-bold" />
                          <span className="text-dim font-medium leading-snug tracking-wide">{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      disabled={plan.name === 'Starter' && user?.plan === 'STARTER'}
                      onClick={() => {
                        if (plan.name === 'Starter' && user?.plan === 'STARTER') return;
                        setCheckoutPlan({ name: plan.name, price: billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly });
                      }}
                      className={`w-full py-4 rounded-2xl font-black tracking-wider transition-all ${
                        (plan.name === 'Starter' && user?.plan === 'STARTER')
                          ? 'bg-muted text-muted-foreground cursor-not-allowed border border-t-border flex-shrink-0'
                          : plan.popular 
                            ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 text-white' 
                            : 'bg-surface hover:bg-surface-active text-foreground'
                      }`}
                    >
                      {(plan.name === 'Starter' && user?.plan === 'STARTER') ? (language === 'fr' ? 'Plan Actuel' : 'الخطة الحالية') : plan.button}
                    </button>
                    
                  </motion.div>
                ))}
              </div>

              {/* Moroccan Banking Footer Info */}
              <div className="mt-10 flex flex-col items-center justify-center gap-2">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                  {language === 'fr' ? 'Paiement Sécurisé au Maroc' : 'دفع آمن بالأسواق المغربية'}
                </p>
                <div className="flex items-center gap-4 text-zinc-400">
                  <span className="text-xs font-semibold">CMI</span>
                  <span className="text-xs font-semibold px-2 py-1 bg-surface rounded">Local Cards</span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Payment Flow Modal */}
    {checkoutPlan && (
      <CheckoutModal 
        isOpen={!!checkoutPlan}
        onClose={() => setCheckoutPlan(null)}
        planName={checkoutPlan.name}
        price={checkoutPlan.price}
        billingCycle={billingCycle}
      />
    )}
    </>
  );
};

export default PricingModal;
