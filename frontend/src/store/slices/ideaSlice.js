import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  ideas: [],
  currentIdea: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    category: 'all',
    search: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const ideaSlice = createSlice({
  name: 'ideas',
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
    setIdeas: (state, action) => {
      state.ideas = action.payload;
      state.loading = false;
    },
    addIdea: (state, action) => {
      state.ideas.unshift(action.payload);
    },
    updateIdea: (state, action) => {
      const index = state.ideas.findIndex(idea => idea.id === action.payload.id);
      if (index !== -1) {
        state.ideas[index] = action.payload;
      }
    },
    deleteIdea: (state, action) => {
      state.ideas = state.ideas.filter(idea => idea.id !== action.payload);
    },
    setCurrentIdea: (state, action) => {
      state.currentIdea = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    endorseIdea: (state, action) => {
      const { ideaId, endorsement } = action.payload;
      const idea = state.ideas.find(idea => idea.id === ideaId);
      if (idea) {
        idea.endorsements = idea.endorsements || [];
        idea.endorsements.push(endorsement);
        idea.status = endorsement.status;
      }
    },
    addComment: (state, action) => {
      const { ideaId, comment } = action.payload;
      const idea = state.ideas.find(idea => idea.id === ideaId);
      if (idea) {
        idea.comments = idea.comments || [];
        idea.comments.push(comment);
      }
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setIdeas,
  addIdea,
  updateIdea,
  deleteIdea,
  setCurrentIdea,
  setFilters,
  setPagination,
  endorseIdea,
  addComment,
} = ideaSlice.actions;

export default ideaSlice.reducer;
