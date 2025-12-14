import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from '../config';

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();
    // Ensure we return an array
    return Array.isArray(data) ? data : (data.categories || []);
  }
);

// Fetch all specialties
export const fetchSpecialties = createAsyncThunk(
  "categories/fetchSpecialties",
  async () => {
    const res = await fetch(`${BASE_URL}/specialties`);
    const data = await res.json();
    return data;
  }
);

// Fetch specialties by category
export const fetchSpecialtiesByCategory = createAsyncThunk(
  "specialties/fetchByCategory",
  async (categoryId) => {
    const res = await fetch(`${BASE_URL}/specialties/category/${categoryId}`);
    const data = await res.json();
    // Ensure we always return an array
    const specialties = Array.isArray(data) ? data : (data.specialties || []);
    return { categoryId, specialties };
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    specialties: [],
    specialtiesByCategory: {}, 
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchSpecialties.fulfilled, (state, action) => {
        state.specialties = action.payload;
      })
      .addCase(fetchSpecialtiesByCategory.fulfilled, (state, action) => {
        const { categoryId, specialties } = action.payload;
        state.specialtiesByCategory[categoryId] = specialties;  
      });
  },
});

export default categoriesSlice.reducer;
