
'use client'
import { useEffect, useState } from 'react'
export default function AdminPage(){
  const [users, setUsers] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  useEffect(()=>{
    fetch('/api/admin/users').then(r=>r.json()).then(setUsers).catch(()=>{})
    fetch('/api/admin/purchases').then(r=>r.json()).then(setPurchases).catch(()=>{})
    fetch('/api/admin/stats').then(r=>r.json()).then(setStats).catch(()=>{})
  },[])
  return (
    <main style={{padding:'20px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'24px', fontWeight:800}}>관리자 대시보드</h1>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginTop:'16px'}}>
        <div style={{background:'white', padding:'16px', borderRadius:'16px'}}><div style={{fontSize:'24px', fontWeight:800}}>{users.length}</div><div style={{fontSize:'12px', color:'#6B7280'}}>총 회원</div></div>
        <div style={{background:'white', padding:'16px', borderRadius:'16px'}}><div style={{fontSize:'24px', fontWeight:800}}>{purchases.length}</div><div style={{fontSize:'12px', color:'#6B7280'}}>총 결제</div></div>
        <div style={{background:'white', padding:'16px', borderRadius:'16px'}}><div style={{fontSize:'24px', fontWeight:800}}>{stats.totalRevenue || 0}원</div><div style={{fontSize:'12px', color:'#6B7280'}}>총 매출</div></div>
      </div>
      <div style={{background:'white', borderRadius:'16px', padding:'16px', marginTop:'16px'}}>
        <h2 style={{fontSize:'16px', fontWeight:700}}>회원 목록</h2>
        <div style={{marginTop:'12px'}}>
          {users.map((u:any)=><div key={u.id} style={{padding:'8px 0', borderBottom:'1px solid #F3F4F6', fontSize:'13px', display:'flex', justifyContent:'space-between'}}><span>{u.loginId} | {u.name} | {u.phone} | {u.interests?.join(',')}</span><span style={{color:'#9CA3AF', fontSize:'11px'}}>{new Date(u.createdAt).toLocaleDateString()}</span></div>)}
        </div>
      </div>
      <div style={{background:'white', borderRadius:'16px', padding:'16px', marginTop:'16px'}}>
        <h2 style={{fontSize:'16px', fontWeight:700}}>결제 내역</h2>
        <div style={{marginTop:'12px'}}>
          {purchases.length===0 ? <div style={{fontSize:'13px', color:'#9CA3AF'}}>결제 내역 없음</div> : purchases.map((p:any)=><div key={p.id} style={{padding:'8px 0', borderBottom:'1px solid #F3F4F6', fontSize:'13px'}}>{p.userId} - {p.amount}원 - {p.verified ? '검증' : '미검증'} - {new Date(p.createdAt).toLocaleString()}</div>)}
        </div>
      </div>
      <a href="/my" style={{display:'block', marginTop:'16px', background:'#111827', color:'white', padding:'12px', borderRadius:'12px', textAlign:'center', textDecoration:'none'}}>MY로 돌아가기</a>
    </main>
  )
}
