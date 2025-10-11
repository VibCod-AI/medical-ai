import { useCallback } from 'react';
import { useAppStore } from '../appStore';
import { Transcription } from '@/types/medical';
import { audioService } from '@/services';

/**
 * Hook para manejo completo del estado de transcripciones
 */
export const useTranscriptionStore = () => {
  const store = useAppStore();
  
  const {
    transcriptions,
    isRecording,
    isConnected,
    currentSessionId,
    sessionTime,
    addTranscription,
    updateTranscription,
    removeTranscription,
    clearTranscriptions,
    setRecording,
    setConnected,
    setCurrentSessionId,
    setSessionTime,
    autoCorrectSpeakers
  } = store;

  // Actions with business logic
  const startRecording = useCallback(async () => {
    try {
      setRecording(true);
      setSessionTime(0);
      clearTranscriptions();
      
      const success = await audioService.startRecording();
      if (!success) {
        setRecording(false);
        throw new Error('Failed to start audio recording');
      }
      
      // Generate session ID
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setCurrentSessionId(sessionId);
      
      return true;
    } catch (error) {
      setRecording(false);
      console.error('Error starting recording:', error);
      return false;
    }
  }, [setRecording, setSessionTime, clearTranscriptions, setCurrentSessionId]);

  const stopRecording = useCallback(async () => {
    try {
      await audioService.stopRecording();
      setRecording(false);
      return true;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return false;
    }
  }, [setRecording]);

  const addTranscriptionWithValidation = useCallback((transcription: Transcription) => {
    // Validate transcription
    if (!transcription.text || transcription.text.trim().length === 0) {
      console.warn('Ignoring empty transcription');
      return;
    }

    // Check for duplicates
    const isDuplicate = transcriptions.some(t => 
      t.text.trim().toLowerCase() === transcription.text.trim().toLowerCase() &&
      Math.abs(new Date(t.timestamp).getTime() - new Date(transcription.timestamp).getTime()) < 5000
    );

    if (isDuplicate) {
      console.warn('Ignoring duplicate transcription');
      return;
    }

    addTranscription(transcription);
  }, [transcriptions, addTranscription]);

  const toggleSpeaker = useCallback((id: string) => {
    const transcription = transcriptions.find(t => t.id === id);
    if (transcription) {
      updateTranscription(id, {
        speaker: transcription.speaker === 'medico' ? 'paciente' : 'medico'
      });
    }
  }, [transcriptions, updateTranscription]);

  const getTranscriptionStats = useCallback(() => {
    const total = transcriptions.length;
    const medico = transcriptions.filter(t => t.speaker === 'medico').length;
    const paciente = transcriptions.filter(t => t.speaker === 'paciente').length;
    const avgConfidence = transcriptions.length > 0 
      ? transcriptions.reduce((sum, t) => sum + (t.confidence || 0), 0) / transcriptions.length 
      : 0;

    return {
      total,
      medico,
      paciente,
      avgConfidence: Math.round(avgConfidence * 100) / 100
    };
  }, [transcriptions]);

  return {
    // State
    transcriptions,
    isRecording,
    isConnected,
    currentSessionId,
    sessionTime,
    
    // Basic actions
    addTranscription: addTranscriptionWithValidation,
    updateTranscription,
    removeTranscription,
    clearTranscriptions,
    setConnected,
    setSessionTime,
    autoCorrectSpeakers,
    
    // Advanced actions
    startRecording,
    stopRecording,
    toggleSpeaker,
    
    // Computed values
    stats: getTranscriptionStats()
  };
};
