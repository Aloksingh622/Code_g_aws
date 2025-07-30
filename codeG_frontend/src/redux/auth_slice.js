import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import axios_client from "../utils/axiosconfig";


export const user_register = createAsyncThunk(
    "auth/register",
    async (user_data, { rejectWithValue }) => {
        try {
            const response = await axios_client.post("/user/register", user_data);
            return response.data.user;
        }
        catch (err) {
            return rejectWithValue(err)
        }
    }
)

export const social_login_thunk = createAsyncThunk(
    "auth/socialLogin",
    async (idToken, { rejectWithValue }) => {
        try {
            // This thunk's only job is to send the Firebase ID Token to your backend.
            const response = await axios_client.post("/user/socialLogin", { idToken }, { withCredentials: true });
            // Your backend will verify the token, find/create a user, and return that user.
            return response.data.user;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);




export const user_login = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios_client.post("/user/login", credentials, { withCredentials: true });
            return response.data.user;
        }
        catch (err) {
            return rejectWithValue(err)
        }
    }
)

export const check_auth = createAsyncThunk(
    "auth/check",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios_client.get("/user/check", { withCredentials: true });
            return response.data.user;
        }
        catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                return rejectWithValue({ message: "Unauthorized", forceLogout: true });
            }
            return rejectWithValue({ message: "Server error", forceLogout: false });
        }
    }
)


export const user_logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {

            const response = await axios_client.post("/user/logout");
            return response.data.message;
        }
        catch (err) {
            return rejectWithValue(err)
        }
    }
)

export const user_delete = createAsyncThunk(
    "auth/delete",
    async (_, { rejectWithValue }) => {
        try {
            console.log("hi")
            const response = await axios_client.delete("/user/deleteProfile");
            return response.data.message;
        }
        catch (err) {
            return rejectWithValue(err)
        }
    }
)


const auth_slice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        is_authenticated: false,
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // register
            .addCase(user_register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(user_register.fulfilled, (state, action) => {
                state.loading = false;
                state.is_authenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(user_register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.is_authenticated = false;
                state.user = null;
            })

            // login

            .addCase(user_login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(user_login.fulfilled, (state, action) => {
                state.loading = false;
                state.is_authenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(user_login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.is_authenticated = false;
                state.user = null;
            })

            // check auth

            .addCase(check_auth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(check_auth.fulfilled, (state, action) => {
                state.loading = false;
                state.is_authenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(check_auth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                if (action.payload?.forceLogout) {
                    state.is_authenticated = false;
                    state.user = null;
                }
            })

            // logout

            .addCase(user_logout.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(user_logout.fulfilled, (state, action) => {
                state.loading = false;
                state.is_authenticated = !!action.payload;
                state.user = null
            })
            .addCase(user_logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.is_authenticated = false;
                state.user = null;
            })

            // social_login

            .addCase(social_login_thunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(social_login_thunk.fulfilled, (state, action) => {
                state.loading = false;
                state.is_authenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(social_login_thunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.is_authenticated = false;
                state.user = null;
            })

            .addCase(user_delete.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(user_delete.fulfilled, (state, action) => {
                state.loading = false;
                state.is_authenticated = !!action.payload;
                state.user = action.payload;
            })
            .addCase(user_delete.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Something went wrong';
                state.is_authenticated = false;
                state.user = null;
            })


    }
})
export default auth_slice.reducer

