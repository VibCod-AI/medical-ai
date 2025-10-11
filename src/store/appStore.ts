import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { Transcription, MedicalAnalysis, FinalMedicalReport } from '@/types/medical';
import { ServiceStatus } from '@/services/interfaces';

// Interfaces for store slices
export interface TranscriptionState {
  transcriptions: Transcription[];
  isRecording: boolean;
  isConnected: boolean;
  currentSessionId: string | null;
  sessionTime: number;
}

export interface AnalysisState {
  currentAnalysis: MedicalAnalysis | null;
  finalReport: FinalMedicalReport | null;
  isGeneratingReport: boolean;
  isAnalyzing: boolean;
  analysisHistory: MedicalAnalysis[];
}

export interface UIState {
  showFinalReport: boolean;
  isSavingSession: boolean;
  isSavingReport: boolean;
  isReportSaved: boolean;
  activeTab: string;
  sidebarOpen: boolean;
  notifications: Notification[];
}

export interface ServicesState {
  audioService: ServiceStatus;
  socketService: ServiceStatus;
  deepgramService: ServiceStatus;
  servicesInitialized: boolean;
}

export interface AppConfig {
  audioConfig: {
    sampleRate: number;
    channels: number;
    chunkDuration: number;
    vadThreshold: number;
  };
  transcriptionConfig: {
    model: string;
    language: string;
    diarize: boolean;
  };
  analysisConfig: {
    autoAnalyze: boolean;
    minTranscriptionsForAnalysis: number;
  };
  theme: 'light' | 'dark';
  debugMode: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

// Combined store interface
export interface AppStore extends 
  TranscriptionState, 
  AnalysisState, 
  UIState, 
  ServicesState {
  config: AppConfig;
  
  // Transcription actions
  addTranscription: (transcription: Transcription) => void;
  updateTranscription: (id: string, updates: Partial<Transcription>) => void;
  removeTranscription: (id: string) => void;
  clearTranscriptions: () => void;
  setRecording: (isRecording: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  setCurrentSessionId: (sessionId: string | null) => void;
  setSessionTime: (time: number) => void;
  autoCorrectSpeakers: () => void;
  
  // Analysis actions
  setCurrentAnalysis: (analysis: MedicalAnalysis | null) => void;
  setFinalReport: (report: FinalMedicalReport | null) => void;
  setIsGeneratingReport: (isGenerating: boolean) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  addToAnalysisHistory: (analysis: MedicalAnalysis) => void;
  clearAnalysisHistory: () => void;
  
  // UI actions
  setShowFinalReport: (show: boolean) => void;
  setIsSavingSession: (isSaving: boolean) => void;
  setIsSavingReport: (isSaving: boolean) => void;
  setIsReportSaved: (isSaved: boolean) => void;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Services actions
  updateServiceStatus: (service: keyof ServicesState, status: ServiceStatus) => void;
  setServicesInitialized: (initialized: boolean) => void;
  
  // Config actions
  updateConfig: (updates: Partial<AppConfig>) => void;
  resetConfig: () => void;
  
  // Utility actions
  reset: () => void;
  exportState: () => string;
  importState: (state: string) => void;
}

// Default configuration
const defaultConfig: AppConfig = {
  audioConfig: {
    sampleRate: 16000,
    channels: 1,
    chunkDuration: 250,
    vadThreshold: 0.02
  },
  transcriptionConfig: {
    model: 'nova-2',
    language: 'es',
    diarize: true
  },
  analysisConfig: {
    autoAnalyze: false,
    minTranscriptionsForAnalysis: 3
  },
  theme: 'light',
  debugMode: process.env.NODE_ENV === 'development'
};

// Default service status
const defaultServiceStatus: ServiceStatus = {
  isConnected: false,
  isInitialized: false,
  reconnectAttempts: 0
};

// Auto-correct speakers utility
const autoCorrectSpeakersLogic = (transcriptions: Transcription[]): Transcription[] => {
  return transcriptions.map(t => {
    const text = t.text.toLowerCase();
    
    // Frases claramente del médico
    const doctorPhrases = ['mi nombre es', 'cuáles son los síntomas', 'podrías describir', 'desde cuándo'];
    // Frases claramente del paciente  
    const patientPhrases = ['me duele', 'siento', 'he notado', 'también noto', 'el dolor se siente'];
    
    const isDoctor = doctorPhrases.some(phrase => text.includes(phrase)) ||
                   (text.includes('?') && (text.includes('cómo') || text.includes('qué') || text.includes('dónde')));
    
    const isPatient = patientPhrases.some(phrase => text.includes(phrase)) ||
                    text.includes('dolor') || text.includes('sensibilidad');
    
    if (isDoctor && !isPatient) {
      return { ...t, speaker: 'medico' };
    } else if (isPatient && !isDoctor) {
      return { ...t, speaker: 'paciente' };
    }
    return t;
  });
};

// Create the store
export const useAppStore = create<AppStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      transcriptions: [],
      isRecording: false,
      isConnected: false,
      currentSessionId: null,
      sessionTime: 0,
      
      currentAnalysis: null,
      finalReport: null,
      isGeneratingReport: false,
      isAnalyzing: false,
      analysisHistory: [],
      
      showFinalReport: false,
      isSavingSession: false,
      isSavingReport: false,
      isReportSaved: false,
      activeTab: 'transcription',
      sidebarOpen: true,
      notifications: [],
      
      audioService: defaultServiceStatus,
      socketService: defaultServiceStatus,
      deepgramService: defaultServiceStatus,
      servicesInitialized: false,
      
      config: defaultConfig,
      
      // Transcription actions
      addTranscription: (transcription) => set((state) => ({
        transcriptions: [...state.transcriptions, transcription]
      })),
      
      updateTranscription: (id, updates) => set((state) => ({
        transcriptions: state.transcriptions.map(t => 
          t.id === id ? { ...t, ...updates } : t
        )
      })),
      
      removeTranscription: (id) => set((state) => ({
        transcriptions: state.transcriptions.filter(t => t.id !== id)
      })),
      
      clearTranscriptions: () => set({ transcriptions: [] }),
      
      setRecording: (isRecording) => set({ isRecording }),
      
      setConnected: (isConnected) => set({ isConnected }),
      
      setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
      
      setSessionTime: (time) => set({ sessionTime: time }),
      
      autoCorrectSpeakers: () => set((state) => ({
        transcriptions: autoCorrectSpeakersLogic(state.transcriptions)
      })),
      
      // Analysis actions
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      
      setFinalReport: (report) => set({ finalReport: report }),
      
      setIsGeneratingReport: (isGenerating) => set({ isGeneratingReport: isGenerating }),
      
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      
      addToAnalysisHistory: (analysis) => set((state) => ({
        analysisHistory: [...state.analysisHistory, analysis]
      })),
      
      clearAnalysisHistory: () => set({ analysisHistory: [] }),
      
      // UI actions
      setShowFinalReport: (show) => set({ showFinalReport: show }),
      
      setIsSavingSession: (isSaving) => set({ isSavingSession: isSaving }),
      
      setIsSavingReport: (isSaving) => set({ isSavingReport: isSaving }),
      
      setIsReportSaved: (isSaved) => set({ isReportSaved: isSaved }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        }]
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      // Services actions
      updateServiceStatus: (service, status) => set((state) => ({
        [service]: status
      })),
      
      setServicesInitialized: (initialized) => set({ servicesInitialized: initialized }),
      
      // Config actions
      updateConfig: (updates) => set((state) => ({
        config: { ...state.config, ...updates }
      })),
      
      resetConfig: () => set({ config: defaultConfig }),
      
      // Utility actions
      reset: () => set({
        transcriptions: [],
        isRecording: false,
        isConnected: false,
        currentSessionId: null,
        sessionTime: 0,
        currentAnalysis: null,
        finalReport: null,
        isGeneratingReport: false,
        isAnalyzing: false,
        analysisHistory: [],
        showFinalReport: false,
        isSavingSession: false,
        isSavingReport: false,
        isReportSaved: false,
        notifications: [],
        config: defaultConfig
      }),
      
      exportState: () => {
        const state = get();
        return JSON.stringify({
          transcriptions: state.transcriptions,
          analysisHistory: state.analysisHistory,
          config: state.config
        });
      },
      
      importState: (stateString) => {
        try {
          const importedState = JSON.parse(stateString);
          set((state) => ({
            ...state,
            ...importedState
          }));
        } catch (error) {
          console.error('Failed to import state:', error);
        }
      }
    })),
    {
      name: 'medical-ai-store',
      partialize: (state) => ({
        config: state.config,
        analysisHistory: state.analysisHistory
      })
    }
  )
);

// Selectors for optimized subscriptions
export const useTranscriptions = () => useAppStore((state) => state.transcriptions);
export const useCurrentAnalysis = () => useAppStore((state) => state.currentAnalysis);
export const useFinalReport = () => useAppStore((state) => state.finalReport);
export const useRecordingState = () => useAppStore((state) => ({
  isRecording: state.isRecording,
  isConnected: state.isConnected,
  sessionTime: state.sessionTime
}));
export const useUIState = () => useAppStore((state) => ({
  showFinalReport: state.showFinalReport,
  activeTab: state.activeTab,
  sidebarOpen: state.sidebarOpen,
  notifications: state.notifications
}));
export const useServicesState = () => useAppStore((state) => ({
  audioService: state.audioService,
  socketService: state.socketService,
  deepgramService: state.deepgramService,
  servicesInitialized: state.servicesInitialized
}));
export const useAppConfig = () => useAppStore((state) => state.config);
