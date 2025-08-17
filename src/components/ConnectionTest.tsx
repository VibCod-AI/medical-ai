'use client';

import React, { useState, useEffect, useCallback } from 'react';
import socketService from '../services/socketService';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  duration?: number;
}

const ConnectionTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [serverStatus, setServerStatus] = useState<string>('unknown');

  const resetTests = () => {
    setTests([
      { test: 'Backend Health', status: 'pending', message: 'Verificando...' },
      { test: 'WebSocket Connection', status: 'pending', message: 'Conectando...' },
      { test: 'Deepgram API', status: 'pending', message: 'Validando...' },
      { test: 'OpenAI API', status: 'pending', message: 'Validando...' },
      { test: 'Micrófono', status: 'pending', message: 'Solicitando permisos...' }
    ]);
  };

  const updateTest = (testName: string, status: TestResult['status'], message: string, duration?: number) => {
    setTests(prev => prev.map(test => 
      test.test === testName 
        ? { ...test, status, message, duration }
        : test
    ));
  };

  const runTests = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    resetTests();

    try {
      // Test 1: Backend Health
      const healthStart = Date.now();
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (response.ok && data.status === 'OK') {
          const duration = Date.now() - healthStart;
          updateTest('Backend Health', 'success', `✅ ${data.message}`, duration);
          setServerStatus('online');
        } else {
          updateTest('Backend Health', 'error', '❌ Servidor no responde correctamente');
          setServerStatus('error');
        }
      } catch (err) {
        console.error('Error conectando al backend:', err);
        updateTest('Backend Health', 'error', '❌ No se puede conectar al servidor');
        setServerStatus('offline');
      }

      // Test 2: WebSocket Connection (con timeout)
      const wsStart = Date.now();
      try {
        await socketService.disconnect(); // Limpiar conexión previa
        
        // Crear una promesa con timeout para evitar que se cuelgue
        const connectWithTimeout = new Promise<boolean>((resolve) => {
          const timeoutId = setTimeout(() => {
            console.log('⚠️ WebSocket connection timeout - usando modo API REST');
            resolve(false);
          }, 3000); // 3 segundos timeout
          
          socketService.connect().then((connected) => {
            clearTimeout(timeoutId);
            resolve(connected);
          }).catch(() => {
            clearTimeout(timeoutId);
            resolve(false);
          });
        });
        
        const connected = await connectWithTimeout;
        
        if (connected) {
          try {
            await socketService.testConnection();
            const duration = Date.now() - wsStart;
            updateTest('WebSocket Connection', 'success', `✅ Conectado (${socketService.isConnected ? 'Activo' : 'Inactivo'})`, duration);
          } catch (testErr) {
            updateTest('WebSocket Connection', 'error', '❌ Error en test de comunicación WebSocket');
          }
        } else {
          const duration = Date.now() - wsStart;
          updateTest('WebSocket Connection', 'error', '❌ WebSocket no disponible - usando API REST', duration);
        }
      } catch (err) {
        const duration = Date.now() - wsStart;
        updateTest('WebSocket Connection', 'error', `❌ Error: ${err}`, duration);
      }

      // Test 3: Deepgram API
      const deepgramStart = Date.now();
      try {
        const response = await fetch('/api/test-deepgram');
        const data = await response.json();
        const duration = Date.now() - deepgramStart;
        
        if (data.status === 'configured') {
          updateTest('Deepgram API', 'success', `✅ ${data.message}`, duration);
        } else {
          updateTest('Deepgram API', 'error', `❌ ${data.message}`);
        }
      } catch (err) {
        console.error('Error verificando Deepgram:', err);
        updateTest('Deepgram API', 'error', '❌ Error verificando Deepgram');
      }

      // Test 4: OpenAI API
      const openaiStart = Date.now();
      try {
        const response = await fetch('/api/test-openai');
        const data = await response.json();
        const duration = Date.now() - openaiStart;
        
        if (data.status === 'configured') {
          updateTest('OpenAI API', 'success', `✅ ${data.message}`, duration);
        } else {
          updateTest('OpenAI API', 'error', `❌ ${data.message}`);
        }
      } catch (err) {
        console.error('Error verificando OpenAI:', err);
        updateTest('OpenAI API', 'error', '❌ Error verificando OpenAI');
      }

      // Test 5: Micrófono
      const micStart = Date.now();
      try {
        // Verificar que estamos en el cliente
        if (typeof window === 'undefined' || !navigator.mediaDevices) {
          updateTest('Micrófono', 'error', '❌ APIs de media no disponibles');
          return;
        }

        // Crear promesa con timeout para evitar que se cuelgue en permisos
        const micWithTimeout = new Promise<MediaStream>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Timeout: El usuario no respondió a la solicitud de permisos en 10 segundos'));
          }, 10000); // 10 segundos timeout
          
          navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: false
            }
          }).then(stream => {
            clearTimeout(timeoutId);
            resolve(stream);
          }).catch(error => {
            clearTimeout(timeoutId);
            reject(error);
          });
        });
        
        const stream = await micWithTimeout;
        
        const duration = Date.now() - micStart;
        
        // Verificar que el stream tiene tracks de audio
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          updateTest('Micrófono', 'success', `✅ Micrófono activo: ${audioTracks[0].label || 'Dispositivo de audio'}`, duration);
          
          // Limpiar el stream
          audioTracks.forEach(track => track.stop());
        } else {
          updateTest('Micrófono', 'error', '❌ No se detectaron dispositivos de audio');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        if (errorMessage.includes('Permission denied')) {
          updateTest('Micrófono', 'error', '❌ Permisos de micrófono denegados');
        } else if (errorMessage.includes('NotFound')) {
          updateTest('Micrófono', 'error', '❌ No se encontró micrófono');
        } else {
          updateTest('Micrófono', 'error', `❌ Error: ${errorMessage}`);
        }
      }

    } finally {
      setIsRunning(false);
    }
  }, []); // No dependencies to prevent infinite re-renders

  // Auto-ejecutar tests al montar el componente (solo una vez)
  useEffect(() => {
    runTests();
  }, []); // Sin dependencias para evitar bucle infinito

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getOverallStatus = () => {
    const successCount = tests.filter(t => t.status === 'success').length;
    const errorCount = tests.filter(t => t.status === 'error').length;
    const pendingCount = tests.filter(t => t.status === 'pending').length;

    if (pendingCount > 0) return { status: 'testing', message: 'Ejecutando tests...', color: '#f59e0b' };
    if (errorCount > 0) return { status: 'error', message: `${errorCount} tests fallaron`, color: '#ef4444' };
    if (successCount === tests.length) return { status: 'success', message: 'Todos los tests pasaron', color: '#10b981' };
    return { status: 'unknown', message: 'Estado desconocido', color: '#6b7280' };
  };

  const overall = getOverallStatus();

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
          🔗 Test de Conectividad
        </h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
          Verificación completa del sistema Medical IA - Next.js
        </p>
        
        {/* Estado general */}
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: overall.color
          }}></div>
          <span style={{ fontWeight: '600' }}>{overall.message}</span>
        </div>
      </div>

      {/* Controles */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={runTests}
            disabled={isRunning}
            style={{
              background: isRunning ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isRunning ? '⏳ Ejecutando...' : '🔄 Ejecutar Tests'}
          </button>
          
          <div style={{
            marginLeft: 'auto',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Estado del servidor: 
            <span style={{ 
              marginLeft: '8px',
              fontWeight: '600',
              color: serverStatus === 'online' ? '#10b981' : 
                    serverStatus === 'offline' ? '#ef4444' : '#f59e0b'
            }}>
              {serverStatus === 'online' ? '🟢 En línea' : 
               serverStatus === 'offline' ? '🔴 Desconectado' : 
               serverStatus === 'error' ? '🟡 Error' : '⚫ Desconocido'}
            </span>
          </div>
        </div>
      </div>

      {/* Resultados de los tests */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '20px', 
          fontWeight: '600',
          color: '#374151'
        }}>
          📊 Resultados de Tests
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tests.map((test, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                border: `2px solid ${getStatusColor(test.status)}`,
                borderRadius: '12px',
                background: test.status === 'success' ? '#f0fdf4' : 
                           test.status === 'error' ? '#fef2f2' : '#fffbeb',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>
                  {getStatusIcon(test.status)}
                </span>
                <div>
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '16px',
                    color: '#374151'
                  }}>
                    {test.test}
                  </div>
                  <div style={{ 
                    fontSize: '14px',
                    color: getStatusColor(test.status),
                    marginTop: '2px'
                  }}>
                    {test.message}
                  </div>
                </div>
              </div>
              
              {test.duration && (
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  background: '#f3f4f6',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}>
                  {test.duration}ms
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#374151'
          }}>
            ℹ️ Información del Sistema
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
            <div>
              <strong>WebSocket:</strong> {socketService.isConnected ? 'Conectado' : 'Desconectado'}
            </div>
            <div>
              <strong>Framework:</strong> Next.js + TypeScript
            </div>
            <div>
              <strong>User Agent:</strong> <span suppressHydrationWarning>{typeof window !== 'undefined' ? navigator.userAgent.split(' ').slice(-2).join(' ') : 'N/A'}</span>
            </div>
            <div>
              <strong>Protocolo:</strong> <span suppressHydrationWarning>{typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Instrucciones si hay errores */}
        {tests.some(t => t.status === 'error') && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px'
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '16px', 
              fontWeight: '600',
              color: '#dc2626'
            }}>
              🚨 Errores Detectados
            </h3>
            <div style={{ fontSize: '14px', color: '#7f1d1d', lineHeight: '1.5' }}>
              <p><strong>Si hay errores de backend:</strong></p>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Verifica que el servidor backend esté ejecutándose en puerto 3001</li>
                <li>Ejecuta: <code style={{ background: '#fee2e2', padding: '2px 4px', borderRadius: '3px' }}>cd backend && npm run dev</code></li>
                <li>Configura las variables de entorno (DEEPGRAM_API_KEY, OPENAI_API_KEY)</li>
              </ul>
              
              <p><strong>Si hay errores de micrófono:</strong></p>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Permite el acceso al micrófono cuando el navegador lo solicite</li>
                <li>Verifica que tengas un micrófono conectado</li>
                <li>Usa HTTPS o localhost para acceso a micrófono</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionTest;
