
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function BottomTabs(){
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=> setLoggedIn(!!d.user)).catch(()=>{})
  }, [pathname])

  if(!loggedIn) return null
  if(pathname?.startsWith('/login') || pathname?.startsWith('/signup')) return null

  const tabs = [
    { href:'/', label:'홈', icon:'🏠', active: pathname==='/' },
    { href:'/learn', label:'학습', icon:'📚', active: pathname?.startsWith('/learn') },
    { href:'/jobs', label:'취업', icon:'💼', active: pathname?.startsWith('/jobs') },
    { href:'/my', label:'MY', icon:'⚙️', active: pathname?.startsWith('/my') || pathname?.startsWith('/admin') },
  ]

  return (
    <div style={{
      position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
      width:'100%', maxWidth:'480px', background:'white',
      borderTop:'1px solid #F3F4F6', display:'flex', justifyContent:'space-around',
      padding:'8px 0 calc(8px + env(safe-area-inset-bottom))', zIndex:50
    }}>
      {tabs.map(t=>(
        <Link key={t.href} href={t.href} style={{
          display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
          textDecoration:'none', color: t.active ? '#111827' : '#9CA3AF',
          fontSize:'11px', fontWeight: t.active ? 700 : 500, padding:'4px 16px', borderRadius:'12px',
          background: t.active ? '#F3F4F6' : 'transparent'
        }}>
          <span style={{fontSize:'20px'}}>{t.icon}</span>
          {t.label}
        </Link>
      ))}
    </div>
  )
}
