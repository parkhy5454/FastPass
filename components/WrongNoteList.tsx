
'use client'
import { useEffect, useState } from 'react'
export default function WrongNoteList(){
  const [notes, setNotes] = useState<any[]>([])
  const [filter, setFilter] = useState<'all'|'frequent'>('all')
  useEffect(()=>{ fetch('/api/wrong-notes').then(r=>r.json()).then(d=> setNotes(Array.isArray(d)?d:[])).catch(()=>{}) },[])
  const filtered = filter==='frequent' ? notes.filter((n:any)=> n.count>=3) : notes
  return (
    <div style={{background:'white', borderRadius:'20px', padding:'20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontWeight:800}}>오답노트 <span style={{background:'#FEE2E2', padding:'2px 8px', borderRadius:'10px', fontSize:'11px'}}>{notes.length}개</span></div>
        <div style={{display:'flex', gap:'6px'}}>
          <button onClick={()=>setFilter('all')} style={{padding:'6px 10px', borderRadius:'8px', border:'none', background: filter==='all' ? '#111827' : '#F3F4F6', color: filter==='all' ? 'white' : '#6B7280', fontSize:'11px', fontWeight:700}}>전체</button>
          <button onClick={()=>setFilter('frequent')} style={{padding:'6px 10px', borderRadius:'8px', border:'none', background: filter==='frequent' ? '#DC2626' : '#F3F4F6', color: filter==='frequent' ? 'white' : '#6B7280', fontSize:'11px', fontWeight:700}}>취약(3회+)</button>
        </div>
      </div>
      {filtered.length===0 && <div style={{textAlign:'center', padding:'30px', color:'#9CA3AF', fontSize:'12px'}}>아직 틀린 문제가 없어요! 문제를 풀어보세요</div>}
      {filtered.map((n:any)=>(
        <div key={n.id} style={{marginTop:'10px', background: n.count>=3 ? '#FEE2E2' : '#F8F9FB', borderRadius:'12px', padding:'14px', border: n.count>=3 ? '1px solid #FECACA' : '1px solid #F3F4F6'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <div style={{fontSize:'13px', fontWeight:700}}>{n.questionTitle || `문제 #${n.questionId?.slice(0,8)}`}</div>
            <span style={{background: n.count>=3 ? '#DC2626' : '#6B7280', color:'white', padding:'2px 8px', borderRadius:'10px', fontSize:'10px'}}>{n.count}회 틀림</span>
          </div>
          <div style={{fontSize:'11px', color:'#6B7280', marginTop:'4px'}}>{n.category} - {new Date(n.updatedAt).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  )
}
