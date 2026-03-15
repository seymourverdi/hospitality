import type { Repositories, RepositoryConfig } from "./types";
import { MockProductRepository, MockMemberRepository, MockOrderRepository } from "./mock";

import { ApiClient } from "./api/http";
import { ApiProductRepository } from "./api/ProductRepository";
import { ApiMemberRepository } from "./api/MemberRepository";
import { ApiOrderRepository } from "./api/OrderRepository";

export * from "./types";

export function createRepositories(config?: RepositoryConfig): Repositories {
  const useApi = config?.useOptix ?? (process.env.NEXT_PUBLIC_SALE_USE_API !== "0");

  if (!useApi) {
    return {
      products: new MockProductRepository(),
      members: new MockMemberRepository(),
      orders: new MockOrderRepository(),
    };
  }

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