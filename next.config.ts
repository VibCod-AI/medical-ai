import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  
  // Configuración para desarrollo
  reactStrictMode: true,
  
  // Configuración para PWA
  experimental: {
    optimizePackageImports: ['socket.io-client', 'recordrtc']
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'microphone=(self), camera=(), geolocation=()',
          },
        ],
      },
    ]
  },
  
  // Configuración para optimización de imágenes
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  
  // Configuración para compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Configuración para WebSocket y audio en modo desarrollo
  webpack: (config, { dev, isServer }) => {
    // Configurar para WebRTC y audio en el cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Optimizaciones para desarrollo
    if (dev) {
      config.devtool = 'eval-source-map'
    }
    
    return config
  },
  
  // Configuración para variables de entorno públicas
  env: {
    CUSTOM_KEY: 'Medical IA-nextjs',
    BACKEND_URL: 'http://localhost:3001',
  },
  
  // Configuración para redirecciones
  async redirects() {
    return []
  },
  
  // Configuración para rewrites (proxy para desarrollo)
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ]
  },
}

export default nextConfig