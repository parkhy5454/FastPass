
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

function formatPhoneNumber(value: string): string {
  // 숫자만 남기기
  const numbers = value.replace(/[^0-9]/g, '')
  
  // 11자리: 010-1234-5678
  // 10자리: 010-123-4567 등 대응
  if (numbers.length <= 3) {
    return numbers
  }
  if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  }
  if (numbers.length <= 10) {
    // 010-123-4567 or 010-1234-567
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`
  }
  // 11자리
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}

export default function SignupPage(){
  const router = useRouter()
  const [form, setForm] = useState({ loginId:'', password:'', name:'', phone:'', interests:[] as string[] })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>){
    const formatted = formatPhoneNumber(e.target.value)
    setForm({ ...form, phone: formatted })
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    if(loading) return
    setLoading(true)
    try{
      const res = await fetch('/api/auth/signup', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if(res.ok){
        alert('회원가입 완료! 로그인해주세요.')
        router.push('/login')
      } else {
        alert(data.error || '회원가입 실패')
      }
    }catch{
      alert('네트워크 오류')
    } finally {
      setLoading(false)
    }
  }

  const allInterests = ['전기기사','전기공사기사','전기산업기사','전기기능사','소방설비기사','기술사','기능장']

  return (
    <main style={{padding:'20px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'24px', fontWeight:800}}>회원가입</h1>
      <form onSubmit={handleSubmit} style={{marginTop:'20px', display:'grid', gap:'16px', background:'white', padding:'20px', borderRadius:'20px'}}>
        <div>
          <label style={{fontSize:'13px', fontWeight:700}}>아이디</label>
          <input value={form.loginId} onChange={e=>setForm({...form, loginId:e.target.value})} placeholder="아이디 또는 이메일" required
            style={{width:'100%', padding:'14px', borderRadius:'12px', border:'1px solid #E5E7EB', marginTop:'6px', boxSizing:'border-box'}} />
        </div>

        <div>
          <label style={{fontSize:'13px', fontWeight:700}}>비밀번호</label>
          <div style={{position:'relative', marginTop:'6px'}}>
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="비밀번호" required
              style={{width:'100%', padding:'14px', borderRadius:'12px', border:'1px solid #E5E7EB', boxSizing:'border-box'}} />
            <button type="button" onClick={()=>setShowPw(!showPw)} style={{position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'12px'}}>{showPw ? '숨김' : '보기'}</button>
          </div>
        </div>

        <div>
          <label style={{fontSize:'13px', fontWeight:700}}>이름</label>
          <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="홍길동" required
            style={{width:'100%', padding:'14px', borderRadius:'12px', border:'1px solid #E5E7EB', marginTop:'6px', boxSizing:'border-box'}} />
        </div>

        <div>
          <label style={{fontSize:'13px', fontWeight:700}}>핸드폰 번호</label>
          <input value={form.phone} onChange={handlePhoneChange} placeholder="01012345678 → 자동 하이픈" required inputMode="numeric" maxLength={13}
            style={{width:'100%', padding:'14px', borderRadius:'12px', border:'1px solid #E5E7EB', marginTop:'6px', boxSizing:'border-box'}} />
          <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'6px'}}>숫자만 입력하세요. 하이픈(-)은 자동으로 생성됩니다. 예: 01012345678 → 010-1234-5678</div>
        </div>

        <div>
          <label style={{fontSize:'13px', fontWeight:700}}>관심 자격증</label>
          <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'8px'}}>
            {allInterests.map(i=>(
              <button key={i} type="button" onClick={()=>{
                setForm({...form, interests: form.interests.includes(i) ? form.interests.filter(x=>x!==i) : [...form.interests, i]})
              }} style={{padding:'8px 14px', borderRadius:'20px', border:'1px solid', borderColor: form.interests.includes(i) ? '#FFD60A' : '#E5E7EB', background: form.interests.includes(i) ? '#FFD60A' : 'white', fontSize:'12px', fontWeight:600, cursor:'pointer'}}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} style={{background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'16px', fontWeight:800, fontSize:'15px', cursor:'pointer', marginTop:'8px'}}>
          {loading ? '가입중...' : '회원가입'}
        </button>

        <a href="/login" style={{textAlign:'center', fontSize:'13px', color:'#6B7280', textDecoration:'none'}}>이미 계정이 있나요? 로그인</a>
      </form>
    </main>
  )
}
