'use client'

import React, { Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardContent from '@/components/DashboardContent'

export default function Dashboard() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        background: '#F5F5F7',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorations */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          width: '300px',
          height: '300px',
          background: 'rgba(91, 156, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'pulse 4s infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          width: '400px',
          height: '400px',
          background: 'rgba(74, 144, 226, 0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'pulse 4s infinite 2s'
        }}></div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          padding: '3rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(91, 156, 255, 0.2)',
            borderTop: '4px solid #4074a3',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
          }}></div>
          <p style={{ 
            color: '#2C2C2E',
            fontSize: '16px',
            fontWeight: '500',
            margin: 0
          }}>
            Cargando Dashboard...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div style={{
        fontFamily: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        background: '#F5F5F7',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(91, 156, 255, 0.2)',
          borderTop: '4px solid #4074a3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
