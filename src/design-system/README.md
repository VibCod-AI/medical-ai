# Medical AI Design System

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Instalación y Uso](#instalación-y-uso)
3. [Tokens de Diseño](#tokens-de-diseño)
4. [Componentes](#componentes)
5. [Temas y Variables CSS](#temas-y-variables-css)
6. [Guías de Uso](#guías-de-uso)
7. [Ejemplos](#ejemplos)

## 🎨 Introducción

El **Medical AI Design System** es un sistema de diseño completo y coherente diseñado específicamente para aplicaciones médicas y de IA. Proporciona componentes reutilizables, tokens de diseño consistentes y patrones de interfaz que garantizan una experiencia de usuario uniforme y profesional.

### Características Principales

- 🎯 **Componentes Especializados**: Diseñados para contextos médicos y de IA
- 🎨 **Tokens de Diseño**: Colores, tipografía y espaciado consistentes
- ♿ **Accesibilidad**: Cumple con estándares WCAG 2.1
- 📱 **Responsive**: Optimizado para todos los dispositivos
- 🌙 **Tema Oscuro**: Soporte para modo oscuro
- ⚡ **Performance**: Componentes optimizados y ligeros

## 🚀 Instalación y Uso

### Importación Básica

```typescript
import { Button, Input, Card, Modal, designTokens } from '@/design-system';
```

### Configuración de CSS Global

Importa las variables CSS globales en tu aplicación:

```typescript
import '@/design-system/globals.css';
```

## 🎨 Tokens de Diseño

### Paleta de Colores

#### Colores Primarios (Azul Médico)
```typescript
designTokens.colors.primary[500] // #3B82F6 - Color principal
designTokens.colors.primary[600] // #2563EB - Hover/Active
designTokens.colors.primary[700] // #1D4ED8 - Pressed
```

#### Colores Secundarios (Verde Médico)
```typescript
designTokens.colors.secondary[500] // #10B981 - Éxito/Salud
designTokens.colors.secondary[600] // #059669 - Hover
```

#### Colores de Acento (Púrpura IA)
```typescript
designTokens.colors.accent[700] // #7C3AED - Análisis IA
designTokens.colors.accent[600] // #9333EA - Hover
```

#### Colores Médicos Específicos
```typescript
designTokens.colors.medical.transcription // #3B82F6 - Transcripciones
designTokens.colors.medical.analysis     // #7C3AED - Análisis médico
designTokens.colors.medical.report       // #059669 - Reportes
designTokens.colors.medical.alert        // #EF4444 - Alertas
designTokens.colors.medical.doctor       // #1D4ED8 - Médico
designTokens.colors.medical.patient      // #059669 - Paciente
```

### Tipografía

```typescript
// Familias de fuentes
designTokens.typography.fontFamily.primary   // SF Pro Display, Inter
designTokens.typography.fontFamily.secondary // SF Pro Text, Inter
designTokens.typography.fontFamily.mono      // SF Mono, Monaco

// Tamaños
designTokens.typography.fontSize.xs    // 0.75rem (12px)
designTokens.typography.fontSize.sm    // 0.875rem (14px)
designTokens.typography.fontSize.base  // 1rem (16px)
designTokens.typography.fontSize.lg    // 1.125rem (18px)
designTokens.typography.fontSize.xl    // 1.25rem (20px)
designTokens.typography.fontSize['2xl'] // 1.5rem (24px)
```

### Espaciado

Basado en una unidad base de 8px:

```typescript
designTokens.spacing[1]  // 0.25rem (4px)
designTokens.spacing[2]  // 0.5rem (8px)
designTokens.spacing[4]  // 1rem (16px)
designTokens.spacing[6]  // 1.5rem (24px)
designTokens.spacing[8]  // 2rem (32px)
```

## 🧩 Componentes

### Button

Botón versátil con múltiples variantes y estados.

```typescript
import { Button } from '@/design-system';

// Uso básico
<Button variant="primary" size="md">
  Iniciar Análisis
</Button>

// Con iconos y estado de carga
<Button 
  variant="secondary" 
  size="lg"
  isLoading={isAnalyzing}
  leftIcon={<AnalysisIcon />}
>
  Generar Reporte
</Button>
```

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'accent' \| 'success' \| 'warning' \| 'error' \| 'ghost' \| 'outline'` | `'primary'` | Estilo del botón |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del botón |
| `isLoading` | `boolean` | `false` | Estado de carga |
| `leftIcon` | `ReactNode` | - | Icono a la izquierda |
| `rightIcon` | `ReactNode` | - | Icono a la derecha |
| `fullWidth` | `boolean` | `false` | Ancho completo |

### Input

Campo de entrada con validación y estados.

```typescript
import { Input } from '@/design-system';

<Input
  label="Nombre del Paciente"
  placeholder="Ingrese el nombre completo"
  helperText="Requerido para el reporte médico"
  error={errors.patientName}
  leftIcon={<UserIcon />}
  fullWidth
/>
```

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'filled' \| 'outline'` | `'default'` | Estilo del input |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del input |
| `label` | `string` | - | Etiqueta del campo |
| `helperText` | `string` | - | Texto de ayuda |
| `error` | `string` | - | Mensaje de error |
| `leftIcon` | `ReactNode` | - | Icono a la izquierda |
| `rightIcon` | `ReactNode` | - | Icono a la derecha |

### Card

Contenedor flexible para agrupar contenido.

```typescript
import { Card, CardHeader, CardContent, CardFooter } from '@/design-system';

<Card variant="medical" hover interactive>
  <CardHeader 
    title="Análisis Médico"
    subtitle="Resultados del análisis de IA"
    action={<Button size="sm">Ver Detalles</Button>}
  />
  <CardContent>
    <p>Contenido del análisis...</p>
  </CardContent>
  <CardFooter justify="between">
    <span>Confianza: 87%</span>
    <Button variant="outline">Exportar</Button>
  </CardFooter>
</Card>
```

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'elevated' \| 'outline' \| 'glass' \| 'medical'` | `'default'` | Estilo de la tarjeta |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Espaciado interno |
| `hover` | `boolean` | `false` | Efecto hover |
| `interactive` | `boolean` | `false` | Cursor pointer |

### BackButton

Botón de navegación hacia atrás con múltiples variantes y posiciones.

```typescript
import { BackButton } from '@/design-system';

// Uso básico
<BackButton 
  to="/" 
  label="Volver al Inicio"
  variant="glass"
  position="top-left"
/>

// Con función personalizada
<BackButton 
  label="Cerrar Modal"
  variant="outline"
  size="sm"
  onClick={() => setModalOpen(false)}
/>
```

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `to` | `string` | `'/'` | Ruta de destino |
| `label` | `string` | `'Volver'` | Texto del botón |
| `position` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-left'` | Posición en pantalla |
| `variant` | `'glass' \| 'solid' \| 'outline'` | `'glass'` | Estilo del botón |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del botón |
| `onClick` | `() => void` | - | Función personalizada (sobrescribe navegación) |

#### Variantes

- **Glass**: Fondo translúcido con efecto blur, ideal para overlays
- **Solid**: Fondo sólido con bordes definidos, para interfaces tradicionales  
- **Outline**: Fondo transparente con borde de color, para acciones secundarias

```typescript
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/design-system';

<Modal
  isOpen={showReport}
  onClose={() => setShowReport(false)}
  size="lg"
  title="Reporte Médico Final"
  subtitle="Análisis completo de la consulta"
>
  <ModalContent>
    <p>Contenido del reporte...</p>
  </ModalContent>
  <ModalFooter>
    <Button variant="outline" onClick={() => setShowReport(false)}>
      Cancelar
    </Button>
    <Button variant="primary" onClick={handleSave}>
      Guardar Reporte
    </Button>
  </ModalFooter>
</Modal>
```

#### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Estado del modal |
| `onClose` | `() => void` | - | Función de cierre |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Tamaño del modal |
| `closeOnOverlayClick` | `boolean` | `true` | Cerrar al hacer clic fuera |
| `closeOnEscape` | `boolean` | `true` | Cerrar con tecla Escape |

## 🎨 Temas y Variables CSS

### Variables CSS Disponibles

Todas las variables están disponibles globalmente:

```css
/* Colores */
--color-primary-500
--color-secondary-500
--color-accent-700

/* Tipografía */
--font-family-primary
--font-size-base
--font-weight-medium

/* Espaciado */
--spacing-4
--spacing-6
--spacing-8

/* Sombras */
--shadow-md
--shadow-glass
--shadow-floating
```

### Clases Utilitarias

```css
/* Colores de texto */
.text-primary
.text-secondary
.text-accent
.medical-transcription
.medical-analysis

/* Fondos */
.bg-primary
.bg-success
.bg-error

/* Sombras */
.shadow-md
.shadow-glass

/* Bordes redondeados */
.rounded-lg
.rounded-xl
.rounded-full

/* Transiciones */
.transition-normal
.transition-slow

/* Animaciones */
.animate-fade-in
.animate-slide-up
.animate-pulse
```

## 📋 Guías de Uso

### Patrones de Color

#### Estados de Componentes Médicos
- **Transcripciones**: Azul primario (`primary-500`)
- **Análisis IA**: Púrpura acento (`accent-700`)
- **Reportes**: Verde secundario (`secondary-500`)
- **Alertas**: Rojo error (`error-main`)
- **Médico**: Azul oscuro (`primary-700`)
- **Paciente**: Verde (`secondary-600`)

#### Jerarquía Visual
1. **Primario**: Acciones principales, elementos importantes
2. **Secundario**: Acciones secundarias, elementos de apoyo
3. **Acento**: Elementos de IA, análisis, características especiales
4. **Neutro**: Texto, fondos, elementos estructurales

### Espaciado Consistente

Utiliza múltiplos de 8px para mantener consistencia:

```typescript
// Correcto
padding: designTokens.spacing[4]  // 16px
margin: designTokens.spacing[6]   // 24px

// Evitar
padding: '15px'
margin: '23px'
```

### Tipografía

#### Jerarquía de Texto
- **6xl**: Títulos principales de página
- **4xl**: Títulos de sección
- **2xl**: Subtítulos importantes
- **xl**: Títulos de tarjetas
- **lg**: Texto destacado
- **base**: Texto normal
- **sm**: Texto secundario
- **xs**: Etiquetas, metadatos

## 💡 Ejemplos

### Tarjeta de Análisis Médico

```typescript
<Card variant="medical" hover>
  <CardHeader 
    title="Análisis de Síntomas"
    subtitle="Procesado con IA médica"
  />
  <CardContent>
    <div style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing[3] }}>
      <div style={{ color: designTokens.colors.medical.alert }}>
        🚨 Síntoma de alta prioridad detectado
      </div>
      <div style={{ color: designTokens.colors.medical.analysis }}>
        🤖 Confianza del análisis: 92%
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button variant="accent" size="sm">
      Ver Detalles
    </Button>
  </CardFooter>
</Card>
```

### Formulario de Paciente

```typescript
<form style={{ display: 'flex', flexDirection: 'column', gap: designTokens.spacing[4] }}>
  <Input
    label="Nombre del Paciente"
    placeholder="Ingrese nombre completo"
    leftIcon={<UserIcon />}
    fullWidth
  />
  
  <Input
    label="Síntomas Principales"
    placeholder="Describa los síntomas"
    variant="filled"
    fullWidth
  />
  
  <div style={{ display: 'flex', gap: designTokens.spacing[3] }}>
    <Button variant="outline" fullWidth>
      Cancelar
    </Button>
    <Button variant="primary" fullWidth>
      Iniciar Análisis
    </Button>
  </div>
</form>
```

### Página de Autenticación con Navegación

```typescript
import { BackButton, Card, Input, Button } from '@/design-system';

<div style={{ minHeight: '100vh', position: 'relative' }}>
  <BackButton 
    to="/" 
    label="Volver al Inicio"
    variant="glass"
    position="top-left"
  />
  
  <Card variant="glass" padding="xl" style={{ maxWidth: '400px', margin: '0 auto' }}>
    <h2>Iniciar Sesión</h2>
    <Input 
      label="Email" 
      type="email" 
      fullWidth 
      style={{ marginBottom: designTokens.spacing[4] }}
    />
    <Input 
      label="Contraseña" 
      type="password" 
      fullWidth 
      style={{ marginBottom: designTokens.spacing[6] }}
    />
    <Button variant="primary" fullWidth>
      Iniciar Sesión
    </Button>
  </Card>
</div>
```

### Modal con Botón de Cerrar

```typescript
<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
  <BackButton 
    label="Cerrar"
    variant="outline"
    size="sm"
    position="top-right"
    onClick={() => setShowModal(false)}
  />
  
  <ModalContent>
    <h3>Contenido del Modal</h3>
    <p>El botón BackButton puede usarse dentro de modales para navegación personalizada.</p>
  </ModalContent>
</Modal>
```

## 🔧 Funciones Utilitarias

```typescript
import { getColor, getSpacing, getFontSize } from '@/design-system';

// Obtener colores de forma segura
const primaryColor = getColor('primary.500');
const alertColor = getColor('medical.alert');

// Espaciado consistente
const padding = getSpacing('4');
const margin = getSpacing('6');

// Tamaños de fuente
const titleSize = getFontSize('2xl');
const bodySize = getFontSize('base');
```

---

## 📚 Recursos Adicionales

- **Figma Design Kit**: [Enlace al kit de diseño]
- **Storybook**: [Enlace a la documentación interactiva]
- **GitHub**: [Repositorio del design system]

---

*Medical AI Design System v1.0 - Diseñado para aplicaciones médicas profesionales*
