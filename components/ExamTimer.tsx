
'use client'
import { useEffect, useState } from 'react'
export default function ExamTimer({durationMinutes=150, onFinish}:{durationMinutes?:number, onFinish?:()=>void}){
  const [seconds, setSeconds] = useState(durationMinutes*60)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  useEffect(()=>{
    if(!running || finished) return
    const t = setInterval(()=>{ setSeconds(s=>{ if(s<=1){ setFinished(true); setRunning(false); onFinish?.(); return 0 } return s-1 }) },1000)
    return ()=>clearInterval(t)
  },[running, finished, onFinish])
  const h = Math.floor(seconds/3600); const m = Math.floor((seconds%3600)/60); const s = seconds%60
  const percent = ((durationMinutes*60 - seconds)/(durationMinutes*60))*100
  const isUrgent = seconds < 300
  return (
    <div style={{background: isUrgent ? '#FEE2E2' : 'white', border: isUrgent ? '2px solid #DC2626' : '1px solid #E5E7EB', borderRadius:'16px', padding:'16px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{fontWeight:800, fontSize:'14px'}}>{isUrgent ? '시간 얼마 안남음!' : '시험 타이머'}</div>
        <div style={{fontSize:'20px', fontWeight:900, color: isUrgent ? '#DC2626' : '#111827', fontFamily:'monospace'}}>{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</div>
      </div>
      <div style={{marginTop:'10px', background:'#E5E7EB', borderRadius:'10px', height:'8px', overflow:'hidden'}}><div style={{width:`${percent}%`, background: isUrgent ? '#DC2626' : '#2563EB', height:'100%'}}/></div>
      <div style={{display:'flex', gap:'8px', marginTop:'12px'}}>
        {!running && !finished && <button onClick={()=>setRunning(true)} style={{flex:1, background:'#111827', color:'white', border:'none', borderRadius:'10px', padding:'12px', fontWeight:700}}>시작</button>}
        {running && <button onClick={()=>setRunning(false)} style={{flex:1, background:'#F3F4F6', border:'none', borderRadius:'10px', padding:'12px', fontWeight:700}}>일시정지</button>}
        <button onClick={()=>{setSeconds(durationMinutes*60); setRunning(false); setFinished(false)}} style={{flex:1, background:'#F3F4F6', border:'none', borderRadius:'10px', padding:'12px', fontWeight:700}}>리셋</button>
      </div>
      {finished && <div style={{marginTop:'10px', background:'#DC2626', color:'white', padding:'12px', borderRadius:'10px', textAlign:'center', fontWeight:800}}>시간 종료! 자동 제출</div>}
    </div>
  )
}
