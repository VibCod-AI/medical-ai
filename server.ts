import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import DeepgramService from './src/lib/services/deepgramService.js';
import OpenAIService from './src/lib/services/openaiService.js';
import audioSessionManager from './src/lib/services/audioSessionManager.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Instancias de servicios
let deepgramService: DeepgramService | null = null;
let openaiService: OpenAIService | null = null;
let io: Server | null = null;

// Inicializar servicios
const initServices = () => {
  try {
    deepgramService = new DeepgramService();
    openaiService = new OpenAIService();
    
    // Configurar callback de Deepgram
    deepgramService.onTranscriptionReceived = async (transcriptionResult) => {
      console.log('📝 Transcripción recibida:', transcriptionResult.transcript);
      
      if (transcriptionResult.transcript.trim()) {
        const transcriptionData = {
          is_final: transcriptionResult.is_final,
          transcript: transcriptionResult.transcript,
          speaker: transcriptionResult.speaker,
          confidence: transcriptionResult.confidence
        };
        
        // Enviar transcripción a todos los clientes
        if (io) {
          io.emit('transcription-update', transcriptionData);
        }
        
        if (transcriptionResult.is_final && transcriptionResult.transcript.trim()) {
          let speakerLabel = 'Sin identificar';
          const speakerMap: {[key: number]: string} = {
            0: 'Médico',
            1: 'Paciente', 
            2: 'Hablante 3',
            3: 'Hablante 4'
          };
          
          if (typeof transcriptionResult.speaker === 'number') {
            speakerLabel = speakerMap[transcriptionResult.speaker] || `Hablante ${transcriptionResult.speaker}`;
          }
          
          // Procesar transcripción final
          processTranscriptionAsync(transcriptionResult, speakerLabel);
        }
      }
    };
    
    console.log('✅ Servicios de IA inicializados correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando servicios:', error);
    return false;
  }
};

const processTranscriptionAsync = async (transcriptionResult: any, speakerLabel: string) => {
  try {
    if (!openaiService) {
      console.warn('⚠️ OpenAI service no disponible');
      return;
    }
    
    // Agregar transcripción al historial
    openaiService.addTranscription(transcriptionResult, speakerLabel);
    
            // Generar análisis médico
        const analysis = await openaiService.generateMedicalAnalysis();
        
        if (analysis) {
          console.log('🧠 Análisis médico generado:', analysis.symptoms?.length || 0, 'síntomas');
          if (io) {
            io.emit('medical-analysis', analysis);
          }
        }
  } catch (error) {
    console.error('❌ Error procesando transcripción:', error);
  }
};

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    return handle(req, res);
  });

  // Inicializar servidor Socket.IO (asignar a variable global)
  io = new Server(httpServer, {
    cors: {
      origin: [`http://localhost:${port}`, "http://127.0.0.1:3000"],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Inicializar servicios de IA
  console.log('🔄 Inicializando servicios de IA...');
  const servicesReady = initServices();
  
  if (!servicesReady) {
    console.warn('⚠️ Algunos servicios no se pudieron inicializar - continuando sin ellos');
  }

  io.on('connection', (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);
    
    // Crear sesión de audio (solo si el servicio está disponible)
    let session = null;
    if (audioSessionManager) {
      session = audioSessionManager.createSession(socket.id);
      console.log(`🎵 Sesión de audio creada: ${session.id}`);
    }

    socket.on('start-recording', async (data) => {
      console.log(`🎙️ Iniciando grabación para socket: ${socket.id}`);
      
      try {
        if (deepgramService && !deepgramService.connected) {
          const connected = await deepgramService.connect();
          if (connected) {
            console.log('✅ Deepgram conectado para grabación');
          } else {
            console.error('❌ No se pudo conectar a Deepgram');
            socket.emit('error', { message: 'Error conectando a Deepgram' });
            return;
          }
        }
        
        socket.emit('recording-started', { 
          sessionId: session?.id || 'no-session',
          message: 'Grabación iniciada correctamente' 
        });
      } catch (error) {
        console.error('❌ Error iniciando grabación:', error);
        socket.emit('error', { message: 'Error iniciando grabación' });
      }
    });

    socket.on('audio-chunk', (audioData) => {
      try {
        if (!audioData || audioData.byteLength === 0) {
          console.warn('⚠️ Chunk de audio vacío recibido');
          return;
        }

        // Procesar chunk de audio
        let chunk = null;
        if (audioSessionManager) {
          chunk = audioSessionManager.processAudioChunk(socket.id, audioData);
        }
        
        if (deepgramService && deepgramService.connected) {
          // Enviar audio a Deepgram
          const sent = deepgramService.sendAudioChunk(audioData);
          if (!sent) {
            console.warn('⚠️ No se pudo enviar audio a Deepgram');
          }
        }
      } catch (error) {
        console.error('❌ Error procesando audio chunk:', error);
      }
    });

    socket.on('stop-recording', () => {
      console.log(`🛑 Deteniendo grabación para socket: ${socket.id}`);
      
      try {
        // Finalizar sesión de Deepgram
        if (deepgramService && deepgramService.connected) {
          deepgramService.finish();
        }
        
        // Finalizar sesión de audio
        if (audioSessionManager) {
          audioSessionManager.endSession(socket.id);
        }
        
        socket.emit('recording-stopped', { 
          message: 'Grabación detenida correctamente' 
        });
      } catch (error) {
        console.error('❌ Error deteniendo grabación:', error);
        socket.emit('error', { message: 'Error deteniendo grabación' });
      }
    });

    socket.on('generate-final-report', async () => {
      console.log(`📋 Generando informe final para socket: ${socket.id}`);
      
      try {
        if (!openaiService) {
          socket.emit('error', { message: 'Servicio OpenAI no disponible' });
          return;
        }
        
        const finalReport = await openaiService.generateFinalReport();
        
        if (finalReport) {
          console.log('📄 Informe final generado exitosamente');
          socket.emit('final-report-generated', finalReport);
        } else {
          socket.emit('error', { 
            message: 'No se pudo generar el informe final. Consulta muy corta.' 
          });
        }
      } catch (error) {
        console.error('❌ Error generando informe final:', error);
        socket.emit('error', { message: 'Error interno generando informe' });
      }
    });

    socket.on('test-connection', () => {
      console.log(`🧪 Test de conexión para socket: ${socket.id}`);
      socket.emit('test-response', { 
        message: 'Conexión WebSocket funcionando correctamente',
        timestamp: new Date().toISOString(),
        socketId: socket.id 
      });
    });

    socket.on('disconnect', (reason) => {
      console.log(`❌ Cliente desconectado: ${socket.id} - Razón: ${reason}`);
      
      try {
        // Limpiar recursos
        if (deepgramService && deepgramService.connected) {
          deepgramService.disconnect();
        }
        
        if (audioSessionManager) {
          audioSessionManager.endSession(socket.id);
        }
      } catch (error) {
        console.error('❌ Error limpiando recursos:', error);
      }
    });
  });

  // Limpiar sesiones inactivas cada 5 minutos
  setInterval(() => {
    try {
      if (audioSessionManager) {
        audioSessionManager.cleanup();
      }
    } catch (error) {
      console.error('❌ Error en limpieza:', error);
    }
  }, 5 * 60 * 1000);

  httpServer
    .once('error', (err) => {
      console.error('❌ Error del servidor:', err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Medical IA iniciado en http://${hostname}:${port}`);
      console.log(`🔌 WebSocket server activo`);
      console.log(`🧠 Servicios de IA configurados`);
    });
});
