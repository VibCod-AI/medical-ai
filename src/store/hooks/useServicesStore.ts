import { useCallback } from 'react';
import { useAppStore } from '../appStore';
import { serviceRegistry } from '@/services';

/**
 * Hook para manejo del estado de servicios
 */
export const useServicesStore = () => {
  const store = useAppStore();
  
  const {
    audioService,
    socketService,
    deepgramService,
    servicesInitialized,
    updateServiceStatus,
    setServicesInitialized,
    addNotification
  } = store;

  // Initialize all services
  const initializeServices = useCallback(async () => {
    try {
      addNotification({
        type: 'info',
        title: 'Inicializando servicios',
        message: 'Configurando servicios de audio y comunicación...',
        autoClose: true,
        duration: 3000
      });

      const result = await serviceRegistry.initializeAll();
      
      if (result.failed.length === 0) {
        setServicesInitialized(true);
        
        addNotification({
          type: 'success',
          title: 'Servicios listos',
          message: 'Todos los servicios se han inicializado correctamente.',
          autoClose: true,
          duration: 3000
        });
        
        return true;
      } else {
        addNotification({
          type: 'warning',
          title: 'Servicios parcialmente inicializados',
          message: `Servicios fallidos: ${result.failed.join(', ')}`,
          autoClose: true,
          duration: 5000
        });
        
        return false;
      }
    } catch (error) {
      console.error('Error initializing services:', error);
      
      addNotification({
        type: 'error',
        title: 'Error en servicios',
        message: 'No se pudieron inicializar los servicios correctamente.',
        autoClose: true,
        duration: 5000
      });
      
      return false;
    }
  }, [setServicesInitialized, addNotification]);

  // Connect all services
  const connectServices = useCallback(async () => {
    try {
      const result = await serviceRegistry.connectAll();
      
      if (result.success.length > 0) {
        addNotification({
          type: 'success',
          title: 'Servicios conectados',
          message: `Conectados: ${result.success.join(', ')}`,
          autoClose: true,
          duration: 3000
        });
      }
      
      if (result.failed.length > 0) {
        addNotification({
          type: 'warning',
          title: 'Conexiones fallidas',
          message: `No conectados: ${result.failed.join(', ')}`,
          autoClose: true,
          duration: 5000
        });
      }
      
      return result.failed.length === 0;
    } catch (error) {
      console.error('Error connecting services:', error);
      
      addNotification({
        type: 'error',
        title: 'Error de conexión',
        message: 'No se pudieron conectar los servicios.',
        autoClose: true,
        duration: 5000
      });
      
      return false;
    }
  }, [addNotification]);

  // Disconnect all services
  const disconnectServices = useCallback(async () => {
    try {
      await serviceRegistry.disconnectAll();
      
      // Update all service statuses to disconnected
      updateServiceStatus('audioService', { 
        isConnected: false, 
        isInitialized: audioService.isInitialized 
      });
      updateServiceStatus('socketService', { 
        isConnected: false, 
        isInitialized: socketService.isInitialized 
      });
      updateServiceStatus('deepgramService', { 
        isConnected: false, 
        isInitialized: deepgramService.isInitialized 
      });
      
      addNotification({
        type: 'info',
        title: 'Servicios desconectados',
        message: 'Todos los servicios han sido desconectados.',
        autoClose: true,
        duration: 3000
      });
      
      return true;
    } catch (error) {
      console.error('Error disconnecting services:', error);
      
      addNotification({
        type: 'error',
        title: 'Error desconectando',
        message: 'Error al desconectar algunos servicios.',
        autoClose: true,
        duration: 5000
      });
      
      return false;
    }
  }, [audioService, socketService, deepgramService, updateServiceStatus, addNotification]);

  // Perform health check on all services
  const performHealthCheck = useCallback(async () => {
    try {
      const healthResults = await serviceRegistry.healthCheckAll();
      
      // Update service statuses based on health check
      Object.entries(healthResults).forEach(([serviceName, result]) => {
        const serviceKey = `${serviceName}Service` as keyof typeof store;
        if (serviceKey in store) {
          updateServiceStatus(serviceKey, {
            isConnected: result.isHealthy,
            isInitialized: true // Assume initialized if health check is possible
          });
        }
      });
      
      const healthyServices = Object.entries(healthResults)
        .filter(([, result]) => result.isHealthy)
        .map(([name]) => name);
      
      const unhealthyServices = Object.entries(healthResults)
        .filter(([, result]) => !result.isHealthy)
        .map(([name]) => name);
      
      if (unhealthyServices.length > 0) {
        addNotification({
          type: 'warning',
          title: 'Servicios con problemas',
          message: `Servicios no saludables: ${unhealthyServices.join(', ')}`,
          autoClose: true,
          duration: 5000
        });
      }
      
      return {
        healthy: healthyServices,
        unhealthy: unhealthyServices,
        results: healthResults
      };
    } catch (error) {
      console.error('Error performing health check:', error);
      
      addNotification({
        type: 'error',
        title: 'Error en diagnóstico',
        message: 'No se pudo verificar el estado de los servicios.',
        autoClose: true,
        duration: 5000
      });
      
      return {
        healthy: [],
        unhealthy: [],
        results: {}
      };
    }
  }, [updateServiceStatus, addNotification]);

  // Get overall services status
  const getOverallStatus = useCallback(() => {
    const services = [audioService, socketService, deepgramService];
    const initialized = services.filter(s => s.isInitialized).length;
    const connected = services.filter(s => s.isConnected).length;
    const total = services.length;
    
    return {
      initializedPercentage: Math.round((initialized / total) * 100),
      connectedPercentage: Math.round((connected / total) * 100),
      allInitialized: initialized === total,
      allConnected: connected === total,
      servicesInitialized
    };
  }, [audioService, socketService, deepgramService, servicesInitialized]);

  // Restart a specific service
  const restartService = useCallback(async (serviceName: string) => {
    try {
      const service = serviceRegistry.get(serviceName);
      if (!service) {
        throw new Error(`Service ${serviceName} not found`);
      }
      
      addNotification({
        type: 'info',
        title: 'Reiniciando servicio',
        message: `Reiniciando ${serviceName}...`,
        autoClose: true,
        duration: 3000
      });
      
      // Disconnect, then reconnect
      await service.disconnect();
      
      if (service.connect) {
        const connected = await service.connect();
        
        if (connected) {
          addNotification({
            type: 'success',
            title: 'Servicio reiniciado',
            message: `${serviceName} se ha reiniciado correctamente.`,
            autoClose: true,
            duration: 3000
          });
          
          return true;
        } else {
          throw new Error('Failed to reconnect');
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error restarting service ${serviceName}:`, error);
      
      addNotification({
        type: 'error',
        title: 'Error reiniciando',
        message: `No se pudo reiniciar ${serviceName}.`,
        autoClose: true,
        duration: 5000
      });
      
      return false;
    }
  }, [addNotification]);

  return {
    // State
    audioService,
    socketService,
    deepgramService,
    servicesInitialized,
    
    // Actions
    initializeServices,
    connectServices,
    disconnectServices,
    performHealthCheck,
    restartService,
    updateServiceStatus,
    
    // Computed values
    overallStatus: getOverallStatus()
  };
};
