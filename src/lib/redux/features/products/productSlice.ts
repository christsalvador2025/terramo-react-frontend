// src/features/products/productsSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of a single product
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
}

// Define the shape of the entire products state
export interface ProductsState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

// Set the initial state
const initialState: ProductsState = {
  items: [],
  isLoading: false,
  error: null,
};

// Create the slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // Action to set the products data
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    // Action to add a single product
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    },
    // Action to update a product
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(
        (product) => product.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    // Action to remove a product
    removeProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (product) => product.id !== action.payload
      );
    },
    // Action to set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // Action to set an error message
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

// Export the actions
export const {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setLoading,
  setError,
} = productsSlice.actions;

// Export the reducer
export default productsSlice.reducer;