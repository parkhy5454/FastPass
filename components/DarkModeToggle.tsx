
'use client'
import { useEffect, useState } from 'react'
export default function DarkModeToggle(){
  const [dark, setDark] = useState(false)
  useEffect(()=>{ const saved = localStorage.getItem('darkMode'); if(saved==='true') setDark(true) },[])
  const toggle = () => {
    const newVal = !dark; setDark(newVal); localStorage.setItem('darkMode', String(newVal))
    if(newVal){ document.documentElement.style.filter='invert(1) hue-rotate(180deg)'; document.documentElement.style.background='#0F0F0F' }
    else{ document.documentElement.style.filter=''; document.documentElement.style.background='' }
  }
  return <button onClick={toggle} style={{background: dark ? '#111827' : '#F3F4F6', color: dark ? 'white' : '#111827', border:'1px solid #E5E7EB', borderRadius:'20px', padding:'8px 14px', fontSize:'12px', fontWeight:700}}>{dark ? '다크모드 ON' : '라이트모드'}</button>
}
