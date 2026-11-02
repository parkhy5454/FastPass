'use client'
import { useState } from 'react'
export default function PasswordInput({ value, onChange, placeholder="비밀번호", className="" }: any) {
  const [show, setShow] = useState(false)
  return (
    <div className={`relative ${className}`}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-zinc-800 rounded-xl px-4 py-3 pr-12 text-white outline-none focus:ring-2 focus:ring-[#FFD60A] border border-zinc-700"
      />
      <button
        type="button"
        onClick={()=>setShow(!show)}
        aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 transition"
      >
        {show ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.38 6.38A13.16 13.16 0 0 0 2 12s3 7 10 7a10.94 10.94 0 0 0 5.39-1.39"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        )}
      </button>
    </div>
  )
}
