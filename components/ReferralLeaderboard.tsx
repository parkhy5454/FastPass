
'use client'
import { useEffect, useState } from 'react'
export default function ReferralLeaderboard(){
  const [board, setBoard] = useState<any[]>([])
  useEffect(()=>{ fetch('/api/referral/stats').then(r=>r.json()).then(d=> setBoard(d.leaderboard||[])).catch(()=>{}) },[])
  return (
    <div style={{background:'white', borderRadius:'20px', padding:'20px'}}>
      <div style={{fontWeight:800, fontSize:'14px'}}>이번달 추천왕</div>
      <div style={{marginTop:'12px'}}>
        {board.length===0 && <div style={{textAlign:'center', padding:'20px', color:'#9CA3AF', fontSize:'12px'}}>아직 추천왕이 없어요! 첫 번째가 되어보세요</div>}
        {board.map((u:any, idx:number)=>(
          <div key={idx} style={{display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid #F3F4F6'}}>
            <div style={{width:'28px', height:'28px', borderRadius:'50%', background: idx===0 ? '#FFD60A' : idx===1 ? '#E5E7EB' : idx===2 ? '#FDBA74' : '#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'12px'}}>{idx+1}</div>
            <div style={{flex:1}}><div style={{fontSize:'13px', fontWeight:700}}>{u.name}</div><div style={{fontSize:'11px', color:'#6B7280'}}>{u.count}명 추천</div></div>
            <div style={{fontWeight:800, fontSize:'13px', color:'#2563EB'}}>{u.count*1000}P</div>
          </div>
        ))}
      </div>
    </div>
  )
}
