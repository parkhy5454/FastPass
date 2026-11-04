
'use client'
import { useEffect, useState } from 'react'
export default function LearningStats(){
  const [stats, setStats] = useState<any>({todaySolved:12, goal:50, streak:7, accuracy:72, totalSolved:128, weakCategory:'전기설비', weakAccuracy:45})
  useEffect(()=>{ fetch('/api/stats').then(r=>r.json()).then(setStats).catch(()=>{}) },[])
  const progress = Math.min(100, (stats.todaySolved/stats.goal)*100)
  return (
    <div style={{background:'white', borderRadius:'20px', padding:'20px'}}>
      <div style={{fontWeight:800, fontSize:'14px'}}>오늘의 학습 현황</div>
      <div style={{marginTop:'14px'}}>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'6px'}}>
          <span style={{color:'#6B7280'}}>오늘 목표</span><span style={{fontWeight:700}}>{stats.todaySolved}/{stats.goal} 문제 ({Math.round(progress)}%)</span>
        </div>
        <div style={{background:'#E5E7EB', borderRadius:'10px', height:'10px', overflow:'hidden'}}><div style={{width:`${progress}%`, background: progress>=100 ? '#22C55E' : '#2563EB', height:'100%'}}/></div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginTop:'16px'}}>
        <div style={{background:'#F8F9FB', borderRadius:'14px', padding:'14px', textAlign:'center'}}><div style={{fontSize:'20px'}}>🔥</div><div style={{fontSize:'18px', fontWeight:800, marginTop:'4px'}}>{stats.streak}일</div><div style={{fontSize:'10px', color:'#6B7280'}}>연속 학습</div></div>
        <div style={{background:'#F8F9FB', borderRadius:'14px', padding:'14px', textAlign:'center'}}><div style={{fontSize:'20px'}}>🎯</div><div style={{fontSize:'18px', fontWeight:800, marginTop:'4px'}}>{stats.accuracy}%</div><div style={{fontSize:'10px', color:'#6B7280'}}>정답률</div></div>
        <div style={{background:'#F8F9FB', borderRadius:'14px', padding:'14px', textAlign:'center'}}><div style={{fontSize:'20px'}}>📚</div><div style={{fontSize:'18px', fontWeight:800, marginTop:'4px'}}>{stats.totalSolved}</div><div style={{fontSize:'10px', color:'#6B7280'}}>총 풀이</div></div>
      </div>
      {stats.weakCategory && <div style={{marginTop:'14px', background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:'12px', padding:'12px', display:'flex', justifyContent:'space-between', alignItems:'center'}}><div><div style={{fontSize:'11px', color:'#92400E', fontWeight:700}}>취약 분야 발견!</div><div style={{fontSize:'13px', fontWeight:800, marginTop:'2px'}}>{stats.weakCategory} 정답률 {stats.weakAccuracy}%</div></div><button style={{background:'#F59E0B', color:'white', border:'none', borderRadius:'8px', padding:'8px 14px', fontSize:'11px', fontWeight:700}}>집중 학습</button></div>}
    </div>
  )
}
