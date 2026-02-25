// src/core/repositories/index.ts
import type { Repositories, RepositoryConfig } from "./types";
import { MockProductRepository, MockMemberRepository, MockOrderRepository } from "./mock";

import { ApiClient } from "./api/http";
import { ApiProductRepository } from "./api/ProductRepository";
import { ApiMemberRepository } from "./api/MemberRepository";
import { ApiOrderRepository } from "./api/OrderRepository";

export * from "./types";

export function createRepositories(config?: RepositoryConfig): Repositories {
  const useOptix = config?.useOptix ?? false;

  if (useOptix) {
    const api = new ApiClient({
      baseUrl: "",
      getToken: () => {      
        return null;
      },
    });

    return {
      products: new ApiProductRepository(api),
      members: new ApiMemberRepository(api),
      orders: new ApiOrderRepository(api),
    };
  }

  return {
    products: new MockProductRepository(),
    members: new MockMemberRepository(),
    orders: new MockOrderRepository(),
  };
}