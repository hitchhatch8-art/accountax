import StatsGrid from '../components/StatsGrid';
import QuickActions from '../components/QuickActions';
import BankSyncWidget from '../components/BankSyncWidget';
import TVACalculator from '../components/TVACalculator';
import FinanceChart from '../components/FinanceChart';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/formatters';

const Dashboard = () => {
  const { language, t } = useLanguage();
  const { invoices, user } = useStore();

  const recentInvoices = invoices.slice(0, 3);

  return (
    <>
      <header>
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold tracking-tight mb-2"
        >
          {language === 'fr' ? `Bienvenue, ${user?.name || 'Utilisateur'}` : `مرحباً، ${user?.name || 'مستخدم'}`} 👋
        </motion.h2>
        <p className="text-zinc-500">
          {language === 'fr' 
            ? "Voici l'état de votre activité pour aujourd'hui." 
            : "إليك حالة نشاطك لهذا اليوم."}
        </p>
      </header>

      <StatsGrid />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-4">
              <span>{language === 'fr' ? 'Actions Rapides' : 'إجراءات سريعة'}</span>
              <div className="h-px flex-1 bg-t-border"></div>
            </h3>
            <QuickActions />
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-4">
                <span>{t('recentActivity')}</span>
                <div className="h-px w-32 bg-t-border"></div>
              </h3>
              <button className="text-xs text-indigo-400 font-bold hover:underline">
                {language === 'fr' ? 'Voir tout' : 'عرض الكل'}
              </button>
            </div>
            
            <div className="glass-card overflow-hidden">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-5 border-b border-t-border last:border-0 hover:bg-surface-hover transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{inv.clientName} - {inv.number}</p>
                        <p className="text-xs text-zinc-500">{inv.date} • {language === 'fr' ? 'Facture Émise' : 'فاتورة مصدرة'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(inv.totalTTC, inv.currency)}</p>
                      <p className={`text-[10px] font-bold uppercase ${
                        inv.status === 'paid' ? 'text-emerald-500' : 
                        inv.status === 'overdue' ? 'text-rose-500' : 
                        inv.status === 'pending' ? 'text-amber-500' : 
                        'text-zinc-500'
                      }`}>
                        {t(inv.status)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-zinc-500 text-sm italic">
                  {language === 'fr' ? 'Aucune activité récente' : 'لا توجد نشاطات أخيرة'}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="xl:col-span-1 space-y-8">
          <FinanceChart />
          <BankSyncWidget />
          <TVACalculator />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
