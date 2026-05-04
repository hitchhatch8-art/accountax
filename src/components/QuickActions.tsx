import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../store/useStore';
import { CreditCard, RefreshCw, Download, ReceiptText } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { exportDataToCSV } from '../lib/exportUtils';

const QuickActions = () => {
  const { t, language } = useLanguage();
  const { invoices, fetchInitialData, addNotification } = useStore();

  const handleAction = async (actionId: string, label: string) => {
    switch (actionId) {
      case 'sync':
        toast.promise(
          fetchInitialData(),
          {
            loading: language === 'fr' ? 'Synchronisation...' : 'جاري المزامنة...',
            success: language === 'fr' ? 'Synchronisé avec succès' : 'تمت المزامنة بنجاح',
            error: language === 'fr' ? 'Erreur de synchronisation' : 'خطأ في المزامنة',
          }
        );
        break;
      case 'export':
        try {
          if (invoices.length > 0) {
            exportDataToCSV(invoices, `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
            toast.success(language === 'fr' ? 'Rapport exporté' : 'تم تصدير التقرير');
          } else {
            toast.error(language === 'fr' ? 'Aucune donnée à exporter' : 'لا توجد بيانات للتصدير');
          }
        } catch (e) {
          toast.error(language === 'fr' ? 'Erreur d\'export' : 'خطأ في التصدير');
        }
        break;
      case 'payTva':
        toast.success(language === 'fr' ? 'Redirection vers le portail DGI...' : 'توجيه إلى بوابة DGI...');
        window.open('https://simpl-tva.tax.gov.ma/', '_blank');
        break;
      case 'connectBank':
        toast.success(language === 'fr' ? 'Veuillez utiliser le widget bancaire...' : 'الرجاء استخدام بطاقة البنك...');
        document.getElementById('bank-sync-widget')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
    }
    
    addNotification({
      title: label,
      description: language === 'fr' 
        ? `L'opération "${label}" a été initialisée avec succès.` 
        : `تم بدء عملية "${label}" بنجاح.`,
      type: 'info'
    });
  };

  const actions = [
    { id: 'connectBank', label: t('connectBank'), icon: CreditCard, color: 'from-blue-500 to-indigo-600' },
    { id: 'sync', label: t('sync'), icon: RefreshCw, color: 'from-emerald-500 to-teal-600' },
    { id: 'export', label: t('export'), icon: Download, color: 'from-purple-500 to-pink-600' },
    { id: 'payTva', label: t('payTva'), icon: ReceiptText, color: 'from-orange-500 to-red-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, idx) => (
        <motion.button
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          key={idx}
          onClick={() => handleAction(action.id, action.label)}
          className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-surface border border-t-border hover:bg-surface-hover hover:border-t-border-strong transition-all duration-300 group shadow-sm"
        >
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/20 transition-all`}>
            <action.icon size={24} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-dim group-hover:text-foreground transition-colors">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;
