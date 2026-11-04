
'use client'
import { useEffect, useState } from 'react'
export default function ReferralShare({user}: {user:any}){
  const [code, setCode] = useState('')
  const [stats, setStats] = useState<any>({count:0, points:0, referredUsers:[], paidCount:0})
  const [copied, setCopied] = useState(false)
  useEffect(()=>{
    if(user){
      const c = `${user.loginId}-${(user.id||'').slice(0,4).toUpperCase()}`
      setCode(c)
      fetch('/api/referral/stats').then(r=>r.json()).then(d=> setStats(d)).catch(()=>{})
    }
  },[user])
  const link = typeof window !== 'undefined' ? `${location.origin}/signup?ref=${code}` : ''
  const shareKakao = async () => {
    const msg = `[자격증 패스트패스] ${user?.name||'친구'}님이 초대!\n전기·토목·정보통신 등 모든 자격증 학습\n가입시 1000P! ${link}`
    if((navigator as any).share){
      try{ await (navigator as any).share({title:'자격증 패스트패스 초대', text:msg, url:link}); return }catch{}
    }
    await navigator.clipboard.writeText(msg)
    alert('초대 메시지가 복사됐어요! 카톡에 붙여넣기 해주세요')
  }
  const shareSMS = () => {
    const msg = `[자격증 패스트패스] ${user?.name}님 초대! 가입시 1000P ${link}`
    location.href = `sms:?&body=${encodeURIComponent(msg)}`
  }
  const shareEmail = () => {
    const sub = `[자격증 패스트패스] ${user?.name}님이 초대했어요`
    const body = `${user?.name}님이 추천한 자격증 패스트패스! 가입 링크: ${link}`
    location.href = `mailto:?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`
  }
  const copyLink = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(()=>setCopied(false),2000)
  }
  return (
    <div style={{background:'white', borderRadius:'20px', padding:'20px', border:'2px solid #FFD60A'}}>
      <div style={{fontWeight:800, fontSize:'16px'}}>🎁 친구 추천 포인트 <span style={{background:'#FFD60A', padding:'4px 10px', borderRadius:'20px', fontSize:'11px'}}>최대 5000P</span></div>
      <div style={{marginTop:'8px', fontSize:'12px', color:'#6B7280'}}>친구가 가입하면 1000P, 결제하면 5000P 추가! 코드: <b>{code}</b></div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'8px', marginTop:'16px'}}>
        <button onClick={shareKakao} style={{background:'#FEE500', border:'none', borderRadius:'14px', padding:'12px 4px', fontWeight:700}}>💬 카톡</button>
        <button onClick={shareSMS} style={{background:'#EFF6FF', border:'1.5px solid #BFDBFE', borderRadius:'14px', padding:'12px 4px', fontWeight:700, color:'#2563EB'}}>💌 문자</button>
        <button onClick={shareEmail} style={{background:'#F3F4F6', border:'none', borderRadius:'14px', padding:'12px 4px', fontWeight:700}}>📧 이메일</button>
        <button onClick={copyLink} style={{background: copied ? '#22C55E' : '#111827', color:'white', border:'none', borderRadius:'14px', padding:'12px 4px', fontWeight:700}}>{copied ? '✅ 복사됨!' : '🔗 복사'}</button>
      </div>
      <div style={{marginTop:'16px', background:'#F8F9FB', borderRadius:'14px', padding:'14px', display:'flex', justifyContent:'space-around', textAlign:'center'}}>
        <div><div style={{fontSize:'18px', fontWeight:800, color:'#2563EB'}}>{stats.count}명</div><div style={{fontSize:'10px', color:'#6B7280'}}>추천 가입</div></div>
        <div><div style={{fontSize:'18px', fontWeight:800, color:'#22C55E'}}>{stats.paidCount}명</div><div style={{fontSize:'10px', color:'#6B7280'}}>결제 완료</div></div>
        <div><div style={{fontSize:'18px', fontWeight:800}}>{stats.points.toLocaleString()}P</div><div style={{fontSize:'10px', color:'#6B7280'}}>받은 포인트</div></div>
      </div>
      <div style={{marginTop:'12px', background:'#FFFBEB', borderRadius:'10px', padding:'10px', fontSize:'11px', color:'#92400E'}}>🔗 추천링크: {link}</div>
    </div>
  )
}
