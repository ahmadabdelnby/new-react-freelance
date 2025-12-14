import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../config';
import storage from '../storage';

// Get profile completion percentage
export const getProfileCompletion = createAsyncThunk(
    'profile/getCompletion',
    async (_, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const response = await fetch(API_ENDPOINTS.PROFILE_COMPLETION, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch profile completion');
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch profile completion');
        }
    }
);

// Fetch own profile (authenticated user)
export const fetchMyProfile = createAsyncThunk(
    'profile/fetchMyProfile',
    async (_, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const response = await fetch(API_ENDPOINTS.PROFILE, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch profile');
            }
            // API returns { message, user }
            return data.user || data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch profile');
        }
    }
);

// Fetch other user by id
export const fetchUserById = createAsyncThunk(
    'profile/fetchUserById',
    async (userId, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const response = await fetch(API_ENDPOINTS.USER_BY_ID(userId), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch user');
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch user');
        }
    }
);

// Update About Me (own profile)
export const updateAboutMe = createAsyncThunk(
    'profile/updateAboutMe',
    async (aboutMe, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ aboutMe })
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to update About Me');
            }
            return data.user || data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update About Me');
        }
    }
);

// Update Skills (own profile)
export const updateSkills = createAsyncThunk(
    'profile/updateSkills',
    async (skillIds, { rejectWithValue }) => {
        try {
            const token = storage.get('token');
            const payload = Array.isArray(skillIds)
                ? { skills: skillIds.map(id => ({ skillId: id })) }
                : { skills: [] };
            const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to update skills');
            }
            return data.user || data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update skills');
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        profileUser: null,
        otherUser: null,
        completion: {
            percentage: 0,
            missingFields: [],
            suggestions: []
        },
        loading: false,
        updating: false,
        error: null
    },
    reducers: {
        clearProfileError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProfileCompletion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProfileCompletion.fulfilled, (state, action) => {
                state.loading = false;
                state.completion = action.payload;
            })
            .addCase(getProfileCompletion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profileUser = action.payload;
            })
            .addCase(fetchMyProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.loading = false;
                state.otherUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateAboutMe.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateAboutMe.fulfilled, (state, action) => {
                state.updating = false;
                state.profileUser = action.payload;
            })
            .addCase(updateAboutMe.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            })
            .addCase(updateSkills.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateSkills.fulfilled, (state, action) => {
                state.updating = false;
                state.profileUser = action.payload;
            })
            .addCase(updateSkills.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            })
    }
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
