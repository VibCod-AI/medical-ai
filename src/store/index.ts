// Main store exports
export { useAppStore } from './appStore';
export type { 
  AppStore, 
  TranscriptionState, 
  AnalysisState, 
  UIState, 
  ServicesState, 
  AppConfig,
  Notification 
} from './appStore';

// Optimized selectors
export {
  useTranscriptions,
  useCurrentAnalysis,
  useFinalReport,
  useRecordingState,
  useUIState,
  useServicesState,
  useAppConfig
} from './appStore';

// Specialized hooks
export { useTranscriptionStore } from './hooks/useTranscriptionStore';
export { useAnalysisStore } from './hooks/useAnalysisStore';
export { useServicesStore } from './hooks/useServicesStore';

// Store utilities
import { useAppStore } from './appStore';

/**
 * Hook for notifications management
 */
export const useNotifications = () => {
  const notifications = useAppStore((state) => state.notifications);
  const addNotification = useAppStore((state) => state.addNotification);
  const removeNotification = useAppStore((state) => state.removeNotification);
  const clearNotifications = useAppStore((state) => state.clearNotifications);
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };
};

/**
 * Hook for app configuration management
 */
export const useConfigStore = () => {
  const config = useAppStore((state) => state.config);
  const updateConfig = useAppStore((state) => state.updateConfig);
  const resetConfig = useAppStore((state) => state.resetConfig);
  
  return {
    config,
    updateConfig,
    resetConfig
  };
};

/**
 * Hook for UI state management
 */
export const useUIStore = () => {
  const {
    showFinalReport,
    activeTab,
    sidebarOpen,
    setShowFinalReport,
    setActiveTab,
    setSidebarOpen
  } = useAppStore();
  
  return {
    showFinalReport,
    activeTab,
    sidebarOpen,
    setShowFinalReport,
    setActiveTab,
    setSidebarOpen
  };
};

/**
 * Hook for session management
 */
export const useSessionStore = () => {
  const {
    currentSessionId,
    sessionTime,
    isSavingSession,
    setCurrentSessionId,
    setSessionTime,
    setIsSavingSession
  } = useAppStore();
  
  return {
    currentSessionId,
    sessionTime,
    isSavingSession,
    setCurrentSessionId,
    setSessionTime,
    setIsSavingSession
  };
};

/**
 * Hook for debug and development utilities
 */
export const useDebugStore = () => {
  const store = useAppStore();
  
  const exportState = () => store.exportState();
  const importState = (state: string) => store.importState(state);
  const reset = () => store.reset();
  
  const getStoreSnapshot = () => ({
    transcriptions: store.transcriptions.length,
    hasAnalysis: !!store.currentAnalysis,
    hasFinalReport: !!store.finalReport,
    isRecording: store.isRecording,
    servicesInitialized: store.servicesInitialized,
    notifications: store.notifications.length
  });
  
  return {
    exportState,
    importState,
    reset,
    getStoreSnapshot,
    debugMode: store.config.debugMode
  };
};
