import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_URL } from '../config';
import storage from '../storage';

// Submit a review
export const submitReview = createAsyncThunk(
    'reviews/submitReview',
    async (reviewData, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const response = await fetch(`${BASE_URL}/reviews`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to submit review');
            }
            
            return data.review;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to submit review');
        }
    }
);

// Get reviews for a user (received reviews)
export const getUserReviews = createAsyncThunk(
    'reviews/getUserReviews',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/reviews/reviewee/${userId}`);
            const data = await response.json();
            
            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch reviews');
            }
            
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch reviews');
        }
    }
);

// Get reviews by contract
export const getContractReviews = createAsyncThunk(
    'reviews/getContractReviews',
    async (contractId, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const response = await fetch(`${BASE_URL}/reviews/contract/${contractId}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch contract reviews');
            }
            
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch contract reviews');
        }
    }
);

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState: {
        reviews: [],
        contractReviews: [],
        loading: false,
        error: null,
        submitSuccess: false
    },
    reducers: {
        clearReviewState: (state) => {
            state.submitSuccess = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Submit review
            .addCase(submitReview.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.submitSuccess = false;
            })
            .addCase(submitReview.fulfilled, (state, action) => {
                state.loading = false;
                state.submitSuccess = true;
                state.reviews.push(action.payload);
            })
            .addCase(submitReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get user reviews
            .addCase(getUserReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(getUserReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get contract reviews
            .addCase(getContractReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getContractReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.contractReviews = action.payload;
            })
            .addCase(getContractReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearReviewState } = reviewsSlice.actions;
export default reviewsSlice.reducer;
