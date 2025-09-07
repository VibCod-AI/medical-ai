'use client';

import React, { useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import audioService, { AudioStats } from '../services/audioService';

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [audioStats, setAudioStats] = useState<AudioStats | null>(null);
  const [volume, setVolume] = useState(0);
  const [peak, setPeak] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [error, setError] = useState<string>('');
  const [recordings, setRecordings] = useState<{
    name: string;
    size: number;
    modified: string;
  }[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const volumeCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Conectar WebSocket al montar
    const connectSocket = async () => {
      try {
        const connected = await socketService.connect();
        setConnectionStatus(connected ? 'connected' : 'disconnected');
      } catch (error) {
        setConnectionStatus('error');
        console.error('Error conectando WebSocket:', error);
      }
    };

    connectSocket();

    // Configurar callbacks de audioService si está disponible
    if (audioService) {
      audioService.setVolumeCallback((vol, pk) => {
        setVolume(vol);
        setPeak(pk || 0);
        drawVolumeLevel(vol, pk || 0);
      });

      audioService.setStatsCallback((stats) => {
        setAudioStats(stats);
      });

      audioService.setErrorCallback((err) => {
        setError(err);
      });
    }

    // Limpiar al desmontar
    return () => {
      if (isRecording && audioService) {
        audioService.stopRecording();
        audioService.cleanup();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const drawVolumeLevel = (vol: number, pk: number) => {
    const canvas = volumeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Normalizar valores
    const normalizedVol = Math.min(vol * 50, 1); // RMS normalizado
    const normalizedPeak = Math.min(pk, 1); // Peak normalizado

    // Dibujar fondo
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);

    // Dibujar nivel RMS (verde)
    const rmsWidth = normalizedVol * width;
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, 0, rmsWidth, height * 0.6);

    // Dibujar nivel Peak (amarillo)
    const peakWidth = normalizedPeak * width;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, height * 0.7, peakWidth, height * 0.3);

    // Dibujar líneas de referencia
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    
    // Línea al 50%
    ctx.beginPath();
    ctx.moveTo(width * 0.5, 0);
    ctx.lineTo(width * 0.5, height);
    ctx.stroke();
    
    // Línea al 80% (umbral de clipping)
    ctx.beginPath();
    ctx.moveTo(width * 0.8, 0);
    ctx.lineTo(width * 0.8, height);
    ctx.stroke();
  };

  const initializeAudio = async () => {
    if (!audioService) {
      setError('AudioService no disponible');
      return;
    }

    try {
      setError('');
      const initialized = await audioService.initialize();
      setIsInitialized(initialized);
      
      if (initialized) {
        console.log('✅ Audio inicializado correctamente');
      } else {
        setError('No se pudo inicializar el audio');
      }
    } catch (error) {
      setError(`Error inicializando audio: ${error}`);
      console.error('Error inicializando audio:', error);
    }
  };

  const startRecording = async () => {
    if (!audioService) {
      setError('AudioService no disponible');
      return;
    }

    try {
      if (!isInitialized) {
        await initializeAudio();
      }

      const started = await audioService.startRecording();
      if (started) {
        setIsRecording(true);
        setSessionTime(0);
        setError('');
        
        // Iniciar timer
        timerRef.current = setInterval(() => {
          setSessionTime(prev => prev + 1);
        }, 1000);
        
        console.log('✅ Grabación iniciada');
      } else {
        setError('No se pudo iniciar la grabación');
      }
    } catch (error) {
      setError(`Error iniciando grabación: ${error}`);
      console.error('Error iniciando grabación:', error);
    }
  };

  const stopRecording = () => {
    if (audioService) {
      audioService.stopRecording();
    }
    
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    console.log('⏹️ Grabación detenida');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10b981';
      case 'disconnected': return '#ef4444';
      case 'error': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢 Conectado';
      case 'disconnected': return '🔴 Desconectado';
      case 'error': return '🟡 Error de conexión';
      default: return '⚫ Desconocido';
    }
  };

  const fetchRecordings = async () => {
    try {
      const response = await fetch('/api/recordings');
      const data = await response.json();
      setRecordings(data.recordings || []);
    } catch (error) {
      console.error('Error obteniendo grabaciones:', error);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, [isRecording]); // Actualizar cuando cambie el estado de grabación

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1000px', 
      margin: '0 auto',
      fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
        color: '#2C2C2E',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
          Grabación de Audio
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', color: '#6C6C70', fontSize: '1rem', fontWeight: '400' }}>
          Sistema de captura de audio en tiempo real para Medical IA
        </p>
        
        <div style={{
          marginTop: '16px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {getConnectionStatusText()}
          </div>
          <div style={{
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            ⏱️ {formatTime(sessionTime)}
          </div>
          <div style={{
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {isRecording ? '🔴 GRABANDO' : '⚪ DETENIDO'}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Controles */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
          {!isInitialized && !isRecording && (
            <button
              onClick={initializeAudio}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🎤 Inicializar Audio
            </button>
          )}
          
          {isInitialized && !isRecording && (
            <button
              onClick={startRecording}
              disabled={connectionStatus !== 'connected'}
              style={{
                background: connectionStatus === 'connected' ? '#16a34a' : '#9ca3af',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: connectionStatus === 'connected' ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ▶️ Iniciar Grabación
            </button>
          )}
          
          {isRecording && (
            <button
              onClick={stopRecording}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ⏹️ Detener Grabación
            </button>
          )}
        </div>

        {/* Visualización de volumen */}
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#374151'
          }}>
            Nivel de Audio
          </h3>
          
          <canvas
            ref={volumeCanvasRef}
            width={400}
            height={60}
            style={{
              width: '100%',
              height: '60px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: '#f3f4f6'
            }}
          />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '8px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <span>🟢 RMS: {(volume * 50).toFixed(3)}</span>
            <span>🟡 Peak: {peak.toFixed(3)}</span>
            <span>Umbral: 0.5</span>
            <span>⚠️ Clipping: 0.8</span>
          </div>
        </div>
      </div>

      {/* Grid de información */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px', 
        marginBottom: '24px'
      }}>
        
        {/* Estadísticas de sesión */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '20px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          padding: '1.5rem'
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#374151'
          }}>
            📈 Estadísticas de Audio
          </h2>

          {audioStats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span>📦 Chunks enviados:</span>
                <span style={{ fontWeight: '600' }}>{audioStats.chunksSent}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span>Total chunks:</span>
                <span style={{ fontWeight: '600' }}>{audioStats.chunksCount}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span>⚠️ Chunks perdidos:</span>
                <span style={{ 
                  fontWeight: '600',
                  color: audioStats.chunksSkipped > 0 ? '#ef4444' : '#10b981'
                }}>
                  {audioStats.chunksSkipped}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #e5e7eb'
              }}>
                <span>🔊 Volumen actual:</span>
                <span style={{ fontWeight: '600' }}>{(volume * 100).toFixed(1)}%</span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '8px 0'
              }}>
                <span>🎯 Éxito de envío:</span>
                <span style={{ 
                  fontWeight: '600',
                  color: audioStats.chunksCount > 0 ? 
                    (audioStats.chunksSent / audioStats.chunksCount > 0.95 ? '#10b981' : '#f59e0b') : 
                    '#6b7280'
                }}>
                  {audioStats.chunksCount > 0 ? 
                    `${((audioStats.chunksSent / audioStats.chunksCount) * 100).toFixed(1)}%` : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#9ca3af', 
              marginTop: '40px'
            }}>
              Las estadísticas aparecerán durante la grabación
            </div>
          )}
        </div>

        {/* Información técnica */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '20px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          padding: '1.5rem'
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#374151'
          }}>
            ⚙️ Configuración Técnica
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span>🎵 Sample Rate:</span>
              <span style={{ fontWeight: '600' }}>16 kHz</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span>🔊 Canales:</span>
              <span style={{ fontWeight: '600' }}>Mono</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span>📦 Formato:</span>
              <span style={{ fontWeight: '600' }}>PCM 16-bit</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span>⏱️ Chunk Duration:</span>
              <span style={{ fontWeight: '600' }}>250ms</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span>🔌 WebSocket:</span>
              <span style={{ 
                fontWeight: '600',
                color: getConnectionStatusColor()
              }}>
                {socketService.isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '8px 0'
            }}>
              <span>🎛️ Procesamiento:</span>
              <span style={{ fontWeight: '600' }}>Tiempo Real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de grabaciones */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
        padding: '1.5rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#374151'
          }}>
            📁 Grabaciones Guardadas
          </h2>
          <button
            onClick={fetchRecordings}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 Actualizar
          </button>
        </div>

        {recordings.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#9ca3af', 
            marginTop: '40px'
          }}>
            📂 No hay grabaciones disponibles
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recordings.map((recording, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <div style={{ fontWeight: '500', fontSize: '14px' }}>
                    📄 {recording.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {formatBytes(recording.size)} • {new Date(recording.modified).toLocaleString()}
                  </div>
                </div>
                <a
                  href={`/api/recordings/${recording.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '12px'
                  }}
                >
                  📥 Descargar
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
