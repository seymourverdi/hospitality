// City Club HMS - Order Context
// Global state for current order

'use client';

import * as React from 'react';
import type { Member } from '@/core/database.types';

const TAX_RATE = 0.0875; // 8.75%

// Local types for order context
export interface ContextOrderItem {
  id: string;
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  modifiers: { groupId: string; optionId: string; name: string; priceAdjustment: number }[];
  note?: string;
}

type OrderStep = 'items' | 'table' | 'submit';

interface OrderState {
  step: OrderStep;
  member: Member | null;
  isNonMember: boolean;
  guestName: string;
  guestCount: number;
  tableId: string | null;
  items: ContextOrderItem[];
  notes: string;
  kitchenNotes: string;
  scheduledTime: Date | null;
  discountPercent: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

type OrderAction =
  | { type: 'SET_STEP'; step: OrderStep }
  | { type: 'SET_MEMBER'; member: Member | null }
  | { type: 'SET_NON_MEMBER'; isNonMember: boolean; guestName?: string }
  | { type: 'SET_GUEST_COUNT'; count: number }
  | { type: 'SET_TABLE'; tableId: string | null }
  | { type: 'ADD_ITEM'; item: ContextOrderItem }
  | { type: 'UPDATE_ITEM'; itemId: string; updates: Partial<ContextOrderItem> }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'CLEAR_ITEMS' }
  | { type: 'SET_NOTES'; notes: string }
  | { type: 'SET_KITCHEN_NOTES'; kitchenNotes: string }
  | { type: 'SET_SCHEDULED_TIME'; time: Date | null }
  | { type: 'SET_DISCOUNT'; percent: number }
  | { type: 'RESET_ORDER' };

function calculateTotals(items: ContextOrderItem[], discountPercent: number) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * TAX_RATE;
  const total = taxableAmount + taxAmount;

  return { subtotal, taxAmount, total };
}

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };

    case 'SET_MEMBER':
      return {
        ...state,
        member: action.member,
        isNonMember: false,
        guestName: '',
        discountPercent: action.member?.default_discount_percent || 0,
      };

    case 'SET_NON_MEMBER':
      return {
        ...state,
        member: null,
        isNonMember: action.isNonMember,
        guestName: action.guestName || '',
        discountPercent: 0,
      };

    case 'SET_GUEST_COUNT':
      return { ...state, guestCount: action.count };

    case 'SET_TABLE':
      return { ...state, tableId: action.tableId };

    case 'ADD_ITEM': {
      const items = [...state.items, action.item];
      const totals = calculateTotals(items, state.discountPercent);
      return { ...state, items, ...totals };
    }

    case 'UPDATE_ITEM': {
      const items = state.items.map((item) =>
        item.id === action.itemId ? { ...item, ...action.updates } : item
      );
      const totals = calculateTotals(items, state.discountPercent);
      return { ...state, items, ...totals };
    }

    case 'REMOVE_ITEM': {
      const items = state.items.filter((item) => item.id !== action.itemId);
      const totals = calculateTotals(items, state.discountPercent);
      return { ...state, items, ...totals };
    }

    case 'CLEAR_ITEMS': {
      return {
        ...state,
        items: [],
        subtotal: 0,
        taxAmount: 0,
        total: 0,
      };
    }

    case 'SET_NOTES':
      return { ...state, notes: action.notes };

    case 'SET_KITCHEN_NOTES':
      return { ...state, kitchenNotes: action.kitchenNotes };

    case 'SET_SCHEDULED_TIME':
      return { ...state, scheduledTime: action.time };

    case 'SET_DISCOUNT': {
      const totals = calculateTotals(state.items, action.percent);
      return { ...state, discountPercent: action.percent, ...totals };
    }

    case 'RESET_ORDER':
      return initialOrderState;

    default:
      return state;
  }
}

const initialOrderState: OrderState = {
  step: 'items',
  member: null,
  isNonMember: false,
  guestName: '',
  guestCount: 1,
  tableId: null,
  items: [],
  notes: '',
  kitchenNotes: '',
  scheduledTime: null,
  discountPercent: 0,
  subtotal: 0,
  taxAmount: 0,
  total: 0,
};

interface OrderContextValue {
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
  // Convenience methods
  addItem: (item: ContextOrderItem) => void;
  updateItem: (itemId: string, updates: Partial<ContextOrderItem>) => void;
  removeItem: (itemId: string) => void;
  setStep: (step: OrderState['step']) => void;
  nextStep: () => void;
  prevStep: () => void;
  canProceed: boolean;
  resetOrder: () => void;
}

const OrderContext = React.createContext<OrderContextValue | undefined>(
  undefined
);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(orderReducer, initialOrderState);

  const addItem = React.useCallback((item: ContextOrderItem) => {
    dispatch({ type: 'ADD_ITEM', item });
  }, []);

  const updateItem = React.useCallback(
    (itemId: string, updates: Partial<ContextOrderItem>) => {
      dispatch({ type: 'UPDATE_ITEM', itemId, updates });
    },
    []
  );

  const removeItem = React.useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', itemId });
  }, []);

  const setStep = React.useCallback((step: OrderState['step']) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const nextStep = React.useCallback(() => {
    const steps: OrderStep[] = ['items', 'table', 'submit'];
    const currentIndex = steps.indexOf(state.step);
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      const nextStepValue = steps[nextIndex];
      if (nextStepValue) {
        dispatch({ type: 'SET_STEP', step: nextStepValue });
      }
    }
  }, [state.step]);

  const prevStep = React.useCallback(() => {
    const steps: OrderStep[] = ['items', 'table', 'submit'];
    const currentIndex = steps.indexOf(state.step);
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      const prevStepValue = steps[prevIndex];
      if (prevStepValue) {
        dispatch({ type: 'SET_STEP', step: prevStepValue });
      }
    }
  }, [state.step]);

  const resetOrder = React.useCallback(() => {
    dispatch({ type: 'RESET_ORDER' });
  }, []);

  // Determine if user can proceed to next step
  const canProceed = React.useMemo(() => {
    switch (state.step) {
      case 'items':
        return state.items.length > 0 && (state.member !== null || state.isNonMember);
      case 'table':
        return state.tableId !== null;
      case 'submit':
        return true;
      default:
        return false;
    }
  }, [state.step, state.items, state.member, state.isNonMember, state.tableId]);

  const value = React.useMemo(
    () => ({
      state,
      dispatch,
      addItem,
      updateItem,
      removeItem,
      setStep,
      nextStep,
      prevStep,
      canProceed,
      resetOrder,
    }),
    [state, addItem, updateItem, removeItem, setStep, nextStep, prevStep, canProceed, resetOrder]
  );

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrder() {
  const context = React.useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
