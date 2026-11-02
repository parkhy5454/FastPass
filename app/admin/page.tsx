'use client'
import { useState, useEffect } from 'react'
export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [restoreText, setRestoreText] = useState('')
  useEffect(()=>{
    fetch('/api/admin/users').then(r=>r.json()).then(setUsers)
  },[])
  const handleRestore = async () => {
    try {
      const questions = JSON.parse(restoreText) // [{subject, question, options, answer, keyword, solution}]
      const res = await fetch('/api/admin/restore-upload', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title:'2026 1회 복원', certType:'기사', year:2026, round:1, questions }) })
      const data = await res.json()
      alert(`복원 업로드 완료: ${data.count}문항`)
    } catch(e){ alert('JSON 형식 오류') }
  }
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white p-6 max-w-[800px] mx-auto">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      <section className="mt-8">
        <h2 className="font-bold">회원 목록</h2>
        <table className="w-full text-sm mt-2"><thead><tr><th>아이디</th><th>이름</th><th>전화</th><th>관심</th></tr></thead>
        <tbody>{users.map((u:any)=><tr key={u.id}><td>{u.loginId}</td><td>{u.name}</td><td>{u.phone}</td><td>{u.interests?.join(',')}</td></tr>)}</tbody></table>
      </section>
      <section className="mt-10">
        <h2 className="font-bold">복원 빠른 업로드 (JSON 붙여넣기)</h2>
        <textarea value={restoreText} onChange={e=>setRestoreText(e.target.value)} placeholder='[{"subject":"전력공학","question":"...","options":["a","b"],"answer":1,"keyword":"변압기"}]' className="w-full h-40 bg-zinc-800 rounded p-2 mt-2 text-xs"></textarea>
        <button onClick={handleRestore} className="bg-[#FFD60A] text-black px-4 py-2 rounded mt-2 font-bold">업로드</button>
      </section>
    </div>
  )
}
