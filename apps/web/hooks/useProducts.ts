"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../lib/api/services/productService";
import { queryKeys } from "../lib/api/utils/queryKeys";
import type {
  ProductResponse,
  ProductCreatePayload,
  ProductUpdatePayload,
} from "../types/product";

export function useProducts() {
  return useQuery<ProductResponse[]>({
    queryKey: queryKeys.products.all,
    queryFn: () => productService.getProducts(),
  });
}

export function useProduct(productId?: string) {
  return useQuery<ProductResponse>({
    queryKey: queryKeys.products.detail(productId || ""),
    queryFn: () => productService.getProduct(productId || ""),
    enabled: Boolean(productId),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation<ProductResponse, unknown, ProductCreatePayload>({
    mutationFn: (payload) => productService.createProduct(payload),
    onSuccess: (newProduct) => {
      queryClient.setQueryData<ProductResponse[] | undefined>(
        queryKeys.products.all,
        (old) => [newProduct, ...(old || [])],
      );
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation<
    ProductResponse,
    unknown,
    { id: string; payload: ProductUpdatePayload }
  >({
    mutationFn: ({ id, payload }) => productService.updateProduct(id, payload),
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData<ProductResponse[] | undefined>(
        queryKeys.products.all,
        (old) => old?.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
      );
      queryClient.setQueryData(
        queryKeys.products.detail(updatedProduct.id),
        updatedProduct,
      );
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (productId) => productService.deleteProduct(productId),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<ProductResponse[] | undefined>(
        queryKeys.products.all,
        (old) => old?.filter((p) => p.id !== deletedId),
      );
    },
  });
}
