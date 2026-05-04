import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download, Eye } from 'lucide-react';
import InvoiceTemplate from './InvoiceTemplate';
import { type Invoice } from '../store/useStore';
import { generatePDF, printDocument } from '../lib/exportUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface InvoicePreviewModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ invoice, isOpen, onClose }) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const handleDownload = async () => {
    await generatePDF('invoice-document', `Invoice-${invoice.number}.pdf`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-overlay backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-card border border-t-border w-full max-w-[900px] max-h-[90vh] overflow-hidden rounded-[32px] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-t-border bg-card/50 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center gap-3 text-indigo-400">
              <Eye size={20} />
              <h2 className="font-bold text-lg">{language === 'fr' ? 'Aperçu Impression' : 'معاينة الطباعة'}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={printDocument}
                className="flex items-center gap-2 bg-surface hover:bg-surface-active text-foreground px-4 py-2 rounded-xl text-sm font-bold transition-all"
              >
                <Printer size={16} />
                {language === 'fr' ? 'Imprimer' : 'طباعة'}
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                <Download size={16} />
                {language === 'fr' ? 'Exporter PDF' : 'تحميل PDF'}
              </button>
              <div className="w-px h-6 bg-t-border-strong mx-2"></div>
              <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Scrolling Preview Area */}
          <div className="flex-1 overflow-y-auto p-12 bg-surface">
            <div className="transform origin-top scale-75 md:scale-90 lg:scale-100 transition-transform duration-500">
               <InvoiceTemplate invoice={invoice} />
            </div>
          </div>

          {/* Hidden print style */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #invoice-document, #invoice-document * {
                visibility: visible;
              }
              #invoice-document {
                position: fixed;
                left: 0;
                top: 0;
                margin: 0;
                padding: 20mm;
                width: 210mm;
              }
              .fixed, .z-[150] {
                display: none !important;
              }
            }
          `}</style>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InvoicePreviewModal;
