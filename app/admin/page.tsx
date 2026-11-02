
'use client'
import { useState, useEffect } from 'react'
export default function AdminPage(){
  const [users, setUsers] = useState<any[]>([])
  const [auth, setAuth] = useState(false)
  const [key, setKey] = useState('')
  useEffect(()=>{ fetch('/api/admin/users').then(r=>{ if(r.ok) return r.json(); throw ''}).then(d=>{setUsers(d); setAuth(true)}).catch(()=>{}) },[])
  if(!auth) return (
    <main style={{minHeight:'100vh', background:'#0F0F0F', color:'white', padding:'24px'}}>
      <div style={{maxWidth:'360px', margin:'0 auto'}}>
        <h1>관리자 로그인</h1>
        <input value={key} onChange={e=>setKey(e.target.value)} placeholder="ADMIN_SECRET" style={{width:'100%', padding:'12px', marginTop:'12px', borderRadius:'12px', background:'#27272a', color:'white', border:'1px solid #333'}} />
        <button onClick={()=>{ document.cookie=`admin_secret=${key}; path=/`; location.reload() }} style={{marginTop:'12px', width:'100%', background:'#FFD60A', padding:'12px', borderRadius:'12px', fontWeight:800}}>입장</button>
      </div>
    </main>
  )
  return (
    <main style={{minHeight:'100vh', background:'#0F0F0F', color:'white', padding:'24px'}}>
      <h1 style={{fontSize:'24px', fontWeight:800}}>관리자 대시보드 - {users.length}명</h1>
      <div style={{marginTop:'16px', display:'grid', gap:'8px'}}>
        {users.map((u:any)=><div key={u.id} style={{background:'#27272a', padding:'12px', borderRadius:'12px', fontSize:'13px'}}>{u.loginId} | {u.name} | {u.phone} | {u.interests?.join(',')} | {new Date(u.createdAt).toLocaleDateString()}</div>)}
      </div>
    </main>
  )
}
