import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore, type InvoiceItem, type Invoice } from '../store/useStore';
import { Plus, Trash2, Save, X, Calendar as CalendarIcon, Hash } from 'lucide-react';
import { calculateInvoiceTotals } from '../lib/formatters';
import toast from 'react-hot-toast';

interface InvoiceFormProps {
  initialData?: Invoice;
  onSave: (data: any) => void;
  onCancel: () => void;
  onDataChange: (data: any) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData, onSave, onCancel, onDataChange }) => {
  const { language, t } = useLanguage();
  const { clients, addNotification } = useStore();

  const [number, setNumber] = useState(initialData?.number || `FA-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`);
  const [date, setDate] = useState(initialData?.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0]);
  const [clientId, setClientId] = useState(initialData?.clientId || '');
  const [items, setItems] = useState<InvoiceItem[]>(initialData?.items && initialData.items.length > 0 ? initialData.items : [
    { id: '1', description: '', quantity: 1, priceHT: 0, tvaRate: 20 }
  ]);

  // Track raw string values for number inputs so users can type freely
  const [rawPrices, setRawPrices] = useState<Record<string, string>>(() => {
    if (initialData?.items) return initialData.items.reduce((acc, item) => ({ ...acc, [item.id]: String(item.priceHT) }), {});
    return { '1': '' };
  });
  const [rawQuantities, setRawQuantities] = useState<Record<string, string>>(() => {
    if (initialData?.items) return initialData.items.reduce((acc, item) => ({ ...acc, [item.id]: String(item.quantity) }), {});
    return { '1': '1' };
  });
  const [currency] = useState(initialData?.currency || 'DH');

  const tvaRates = [20, 14, 10, 7, 0];

  useEffect(() => {
    const selectedClient = clients.find(c => c.id === clientId);
    const totals = calculateInvoiceTotals(items);
    
    onDataChange({
      number,
      date,
      clientId, // Pass clientId down
      clientName: selectedClient?.name || '',
      items,
      ...totals,
      currency
    });
  }, [number, date, clientId, items, clients, onDataChange, currency]);

  const addItem = () => {
    const newId = Math.random().toString(36).substring(7);
    setItems([...items, { id: newId, description: '', quantity: 1, priceHT: 0, tvaRate: 20 }]);
    setRawPrices(prev => ({ ...prev, [newId]: '' }));
    setRawQuantities(prev => ({ ...prev, [newId]: '1' }));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = () => {
    if (!clientId) {
      toast.error(language === 'fr' ? 'Veuillez sélectionner un client' : 'يرجى اختيار عميل');
      return;
    }
    
    const selectedClient = clients.find(c => c.id === clientId);
    const totals = calculateInvoiceTotals(items);

    const invoiceData = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      number,
      date,
      clientId,
      clientName: selectedClient?.name || '',
      items,
      ...totals,
      status: initialData?.status || 'pending',
      currency
    };

    onSave(invoiceData);

    addNotification({
      title: language === 'fr' ? 'Facture enregistrée' : 'تم حفظ الفاتورة',
      description: `${language === 'fr' ? 'La facture' : 'الفاتورة'} ${number} ${language === 'fr' ? 'est prête' : 'جاهزة'}`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Hash size={12} /> {t('invoiceNumber')}
          </label>
          <input 
            type="text" 
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full bg-surface border border-t-border-strong rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-mono"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon size={12} /> {t('invoiceDate')}
          </label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-surface border border-t-border-strong rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Client Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">{t('selectClient')}</label>
        <select 
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full bg-surface border border-t-border-strong rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none hover:bg-surface-hover transition-colors"
        >
          <option value="" className="bg-dropdown text-dimmer">--- {t('selectClient')} ---</option>
          {clients.map(client => (
            <option key={client.id} value={client.id} className="bg-dropdown">{client.name} (ICE: {client.ice})</option>
          ))}
        </select>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Articles & Services</label>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-3 items-end group">
              <div className="col-span-12 lg:col-span-5 space-y-1">
                <input 
                  type="text" 
                  placeholder={t('itemDescription')}
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  className="w-full bg-surface border border-t-border-strong rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="col-span-3 lg:col-span-2 space-y-1">
                <input 
                  type="text" 
                  inputMode="decimal"
                  placeholder="Qté"
                  value={rawQuantities[item.id] ?? item.quantity}
                  onChange={(e) => {
                    const val = e.target.value.replace(',', '.');
                    setRawQuantities(prev => ({ ...prev, [item.id]: e.target.value }));
                    updateItem(item.id, 'quantity', parseFloat(val) || 0);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none text-center"
                />
              </div>
              <div className="col-span-5 lg:col-span-2 space-y-1">
                <input 
                  type="text" 
                  inputMode="decimal"
                  placeholder={language === 'fr' ? 'Prix HT' : 'الثمن'}
                  value={rawPrices[item.id] ?? (item.priceHT || '')}
                  onChange={(e) => {
                    const val = e.target.value.replace(',', '.');
                    setRawPrices(prev => ({ ...prev, [item.id]: e.target.value }));
                    updateItem(item.id, 'priceHT', parseFloat(val) || 0);
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none text-right"
                />
              </div>
              <div className="col-span-3 lg:col-span-2 space-y-1 relative">
                <select 
                  value={item.tvaRate}
                  onChange={(e) => updateItem(item.id, 'tvaRate', parseFloat(e.target.value))}
                  className="w-full bg-surface border border-t-border-strong rounded-xl px-2 py-2.5 text-[10px] font-bold text-foreground focus:outline-none appearance-none cursor-pointer"
                >
                  {tvaRates.map(rate => (
                    <option key={rate} value={rate} className="bg-dropdown">TVA {rate}%</option>
                  ))}
                  <option value="-1" className="bg-dropdown">Custom...</option>
                </select>
                {item.tvaRate === -1 && (
                  <input 
                    type="number" 
                    placeholder="%"
                    className="absolute inset-0 bg-surface border border-t-border-strong rounded-xl px-2 py-2.5 text-[10px] text-foreground focus:outline-none"
                    onBlur={(e) => updateItem(item.id, 'tvaRate', parseFloat(e.target.value) || 0)}
                  />
                )}
              </div>
              <div className="col-span-1 flex justify-center pb-2">
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={addItem}
          className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors p-1"
        >
          <Plus size={14} /> {t('addItem')}
        </button>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-4 pt-8 border-t border-t-border">
        <button 
          onClick={handleSave}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
        >
          <Save size={18} /> {t('saveInvoice')}
        </button>
        <button 
          onClick={onCancel}
          className="px-6 py-4 bg-surface hover:bg-surface-active text-dimmer hover:text-foreground rounded-2xl transition-all font-bold border border-t-border"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;
