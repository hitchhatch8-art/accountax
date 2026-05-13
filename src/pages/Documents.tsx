import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { FileText, Upload, Receipt, Users, Landmark } from 'lucide-react';

const Documents: React.FC = () => {
  const { language, t } = useLanguage();
  const { invoices, expenses, clients } = useStore();

  // Dynamic folder counts based on real data
  const folders = [
    { 
      name: language === 'fr' ? 'Factures Ventes' : 'فواتير المبيعات', 
      count: invoices.length, 
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
    },
    { 
      name: language === 'fr' ? 'Achats & Frais' : 'المشتريات والمصاريف', 
      count: expenses.length, 
      icon: Receipt,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
    },
    { 
      name: language === 'fr' ? 'Clients' : 'العملاء', 
      count: clients.length, 
      icon: Users,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
    },
    { 
      name: language === 'fr' ? 'Fiscal (DGI)' : 'الضرائب (DGI)', 
      count: invoices.filter(i => i.status === 'paid').length, 
      icon: Landmark,
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
    },
  ];

  // Recent documents from invoices + expenses combined
  const recentDocs = [
    ...invoices.slice(0, 3).map(inv => ({
      id: inv.id,
      name: `${language === 'fr' ? 'Facture' : 'فاتورة'} ${inv.number}`,
      type: language === 'fr' ? 'Facture de vente' : 'فاتورة مبيعات',
      date: inv.date,
      icon: FileText,
      color: 'text-blue-400',
    })),
    ...expenses.slice(0, 3).map(exp => ({
      id: exp.id,
      name: `${language === 'fr' ? 'Dépense' : 'مصروف'} ${exp.number}`,
      type: language === 'fr' ? 'Facture fournisseur' : 'فاتورة مورّد',
      date: exp.date,
      icon: Receipt,
      color: 'text-emerald-400',
    })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tight mb-2"
          >
            {t('documents')}
          </motion.h2>
          <p className="text-zinc-500">
            {language === 'fr' 
              ? `${invoices.length + expenses.length} documents comptables enregistrés.`
              : `${invoices.length + expenses.length} مستند محاسبي مسجل.`}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20">
          <Upload size={18} />
          {language === 'fr' ? 'Téléverser' : 'رفع ملف'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {folders.map((folder, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -5 }}
            className="glass-card p-6 cursor-pointer group hover:bg-surface-hover transition-all"
          >
            <div className={`w-12 h-12 rounded-xl ${folder.color} bg-opacity-10 border border-t-border flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <folder.icon size={24} className={folder.textColor} />
            </div>
            <h4 className="font-bold text-sm mb-1">{folder.name}</h4>
            <p className="text-xs text-zinc-500">
              {folder.count} {language === 'fr' ? 'documents' : 'مستند'}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recent Documents */}
      {recentDocs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-4">
            <span>{language === 'fr' ? 'Documents Récents' : 'المستندات الأخيرة'}</span>
            <div className="h-px flex-1 bg-t-border"></div>
          </h3>
          <div className="glass-card overflow-hidden">
            {recentDocs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-5 border-b border-t-border last:border-0 hover:bg-surface-hover transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                    <doc.icon size={18} className={doc.color} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{doc.name}</p>
                    <p className="text-xs text-zinc-500">{doc.type}</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-500 font-mono">{doc.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div className="glass-card p-8 text-center border-dashed border-t-border-strong py-16 group hover:border-indigo-500/30 transition-colors cursor-pointer">
        <Upload className="mx-auto text-zinc-600 mb-4 group-hover:text-indigo-500 transition-colors" size={48} />
        <p className="text-zinc-500 group-hover:text-zinc-400 transition-colors">
          {language === 'fr' 
            ? 'Glissez-déposez des fichiers ici pour les analyser' 
            : 'اسحب الملفات وأفلتها هنا للتحليل'}
        </p>
        <p className="text-xs text-zinc-600 mt-2">
          {language === 'fr' ? 'PDF, JPG, PNG — max 10MB' : 'PDF, JPG, PNG — حد أقصى 10 ميجابايت'}
        </p>
      </div>
    </div>
  );
};

export default Documents;
