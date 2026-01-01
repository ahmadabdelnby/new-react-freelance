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

// Add reply to a review
export const addReviewReply = createAsyncThunk(
    'reviews/addReviewReply',
    async ({ reviewId, content }, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const response = await fetch(`${BASE_URL}/reviews/${reviewId}/reply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to add reply');
            }

            return data.review;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to add reply');
        }
    }
);

// Update reply to a review
export const updateReviewReply = createAsyncThunk(
    'reviews/updateReviewReply',
    async ({ reviewId, content }, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const response = await fetch(`${BASE_URL}/reviews/${reviewId}/reply`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to update reply');
            }

            return data.review;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update reply');
        }
    }
);

// Delete reply from a review
export const deleteReviewReply = createAsyncThunk(
    'reviews/deleteReviewReply',
    async (reviewId, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const response = await fetch(`${BASE_URL}/reviews/${reviewId}/reply`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to delete reply');
            }

            return reviewId;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete reply');
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
            })
            // Add reply
            .addCase(addReviewReply.pending, (state) => {
                state.error = null;
            })
            .addCase(addReviewReply.fulfilled, (state, action) => {
                const index = state.reviews.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.reviews[index] = action.payload;
                }
            })
            .addCase(addReviewReply.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Update reply
            .addCase(updateReviewReply.pending, (state) => {
                state.error = null;
            })
            .addCase(updateReviewReply.fulfilled, (state, action) => {
                const index = state.reviews.findIndex(r => r._id === action.payload._id);
                if (index !== -1) {
                    state.reviews[index] = action.payload;
                }
            })
            .addCase(updateReviewReply.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Delete reply
            .addCase(deleteReviewReply.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteReviewReply.fulfilled, (state, action) => {
                const index = state.reviews.findIndex(r => r._id === action.payload);
                if (index !== -1) {
                    state.reviews[index].freelancerReply = null;
                }
            })
            .addCase(deleteReviewReply.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export const { clearReviewState } = reviewsSlice.actions;
export default reviewsSlice.reducer;
