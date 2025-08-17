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
- **Dashboard en tiempo real** con 6 paneles especializados
- **Compatible con dispositivos móviles** y escritorio

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │  APIs EXTERNAS  │
│  React + TS     │◄──►│ Node.js + TS    │◄──►│ Deepgram + AI   │
│  Audio Capture  │    │ WebSocket       │    │ Transcripción   │
│  Medical UI     │    │ Real-time       │    │ Análisis IA     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Cuenta de Deepgram
- Cuenta de OpenAI

### **1. Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/Medical IA.git
cd Medical IA
```

### **2. Configurar Backend**
```bash
cd backend
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus API keys:
# DEEPGRAM_API_KEY=tu_api_key_deepgram
# OPENAI_API_KEY=tu_api_key_openai
```

### **3. Configurar Frontend**
```bash
cd ../frontend
npm install
```

### **4. Ejecutar en Desarrollo**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Acceder a:** `http://localhost:3000`

## 📱 Uso del Sistema

### **1. 🔌 Verificar Conectividad**
- Ir a la pestaña "Conectividad" 
- Verificar conexión a backend y APIs
- Probar micrófono

### **2. 🎙️ Grabar Audio (Opcional)**
- Pestaña "Grabación de Audio"
- Probar captura y procesamiento

### **3. 🩺 Dashboard Médico**
- **Pestaña principal** para consultas
- **Iniciar Consulta** ▶️
- **Hablar normalmente** - el sistema transcribe automáticamente
- **Ver análisis en tiempo real** en los paneles
- **Finalizar Consulta** ⏹️
- **Generar Informe Final** 📋

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

### **Variables de Entorno (backend/.env)**
```env
# Deepgram
DEEPGRAM_API_KEY=your_deepgram_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Servidor
PORT=3001
```

### **Modelos Configurables**
- **Deepgram**: Nova-2, Base, Enhanced
- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Idioma**: Español (es), Inglés (en)

## 📦 Estructura del Proyecto

```
Medical IA/
├── README.md
├── PLAN_PROYECTO.md          # Roadmap detallado
├── .gitignore
├── frontend/                 # React + TypeScript PWA
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioRecorder.tsx
│   │   │   ├── ConnectionTest.tsx
│   │   │   └── MedicalDashboard.tsx
│   │   └── services/
│   │       ├── audioService.ts
│   │       └── socketService.ts
│   └── package.json
└── backend/                  # Node.js + TypeScript API
    ├── src/
    │   ├── server.ts
    │   ├── services/
    │   │   ├── deepgramService.ts
    │   │   ├── openaiService.ts
    │   │   └── audioSessionManager.ts
    │   └── types/
    └── package.json
```

## 🛠️ Scripts Disponibles

### **Backend**
```bash
npm run dev        # Desarrollo con nodemon
npm run build      # Compilar TypeScript
npm start          # Producción
```

### **Frontend**
```bash
npm start          # Desarrollo
npm run build      # Build para producción
npm test           # Tests
```

## 🔒 Seguridad y Privacidad

- **Sin persistencia** de datos por defecto
- **Procesamiento local** de audio
- **APIs externas** solo para transcripción y análisis
- **Variables de entorno** para keys sensibles

## 🚀 Despliegue

### **Frontend (Vercel/Netlify)**
```bash
cd frontend
npm run build
# Subir carpeta build/
```

### **Backend (Railway/Render)**
```bash
cd backend
npm run build
# Configurar variables de entorno en la plataforma
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
