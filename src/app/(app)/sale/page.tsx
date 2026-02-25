// City Club HMS - Sale POS Page
// Complete Sale screen matching Figma design exactly
// Uses modular components from Sale module

'use client';

import * as React from 'react';

// Context
import { SaleProvider, useSale } from '@/modules/Sale/context/SaleContext';

// Components
import { TopBar } from '@/modules/Sale/components/TopBar';
import { OrderSummaryPanel } from '@/modules/Sale/components/OrderSummaryPanel';
import { StepperNav } from '@/modules/Sale/components/StepperNav';

// Screens
import { SelectItemsScreen } from '@/modules/Sale/screens/SelectItemsScreen';
import { SelectPersonScreen } from '@/modules/Sale/screens/SelectPersonScreen';
import { SelectTableScreen } from '@/modules/Sale/screens/SelectTableScreen';

// Modals
import { ModifiersModal } from '@/modules/Sale/modals/ModifiersModal';
import { CustomNoteModal } from '@/modules/Sale/modals/CustomNoteModal';
import { ScheduleModal } from '@/modules/Sale/modals/ScheduleModal';

// Constants
import { KITCHEN_NOTICE } from '@/modules/Sale/constants';

import type { SelectedModifier } from '@/modules/Sale/types';

// ============================================
// SALE PAGE CONTENT (uses context)
// ============================================

function SalePageContent() {
  const {
    state,
    subtotal,
    tax,
    total,
    itemCount,
    currentStepNumber,
    canProceedToNextStep,
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

  // Get the note for the currently editing item
  const editingItem = editingItemId ? items.find((i) => i.id === editingItemId) : null;

  // Handle applying modifiers from modal
  const handleApplyModifiers = (modifiers: SelectedModifier[]) => {
    if (pendingProduct) {
      addItem(pendingProduct, modifiers);
    }
    hideModifierModal();
  };

  // Handle saving note
  const handleSaveNote = (note: string) => {
    if (editingItemId) {
      setItemNote(editingItemId, note);
    }
    hideNoteModal();
  };

  // Handle schedule
  const handleSchedule = (time: Date | null) => {
    setScheduledTime(time);
    closeScheduleModal();
  };

  // Render the current step's content
  const renderStepContent = () => {
    switch (step) {
      case 'select-items':
        return <SelectItemsScreen />;
      case 'select-person':
        return <SelectPersonScreen />;
      case 'select-table':
        return <SelectTableScreen />;
      case 'submit':
        // Final confirmation step
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
      {/* Left Side - Top Bar + Step Content + Bottom Stepper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Search, Notice, Toggles */}
        <TopBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          isNonMember={isNonMember}
          onNonMemberToggle={toggleNonMember}
          skipSeating={skipSeating}
          onSkipSeatingToggle={toggleSkipSeating}
          selectedMember={selectedMember}
          kitchenNotice={KITCHEN_NOTICE}
        />

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          {renderStepContent()}
        </div>

        {/* Bottom Stepper Navigation - spans full width of main content */}
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

      {/* Right Side - Order Summary Panel (full height) */}
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

      {/* Modals */}
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

// ============================================
// MAIN PAGE EXPORT (with Provider)
// ============================================

export default function SalePage() {
  return (
    <SaleProvider>
      <SalePageContent />
    </SaleProvider>
  );
}
