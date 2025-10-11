import { useState, useCallback, useEffect } from 'react';
import { MedicalAnalysis, Transcription, FinalMedicalReport } from '@/types/medical';
import socketService from '@/services/socketService';

interface UseMedicalAnalysisOptions {
  onAnalysisReceived?: (analysis: MedicalAnalysis) => void;
  onFinalReportReceived?: (report: FinalMedicalReport) => void;
  autoAnalyze?: boolean;
  minTranscriptionsForAnalysis?: number;
}

interface UseMedicalAnalysisReturn {
  currentAnalysis: MedicalAnalysis | null;
  finalReport: FinalMedicalReport | null;
  isGeneratingReport: boolean;
  isAnalyzing: boolean;
  
  // Actions
  setCurrentAnalysis: (analysis: MedicalAnalysis | null) => void;
  setFinalReport: (report: FinalMedicalReport | null) => void;
  requestAnalysis: (transcriptions: Transcription[]) => Promise<void>;
  generateFinalReport: (transcriptions: Transcription[], analysis?: MedicalAnalysis) => Promise<void>;
  clearAnalysis: () => void;
  clearFinalReport: () => void;
}

export const useMedicalAnalysis = (options: UseMedicalAnalysisOptions = {}): UseMedicalAnalysisReturn => {
  const {
    onAnalysisReceived,
    onFinalReportReceived,
    autoAnalyze = false,
    minTranscriptionsForAnalysis = 3
  } = options;

  const [currentAnalysis, setCurrentAnalysis] = useState<MedicalAnalysis | null>(null);
  const [finalReport, setFinalReport] = useState<FinalMedicalReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Configurar listeners de WebSocket
  useEffect(() => {
    if (!socketService) return;

    // Listener para análisis médicos
    const handleMedicalAnalysis = (...args: unknown[]) => {
      const analysis = args[0] as MedicalAnalysis;
      console.log('📊 useMedicalAnalysis: Nuevo análisis recibido:', analysis);
      
      setCurrentAnalysis(analysis);
      setIsAnalyzing(false);
      
      if (onAnalysisReceived) {
        onAnalysisReceived(analysis);
      }
    };

    // Listener para reportes finales
    const handleFinalReportGenerated = (...args: unknown[]) => {
      const report = args[0] as FinalMedicalReport;
      console.log('📋 useMedicalAnalysis: Informe final recibido:', report);
      
      setFinalReport(report);
      setIsGeneratingReport(false);
      
      if (onFinalReportReceived) {
        onFinalReportReceived(report);
      }
    };

    // Registrar listeners
    socketService.on('medical-analysis', handleMedicalAnalysis);
    socketService.on('final-report-generated', handleFinalReportGenerated);

    return () => {
      // Limpiar listeners
      socketService.off('medical-analysis', handleMedicalAnalysis);
      socketService.off('final-report-generated', handleFinalReportGenerated);
    };
  }, [onAnalysisReceived, onFinalReportReceived]);

  const requestAnalysis = useCallback(async (transcriptions: Transcription[]) => {
    if (transcriptions.length < minTranscriptionsForAnalysis) {
      console.warn(`⚠️ useMedicalAnalysis: Se necesitan al menos ${minTranscriptionsForAnalysis} transcripciones para análisis`);
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('🔍 useMedicalAnalysis: Solicitando análisis médico...');
      
      const response = await fetch('/api/medical-analysis', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          transcriptions: transcriptions
        })
      });
      
      const data = await response.json();
      console.log('📊 useMedicalAnalysis: Respuesta del análisis:', data);
      
      if (data.status === 'success' && data.analysis) {
        setCurrentAnalysis(data.analysis);
        
        if (onAnalysisReceived) {
          onAnalysisReceived(data.analysis);
        }
        
        console.log('✅ useMedicalAnalysis: Análisis recibido exitosamente');
      } else {
        console.warn('⚠️ useMedicalAnalysis: No se pudo generar análisis:', data.message);
      }
    } catch (error) {
      console.error('❌ useMedicalAnalysis: Error solicitando análisis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [minTranscriptionsForAnalysis, onAnalysisReceived]);

  const generateFinalReport = useCallback(async (transcriptions: Transcription[], analysis?: MedicalAnalysis) => {
    if (transcriptions.length < 4) {
      throw new Error('La consulta es muy corta para generar un informe completo. Necesita al menos 4 intercambios.');
    }

    setIsGeneratingReport(true);
    
    try {
      console.log('📋 useMedicalAnalysis: Generando informe final...');
      
      const response = await fetch('/api/generate-final-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcriptions: transcriptions,
          current_analysis: analysis || currentAnalysis
        }),
      });

      const data = await response.json();
      console.log('📋 useMedicalAnalysis: Respuesta del informe:', data);

      if (data.status === 'success') {
        if (data.report) {
          setFinalReport(data.report);
          
          if (onFinalReportReceived) {
            onFinalReportReceived(data.report);
          }
          
          console.log('✅ useMedicalAnalysis: Informe final generado exitosamente');
        } else {
          console.log('📡 useMedicalAnalysis: Informe siendo generado en background...');
        }
      } else {
        throw new Error(data.message || 'Error generando informe final');
      }
    } catch (error) {
      console.error('❌ useMedicalAnalysis: Error generando informe final:', error);
      setIsGeneratingReport(false);
      throw error;
    }
  }, [currentAnalysis, onFinalReportReceived]);

  const clearAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    console.log('🗑️ useMedicalAnalysis: Análisis limpiado');
  }, []);

  const clearFinalReport = useCallback(() => {
    setFinalReport(null);
    console.log('🗑️ useMedicalAnalysis: Informe final limpiado');
  }, []);

  // Auto-análisis cuando hay suficientes transcripciones
  useEffect(() => {
    // Esta funcionalidad se implementaría si se requiere análisis automático
    // Por ahora se mantiene manual para control del usuario
  }, [autoAnalyze]);

  return {
    currentAnalysis,
    finalReport,
    isGeneratingReport,
    isAnalyzing,
    setCurrentAnalysis,
    setFinalReport,
    requestAnalysis,
    generateFinalReport,
    clearAnalysis,
    clearFinalReport
  };
};
