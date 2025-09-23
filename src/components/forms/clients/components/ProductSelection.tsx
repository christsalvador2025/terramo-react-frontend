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
   
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Produktdetails</h3>
      <div className="space-y-3">
        {products?.map((product) => (
          <div key={product.id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={`product-${product.id}`}
              checked={selectedProducts.includes(product.id)}
              onChange={() => handleProductToggle(product.id)}
              className="appearance-none size-5 border border-gray-400 rounded-md checked:bg-white checked:border-gray-400 productdata"
               
            />
            <label
              htmlFor={`product-${product.id}`}
              className="text-[16px] font-medium text-[#1C1B1F] cursor-pointer"
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