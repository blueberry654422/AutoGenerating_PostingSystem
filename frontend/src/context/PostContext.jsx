import { createContext, useContext, useReducer } from 'react';

const initialState = {
  sessionId: null,
  image: null,
  settings: { topic: '', tone: 'casual', language: 'en', captionCount: 2 },
  captions: [],
  selectedCaptionId: null,
  platforms: [],
  platformCaptions: {},
  schedule: null,
  postResult: null,
  currentStep: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, sessionId: action.sessionId, image: action.image, settings: action.settings, currentStep: 1 };
    case 'SET_CAPTIONS':
      return { ...state, captions: action.captions, selectedCaptionId: action.captions[0]?.id || null };
    case 'UPDATE_CAPTION': {
      const captions = state.captions.map((c) => (c.id === action.caption.id ? action.caption : c));
      return { ...state, captions };
    }
    case 'SELECT_CAPTION':
      return { ...state, selectedCaptionId: action.captionId };
    case 'SET_PLATFORMS':
      return { ...state, platforms: action.platforms, currentStep: 2 };
    case 'SET_PLATFORM_CAPTIONS':
      return { ...state, platformCaptions: action.platformCaptions, currentStep: 3 };
    case 'SET_SCHEDULE':
      return { ...state, schedule: action.schedule, currentStep: 4 };
    case 'SET_POST_RESULT':
      return { ...state, postResult: action.postResult, currentStep: 5 };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

const PostContext = createContext(null);

export function PostProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <PostContext.Provider value={{ state, dispatch }}>{children}</PostContext.Provider>;
}

export function usePost() {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error('usePost must be used within PostProvider');
  return ctx;
}
