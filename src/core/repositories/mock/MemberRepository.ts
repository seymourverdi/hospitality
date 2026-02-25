// City Club HMS - Mock Member Repository
// Uses mock data from Sale constants for development

import type { IMemberRepository } from '../types';
import type { Member } from '@/modules/Sale/types';
import {
  MEMBERS,
  searchMembers as searchMockMembers,
} from '@/modules/Sale/constants';

export class MockMemberRepository implements IMemberRepository {
  async searchMembers(query: string): Promise<Member[]> {
    // Simulate network delay
    await this.delay(100);
    return searchMockMembers(query);
  }

  async getRecentMembers(limit: number = 10): Promise<Member[]> {
    await this.delay(100);
    // Return first N members as "recent"
    return MEMBERS.slice(0, limit);
  }

  async getMemberById(id: string): Promise<Member | null> {
    await this.delay(50);
    return MEMBERS.find((m) => m.id === id) || null;
  }

  async getMemberByAccount(accountNumber: string): Promise<Member | null> {
    await this.delay(50);
    return MEMBERS.find((m) => m.accountNumber === accountNumber) || null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
