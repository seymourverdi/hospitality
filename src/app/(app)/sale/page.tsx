// City Club HMS - Sale POS Page
// Complete Sale screen matching Figma design exactly
// Uses modular components from Sale module

'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { SaleProvider, useSale } from '@/modules/Sale/context/SaleContext';

import { TopBar } from '@/modules/Sale/components/TopBar';
import { OrderSummaryPanel } from '@/modules/Sale/components/OrderSummaryPanel';
import { StepperNav } from '@/modules/Sale/components/StepperNav';

import { SelectItemsScreen } from '@/modules/Sale/screens/SelectItemsScreen';
import { SelectPersonScreen } from '@/modules/Sale/screens/SelectPersonScreen';
import { SelectTableScreen } from '@/modules/Sale/screens/SelectTableScreen';

import { ModifiersModal } from '@/modules/Sale/modals/ModifiersModal';
import { CustomNoteModal } from '@/modules/Sale/modals/CustomNoteModal';
import { ScheduleModal } from '@/modules/Sale/modals/ScheduleModal';

import { KITCHEN_NOTICE } from '@/modules/Sale/constants';

import type { SelectedModifier, Product, Table } from '@/modules/Sale/types';

type HydrateResponse = {
  ok: boolean;
  table?: Table;
  order?: {
    id: number;
    status: string;
    seatNumbers: number[];
    items: Array<{
      id: number;
      qty: number;
      note: string;
      modifiers: SelectedModifier[];
      product: Product;
    }>;
  } | null;
  error?: string;
};

function SaleHydrator() {
  const searchParams = useSearchParams();
  const hydratedKeyRef = React.useRef<string | null>(null);

  const {
    reset,
    selectTable,
    addItem,
  } = useSale();

  React.useEffect(() => {
    const tableIdParam = searchParams.get('tableId');

    if (!tableIdParam) {
      hydratedKeyRef.current = null;
      return;
    }

    const tableId = tableIdParam;

    let cancelled = false;

    async function hydrate() {
      try {
        const res = await fetch(
          `/api/sale/orders/by-table?tableId=${encodeURIComponent(tableId)}`,
          {
            method: 'GET',
            cache: 'no-store',
          }
        );

        const data = (await res.json()) as HydrateResponse;

        if (!res.ok || !data.ok || !data.table) {
          throw new Error(data.error || 'Failed to hydrate sale by table');
        }

        if (cancelled) return;

        reset();
        selectTable(data.table, data.order?.seatNumbers ?? []);

        if (data.order?.items?.length) {
          for (const item of data.order.items) {
            addItem(item.product, item.modifiers ?? [], item.qty);
          }
        }

        hydratedKeyRef.current = tableId;
      } catch (error) {
        console.error('Failed to hydrate sale page', error);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [searchParams, reset, selectTable, addItem]);

  return null;
}

type SaleConfig = {
  showSkipSeating: boolean;
  showNonMember: boolean;
  showAllModifiersByDefault: boolean;
  noticeEnabled: boolean;
  noticeMessage: string;
};

const DEFAULT_SALE_CONFIG: SaleConfig = {
  showSkipSeating: true,
  showNonMember: true,
  showAllModifiersByDefault: true,
  noticeEnabled: true,
  noticeMessage: '',
};

function SalePageContent() {
  const router = useRouter();

  const [saleConfig, setSaleConfig] = React.useState<SaleConfig>(DEFAULT_SALE_CONFIG);

  React.useEffect(() => {
    void (async () => {
      try {
        const res  = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await res.json() as { ok: boolean; settings?: { saleConfig?: Partial<SaleConfig> } };
        if (data.ok && data.settings?.saleConfig) {
          setSaleConfig(prev => ({ ...prev, ...data.settings!.saleConfig }));
        }
      } catch { /* keep defaults */ }
    })();
  }, []);

  const {
    state,
    subtotal,
    tax,
    total,
    itemCount,
    currentStepNumber,
    canProceedToNextStep,
    submissionFeedback,
    clearSubmissionFeedback,
    setSearchQuery,
    toggleNonMember,
    toggleSkipSeating,
    updateQuantity,
    setDiscount,
    setScheduledTime,
    addItem,
    setItemNote,
    nextStep,
    prevStep,
    hideModifierModal,
    hideNoteModal,
    showScheduleModal: openScheduleModal,
    hideScheduleModal: closeScheduleModal,
  } = useSale();

  const {
    step,
    items,
    selectedMember,
    isNonMember,
    skipSeating,
    searchQuery,
    discountTier,
    scheduledTime,
    showModifierModal,
    showNoteModal,
    showScheduleModal,
    pendingProduct,
    editingItemId,
  } = state;

  const editingItem = editingItemId ? items.find((i) => i.id === editingItemId) : null;

  React.useEffect(() => {
    if (submissionFeedback.status !== 'success') {
      return;
    }

    const timer = window.setTimeout(() => {
      clearSubmissionFeedback();
      router.push('/tables');
    }, 1200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [submissionFeedback.status, clearSubmissionFeedback, router]);

  const handleApplyModifiers = (modifiers: SelectedModifier[]) => {
    if (pendingProduct) {
      addItem(pendingProduct, modifiers);
    }
    hideModifierModal();
  };

  const handleSaveNote = (note: string) => {
    if (editingItemId) {
      setItemNote(editingItemId, note);
    }
    hideNoteModal();
  };

  const handleSchedule = (time: Date | null) => {
    setScheduledTime(time);
    closeScheduleModal();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'select-items':
        return <SelectItemsScreen />;

      case 'select-person':
        return <SelectPersonScreen />;

      case 'select-table':
        return <SelectTableScreen />;

      case 'submit':
        return (
          <div className="flex-1 flex items-center justify-center bg-sale-bg">
            <div className="text-center">
              <h2 className="text-white text-2xl font-semibold mb-4">Ready to Submit</h2>
              <p className="text-white/60 mb-6">
                Review your order and click Submit to complete
              </p>
              <div className="text-white/40 text-sm">
                {itemCount} items • ${total.toFixed(2)} total
              </div>
            </div>
          </div>
        );

      default:
        return <SelectItemsScreen />;
    }
  };

  return (
    <div className="h-screen flex bg-sale-bg">
      <SaleHydrator />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          isNonMember={isNonMember}
          onNonMemberToggle={toggleNonMember}
          skipSeating={skipSeating}
          onSkipSeatingToggle={toggleSkipSeating}
          selectedMember={selectedMember}
          showSkipSeating={saleConfig.showSkipSeating}
          showNonMember={saleConfig.showNonMember}
          kitchenNotice={
            saleConfig.noticeEnabled
              ? { message: saleConfig.noticeMessage || KITCHEN_NOTICE.message, active: true }
              : { message: '', active: false }
          }
        />

        {submissionFeedback.status !== 'idle' && submissionFeedback.message ? (
          <div className="px-4 pt-3">
            <div
              className={[
                'rounded-xl px-4 py-3 flex items-center justify-between',
                submissionFeedback.status === 'success'
                  ? 'bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-[#86efac]'
                  : submissionFeedback.status === 'error'
                    ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                    : 'bg-white/10 border border-white/10 text-white/70',
              ].join(' ')}
            >
              <span className="text-sm font-medium">{submissionFeedback.message}</span>
              <button
                type="button"
                onClick={clearSubmissionFeedback}
                className="ml-4 text-xs opacity-80 hover:opacity-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex-1 overflow-hidden">
          {renderStepContent()}
        </div>

        <StepperNav
          currentStep={currentStepNumber}
          skipSeating={skipSeating}
          itemCount={itemCount}
          total={total}
          tax={tax}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          canProceed={canProceedToNextStep}
        />
      </div>

      <OrderSummaryPanel
        items={items}
        selectedMember={selectedMember}
        isNonMember={isNonMember}
        skipSeating={skipSeating}
        currentStep={currentStepNumber}
        selectedDiscount={discountTier}
        subtotal={subtotal}
        tax={tax}
        total={total}
        itemCount={itemCount}
        scheduledTime={scheduledTime}
        canProceed={canProceedToNextStep}
        onIncrease={(itemId) => updateQuantity(itemId, 1)}
        onDecrease={(itemId) => updateQuantity(itemId, -1)}
        onDiscountChange={setDiscount}
        onScheduleClick={openScheduleModal}
        onNextStep={nextStep}
        onPrevStep={prevStep}
      />

      <ModifiersModal
        isOpen={showModifierModal}
        product={pendingProduct}
        onClose={hideModifierModal}
        onApply={handleApplyModifiers}
      />

      <CustomNoteModal
        isOpen={showNoteModal}
        initialNote={editingItem?.note || ''}
        onClose={hideNoteModal}
        onSave={handleSaveNote}
      />

      <ScheduleModal
        isOpen={showScheduleModal}
        initialTime={scheduledTime}
        onClose={closeScheduleModal}
        onSchedule={handleSchedule}
      />
    </div>
  );
}

export default function SalePage() {
  return (
    <SaleProvider>
      <SalePageContent />
    </SaleProvider>
  );
}