import React, { useState } from 'react';
import InvoiceForm from './InvoiceForm';
import InvoicePreviewLite from './InvoicePreviewLite';
import InvoicePreviewModal from './InvoicePreviewModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore, type Invoice } from '../store/useStore';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

interface InvoiceBuilderProps {
  initialData?: Invoice;
  onSaved: () => void;
  onCancel: () => void;
}

const InvoiceBuilder: React.FC<InvoiceBuilderProps> = ({ initialData, onSaved, onCancel }) => {
  const { t } = useLanguage();
  const { addInvoice, updateInvoice, clients } = useStore();
  const [previewData, setPreviewData] = useState<any>(initialData || null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSave = (invoiceData: any) => {
    if (invoiceData.id) {
      updateInvoice(invoiceData.id, invoiceData);
    } else {
      addInvoice(invoiceData);
    }
    onSaved();
  };

  const currentInvoice: Invoice = {
    id: 'preview',
    number: previewData?.number || '',
    date: previewData?.date || new Date().toISOString(),
    clientId: previewData?.clientId || '',
    clientName: clients.find(c => c.id === previewData?.clientId)?.name || '---',
    items: previewData?.items || [],
    totalHT: previewData?.totalHT || 0,
    totalTVA: previewData?.totalTVA || 0,
    totalTTC: previewData?.totalTTC || 0,
    status: 'pending',
    currency: previewData?.currency || 'DH',
  };

  return (
    <div className="bg-modal border border-t-border-strong p-6 md:p-12 w-full max-w-[1600px] mx-auto rounded-[2.5rem] shadow-2xl relative">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-4 w-full">
              <span>{t('addItem')}</span>
              <div className="h-px flex-1 bg-t-border"></div>
            </h3>
          </div>
          <InvoiceForm 
            initialData={initialData}
            onSave={handleSave} 
            onCancel={onCancel} 
            onDataChange={setPreviewData} 
          />
          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-6 py-4 bg-surface hover:bg-surface-active text-foreground rounded-2xl transition-all font-bold border border-t-border flex items-center gap-2"
            >
              <Eye size={18} /> {t('preview')}
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden xl:block"
        >
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-4 mb-8">
            <span>{t('preview')}</span>
            <div className="h-px flex-1 bg-t-border"></div>
          </h3>
          {previewData && <InvoicePreviewLite data={previewData} />}
        </motion.div>
      </div>

      <InvoicePreviewModal 
        isOpen={isPreviewOpen}
        invoice={currentInvoice}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};

export default InvoiceBuilder;
