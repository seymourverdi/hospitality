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

const TAX_RATE = 0.1157;

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
        modifierText: modifiers.map((m) => m.name).join(', ') || undefined,
      };

      return { ...state, items: [...state.items, newItem] };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.itemId),
      };

    case 'UPDATE_QUANTITY': {
      const { itemId, delta } = action.payload;

      const items = state.items
        .map((item) => {
          if (item.id !== itemId) return item;

          const newQty = Math.max(0, item.qty + delta);
          if (newQty === 0) return null;

          return {
            ...item,
            qty: newQty,
            price: item.unitPrice * newQty,
          };
        })
        .filter(Boolean) as OrderItem[];

      return { ...state, items };
    }

    case 'SET_ITEM_NOTE':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.itemId ? { ...item, note: action.payload.note } : item
        ),
      };

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
  skipSeating: false,
  searchQuery: '',
  activeCategory: 'all',
  customNotes: new Map(),
  showModifierModal: false,
  showNoteModal: false,
  showScheduleModal: false,
  pendingProduct: null,
  editingItemId: null,
};

type SubmissionFeedback = {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message: string | null;
  orderId: number | null;
};

interface SaleContextValue {
  state: SaleState;
  dispatch: React.Dispatch<SaleAction>;
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  currentStepNumber: number;
  totalSteps: number;
  canProceedToNextStep: boolean;
  submissionFeedback: SubmissionFeedback;
  clearSubmissionFeedback: () => void;
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

type SubmitOrderResponse = {
  ok: boolean;
  orderId?: number;
  tableId?: number;
  submittedItemCount?: number;
  error?: string;
};

export function SaleProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(saleReducer, initialSaleState);
  const [submissionFeedback, setSubmissionFeedback] = React.useState<SubmissionFeedback>({
    status: 'idle',
    message: null,
    orderId: null,
  });
  const submittingRef = React.useRef(false);

  const { subtotal, tax, total } = React.useMemo(
    () => calculateTotals(state.items, state.discountTier),
    [state.items, state.discountTier]
  );

  const itemCount = React.useMemo(
    () => state.items.reduce((sum, item) => sum + item.qty, 0),
    [state.items]
  );

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

  const totalSteps = steps.length - 1;

  const canProceedToNextStep = React.useMemo(() => {
    switch (state.step) {
      case 'select-items':
        return state.items.length > 0;
      case 'select-person':
        return state.selectedMember !== null || state.isNonMember;
      case 'select-table':
        return state.selectedTable !== null && state.selectedSeats.length > 0;
      case 'submit':
        return state.items.length > 0 && state.selectedTable !== null;
      default:
        return false;
    }
  }, [state]);

  const addItem = React.useCallback((product: Product, modifiers?: SelectedModifier[], qty?: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, modifiers, qty } });
  }, []);

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

  const clearSubmissionFeedback = React.useCallback(() => {
    setSubmissionFeedback({
      status: 'idle',
      message: null,
      orderId: null,
    });
  }, []);

  const submitCurrentOrder = React.useCallback(async () => {
    if (submittingRef.current) return;

    if (!state.selectedTable) {
      setSubmissionFeedback({
        status: 'error',
        message: 'Please select a table before submitting the order.',
        orderId: null,
      });
      return;
    }

    if (state.items.length === 0) {
      setSubmissionFeedback({
        status: 'error',
        message: 'Please add at least one item before submitting.',
        orderId: null,
      });
      return;
    }

    submittingRef.current = true;
    setSubmissionFeedback({
      status: 'submitting',
      message: 'Submitting order...',
      orderId: null,
    });

    try {
      const response = await fetch('/api/sale/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.NEXT_PUBLIC_SALE_API_KEY
            ? {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_SALE_API_KEY}`,
              }
            : {}),
        },
        body: JSON.stringify({
          tableId: state.selectedTable.id,
          seatNumbers: state.selectedSeats,
          memberId: state.selectedMember?.id,
          isNonMember: state.isNonMember,
          discountTier: state.discountTier,
          scheduledTime: state.scheduledTime ? state.scheduledTime.toISOString() : null,
          items: state.items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            note: item.note ?? null,
            modifiers: item.modifiers ?? [],
          })),
        }),
      });

      const data = (await response.json()) as SubmitOrderResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      setSubmissionFeedback({
        status: 'success',
        message: `Order #${data.orderId} submitted successfully. Redirecting...`,
        orderId: data.orderId ?? null,
      });

      dispatch({ type: 'RESET' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit order';

      console.error('Sale submit failed', error);

      setSubmissionFeedback({
        status: 'error',
        message,
        orderId: null,
      });
    } finally {
      submittingRef.current = false;
    }
  }, [state]);

  const nextStep = React.useCallback(() => {
    if (state.step === 'submit') {
      void submitCurrentOrder();
      return;
    }

    dispatch({ type: 'NEXT_STEP' });
  }, [state.step, submitCurrentOrder]);

  const prevStep = React.useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const reset = React.useCallback(() => {
    dispatch({ type: 'RESET' });
    setSubmissionFeedback({
      status: 'idle',
      message: null,
      orderId: null,
    });
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
      submissionFeedback,
      clearSubmissionFeedback,
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
      submissionFeedback,
      clearSubmissionFeedback,
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