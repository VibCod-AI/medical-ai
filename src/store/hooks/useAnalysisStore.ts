import { useCallback } from 'react';
import { useAppStore } from '../appStore';
import { MedicalAnalysis, FinalMedicalReport, Transcription } from '@/types/medical';

/**
 * Hook para manejo completo del estado de análisis médico
 */
export const useAnalysisStore = () => {
  const store = useAppStore();
  
  const {
    currentAnalysis,
    finalReport,
    isGeneratingReport,
    isAnalyzing,
    analysisHistory,
    transcriptions,
    setCurrentAnalysis,
    setFinalReport,
    setIsGeneratingReport,
    setIsAnalyzing,
    addToAnalysisHistory,
    clearAnalysisHistory,
    addNotification
  } = store;

  // Request medical analysis
  const requestAnalysis = useCallback(async (transcriptionsToAnalyze?: Transcription[]) => {
    const targetTranscriptions = transcriptionsToAnalyze || transcriptions;
    
    if (targetTranscriptions.length < 3) {
      addNotification({
        type: 'warning',
        title: 'Análisis no disponible',
        message: 'Se necesitan al menos 3 transcripciones para generar un análisis médico.',
        autoClose: true,
        duration: 5000
      });
      return false;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/medical-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptions: targetTranscriptions
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success' && data.analysis) {
        setCurrentAnalysis(data.analysis);
        addToAnalysisHistory(data.analysis);
        
        addNotification({
          type: 'success',
          title: 'Análisis completado',
          message: 'El análisis médico ha sido generado exitosamente.',
          autoClose: true,
          duration: 3000
        });
        
        return true;
      } else {
        throw new Error(data.message || 'Error generando análisis');
      }
    } catch (error) {
      console.error('Error requesting analysis:', error);
      
      addNotification({
        type: 'error',
        title: 'Error en análisis',
        message: 'No se pudo generar el análisis médico. Inténtalo de nuevo.',
        autoClose: true,
        duration: 5000
      });
      
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  }, [transcriptions, setIsAnalyzing, setCurrentAnalysis, addToAnalysisHistory, addNotification]);

  // Generate final report
  const generateFinalReport = useCallback(async (transcriptionsToUse?: Transcription[], analysisToUse?: MedicalAnalysis) => {
    const targetTranscriptions = transcriptionsToUse || transcriptions;
    const targetAnalysis = analysisToUse || currentAnalysis;
    
    if (targetTranscriptions.length < 4) {
      addNotification({
        type: 'warning',
        title: 'Consulta muy corta',
        message: 'La consulta es muy corta para generar un informe completo. Necesita al menos 4 intercambios.',
        autoClose: true,
        duration: 5000
      });
      return false;
    }

    setIsGeneratingReport(true);
    
    try {
      const response = await fetch('/api/generate-final-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptions: targetTranscriptions,
          current_analysis: targetAnalysis
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        if (data.report) {
          setFinalReport(data.report);
          
          addNotification({
            type: 'success',
            title: 'Informe generado',
            message: 'El informe médico final ha sido generado exitosamente.',
            autoClose: true,
            duration: 3000
          });
          
          return true;
        } else {
          addNotification({
            type: 'info',
            title: 'Generando informe',
            message: 'El informe está siendo generado en segundo plano. Te notificaremos cuando esté listo.',
            autoClose: true,
            duration: 5000
          });
          
          return true;
        }
      } else {
        throw new Error(data.message || 'Error generando informe final');
      }
    } catch (error) {
      console.error('Error generating final report:', error);
      
      addNotification({
        type: 'error',
        title: 'Error en informe',
        message: 'No se pudo generar el informe final. Inténtalo de nuevo.',
        autoClose: true,
        duration: 5000
      });
      
      return false;
    } finally {
      setIsGeneratingReport(false);
    }
  }, [transcriptions, currentAnalysis, setIsGeneratingReport, setFinalReport, addNotification]);

  // Save final report
  const saveFinalReport = useCallback(async (reportToSave?: FinalMedicalReport) => {
    const targetReport = reportToSave || finalReport;
    
    if (!targetReport) {
      addNotification({
        type: 'warning',
        title: 'Sin informe',
        message: 'No hay ningún informe para guardar.',
        autoClose: true,
        duration: 3000
      });
      return false;
    }

    try {
      const response = await fetch('/api/medical-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          final_report: targetReport,
          transcriptions: transcriptions,
          analyses: currentAnalysis ? [currentAnalysis] : [],
          status: 'completed'
        })
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Informe guardado',
          message: 'El informe médico ha sido guardado exitosamente.',
          autoClose: true,
          duration: 3000
        });
        
        return true;
      } else {
        throw new Error(result.message || 'Error guardando informe');
      }
    } catch (error) {
      console.error('Error saving final report:', error);
      
      addNotification({
        type: 'error',
        title: 'Error guardando',
        message: 'No se pudo guardar el informe. Inténtalo de nuevo.',
        autoClose: true,
        duration: 5000
      });
      
      return false;
    }
  }, [finalReport, transcriptions, currentAnalysis, addNotification]);

  // Get analysis statistics
  const getAnalysisStats = useCallback(() => {
    if (!currentAnalysis) {
      return {
        hasRedFlags: false,
        symptomsCount: 0,
        diagnosesCount: 0,
        recommendationsCount: 0,
        confidenceLevel: 0
      };
    }

    return {
      hasRedFlags: currentAnalysis.red_flags.length > 0,
      symptomsCount: currentAnalysis.symptoms.length,
      diagnosesCount: currentAnalysis.diagnoses.length,
      recommendationsCount: currentAnalysis.recommendations.length,
      confidenceLevel: Math.round(currentAnalysis.confidence_level * 100)
    };
  }, [currentAnalysis]);

  // Clear all analysis data
  const clearAllAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    setFinalReport(null);
    clearAnalysisHistory();
    setIsGeneratingReport(false);
    setIsAnalyzing(false);
  }, [setCurrentAnalysis, setFinalReport, clearAnalysisHistory, setIsGeneratingReport, setIsAnalyzing]);

  return {
    // State
    currentAnalysis,
    finalReport,
    isGeneratingReport,
    isAnalyzing,
    analysisHistory,
    
    // Basic actions
    setCurrentAnalysis,
    setFinalReport,
    clearAnalysisHistory,
    
    // Advanced actions
    requestAnalysis,
    generateFinalReport,
    saveFinalReport,
    clearAllAnalysis,
    
    // Computed values
    stats: getAnalysisStats(),
    
    // Utilities
    canGenerateReport: transcriptions.length >= 4,
    canRequestAnalysis: transcriptions.length >= 3
  };
};
