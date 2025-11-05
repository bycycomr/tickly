import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import api from '../lib/api'

type UserInfo = {
  username: string
  sub: string
  deptRole?: string // e.g. "1:DepartmentManager"
  roles?: string[]
}

type AuthContextType = {
  user: UserInfo | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function parseJwt(token: string) {
  try {
    const payload = token.split('.')[1]
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('tickly_token'))
  const [user, setUser] = useState<UserInfo | null>(() => {
    const t = localStorage.getItem('tickly_token')
    if (!t) return null
    const p = parseJwt(t)
    if (!p) return null
    const rolesRaw = p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || p.role
    let roles: string[] | undefined
    if (Array.isArray(rolesRaw)) roles = rolesRaw
    else if (typeof rolesRaw === 'string') roles = [rolesRaw]
    return { username: p["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || p.name || '', sub: p.sub, deptRole: p.dept_role, roles }
  })

  useEffect(() => {
    if (token) {
      localStorage.setItem('tickly_token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      localStorage.removeItem('tickly_token')
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  async function login(username: string, password: string) {
    const resp = await api.post('/api/auth/login', { Username: username, Password: password })
    const t: string = resp.data.token
    setToken(t)
    const p = parseJwt(t)
    const info: UserInfo = { username: p["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || p.name || username, sub: p.sub, deptRole: p.dept_role }
    setUser(info)
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
