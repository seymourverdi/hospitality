// City Club HMS - Optix GraphQL Mutations
// Write operations for orders/charges

import { gql } from 'graphql-request';

// ============================================
// CHARGE/ORDER MUTATIONS
// ============================================

export const CREATE_CHARGE = gql`
  mutation CreateCharge($input: CreateChargeInput!) {
    createCharge(input: $input) {
      id
      orderNumber
      total
      tax
      status
      lineItems {
        id
        productId
        quantity
        price
        modifiers
        notes
      }
    }
  }
`;

export const UPDATE_CHARGE = gql`
  mutation UpdateCharge($id: ID!, $input: UpdateChargeInput!) {
    updateCharge(id: $id, input: $input) {
      id
      lineItems {
        id
        productId
        quantity
      }
    }
  }
`;

export const ADD_LINE_ITEM = gql`
  mutation AddLineItem($chargeId: ID!, $input: LineItemInput!) {
    addLineItem(chargeId: $chargeId, input: $input) {
      id
      lineItems {
        id
        productId
        quantity
        unitPrice
        lineTotal
      }
      subtotal
      taxAmount
      total
    }
  }
`;

export const UPDATE_LINE_ITEM = gql`
  mutation UpdateLineItem($chargeId: ID!, $lineItemId: ID!, $input: LineItemUpdateInput!) {
    updateLineItem(chargeId: $chargeId, lineItemId: $lineItemId, input: $input) {
      id
      lineItems {
        id
        productId
        quantity
        unitPrice
        lineTotal
      }
      subtotal
      taxAmount
      total
    }
  }
`;

export const REMOVE_LINE_ITEM = gql`
  mutation RemoveLineItem($chargeId: ID!, $lineItemId: ID!) {
    removeLineItem(chargeId: $chargeId, lineItemId: $lineItemId) {
      id
      lineItems {
        id
        productId
        quantity
      }
      subtotal
      taxAmount
      total
    }
  }
`;

export const APPLY_DISCOUNT = gql`
  mutation ApplyDiscount($chargeId: ID!, $discountTier: Int!) {
    applyDiscount(chargeId: $chargeId, discountTier: $discountTier) {
      id
      discount
      total
    }
  }
`;

export const REMOVE_DISCOUNT = gql`
  mutation RemoveDiscount($chargeId: ID!) {
    removeDiscount(chargeId: $chargeId) {
      id
      discount
      total
    }
  }
`;

export const SET_SCHEDULED_TIME = gql`
  mutation SetScheduledTime($chargeId: ID!, $scheduledTime: DateTime) {
    setScheduledTime(chargeId: $chargeId, scheduledTime: $scheduledTime) {
      id
      scheduledTime
    }
  }
`;

export const SUBMIT_CHARGE = gql`
  mutation SubmitCharge($id: ID!, $input: SubmitChargeInput!) {
    submitCharge(id: $id, input: $input) {
      id
      status
      receipt {
        url
      }
    }
  }
`;

export const CANCEL_CHARGE = gql`
  mutation CancelCharge($id: ID!) {
    cancelCharge(id: $id) {
      id
      status
    }
  }
`;

// ============================================
// NON-MEMBER MUTATIONS
// ============================================

export const PROCESS_NON_MEMBER_PAYMENT = gql`
  mutation ProcessNonMemberPayment($chargeId: ID!, $email: String!) {
    processNonMemberPayment(chargeId: $chargeId, email: $email) {
      id
      status
      receiptSentTo
    }
  }
`;
