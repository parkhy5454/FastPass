'use client'
import { useState } from 'react'

export default function ChangePassword(){
  const [current,setCurrent]=useState('')
  const [next,setNext]=useState('')
  const [confirm,setConfirm]=useState('')
  const [loading,setLoading]=useState(false)
  const [msg,setMsg]=useState('')

  async function submit(e: React.FormEvent){
    e.preventDefault()
    setMsg('')
    if(next.length < 8){ setMsg('새 비밀번호는 8자 이상이어야 합니다'); return }
    if(next !== confirm){ setMsg('새 비밀번호가 서로 다릅니다'); return }
    setLoading(true)
    try{
      const res = await fetch('/api/user/password',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({currentPassword: current, newPassword: next}),
      })
      const data = await res.json().catch(()=>({}))
      if(!res.ok){ setMsg(data.error || '비밀번호 변경 실패'); return }
      setCurrent(''); setNext(''); setConfirm('')
      setMsg('비밀번호가 변경되었습니다')
    }catch{
      setMsg('네트워크 오류가 발생했습니다')
    }finally{
      setLoading(false)
    }
  }

  const input: React.CSSProperties = {width:'100%', padding:'10px 12px', border:'1px solid #E9ECEF', borderRadius:8, fontSize:13, boxSizing:'border-box', marginBottom:8}

  return (
    <form onSubmit={submit} style={{background:'white', border:'1px solid #EEF2F7', borderRadius:12, padding:14, marginBottom:16}}>
      <div style={{fontSize:13, fontWeight:700, marginBottom:10, color:'#1a1a2e'}}>🔐 비밀번호 변경</div>
      <input type="password" placeholder="현재 비밀번호" value={current} onChange={e=>setCurrent(e.target.value)} style={input} autoComplete="current-password" required />
      <input type="password" placeholder="새 비밀번호 (8자 이상)" value={next} onChange={e=>setNext(e.target.value)} style={input} autoComplete="new-password" required />
      <input type="password" placeholder="새 비밀번호 확인" value={confirm} onChange={e=>setConfirm(e.target.value)} style={input} autoComplete="new-password" required />
      {msg && <div style={{fontSize:12, color: msg.includes('변경되었습니다') ? '#2F855A' : '#C53030', marginBottom:8}}>{msg}</div>}
      <button type="submit" disabled={loading} style={{width:'100%', padding:12, background:'#1a1a2e', color:'white', border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer', opacity: loading ? 0.6 : 1}}>
        {loading ? '변경 중...' : '비밀번호 변경'}
      </button>
    </form>
  )
}
