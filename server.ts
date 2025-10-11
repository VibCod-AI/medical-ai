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
    // Verificar variables de entorno críticas
    console.log('🔍 SERVER: Verificando variables de entorno:', {
      hasDeepgramKey: !!process.env.DEEPGRAM_API_KEY,
      deepgramKeyLength: process.env.DEEPGRAM_API_KEY?.length || 0,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      wsUrl: process.env.NEXT_PUBLIC_WS_URL
    });

    if (!process.env.DEEPGRAM_API_KEY) {
      console.error('❌ SERVER: DEEPGRAM_API_KEY no encontrada!');
      console.error('💡 SERVER: Verifica que el archivo .env.local existe y contiene DEEPGRAM_API_KEY');
    }

    console.log('🔧 SERVER: Creando instancia de Deepgram...');
    deepgramService = new DeepgramService();
    console.log('✅ SERVER: Deepgram creado:', !!deepgramService);
    
    console.log('🔧 SERVER: Creando instancia de OpenAI...');
    try {
      openaiService = new OpenAIService();
      console.log('✅ SERVER: OpenAI creado:', !!openaiService);
      
      // Exponer la instancia globalmente para que los endpoints API puedan accederla
      (global as any).openaiService = openaiService;
      console.log('🌍 SERVER: Instancia OpenAI expuesta globalmente:', !!openaiService);
      
    } catch (error) {
      console.error('❌ SERVER: Error creando OpenAI service:', error);
      openaiService = null;
    }
    
    // Configurar callback de Deepgram
    deepgramService.onTranscriptionReceived = async (transcriptionResult) => {
      console.log('📝 SERVER: Transcripción recibida de Deepgram:', {
        transcript: transcriptionResult.transcript,
        is_final: transcriptionResult.is_final,
        speaker: transcriptionResult.speaker,
        confidence: transcriptionResult.confidence,
        transcript_length: transcriptionResult.transcript?.length || 0,
        has_io: !!io,
        connected_clients: io?.engine?.clientsCount || 0
      });
      
      if (transcriptionResult.transcript.trim()) {
        const transcriptionData = {
          is_final: transcriptionResult.is_final,
          transcript: transcriptionResult.transcript,
          speaker: transcriptionResult.speaker,
          confidence: transcriptionResult.confidence
        };
        
        console.log('🚀 SERVER: Enviando transcription-update a clientes:', transcriptionData);
        
        // Enviar transcripción a todos los clientes
        if (io) {
          io.emit('transcription-update', transcriptionData);
          console.log('✅ SERVER: Evento transcription-update emitido');
        } else {
          console.error('❌ SERVER: io no disponible, no se puede enviar transcripción');
        }
        
        if (transcriptionResult.is_final && transcriptionResult.transcript.trim()) {
          console.log('🔄 SERVER: Procesando transcripción final para análisis médico...');
          
          // Detectar speaker basándose en contenido (ya que Deepgram no está enviando speaker info)
          let speakerLabel = 'Paciente'; // Default
          const text = transcriptionResult.transcript.toLowerCase();
          
          // Frases típicas del médico
          const doctorPhrases = [
            'cuáles son los síntomas', 'desde cuándo', 'podrías describir', 'cómo se siente',
            'qué tipo de dolor', 'se acompaña', 'has notado', 'tienes algún', 'mi nombre es',
            'acompañando en tu consulta', 'vamos a revisar'
          ];
          
          // Frases típicas del paciente  
          const patientPhrases = [
            'me duele', 'siento', 'tengo dolor', 'he estado', 'vengo porque', 'he notado',
            'se siente como', 'es una presión', 'dolor constante', 'hola doctor'
          ];
          
          const hasDoctorPhrase = doctorPhrases.some(phrase => text.includes(phrase));
          const hasPatientPhrase = patientPhrases.some(phrase => text.includes(phrase));
          
          if (hasDoctorPhrase && !hasPatientPhrase) {
            speakerLabel = 'Médico';
          } else if (hasPatientPhrase && !hasDoctorPhrase) {
            speakerLabel = 'Paciente';
          } else if (typeof transcriptionResult.speaker === 'number') {
            // Fallback a Deepgram si está disponible
            const speakerMap: {[key: number]: string} = {
              0: 'Médico',
              1: 'Paciente', 
              2: 'Hablante 3',
              3: 'Hablante 4'
            };
            speakerLabel = speakerMap[transcriptionResult.speaker] || `Hablante ${transcriptionResult.speaker}`;
          }
          
          console.log('🧠 SERVER: Enviando a OpenAI para análisis:', {
            texto: transcriptionResult.transcript.substring(0, 50) + '...',
            speaker: speakerLabel,
            openaiService: !!openaiService
          });
          
          // Procesar transcripción final
          processTranscriptionAsync(transcriptionResult, speakerLabel);
        }
      } else {
        console.log('⏭️ SERVER: Transcripción ignorada (texto vacío)');
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
      console.warn('⚠️ OpenAI service no disponible para análisis médico');
      return;
    }
    
    console.log('📝 SERVER: Agregando transcripción al historial de OpenAI...');
    
    // Agregar transcripción al historial
    openaiService.addTranscription(transcriptionResult, speakerLabel);
    
    console.log('🧠 SERVER: Generando análisis médico con OpenAI...');
    
    // Generar análisis médico
    const analysis = await openaiService.generateMedicalAnalysis();
    
    if (analysis) {
      console.log('✅ SERVER: Análisis médico generado exitosamente:', {
        síntomas: analysis.symptoms?.length || 0,
        diagnósticos: analysis.diagnoses?.length || 0,
        recomendaciones: analysis.recommendations?.length || 0,
        confianza: Math.round((analysis.confidence_level || 0) * 100) + '%'
      });
      
      if (io) {
        console.log('🚀 SERVER: Enviando análisis médico a clientes...');
        io.emit('medical-analysis', analysis);
        console.log('✅ SERVER: Análisis médico enviado a', io.engine?.clientsCount || 0, 'clientes');
      } else {
        console.error('❌ SERVER: io no disponible, no se puede enviar análisis');
      }
    } else {
      console.log('⏭️ SERVER: No se generó análisis (insuficientes datos o ya en proceso)');
    }
  } catch (error) {
    console.error('❌ SERVER: Error procesando transcripción para análisis:', error);
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
  
  console.log('🔍 SERVER: Resultado de inicialización:', {
    servicesReady,
    hasDeepgram: !!deepgramService,
    hasOpenAI: !!openaiService,
    globalOpenAI: !!(global as any).openaiService
  });
  
  if (!servicesReady) {
    console.warn('⚠️ Algunos servicios no se pudieron inicializar - continuando sin ellos');
  } else {
    console.log('✅ SERVER: Todos los servicios inicializados correctamente');
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
        console.log(`🎵 SERVER: Audio chunk recibido de ${socket.id}:`, {
          hasData: !!audioData,
          byteLength: audioData?.byteLength || 0,
          deepgramConnected: deepgramService?.connected || false,
          sessionManagerAvailable: !!audioSessionManager
        });

        if (!audioData || audioData.byteLength === 0) {
          console.warn('⚠️ Chunk de audio vacío recibido');
          return;
        }

        // Procesar chunk de audio
        let chunk = null;
        if (audioSessionManager) {
          chunk = audioSessionManager.processAudioChunk(socket.id, audioData);
          console.log(`📊 SERVER: Chunk procesado:`, {
            chunkId: chunk?.id,
            sessionId: chunk?.sessionId
          });
        }
        
        if (deepgramService && deepgramService.connected) {
          console.log(`🚀 SERVER: Enviando chunk a Deepgram...`);
          // Enviar audio a Deepgram
          const sent = deepgramService.sendAudioChunk(audioData);
          if (!sent) {
            console.warn('⚠️ No se pudo enviar audio a Deepgram');
          } else {
            console.log('✅ SERVER: Chunk enviado a Deepgram exitosamente');
          }
          
          // ELIMINADO: Código de simulación que estaba contaminando las transcripciones reales
          // Las transcripciones ahora vienen únicamente de Deepgram
        } else {
          console.warn('⚠️ SERVER: Deepgram no conectado, chunk no enviado');
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
