// City Club HMS - Optix GraphQL Client
// Type-safe wrapper for Optix API integration

import { GraphQLClient } from 'graphql-request';

// Environment variables for Optix connection
const OPTIX_ENDPOINT = process.env.NEXT_PUBLIC_OPTIX_GRAPHQL_URL || 'https://api.optixapp.com/graphql';
const OPTIX_API_KEY = process.env.OPTIX_API_KEY || '';

// GraphQL client instance
export const optixClient = new GraphQLClient(OPTIX_ENDPOINT, {
  headers: {
    Authorization: `Bearer ${OPTIX_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Type-safe query wrapper with error handling
export async function optixQuery<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    return await optixClient.request<T>(query, variables);
  } catch (error) {
    console.error('Optix query failed:', error);
    throw error;
  }
}

// Type-safe mutation wrapper with error handling
export async function optixMutation<T>(
  mutation: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    return await optixClient.request<T>(mutation, variables);
  } catch (error) {
    console.error('Optix mutation failed:', error);
    throw error;
  }
}

// Check if Optix is configured
export function isOptixConfigured(): boolean {
  return Boolean(process.env.OPTIX_API_KEY);
}
