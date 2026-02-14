import { create } from "zustand";

interface ExpenseFormItem {
  name: string;
  amount: string;
}

interface ExpenseFormState {
  store: string;
  date: string;
  amount: string;
  notes: string;
  paymentMethod: string;
  selectedTagIds: string[];
  items: ExpenseFormItem[];
  receiptBase64: string | null;
  receiptMimeType: string | null;
  isParsing: boolean;
  parseError: string | null;
}

interface ExpenseStoreState extends ExpenseFormState {
  activeTab: "manual" | "receipt";
  filterTagIds: string[];

  setActiveTab: (tab: "manual" | "receipt") => void;
  setStore: (store: string) => void;
  setDate: (date: string) => void;
  setAmount: (amount: string) => void;
  setNotes: (notes: string) => void;
  setPaymentMethod: (paymentMethod: string) => void;
  toggleTag: (tagId: string) => void;
  setSelectedTagIds: (ids: string[]) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, field: "name" | "amount", value: string) => void;
  setReceipt: (base64: string | null, mimeType: string | null) => void;
  setIsParsing: (isParsing: boolean) => void;
  setParseError: (error: string | null) => void;
  fillFromReceipt: (data: {
    store: string;
    date: string;
    amount: number;
    items: { name: string; amount: number }[];
    tagIds: string[];
  }) => void;
  resetForm: () => void;
  toggleFilterTag: (tagId: string) => void;
  clearFilters: () => void;
}

const initialFormState: ExpenseFormState = {
  store: "",
  date: new Date().toISOString().slice(0, 16),
  amount: "",
  notes: "",
  paymentMethod: "",
  selectedTagIds: [],
  items: [{ name: "", amount: "" }],
  receiptBase64: null,
  receiptMimeType: null,
  isParsing: false,
  parseError: null,
};

export const useExpenseStore = create<ExpenseStoreState>((set) => ({
  ...initialFormState,
  activeTab: "manual",
  filterTagIds: [],

  setActiveTab: (tab) => set({ activeTab: tab }),
  setStore: (store) => set({ store }),
  setDate: (date) => set({ date }),
  setAmount: (amount) => set({ amount }),
  setNotes: (notes) => set({ notes }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  toggleTag: (tagId) =>
    set((state) => ({
      selectedTagIds: state.selectedTagIds.includes(tagId)
        ? state.selectedTagIds.filter((id) => id !== tagId)
        : [...state.selectedTagIds, tagId],
    })),

  setSelectedTagIds: (ids) => set({ selectedTagIds: ids }),

  addItem: () =>
    set((state) => ({
      items: [...state.items, { name: "", amount: "" }],
    })),

  removeItem: (index) =>
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    })),

  updateItem: (index, field, value) =>
    set((state) => ({
      items: state.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    })),

  setReceipt: (base64, mimeType) =>
    set({ receiptBase64: base64, receiptMimeType: mimeType }),

  setIsParsing: (isParsing) => set({ isParsing }),

  setParseError: (error) => set({ parseError: error }),

  fillFromReceipt: (data) =>
    set({
      parseError: null,
      store: data.store,
      date: data.date.slice(0, 16),
      amount: data.amount.toFixed(2),
      selectedTagIds: data.tagIds,
      items: data.items.map((item) => ({
        name: item.name,
        amount: item.amount.toFixed(2),
      })),
      isParsing: false,
    }),

  resetForm: () => set({ ...initialFormState, parseError: null, date: new Date().toISOString().slice(0, 16) }),

  toggleFilterTag: (tagId) =>
    set((state) => ({
      filterTagIds: state.filterTagIds.includes(tagId)
        ? state.filterTagIds.filter((id) => id !== tagId)
        : [...state.filterTagIds, tagId],
    })),

  clearFilters: () => set({ filterTagIds: [] }),
}));
