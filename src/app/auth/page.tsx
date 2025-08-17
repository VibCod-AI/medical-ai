'use client'

import React, { useState } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import SignUpForm from '@/components/auth/SignUpForm'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <>
      {isLogin ? (
        <LoginForm onSwitchToSignUp={() => setIsLogin(false)} />
      ) : (
        <SignUpForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </>
  )
}
