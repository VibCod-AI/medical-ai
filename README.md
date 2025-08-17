# 🏥 Medical IA - PWA de Consultas Médicas en Tiempo Real

**Sistema revolucionario de análisis médico en tiempo real** con transcripción inteligente, diarización de hablantes y análisis de IA para generar diagnósticos, recomendaciones y informes médicos completos con códigos CIE-10.

## 🌟 Características Principales

### 🎤 **Audio en Tiempo Real**
- **Captura simultánea** de médico y paciente
- **Transcripción en vivo** con Deepgram Nova 2
- **Diarización automática** (identificación de hablantes)
- **Optimización de audio** (AEC, VAD, reducción de ruido)

### 🤖 **Análisis Médico Inteligente**
- **OpenAI GPT-4** para análisis médico profesional
- **Sugerencias contextuales** en tiempo real
- **Detección automática** de síntomas y diagnósticos
- **Sistema de preguntas inteligentes** que evita repeticiones

### 📋 **Informes Médicos Completos**
- **Códigos CIE-10** específicos y precisos
- **Lenguaje dual**: normal para pacientes + técnico médico
- **Prescripciones detalladas** con dosis, frecuencia, contraindicaciones
- **Plan de seguimiento** temporal específico
- **Criterios de emergencia** con umbrales de acción

### 💻 **Tecnología PWA**
- **Progressive Web App** con funcionalidad offline
- **Interface médica profesional** responsiva
- **Dashboard en tiempo real** con paneles especializados
- **Compatible con dispositivos móviles** y escritorio

### 🔐 **Autenticación y Datos**
- **Supabase** para autenticación de usuarios
- **Google OAuth** (opcional)
- **Almacenamiento seguro** de sesiones médicas
- **Historial de reportes** y análisis

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS FULLSTACK APP                   │
├─────────────────┬─────────────────┬─────────────────────────┤
│   FRONTEND      │   API ROUTES    │    WEBSOCKET SERVER     │
│  React + TS     │   Next.js API   │    Socket.io + Audio    │
│  Audio Capture  │   RESTful APIs  │    Real-time Comms      │
│  Medical UI     │   Route Handler │    Session Management   │
└─────────────────┴─────────────────┴─────────────────────────┘
           │                │                    │
           ▼                ▼                    ▼
    ┌─────────────┐  ┌─────────────┐    ┌─────────────┐
    │  SUPABASE   │  │  DEEPGRAM   │    │   OPENAI    │
    │ Auth + DB   │  │ Speech API  │    │  GPT-4 API  │
    └─────────────┘  └─────────────┘    └─────────────┘
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Cuenta de Deepgram
- Cuenta de OpenAI

### **1. Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/medical-ai.git
cd medical-ai
```

### **2. Instalar dependencias**
```bash
npm install
```

### **3. Configurar variables de entorno**
```bash
# Copiar el template de variables de entorno
cp env.template .env.local

# Editar .env.local con tus credenciales:
# - Configuración de Supabase
# - API Keys de Deepgram y OpenAI
# - Configuración opcional de Google OAuth
```

### **4. Ejecutar en Desarrollo**
```bash
npm run dev
```

**Acceder a:** `http://localhost:3000`

### **5. Para producción**
```bash
npm run build
npm start
```

## 📱 Uso del Sistema

### **1. 🔐 Autenticación**
- Registrarse o iniciar sesión en `/auth`
- Autenticación con email/password o Google OAuth
- Dashboard de usuario en `/dashboard`

### **2. 🔌 Verificar Conectividad**
- Probar conexiones API en el dashboard
- Verificar micrófono y permisos de audio
- Test de Deepgram y OpenAI

### **3. 🩺 Consulta Médica**
- Acceder al módulo médico en `/medical`
- **Iniciar Nueva Sesión** ▶️
- **Hablar normalmente** - transcripción automática en tiempo real
- **Ver análisis médico** en paneles especializados
- **Finalizar Consulta** ⏹️
- **Generar Informe Final** 📋 con códigos CIE-10

### **4. 📊 Historial y Reportes**
- Ver sesiones anteriores en el dashboard
- Descargar reportes médicos completos
- Análisis de tendencias y seguimiento

## 🎯 Funcionalidades Avanzadas

### **🧠 Sistema de Preguntas Inteligentes**
- **Fases de consulta**: Listening → Exploring → Differential → Confirmation
- **Detección semántica** de respuestas indirectas
- **Eliminación automática** de preguntas ya respondidas
- **Adaptación contextual** según fase de consulta

### **📊 Análisis Médico Completo**
- **Síntomas**: Detección automática con severidad
- **Diagnósticos**: Probabilidades y evidencia
- **Medicamentos**: Prescripciones detalladas
- **Seguimiento**: Plan temporal específico
- **Emergencias**: Criterios de alarma

### **📋 Informe Final Profesional**
```json
{
  "symptoms_report": [
    {
      "normal_language": "Dolor de cabeza tipo presión",
      "technical_language": "Cefalea tensional bilateral",
      "cie10_code": "G44.2",
      "severity": "moderado"
    }
  ],
  "diagnoses_report": [
    {
      "normal_language": "Dolor de cabeza por tensión",
      "technical_language": "Cefalea tensional episódica", 
      "cie10_code": "G44.20",
      "probability": 0.85
    }
  ]
}
```

## 🔧 Configuración Avanzada

### **Variables de Entorno (.env.local)**
```env
# Supabase Configuration (Requerido)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Services (Requerido)
DEEPGRAM_API_KEY=your_deepgram_api_key
OPENAI_API_KEY=your_openai_api_key

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server Configuration (Opcional)
PORT=3000
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

### **Modelos Configurables**
- **Deepgram**: Nova-2, Base, Enhanced
- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Idioma**: Español (es), Inglés (en)

## 📦 Estructura del Proyecto

```
medical-ai/
├── README.md
├── env.template                     # Template de variables de entorno
├── package.json                     # Dependencias del proyecto
├── next.config.ts                   # Configuración de Next.js
├── server.ts                        # Servidor custom con Socket.io
├── tsconfig.json                    # Configuración TypeScript
├── tailwind.config.js               # Configuración Tailwind CSS
├── public/                          # Archivos estáticos
│   ├── manifest.json               # PWA Manifest
│   └── *.svg                       # Iconos
└── src/                            # Código fuente
    ├── app/                        # App Router de Next.js
    │   ├── layout.tsx              # Layout principal
    │   ├── page.tsx                # Página de inicio
    │   ├── auth/                   # Autenticación
    │   ├── dashboard/              # Dashboard de usuario
    │   ├── medical/                # Módulo médico principal
    │   └── api/                    # API Routes
    │       ├── health/             # Health check
    │       ├── test-deepgram/      # Test Deepgram
    │       ├── test-openai/        # Test OpenAI
    │       ├── medical-analysis/   # Análisis médico
    │       ├── medical-sessions/   # Sesiones médicas
    │       ├── recordings/         # Grabaciones
    │       └── reports-history/    # Historial reportes
    ├── components/                 # Componentes React
    │   ├── AudioRecorder.tsx       # Grabador de audio
    │   ├── ConnectionTest.tsx      # Test de conectividad
    │   ├── MedicalDashboard.tsx    # Dashboard médico
    │   └── auth/                   # Componentes de auth
    ├── contexts/                   # Contextos React
    │   └── AuthContext.tsx         # Contexto de autenticación
    ├── lib/                        # Librerías y utilidades
    │   ├── services/               # Servicios
    │   │   ├── deepgramService.ts  # Servicio Deepgram
    │   │   ├── openaiService.ts    # Servicio OpenAI
    │   │   └── audioSessionManager.ts # Gestor de sesiones
    │   ├── supabase/               # Cliente Supabase
    │   └── types/                  # Tipos TypeScript
    ├── services/                   # Servicios del cliente
    │   ├── audioService.ts         # Servicio de audio
    │   └── socketService.ts        # Servicio WebSocket
    └── middleware.ts               # Middleware de Next.js
```

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Desarrollo con servidor customizado
npm run build        # Build para producción
npm start            # Iniciar en producción
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Arreglar errores de ESLint automáticamente
npm run type-check   # Verificar tipos TypeScript
npm run clean        # Limpiar archivos de build
npm run analyze      # Analizar bundle de producción
npm test             # Ejecutar tests (placeholder)
```

## 🔒 Seguridad y Privacidad

- **Sin persistencia** de datos por defecto
- **Procesamiento local** de audio
- **APIs externas** solo para transcripción y análisis
- **Variables de entorno** para keys sensibles

## 🚀 Despliegue

### **Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno en Vercel dashboard
# Todas las variables del env.template
```

### **Otras plataformas (Railway/Render/Netlify)**
```bash
npm run build

# Configurar variables de entorno:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY  
# - SUPABASE_SERVICE_ROLE_KEY
# - DEEPGRAM_API_KEY
# - OPENAI_API_KEY
# - PORT (opcional)
```

### **Docker**
```dockerfile
# Dockerfile incluido para containerización
docker build -t medical-ai .
docker run -p 3000:3000 medical-ai
```

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Issues**: GitHub Issues
- **Documentación**: Wiki del proyecto
- **Actualizaciones**: Ver PLAN_PROYECTO.md

## 🎯 Roadmap

- ✅ **V1.0**: Sistema básico completo
- 🔄 **V1.1**: Persistencia de datos
- 📱 **V1.2**: App móvil nativa
- 🌐 **V1.3**: Multi-idioma
- 🔐 **V1.4**: Autenticación y roles

---

**Desarrollado con ❤️ para revolucionar las consultas médicas**
