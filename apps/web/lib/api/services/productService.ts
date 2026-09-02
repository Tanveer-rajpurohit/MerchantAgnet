import { api } from "../utils/fetchClient";
import type {
  ProductResponse,
  ProductCreatePayload,
  ProductUpdatePayload,
} from "../../../types";

export const productService = {
  async getProducts(): Promise<ProductResponse[]> {
    return await api.get<ProductResponse[]>("/products");
  },

  async getProduct(productId: string): Promise<ProductResponse> {
    return await api.get<ProductResponse>(`/products/${productId}`);
  },

  async createProduct(payload: ProductCreatePayload): Promise<ProductResponse> {
    return await api.post<ProductResponse>("/products", payload);
  },

  async updateProduct(
    productId: string,
    payload: ProductUpdatePayload,
  ): Promise<ProductResponse> {
    return await api.put<ProductResponse>(`/products/${productId}`, payload);
  },

  async deleteProduct(productId: string): Promise<void> {
    await api.delete<void>(`/products/${productId}`);
  },
};
