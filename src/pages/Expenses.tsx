import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Receipt, TrendingDown, X, Calculator } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';
import toast from 'react-hot-toast';

const Expenses: React.FC = () => {
  const { language, t } = useLanguage();
  const { expenses, addExpense, deleteExpense } = useStore();
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [date] = useState(() => new Date().toISOString().split('T')[0]);
  const [number, setNumber] = useState(() => `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [supplier, setSupplier] = useState('');
  const [category, setCategory] = useState('Achats');
  const [totalHT, setTotalHT] = useState('');
  const [tvaRate, setTvaRate] = useState(20);

  const totalTVA = (parseFloat(totalHT) || 0) * (tvaRate / 100);
  const totalTTC = (parseFloat(totalHT) || 0) + totalTVA;

  const totalExpensesTTC = expenses.reduce((sum, e) => sum + e.totalTTC, 0);
  const totalTvaDeductible = expenses.reduce((sum, e) => sum + e.totalTVA, 0);

  const handleDelete = (id: string, ref: string) => {
    if (confirm(language === 'fr' ? `Supprimer la dépense ${ref} ?` : `حذف المصروف ${ref}؟`)) {
      deleteExpense(id);
      toast.success(language === 'fr' ? 'Dépense supprimée' : 'تم حذف المصروف');
    }
  };

  const handleSave = async () => {
    if (!supplier || !totalHT) {
      toast.error(language === 'fr' ? 'Veuillez remplir les champs obligatoires' : 'الرجاء تعبئة الحقول المطلوبة');
      return;
    }
    
    await addExpense({
      number,
      date,
      supplier,
      category,
      totalHT: parseFloat(totalHT),
      totalTVA,
      totalTTC,
      status: 'paid',
      currency: 'DH'
    });

    toast.success(language === 'fr' ? 'Dépense enregistrée' : 'تم حفظ المصروف');
    setIsAdding(false);
    // Reset Form
    setSupplier('');
    setTotalHT('');
    setNumber(`EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-6 border-t-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{language === 'fr' ? 'Total Dépenses' : 'إجمالي المصروفات'}</p>
          <h4 className="text-3xl font-black text-rose-400 font-mono flex items-center gap-2">
            <TrendingDown size={24} />
            {formatCurrency(totalExpensesTTC, 'DH')}
          </h4>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 border-t-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{language === 'fr' ? 'TVA Déductible (Récupérable)' : 'الضريبة المسترجعة'}</p>
          <h4 className="text-3xl font-black text-emerald-400 font-mono flex items-center gap-2">
            <Calculator size={24} />
            {formatCurrency(totalTvaDeductible, 'DH')}
          </h4>
        </motion.div>
      </div>

      <div className="flex justify-between items-center text-start mt-8">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tight mb-2"
          >
             {t('expenses')}
          </motion.h2>
          <p className="text-zinc-500">
            {language === 'fr' 
              ? `Gérez vos ${expenses.length} dépenses enregistrées.` 
              : `إدارة ${expenses.length} مصروف مسجل.`}
          </p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          {language === 'fr' ? 'Ajouter une dépense' : 'إضافة مصروف'}
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="border-b border-t-border text-[10px] uppercase tracking-widest text-muted-foreground font-black">
                <th className="px-6 py-5">{t('invoiceDate')}</th>
                <th className="px-6 py-5">{t('invoiceNumber')}</th>
                <th className="px-6 py-5">{t('supplier')}</th>
                <th className="px-6 py-5">{t('category')}</th>
                <th className="px-6 py-5">{t('tva')}</th>
                <th className="px-6 py-5">{t('totalTTC')}</th>
                <th className="px-6 py-5 text-right">{language === 'fr' ? 'Actions' : 'الإجراءات'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-t-border">
              {expenses.length > 0 ? (
                expenses.map((exp) => (
                  <tr key={exp.id} className="group hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4 text-sm text-dim">{exp.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                          <Receipt size={14} />
                        </div>
                        <span className="text-sm font-bold text-foreground tracking-widest">{exp.number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-foreground">{exp.supplier}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs px-2 py-1 rounded border border-t-border-strong bg-surface">{exp.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-emerald-400">{formatCurrency(exp.totalTVA, exp.currency)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-foreground">{formatCurrency(exp.totalTTC, exp.currency)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(exp.id, exp.number)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        aria-label={language === 'fr' ? 'Supprimer' : 'حذف'}
                        title={language === 'fr' ? 'Supprimer' : 'حذف'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-zinc-500 text-sm italic">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center text-muted-foreground">
                        <Receipt size={32} />
                      </div>
                      {language === 'fr' ? 'Aucune dépense enregistrée' : 'لا توجد مصروفات مسجلة'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="bg-modal border border-t-border-strong p-8 w-full max-w-2xl rounded-3xl shadow-2xl relative"
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-6 right-6 p-2 bg-surface hover:bg-surface-active rounded-xl text-dimmer hover:text-foreground transition-colors"
                aria-label={language === 'fr' ? 'Fermer' : 'إغلاق'}
                title={language === 'fr' ? 'Fermer' : 'إغلاق'}
               >
                 <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Receipt size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {language === 'fr' ? 'Nouvelle Dépense' : 'مصروف جديد'}
                  </h3>
                  <p className="text-sm text-zinc-500">
                     {language === 'fr' ? 'Enregistrez une facture fournisseur' : 'تأكيد فاتورة المورد'}
                  </p>
                </div>
              </div>

               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label htmlFor="supplier-input" className="text-xs font-bold text-zinc-500 mb-2 block">{t('supplier')}*</label>
                     <input id="supplier-input" title={t('supplier')} aria-label={t('supplier')} type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full bg-surface border border-t-border-strong rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500" placeholder="Ex: Maroc Telecom" />
                   </div>
                   <div>
                     <label htmlFor="category-select" className="text-xs font-bold text-zinc-500 mb-2 block">{t('category')}</label>
                     <select id="category-select" title={t('category')} aria-label={t('category')} value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-dropdown border border-t-border-strong rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500">
                       <option value="Achats">Achats de marchandises</option>
                       <option value="Services">Services externes</option>
                       <option value="Taxes">Impôts et Taxes</option>
                       <option value="Salaires">Salaires</option>
                       <option value="Equipement">Equipement</option>
                     </select>
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label htmlFor="amount-input" className="text-xs font-bold text-zinc-500 mb-2 block">{language === 'fr' ? 'Montant HT (DH)' : 'المبلغ الصافي (DH)'}*</label>
                     <input id="amount-input" title={language === 'fr' ? 'Montant HT (DH)' : 'المبلغ الصافي (DH)'} aria-label={language === 'fr' ? 'Montant HT (DH)' : 'المبلغ الصافي (DH)'} type="number" value={totalHT} onChange={(e) => setTotalHT(e.target.value)} className="w-full bg-surface border border-t-border-strong rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500" />
                   </div>
                   <div>
                     <label htmlFor="tva-select" className="text-xs font-bold text-zinc-500 mb-2 block">{language === 'fr' ? 'Taux TVA' : 'نسبة الضريبة'}</label>
                     <select id="tva-select" title={language === 'fr' ? 'Taux TVA' : 'نسبة الضريبة'} aria-label={language === 'fr' ? 'Taux TVA' : 'نسبة الضريبة'} value={tvaRate} onChange={(e) => setTvaRate(Number(e.target.value))} className="w-full bg-dropdown border border-t-border-strong rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-indigo-500">
                       <option value="20">20%</option>
                       <option value="14">14%</option>
                       <option value="10">10%</option>
                       <option value="7">7%</option>
                       <option value="0">0%</option>
                     </select>
                   </div>
                 </div>

                 <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm text-zinc-400">{language === 'fr' ? 'Montant TVA' : 'مبلغ الضريبة'}</span>
                     <span className="text-sm font-bold text-emerald-400">+{totalTVA.toFixed(2)} DH</span>
                   </div>
                   <div className="h-px w-full bg-t-border-strong my-2"></div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-bold text-foreground">{language === 'fr' ? 'Total TTC' : 'المجموع الكلي'}</span>
                     <span className="text-xl font-black text-foreground">{totalTTC.toFixed(2)} DH</span>
                   </div>
                 </div>

                 <button onClick={handleSave} className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors">
                   {language === 'fr' ? 'Enregistrer' : 'حفظ'}
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Expenses;
