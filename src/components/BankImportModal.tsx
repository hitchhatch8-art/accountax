import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, FileText, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../lib/formatters';
import toast from 'react-hot-toast';

interface BankImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockTransactions = [
  { id: '1', date: '2024-10-15', description: 'Virement Client SARL', amount: 15000, type: 'credit', match: 'FA-2024-001' },
  { id: '2', date: '2024-10-16', description: 'Paiement Fournisseur IT', amount: -2400, type: 'debit', match: null },
  { id: '3', date: '2024-10-18', description: 'Frais Bancaires Mensuels', amount: -150, type: 'debit', match: null },
];

const BankImportModal: React.FC<BankImportModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
  
  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setStep('processing');
      // Simulate processing time
      setTimeout(() => {
        setStep('review');
      }, 2500);
    }
  };

  const handleImport = () => {
    toast.success(
      language === 'fr' 
        ? '3 transactions importées et réconciliées avec succès !' 
        : 'تم استيراد ومطابقة 3 عمليات بنجاح!',
      { icon: '🏦' }
    );
    setTimeout(() => {
      setStep('upload');
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-modal border border-t-border-strong rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-t-border">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="text-indigo-400" size={24} />
                {language === 'fr' ? 'Import Relevé Bancaire' : 'استيراد كشف الحساب'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'fr' ? 'Format supporté : CSV, XLS, PDF' : 'الصيغ المدعومة: CSV, XLS, PDF'}
              </p>
            </div>
            <button 
              onClick={onClose}
              aria-label="Close"
              title="Close"
              className="p-2 rounded-xl text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 md:p-8 min-h-[300px] flex flex-col justify-center">
            
            {/* Step 1: Upload */}
            {step === 'upload' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="border-2 border-dashed border-t-border-strong rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-surface hover:bg-surface-hover hover:border-indigo-500/50 transition-all group relative cursor-pointer"
              >
                <input 
                  type="file" 
                  accept=".csv,.xls,.xlsx,.pdf" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                />
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform mb-4">
                  <UploadCloud size={32} />
                </div>
                <h4 className="text-lg font-bold mb-2">
                  {language === 'fr' ? 'Glissez-déposez votre fichier ici' : 'اسحب وأفلت الملف هنا'}
                </h4>
                <p className="text-sm text-zinc-500">
                  {language === 'fr' ? 'ou cliquez pour parcourir vos fichiers' : 'أو اضغط لتصفح ملفاتك'}
                </p>
              </motion.div>
            )}

            {/* Step 2: Processing */}
            {step === 'processing' && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader2 size={48} className="text-indigo-500 animate-spin mb-6" />
                <h4 className="text-lg font-bold mb-2">
                  {language === 'fr' ? 'Analyse intelligente en cours...' : 'جاري التحليل الذكي...'}
                </h4>
                <p className="text-sm text-zinc-500">
                  {language === 'fr' ? 'Extraction et recherche de correspondances comptables' : 'استخراج وبحث عن تطابقات محاسبية'}
                </p>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 'review' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {language === 'fr' ? '3 Opérations trouvées' : 'تم العثور على 3 عمليات'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 uppercase tracking-widest font-black bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    <Sparkles size={12} className="text-indigo-400" />
                    Auto-Match Active
                  </div>
                </div>

                <div className="bg-surface border border-t-border rounded-2xl overflow-hidden">
                  <table className="w-full text-start text-sm">
                    <thead className="bg-background/50 text-muted-foreground text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">{language === 'fr' ? 'Date' : 'التاريخ'}</th>
                        <th className="px-4 py-3">{language === 'fr' ? 'Description' : 'الوصف'}</th>
                        <th className="px-4 py-3 text-right">{language === 'fr' ? 'Montant' : 'المبلغ'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-t-border">
                      {mockTransactions.map((trx) => (
                        <tr key={trx.id} className="hover:bg-surface-hover transition-colors">
                          <td className="px-4 py-4 text-zinc-400 whitespace-nowrap">{trx.date}</td>
                          <td className="px-4 py-4">
                            <div className="font-medium">{trx.description}</div>
                            {trx.match && (
                              <div className="flex items-center gap-1 text-xs text-indigo-400 mt-1 bg-indigo-500/10 w-fit px-2 py-0.5 rounded">
                                <Sparkles size={10} />
                                {language === 'fr' ? `Correspond : Facture ${trx.match}` : `تطابق الفاتورة: ${trx.match}`}
                              </div>
                            )}
                          </td>
                          <td className={`px-4 py-4 text-right font-mono font-bold ${trx.amount > 0 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                            {trx.amount > 0 ? '+' : ''}{formatCurrency(trx.amount, 'DH')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleImport}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25"
                  >
                    {language === 'fr' ? 'Valider et Enregistrer' : 'تأكيد الحفظ في المحاسبة'}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BankImportModal;
