import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore, type Invoice } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, FileDown, Printer, History, FileText, Edit2 } from 'lucide-react';
import InvoiceBuilder from '../components/InvoiceBuilder';
import InvoicePreviewModal from '../components/InvoicePreviewModal';
import { formatCurrency } from '../lib/formatters';
import toast from 'react-hot-toast';

const Invoices: React.FC = () => {
  const { language, t } = useLanguage();
  const { invoices, deleteInvoice, updateInvoiceStatus } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editInvoiceData, setEditInvoiceData] = useState<Invoice | null>(null);

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'overdue': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  const nextStatus = (current: Invoice['status']): Invoice['status'] => {
    const sequence: Invoice['status'][] = ['draft', 'pending', 'paid', 'overdue'];
    const idx = sequence.indexOf(current);
    return sequence[(idx + 1) % sequence.length];
  };

  const handleStatusClick = (id: string, current: Invoice['status']) => {
    const status = nextStatus(current);
    updateInvoiceStatus(id, status);
    toast.success(language === 'fr' ? `Statut mis à jour: ${t(status)}` : `تم تحديث الحالة: ${t(status)}`);
  };

  const handleDelete = (id: string, number: string) => {
    if (confirm(language === 'fr' ? `Supprimer la facture ${number} ?` : `حذف الفاتورة ${number}؟`)) {
      deleteInvoice(id);
      toast.success(language === 'fr' ? 'Facture supprimée' : 'تم حذف الفاتورة');
    }
  };

  return (
    <div className="space-y-8">
      {/* ... previous header ... */}
      <div className="flex justify-between items-center text-start">
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
              ? `Gérez vos ${invoices.length} factures enregistrées.` 
              : `إدارة ${invoices.length} فواتير مسجلة.`}
          </p>
        </div>
        <button 
          onClick={() => {
            setEditInvoiceData(null);
            setIsAdding(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          {language === 'fr' ? 'Créer une Facture' : 'إنشاء فاتورة'}
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="border-b border-t-border text-[10px] uppercase tracking-widest text-muted-foreground font-black">
                <th className="px-6 py-5">{t('invoiceNumber')}</th>
                <th className="px-6 py-5">{t('selectClient')}</th>
                <th className="px-6 py-5">{t('status')}</th>
                <th className="px-6 py-5">{t('totalTTC')}</th>
                <th className="px-6 py-5 text-right">{language === 'fr' ? 'Actions' : 'الإجراءات'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-t-border">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="group hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                          <History size={14} />
                        </div>
                        <span className="text-sm font-bold text-foreground tracking-widest">{inv.number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-dim">{inv.clientName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleStatusClick(inv.id, inv.status)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95 ${getStatusColor(inv.status)}`}
                      >
                        {t(inv.status)}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-foreground">{formatCurrency(inv.totalTTC, inv.currency)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* actions */}
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                          title={language === 'fr' ? 'Aperçu & Print' : 'معاينة وطباعة'}
                        >
                          <Printer size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditInvoiceData(inv);
                            setIsAdding(true);
                          }}
                          className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                          title={language === 'fr' ? 'Modifier' : 'تعديل'}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
                          title={language === 'fr' ? 'Télécharger PDF' : 'تحميل PDF'}
                        >
                          <FileDown size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(inv.id, inv.number)}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-zinc-500 text-sm italic">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center text-muted-foreground">
                        <FileText size={32} />
                      </div>
                      {language === 'fr' ? 'Aucune facture enregistrée' : 'لا توجد فواتير مسجلة'}
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
            <div className="min-h-full py-12 flex items-center justify-center w-full">
               <InvoiceBuilder 
                  initialData={editInvoiceData || undefined}
                  onSaved={() => {
                    setIsAdding(false);
                    setEditInvoiceData(null);
                  }} 
                  onCancel={() => {
                    setIsAdding(false);
                    setEditInvoiceData(null);
                  }} 
               />
            </div>
          </div>
        )}
      </AnimatePresence>

      {selectedInvoice && (
        <InvoicePreviewModal 
          isOpen={!!selectedInvoice}
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default Invoices;
