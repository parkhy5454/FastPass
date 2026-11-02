'use client'
import { useState } from 'react'
import PasswordInput from '@/components/PasswordInput'
export default function LoginPage() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const handleLogin = async () => {
    const res = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ loginId, password }) })
    const data = await res.json()
    if (data.token) { alert('로그인 성공'); window.location.href='/' } else alert(data.error)
  }
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-[400px] bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
        <h1 className="text-2xl font-black">로그인</h1>
        <p className="text-zinc-400 text-sm mt-1">전기 패스트패스</p>
        <div className="mt-6 space-y-4">
          <input value={loginId} onChange={e=>setLoginId(e.target.value)} placeholder="아이디" className="w-full bg-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#FFD60A] border border-zinc-700"/>
          <PasswordInput value={password} onChange={(e:any)=>setPassword(e.target.value)} placeholder="비밀번호"/>
          <button onClick={handleLogin} className="w-full bg-[#FFD60A] text-black rounded-xl py-3 font-bold">로그인</button>
        </div>
      </div>
    </div>
  )
}
