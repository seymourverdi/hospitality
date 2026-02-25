// src/core/repositories/api/MemberRepository.ts
import type { IMemberRepository } from "@/core/repositories/types";
import type { Member } from "@/modules/Sale/types";
import { ApiClient } from "./http";

export class ApiMemberRepository implements IMemberRepository {
  private api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  async searchMembers(query: string): Promise<Member[]> {
    void query; 
    return [];
  }

  async getRecentMembers(limit = 10): Promise<Member[]> {
    void limit; 
    return [];
  }

  async getMemberById(id: string): Promise<Member | null> {
    void id;
    return null;
  }

  async getMemberByAccount(accountNumber: string): Promise<Member | null> {
    void accountNumber;  
    return null;
  }
}