"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { TRegisterClientAdminSchema } from "../validations/_clientSchema";
// import { Checkbox } from "../../ui/Checkbox";
import { Products } from "../types/clients";

interface ProductSelectionProps {
  form: UseFormReturn<TRegisterClientAdminSchema>;
  products: Products[];
  isLoading: boolean;
}

export const ProductSelection: React.FC<ProductSelectionProps> = ({
  form,
  products,
  isLoading,
}) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const selectedProducts = watch("product_ids") || [];

  const handleProductToggle = (productId: string) => {
    const currentProducts = selectedProducts;
    const updatedProducts = currentProducts.includes(productId)
      ? currentProducts.filter((id) => id !== productId)
      : [...currentProducts, productId];
    
    setValue("product_ids", updatedProducts);
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading products...</div>;
  }
console.log('products->', products)
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
      <div className="space-y-3">
        {products?.results?.map((product) => (
          <div key={product.id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={`product-${product.id}`}
              checked={selectedProducts.includes(product.id)}
              onChange={() => handleProductToggle(product.id)}
              className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor={`product-${product.id}`}
              className="text-sm font-medium text-gray-700"
            >
              {product.name}
            </label>
          </div>
        ))}
      </div>
      {errors.product_ids && (
        <p className="text-sm text-red-600">{errors.product_ids.message}</p>
      )}
    </div>
  );
};