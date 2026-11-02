'use client'
import { useState } from 'react'
import PasswordInput from '@/components/PasswordInput'
export default function SignupPage() {
  const [form, setForm] = useState({ loginId:'', password:'', name:'', phone:'', interests: [] as string[] })
  const handleSignup = async () => {
    const res = await fetch('/api/auth/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const data = await res.json()
    if (data.user) { alert('회원가입 성공'); window.location.href='/login' } else alert(data.error)
  }
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white p-6">
      <div className="max-w-[420px] mx-auto bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
        <h1 className="text-2xl font-black">회원가입</h1>
        <div className="mt-6 space-y-4">
          <input value={form.loginId} onChange={e=>setForm({...form, loginId:e.target.value})} placeholder="아이디" className="w-full bg-zinc-800 rounded-xl px-4 py-3 outline-none border border-zinc-700"/>
          <PasswordInput value={form.password} onChange={(e:any)=>setForm({...form, password:e.target.value})} placeholder="비밀번호 8자 이상"/>
          <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="이름" className="w-full bg-zinc-800 rounded-xl px-4 py-3 outline-none border border-zinc-700"/>
          <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="핸드폰 번호" className="w-full bg-zinc-800 rounded-xl px-4 py-3 outline-none border border-zinc-700"/>
          <div className="text-xs text-zinc-400">관심 자격증: 전기기사, 전기산업기사 등 선택</div>
          <button onClick={handleSignup} className="w-full bg-[#FFD60A] text-black rounded-xl py-3 font-bold">가입하기</button>
        </div>
      </div>
    </div>
  )
}
