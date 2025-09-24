import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  students: [],
  colleges: [],
  incubators: [],
  loading: false,
  error: null,
  filters: {
    role: 'all',
    status: 'all',
    search: '',
    region: 'all',
  },
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
      state.loading = false;
    },
    setStudents: (state, action) => {
      state.students = action.payload;
      state.loading = false;
    },
    setColleges: (state, action) => {
      state.colleges = action.payload;
      state.loading = false;
    },
    setIncubators: (state, action) => {
      state.incubators = action.payload;
      state.loading = false;
    },
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setUsers,
  setStudents,
  setColleges,
  setIncubators,
  addUser,
  updateUser,
  deleteUser,
  setFilters,
} = userSlice.actions;

export default userSlice.reducer;
