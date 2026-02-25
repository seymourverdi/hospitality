// City Club HMS - Sale Context
// State machine for the complete sale flow matching Figma design

'use client';

import * as React from 'react';
import type {
  SaleState,
  SaleAction,
  SaleStep,
  OrderItem,
  Product,
  Member,
  Table,
  SelectedModifier,
  CategoryId,
} from '../types';

const TAX_RATE = 0.1157; // 11.57% as shown in Figma

// Generate unique ID for order items
function generateItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function calculateTotals(items: OrderItem[], discountTier: number | null) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = discountTier ? subtotal * (discountTier / 100) : 0;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax;

  return { subtotal, tax, total };
}

function saleReducer(state: SaleState, action: SaleAction): SaleState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };

    case 'ADD_ITEM': {
      const { product, modifiers = [], qty = 1 } = action.payload;
      const modifierTotal = modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0);
      const unitPrice = product.price + modifierTotal;

      const newItem: OrderItem = {
        id: generateItemId(),
        productId: product.id,
        name: product.name,
        qty,
        unitPrice,
        price: unitPrice * qty,
        modifiers,
        modifierText: modifiers.map(m => m.name).join(', ') || undefined,
      };

      const items = [...state.items, newItem];
      return { ...state, items };
    }

    case 'REMOVE_ITEM': {
      const items = state.items.filter((item) => item.id !== action.payload.itemId);
      return { ...state, items };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, delta } = action.payload;
      const items = state.items.map((item) => {
        if (item.id !== itemId) return item;
        const newQty = Math.max(0, item.qty + delta);
        if (newQty === 0) return null;
        return {
          ...item,
          qty: newQty,
          price: item.unitPrice * newQty,
        };
      }).filter(Boolean) as OrderItem[];
      return { ...state, items };
    }

    case 'SET_ITEM_NOTE': {
      const { itemId, note } = action.payload;
      const items = state.items.map((item) =>
        item.id === itemId ? { ...item, note } : item
      );
      return { ...state, items };
    }

    case 'SELECT_MEMBER':
      return {
        ...state,
        selectedMember: action.payload,
        isNonMember: false,
        discountTier: action.payload.discountTier || null,
      };

    case 'CLEAR_MEMBER':
      return {
        ...state,
        selectedMember: null,
        discountTier: null,
      };

    case 'SELECT_TABLE':
      return {
        ...state,
        selectedTable: action.payload.table,
        selectedSeats: action.payload.seats,
      };

    case 'CLEAR_TABLE':
      return {
        ...state,
        selectedTable: null,
        selectedSeats: [],
      };

    case 'SET_DISCOUNT':
      return { ...state, discountTier: action.payload };

    case 'SET_SCHEDULED_TIME':
      return { ...state, scheduledTime: action.payload };

    case 'TOGGLE_NON_MEMBER':
      return {
        ...state,
        isNonMember: !state.isNonMember,
        selectedMember: state.isNonMember ? state.selectedMember : null,
      };

    case 'TOGGLE_SKIP_SEATING':
      return { ...state, skipSeating: !state.skipSeating };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategory: action.payload };

    case 'SHOW_MODIFIER_MODAL':
      return {
        ...state,
        showModifierModal: true,
        pendingProduct: action.payload,
      };

    case 'HIDE_MODIFIER_MODAL':
      return {
        ...state,
        showModifierModal: false,
        pendingProduct: null,
      };

    case 'SHOW_NOTE_MODAL':
      return {
        ...state,
        showNoteModal: true,
        editingItemId: action.payload,
      };

    case 'HIDE_NOTE_MODAL':
      return {
        ...state,
        showNoteModal: false,
        editingItemId: null,
      };

    case 'SHOW_SCHEDULE_MODAL':
      return { ...state, showScheduleModal: true };

    case 'HIDE_SCHEDULE_MODAL':
      return { ...state, showScheduleModal: false };

    case 'NEXT_STEP': {
      const steps: SaleStep[] = state.skipSeating
        ? ['select-items', 'select-person', 'submit']
        : ['select-items', 'select-person', 'select-table', 'submit'];
      const currentIndex = steps.indexOf(state.step);
      if (currentIndex < steps.length - 1 && currentIndex >= 0) {
        const nextStep = steps[currentIndex + 1];
        return nextStep ? { ...state, step: nextStep } : state;
      }
      return state;
    }

    case 'PREV_STEP': {
      const steps: SaleStep[] = state.skipSeating
        ? ['select-items', 'select-person', 'submit']
        : ['select-items', 'select-person', 'select-table', 'submit'];
      const currentIndex = steps.indexOf(state.step);
      if (currentIndex > 0) {
        const prevStep = steps[currentIndex - 1];
        return prevStep ? { ...state, step: prevStep } : state;
      }
      return state;
    }

    case 'RESET':
      return initialSaleState;

    default:
      return state;
  }
}

const initialSaleState: SaleState = {
  step: 'select-items',
  items: [],
  selectedMember: null,
  selectedTable: null,
  selectedSeats: [],
  discountTier: null,
  scheduledTime: null,
  isNonMember: false,
  skipSeating: true,
  searchQuery: '',
  activeCategory: 'all',
  customNotes: new Map(),
  showModifierModal: false,
  showNoteModal: false,
  showScheduleModal: false,
  pendingProduct: null,
  editingItemId: null,
};

interface SaleContextValue {
  state: SaleState;
  dispatch: React.Dispatch<SaleAction>;

  // Computed values
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;

  // Step management
  currentStepNumber: number;
  totalSteps: number;
  canProceedToNextStep: boolean;

  // Convenience actions
  addItem: (product: Product, modifiers?: SelectedModifier[], qty?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  setItemNote: (itemId: string, note: string) => void;
  selectMember: (member: Member) => void;
  clearMember: () => void;
  selectTable: (table: Table, seats: number[]) => void;
  clearTable: () => void;
  setDiscount: (tier: number | null) => void;
  setScheduledTime: (time: Date | null) => void;
  toggleNonMember: () => void;
  toggleSkipSeating: () => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: CategoryId) => void;
  showModifierModal: (product: Product) => void;
  hideModifierModal: () => void;
  showNoteModal: (itemId: string) => void;
  hideNoteModal: () => void;
  showScheduleModal: () => void;
  hideScheduleModal: () => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const SaleContext = React.createContext<SaleContextValue | undefined>(undefined);

export function SaleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(saleReducer, initialSaleState);

  // Computed totals
  const { subtotal, tax, total } = React.useMemo(
    () => calculateTotals(state.items, state.discountTier),
    [state.items, state.discountTier]
  );

  const itemCount = React.useMemo(
    () => state.items.reduce((sum, item) => sum + item.qty, 0),
    [state.items]
  );

  // Step calculations
  const steps: SaleStep[] = React.useMemo(
    () =>
      state.skipSeating
        ? ['select-items', 'select-person', 'submit']
        : ['select-items', 'select-person', 'select-table', 'submit'],
    [state.skipSeating]
  );

  const currentStepNumber = React.useMemo(
    () => steps.indexOf(state.step) + 1,
    [steps, state.step]
  );

  const totalSteps = steps.length - 1; // Don't count 'submit' as a numbered step

  // Can proceed logic
  const canProceedToNextStep = React.useMemo(() => {
    switch (state.step) {
      case 'select-items':
        return state.items.length > 0;
      case 'select-person':
        return state.selectedMember !== null || state.isNonMember;
      case 'select-table':
        return state.selectedTable !== null && state.selectedSeats.length > 0;
      case 'submit':
        return true;
      default:
        return false;
    }
  }, [state]);

  // Convenience action creators
  const addItem = React.useCallback(
    (product: Product, modifiers?: SelectedModifier[], qty?: number) => {
      dispatch({ type: 'ADD_ITEM', payload: { product, modifiers, qty } });
    },
    []
  );

  const removeItem = React.useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  }, []);

  const updateQuantity = React.useCallback((itemId: string, delta: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, delta } });
  }, []);

  const setItemNote = React.useCallback((itemId: string, note: string) => {
    dispatch({ type: 'SET_ITEM_NOTE', payload: { itemId, note } });
  }, []);

  const selectMember = React.useCallback((member: Member) => {
    dispatch({ type: 'SELECT_MEMBER', payload: member });
  }, []);

  const clearMember = React.useCallback(() => {
    dispatch({ type: 'CLEAR_MEMBER' });
  }, []);

  const selectTable = React.useCallback((table: Table, seats: number[]) => {
    dispatch({ type: 'SELECT_TABLE', payload: { table, seats } });
  }, []);

  const clearTable = React.useCallback(() => {
    dispatch({ type: 'CLEAR_TABLE' });
  }, []);

  const setDiscount = React.useCallback((tier: number | null) => {
    dispatch({ type: 'SET_DISCOUNT', payload: tier });
  }, []);

  const setScheduledTime = React.useCallback((time: Date | null) => {
    dispatch({ type: 'SET_SCHEDULED_TIME', payload: time });
  }, []);

  const toggleNonMember = React.useCallback(() => {
    dispatch({ type: 'TOGGLE_NON_MEMBER' });
  }, []);

  const toggleSkipSeating = React.useCallback(() => {
    dispatch({ type: 'TOGGLE_SKIP_SEATING' });
  }, []);

  const setSearchQuery = React.useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setActiveCategory = React.useCallback((category: CategoryId) => {
    dispatch({ type: 'SET_ACTIVE_CATEGORY', payload: category });
  }, []);

  const showModifierModalAction = React.useCallback((product: Product) => {
    dispatch({ type: 'SHOW_MODIFIER_MODAL', payload: product });
  }, []);

  const hideModifierModalAction = React.useCallback(() => {
    dispatch({ type: 'HIDE_MODIFIER_MODAL' });
  }, []);

  const showNoteModalAction = React.useCallback((itemId: string) => {
    dispatch({ type: 'SHOW_NOTE_MODAL', payload: itemId });
  }, []);

  const hideNoteModalAction = React.useCallback(() => {
    dispatch({ type: 'HIDE_NOTE_MODAL' });
  }, []);

  const showScheduleModalAction = React.useCallback(() => {
    dispatch({ type: 'SHOW_SCHEDULE_MODAL' });
  }, []);

  const hideScheduleModalAction = React.useCallback(() => {
    dispatch({ type: 'HIDE_SCHEDULE_MODAL' });
  }, []);

  const nextStep = React.useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = React.useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const reset = React.useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value: SaleContextValue = React.useMemo(
    () => ({
      state,
      dispatch,
      subtotal,
      tax,
      total,
      itemCount,
      currentStepNumber,
      totalSteps,
      canProceedToNextStep,
      addItem,
      removeItem,
      updateQuantity,
      setItemNote,
      selectMember,
      clearMember,
      selectTable,
      clearTable,
      setDiscount,
      setScheduledTime,
      toggleNonMember,
      toggleSkipSeating,
      setSearchQuery,
      setActiveCategory,
      showModifierModal: showModifierModalAction,
      hideModifierModal: hideModifierModalAction,
      showNoteModal: showNoteModalAction,
      hideNoteModal: hideNoteModalAction,
      showScheduleModal: showScheduleModalAction,
      hideScheduleModal: hideScheduleModalAction,
      nextStep,
      prevStep,
      reset,
    }),
    [
      state,
      subtotal,
      tax,
      total,
      itemCount,
      currentStepNumber,
      totalSteps,
      canProceedToNextStep,
      addItem,
      removeItem,
      updateQuantity,
      setItemNote,
      selectMember,
      clearMember,
      selectTable,
      clearTable,
      setDiscount,
      setScheduledTime,
      toggleNonMember,
      toggleSkipSeating,
      setSearchQuery,
      setActiveCategory,
      showModifierModalAction,
      hideModifierModalAction,
      showNoteModalAction,
      hideNoteModalAction,
      showScheduleModalAction,
      hideScheduleModalAction,
      nextStep,
      prevStep,
      reset,
    ]
  );

  return <SaleContext.Provider value={value}>{children}</SaleContext.Provider>;
}

export function useSale() {
  const context = React.useContext(SaleContext);
  if (context === undefined) {
    throw new Error('useSale must be used within a SaleProvider');
  }
  return context;
}

export { initialSaleState };
