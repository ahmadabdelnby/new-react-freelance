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
            const userData = data.user || data;

            // Update localStorage
            storage.setJSON('user', userData);

            return userData;
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

            if (!token) {
                return rejectWithValue('No authentication token found');
            }

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
            console.error('❌ Update About Me error:', error);
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
            // Send skills as a direct array of ObjectIds
            const payload = { skills: Array.isArray(skillIds) ? skillIds : [] };
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

// Update Basic Info (own profile)
export const updateBasicInfo = createAsyncThunk(
    'profile/updateBasicInfo',
    async (basicInfo, { rejectWithValue }) => {
        try {
            const token = storage.get('token');

            if (!token) {
                return rejectWithValue('No authentication token found');
            }

            const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(basicInfo)
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to update profile information');
            }

            // Update user in storage
            const updatedUser = data.user || data;
            storage.setJSON('user', updatedUser);

            return updatedUser;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update profile information');
        }
    }
);

// Parse CV and extract data
export const parseCV = createAsyncThunk(
    'profile/parseCV',
    async (cvFile, { rejectWithValue }) => {
        try {
            const token = storage.get('token');

            if (!token) {
                return rejectWithValue('No authentication token found');
            }

            if (!cvFile) {
                return rejectWithValue('No CV file provided');
            }

            // Validate file type
            if (cvFile.type !== 'application/pdf') {
                return rejectWithValue('Only PDF files are supported');
            }

            // Validate file size (max 10MB)
            if (cvFile.size > 10 * 1024 * 1024) {
                return rejectWithValue('File size must be less than 10MB');
            }

            const formData = new FormData();
            formData.append('cv', cvFile);

            const response = await fetch(API_ENDPOINTS.PARSE_CV, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to parse CV');
            }

            // Return extracted data
            return data.data || data;
        } catch (error) {
            console.error('❌ Parse CV error:', error);
            return rejectWithValue(error.message || 'Failed to parse CV');
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
        cvData: null,
        parseCVLoading: false,
        loading: false,
        updating: false,
        error: null
    },
    reducers: {
        clearProfileError: (state) => {
            state.error = null;
        },
        clearCVData: (state) => {
            state.cvData = null;
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
            .addCase(updateBasicInfo.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateBasicInfo.fulfilled, (state, action) => {
                state.updating = false;
                state.profileUser = action.payload;
            })
            .addCase(updateBasicInfo.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            })
            .addCase(parseCV.pending, (state) => {
                state.parseCVLoading = true;
                state.error = null;
                state.cvData = null;
            })
            .addCase(parseCV.fulfilled, (state, action) => {
                state.parseCVLoading = false;
                state.cvData = action.payload;
            })
            .addCase(parseCV.rejected, (state, action) => {
                state.parseCVLoading = false;
                state.error = action.payload;
            })
    }
});

export const { clearProfileError, clearCVData } = profileSlice.actions;
export default profileSlice.reducer;
