
'use client'
import { useEffect, useState } from 'react'
export default function AdminPage(){
  const [users, setUsers] = useState<any[]>([])
  useEffect(()=>{ fetch('/api/admin/users').then(r=>r.json()).then(setUsers).catch(()=>{}) },[])
  return <main style={{padding:'20px'}}><h1>관리자 - {users.length}명</h1>{users.map((u:any)=><div key={u.id} style={{padding:'8px', background:'white', marginTop:'8px', borderRadius:'8px', fontSize:'13px'}}>{u.loginId} | {u.name} | {u.phone} | {u.interests?.join(',')}</div>)}</main>
}
