/**
 * Tutor Module Configuration & Feature Flags
 */
export const TUTOR_CONFIG = {
  // Master feature flag: can toggle Tutor on/off cleanly without breaking other modules
  ENABLED: true,

  // Version
  VERSION: '2.0.0',

  // Local Ollama AI settings
  OLLAMA: {
    DEFAULT_HOST: 'http://localhost:11434',
    DEFAULT_FAST_MODEL: 'gemma4:e4b',
    DEFAULT_DEEP_MODEL: 'gemma4:26b',
  },

  // Gemini model selection
  GEMINI: {
    FAST_MODEL: 'gemini-3.8-flash',
    PRO_MODEL: 'gemini-3.8-flash', // Graceful fallback
  },

  // Ingestion limits
  INGESTION: {
    MAX_FILE_BYTES: 250 * 1024, // 250KB max per file
    MAX_FILES_ANALYZED: 120,
    LONG_CONTEXT_THRESHOLD_KB: 400,
  },

  // IndexedDB Cache settings
  CACHE: {
    DB_NAME: 'RepoRescue_Tutor_DB',
    DB_VERSION: 1,
    STORE_NAME: 'repo_models',
    TTL_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};
