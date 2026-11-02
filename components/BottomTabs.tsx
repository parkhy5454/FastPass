
'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
export default function BottomTabs(){
  const pathname = usePathname()
  const tabs = [
    { href:'/', label:'홈', icon:'🏠', active: pathname==='/' },
    { href:'/study', label:'학습', icon:'📚', active: pathname?.startsWith('/study') },
    { href:'/jobs', label:'취업', icon:'💼', active: pathname?.startsWith('/jobs') },
    { href:'/my', label:'MY', icon:'⚙️', active: pathname?.startsWith('/my') || pathname?.startsWith('/admin') },
  ]
  return (
    <nav style={{position:'fixed', bottom:0, left:0, right:0, background:'white', borderTop:'1px solid #E5E7EB', display:'flex', justifyContent:'space-around', padding:'8px 0 calc(8px + env(safe-area-inset-bottom))', zIndex:50}}>
      {tabs.map(t=>(
        <Link key={t.href} href={t.href} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'2px', textDecoration:'none', padding:'4px 20px', borderRadius:'12px', background: t.active ? '#FFF7CC' : 'transparent'}}>
          <span style={{fontSize:'20px'}}>{t.icon}</span>
          <span style={{fontSize:'11px', fontWeight: t.active ? 700 : 500, color: t.active ? '#111827' : '#9CA3AF'}}>{t.label}</span>
        </Link>
      ))}
    </nav>
  )
}
