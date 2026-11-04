
'use client'
import { useEffect, useState } from 'react'

export default function DiscountTimer(){
  const [time, setTime] = useState({h:23,m:59,s:59, expired:false})

  useEffect(()=>{
    const key='discountEnd'
    let endStr = localStorage.getItem(key)
    if(!endStr){
      const end = new Date(Date.now()+24*60*60*1000).toISOString()
      localStorage.setItem(key, end)
      endStr=end
    }
    const interval=setInterval(()=>{
      const end=new Date(endStr!)
      const diff=end.getTime()-Date.now()
      if(diff<=0){ setTime({h:0,m:0,s:0, expired:true}); clearInterval(interval); return }
      setTime({h:Math.floor(diff/(1000*60*60)), m:Math.floor((diff%(1000*60*60))/(1000*60)), s:Math.floor((diff%(1000*60))/1000), expired:false})
    },1000)
    return ()=> clearInterval(interval)
  },[])

  if(time.expired) return null

  return (
    <div style={{background:'linear-gradient(135deg, #FF4444 0%, #CC0000 100%)', color:'white', padding:'8px 12px', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, fontWeight:700, marginBottom:10}}>
      <span>🔥 첫 결제 50% 할인!</span>
      <span style={{background:'white', color:'#CC0000', padding:'4px 8px', borderRadius:6, fontSize:11, fontWeight:800, letterSpacing:'1px'}}>{String(time.h).padStart(2,'0')}:{String(time.m).padStart(2,'0')}:{String(time.s).padStart(2,'0')}</span>
    </div>
  )
}
