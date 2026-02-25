// City Club HMS - Optix GraphQL Queries
// Read operations for products, members, and orders

import { gql } from 'graphql-request';

// ============================================
// PRODUCT QUERIES
// ============================================

export const GET_PRODUCTS = gql`
  query GetProducts($locationId: ID!, $categoryId: ID) {
    products(locationId: $locationId, categoryId: $categoryId) {
      id
      name
      price
      description
      availableQuantity
      isAvailable
      allergens
      category {
        id
        name
        color
      }
      modifierGroups {
        id
        name
        required
        maxSelections
        modifiers {
          id
          name
          priceAdjustment
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    product(id: $id) {
      id
      name
      price
      description
      availableQuantity
      isAvailable
      allergens
      category {
        id
        name
        color
      }
      modifierGroups {
        id
        name
        required
        maxSelections
        modifiers {
          id
          name
          priceAdjustment
        }
      }
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!, $locationId: ID!) {
    products(search: $query, locationId: $locationId) {
      id
      name
      price
      description
      availableQuantity
      isAvailable
      allergens
      category {
        id
        name
        color
      }
    }
  }
`;

// ============================================
// MEMBER QUERIES
// ============================================

export const SEARCH_MEMBERS = gql`
  query SearchMembers($query: String!, $limit: Int) {
    members(search: $query, first: $limit) {
      id
      firstName
      lastName
      accountNumber
      balance
      discountTier
      email
      phone
      recentOrders {
        id
        createdAt
      }
    }
  }
`;

export const GET_RECENT_MEMBERS = gql`
  query GetRecentMembers($limit: Int) {
    members(orderBy: LAST_ORDER_DESC, first: $limit) {
      id
      firstName
      lastName
      accountNumber
      balance
      discountTier
    }
  }
`;

export const GET_MEMBER_BY_ID = gql`
  query GetMemberById($id: ID!) {
    member(id: $id) {
      id
      firstName
      lastName
      accountNumber
      balance
      discountTier
      email
      phone
      recentOrders {
        id
        createdAt
      }
    }
  }
`;

// ============================================
// ORDER/CHARGE QUERIES
// ============================================

export const GET_CHARGE_BY_ID = gql`
  query GetChargeById($id: ID!) {
    charge(id: $id) {
      id
      orderNumber
      memberId
      memberName
      tableId
      seatNumbers
      status
      lineItems {
        id
        productId
        productName
        quantity
        unitPrice
        lineTotal
        modifiers {
          modifierId
          modifierName
          priceAdjustment
        }
        notes
      }
      subtotal
      discountPercent
      discountAmount
      taxAmount
      total
      notes
      kitchenNotes
      scheduledTime
      createdAt
      submittedAt
    }
  }
`;

export const GET_ACTIVE_CHARGES = gql`
  query GetActiveCharges($locationId: ID!) {
    charges(locationId: $locationId, status: [DRAFT, SUBMITTED]) {
      id
      orderNumber
      memberName
      tableId
      status
      total
      createdAt
    }
  }
`;

// ============================================
// CATEGORY QUERIES
// ============================================

export const GET_CATEGORIES = gql`
  query GetCategories($locationId: ID!) {
    categories(locationId: $locationId) {
      id
      name
      color
      productCount
    }
  }
`;
