import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  priceHT: number;
  tvaRate: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  clientId: string;
  clientName: string;
  items: InvoiceItem[];
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  status: 'draft' | 'paid' | 'pending' | 'overdue';
  currency: string;
}

export interface Expense {
  id: string;
  number: string;
  date: string;
  category: string;
  supplier: string;
  status: 'paid' | 'pending';
  currency: string;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
}

export interface Client {
  id: string;
  name: string;
  ice: string;
  status: 'active' | 'inactive';
  email?: string;
  phone?: string;
  address?: string;
  _count?: { invoices: number };
}

export interface CompanyProfile {
  name: string;
  ice: string;
  ifNum: string;
  rc: string;
  address: string;
  phone: string;
  logo?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string;
  trialEndsAt: string | null;
}

interface AppState {
  // Auth State
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;

  // Data State
  notifications: AppNotification[];
  clients: Client[];
  invoices: Invoice[];
  expenses: Expense[];
  companyProfile: CompanyProfile | null;
  
  // App logic (Sync)
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'time'>) => void;
  markAsRead: (id: string) => void;
  toggleNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // API logic (Async)
  fetchInitialData: () => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'status'> & { status?: string }) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'totalHT' | 'totalTVA' | 'totalTTC' | 'clientName'>) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<void>;
  
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  updateCompanyProfile: (profile: Partial<CompanyProfile>) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      notifications: [],
      clients: [],
      invoices: [],
      expenses: [],
      companyProfile: null,

      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, clients: [], invoices: [], expenses: [], companyProfile: null });
        window.location.href = '/login';
      },

      addNotification: (n) => set((state) => ({
        notifications: [
          {
            ...n,
            id: Math.random().toString(36).substring(7),
            read: false,
            time: new Date().toLocaleTimeString(),
          },
          ...state.notifications,
        ],
      })),

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n),
      })),

      toggleNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, read: !n.read } : n),
      })),

      clearNotifications: () => set({ notifications: [] }),

      fetchInitialData: async () => {
        try {
          const [clients, invoices, company, expenses] = await Promise.all([
            api.get('/clients'),
            api.get('/invoices'),
            api.get('/company'),
            api.get('/expenses'),
          ]);
          set({ clients, invoices, companyProfile: company, expenses });
        } catch (error) {
          console.error("Failed to fetch initial data", error);
        }
      },

      addClient: async (c) => {
        try {
          const newClient = await api.post('/clients', c);
          set((state) => ({ clients: [newClient, ...state.clients] }));
        } catch (error: any) {
          console.error('Failed to add client:', error);
          throw error;
        }
      },

      deleteClient: async (id) => {
        try {
          await api.delete(`/clients/${id}`);
          set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }));
        } catch (error: any) {
          console.error('Failed to delete client:', error);
          throw error;
        }
      },

      addInvoice: async (i) => {
        try {
          const newInvoice = await api.post('/invoices', i);
          set((state) => ({ invoices: [newInvoice, ...state.invoices] }));
        } catch (error: any) {
          console.error('Failed to add invoice:', error);
          throw error;
        }
      },

      updateInvoice: async (id, i) => {
        try {
          const updatedInvoice = await api.put(`/invoices/${id}`, i);
          set((state) => ({
            invoices: state.invoices.map(inv => inv.id === id ? updatedInvoice : inv)
          }));
        } catch (error: any) {
          console.error('Failed to update invoice:', error);
          throw error;
        }
      },

      deleteInvoice: async (id) => {
        try {
          await api.delete(`/invoices/${id}`);
          set((state) => ({ invoices: state.invoices.filter((inv) => inv.id !== id) }));
        } catch (error: any) {
          console.error('Failed to delete invoice:', error);
          throw error;
        }
      },

      updateInvoiceStatus: async (id, status) => {
        try {
          const updatedInvoice = await api.patch(`/invoices/${id}/status`, { status });
          set((state) => ({
            invoices: state.invoices.map((inv) => inv.id === id ? { ...inv, status: updatedInvoice.status } : inv),
          }));
        } catch (error: any) {
          console.error('Failed to update invoice status:', error);
          throw error;
        }
      },

      updateCompanyProfile: async (profile) => {
        try {
          const updatedProfile = await api.put('/company', profile);
          set({ companyProfile: updatedProfile });
        } catch (error: any) {
          console.error('Failed to update company profile:', error);
          throw error;
        }
      },

      addExpense: async (e) => {
        try {
          const newExpense = await api.post('/expenses', e);
          set((state) => ({ expenses: [newExpense, ...state.expenses] }));
        } catch (error: any) {
          console.error('Failed to add expense:', error);
          throw error;
        }
      },

      deleteExpense: async (id) => {
        try {
          await api.delete(`/expenses/${id}`);
          set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }));
        } catch (error: any) {
          console.error('Failed to delete expense:', error);
          throw error;
        }
      },
    }),
    {
      name: 'accountax-storage',
      // Don't persist everything, only auth details and some user prefs if needed
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        notifications: state.notifications,
      }),
    }
  )
);
