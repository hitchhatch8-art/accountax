import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    dashboard: 'Tableau de bord',
    clients: 'Clients',
    documents: 'Documents',
    tasks: 'Tâches',
    settings: 'Paramètres',
    welcome: 'Bienvenue sur AccounTax',
    connectBank: 'Connecter une banque',
    sync: 'Synchroniser',
    export: 'Exporter Rapport',
    payTva: 'Payer TVA / CNSS',
    recentActivity: 'Activité récente',
    bankStatus: 'Synchronisé',
    clientsActive: 'Clients Actifs',
    docsPending: 'Docs en attente',
    upcomingTax: 'Échéances fiscales',
    invoiceNumber: 'N° Facture',
    invoiceDate: 'Date',
    itemDescription: 'Désignation / Article',
    quantity: 'Qté',
    priceHT: 'Prix Unit. HT',
    tva: 'TVA',
    totalHT: 'Total HT',
    totalTVA: 'Total TVA',
    totalTTC: 'Total TTC',
    saveInvoice: 'Enregistrer la Facture',
    preview: 'Aperçu',
    addItem: 'Ajouter un article',
    selectClient: 'Sélectionner un Client',
    addClient: 'Nouveau Client',
    clientName: 'Nom du Client',
    iceNumber: 'Numéro ICE',
    status: 'Statut',
    active: 'Actif',
    inactive: 'Inactif',
    searchClients: 'Rechercher un client...',
    delete: 'Supprimer',
    companyName: 'Nom de l\'entreprise',
    address: 'Adresse',
    phone: 'Téléphone',
    logo: 'Logo',
    changeLogo: 'Changer le Logo',
    saveSettings: 'Enregistrer les paramètres',
    draft: 'Brouillon',
    pending: 'En attente',
    paid: 'Payée',
    overdue: 'En retard',
    expenses: 'Dépenses',
    supplier: 'Fournisseur',
    category: 'Catégorie',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    clients: 'العملاء',
    documents: 'الوثائق',
    tasks: 'المهام',
    settings: 'الإعدادات',
    welcome: 'مرحباً بك في AccounTax',
    connectBank: 'ربط حساب بنكي',
    sync: 'مزامنة',
    export: 'تصدير التقرير',
    payTva: 'أداء TVA / CNSS',
    recentActivity: 'آخر النشاطات',
    bankStatus: 'متصل',
    clientsActive: 'العملاء النشطون',
    docsPending: 'وثائق قيد الانتظار',
    upcomingTax: 'الالتزامات الضريبية',
    invoiceNumber: 'رقم الفاتورة',
    invoiceDate: 'التاريخ',
    itemDescription: 'البيان / المادة',
    quantity: 'الكمية',
    priceHT: 'سعر الوحدة (HT)',
    tva: 'الضريبة',
    totalHT: 'المجموع الصافي (HT)',
    totalTVA: 'مجموع الضريبة (TVA)',
    totalTTC: 'المجموع الكلي (TTC)',
    saveInvoice: 'حفظ الفاتورة',
    preview: 'معاينة',
    addItem: 'إضافة مادة',
    selectClient: 'اختر العميل',
    addClient: 'عميل جديد',
    clientName: 'اسم العميل',
    iceNumber: 'رقم الـ ICE',
    status: 'الحالة',
    active: 'نشط',
    inactive: 'غير نشط',
    searchClients: 'بحث عن عميل...',
    delete: 'حذف',
    companyName: 'اسم الشركة',
    address: 'العنوان',
    phone: 'الهاتف',
    logo: 'الشعار',
    changeLogo: 'تغيير الشعار',
    saveSettings: 'حفظ الإعدادات',
    draft: 'مسودة',
    pending: 'قيد الانتظار',
    paid: 'مدفوعة',
    overdue: 'متأخرة',
    expenses: 'المصروفات',
    supplier: 'المُورّد',
    category: 'الفئة',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('accountax-lang');
    return (saved as Language) || 'fr';
  });

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('accountax-lang', language);
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['fr']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
