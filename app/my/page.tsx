
'use client'
import { useEffect, useState } from 'react'
export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({name:'', phone:'', interests:''})
  const [showUsers, setShowUsers] = useState(false)

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      setUser(d.user)
      if(d.user){ setForm({name:d.user.name, phone:d.user.phone, interests: (d.user.interests||[]).join(', ')}) }
      if(d.user?.role==='ADMIN'){ fetch('/api/admin/users').then(r=>r.json()).then(setUsers).catch(()=>{}) }
    })
  },[])

  async function save(){
    const res = await fetch('/api/user/update', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, interests: form.interests.split(',').map((s:string)=>s.trim()).filter(Boolean)})})
    if(res.ok){ alert('수정 완료'); setEdit(false); location.reload() } else alert('실패')
  }
  async function logout(){ await fetch('/api/auth/logout', {method:'POST'}); location.href='/' }

  if(!user) return <main style={{padding:'20px'}}>로그인이 필요합니다. <a href="/login">로그인</a></main>

  return (
    <main style={{padding:'20px'}}>
      <h1 style={{fontSize:'22px', fontWeight:800, margin:'8px 0 16px'}}>⚙️ MY / 설정</h1>
      
      <div style={{background:'white', borderRadius:'20px', padding:'20px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontWeight:700}}>내 정보</div>
          <button onClick={()=>setEdit(!edit)} style={{background: edit ? '#111827' : '#F3F4F6', color: edit ? 'white' : '#111827', border:'none', borderRadius:'10px', padding:'6px 12px', fontSize:'12px', fontWeight:700, cursor:'pointer'}}>{edit ? '취소' : '수정'}</button>
        </div>
        {!edit ? (
          <div style={{marginTop:'14px', display:'grid', gap:'10px', fontSize:'14px'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>아이디</span><span style={{fontWeight:600}}>{user.loginId}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>이름</span><span style={{fontWeight:600}}>{user.name}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>전화번호</span><span style={{fontWeight:600}}>{user.phone}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>관심자격증</span><span style={{fontWeight:600}}>{user.interests?.join(', ')}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>역할</span><span style={{background: user.role==='ADMIN' ? '#FFD60A' : '#F3F4F6', padding:'2px 8px', borderRadius:'8px', fontSize:'11px', fontWeight:700}}>{user.role}</span></div>
          </div>
        ) : (
          <div style={{marginTop:'14px', display:'grid', gap:'10px'}}>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="이름" style={{padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB'}} />
            <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="전화번호" style={{padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB'}} />
            <input value={form.interests} onChange={e=>setForm({...form, interests:e.target.value})} placeholder="관심자격증" style={{padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB'}} />
            <button onClick={save} style={{background:'#FFD60A', border:'none', borderRadius:'10px', padding:'12px', fontWeight:800, cursor:'pointer'}}>저장하기</button>
          </div>
        )}
      </div>

      <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
        <div style={{fontWeight:700, fontSize:'14px', marginBottom:'12px'}}>설정</div>
        <div style={{display:'grid', gap:'12px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0'}}><span style={{fontSize:'14px'}}>학습 알림</span><div style={{width:'44px', height:'26px', background:'#111827', borderRadius:'20px', position:'relative'}}><div style={{position:'absolute', right:'3px', top:'3px', width:'20px', height:'20px', background:'white', borderRadius:'50%'}} /></div></div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0'}}><span style={{fontSize:'14px'}}>취업 알림</span><div style={{width:'44px', height:'26px', background:'#E5E7EB', borderRadius:'20px', position:'relative'}}><div style={{position:'absolute', left:'3px', top:'3px', width:'20px', height:'20px', background:'white', borderRadius:'50%'}} /></div></div>
          <a href="/login" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', textDecoration:'none', color:'#111827'}}><span style={{fontSize:'14px'}}>비밀번호 변경</span><span style={{color:'#9CA3AF'}}>›</span></a>
        </div>
      </div>

      {user.role==='ADMIN' && (
        <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{fontWeight:700, fontSize:'14px'}}>관리자 - 회원 목록 ({users.length}명)</div>
            <button onClick={()=>setShowUsers(!showUsers)} style={{background:'#F3F4F6', border:'none', borderRadius:'8px', padding:'6px 12px', fontSize:'12px', cursor:'pointer'}}>{showUsers ? '접기' : '보기'}</button>
          </div>
          {showUsers && (
            <div style={{marginTop:'12px', maxHeight:'300px', overflow:'auto'}}>
              {users.map((u:any)=>(
                <div key={u.id} style={{padding:'10px 0', borderBottom:'1px solid #F3F4F6', fontSize:'12px', display:'grid', gap:'2px'}}>
                  <div style={{fontWeight:600}}>{u.loginId} - {u.name}</div>
                  <div style={{color:'#6B7280'}}>{u.phone} | {u.interests?.join(', ')} | {new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
              {users.length===0 && <div style={{fontSize:'12px', color:'#9CA3AF', padding:'12px 0'}}>회원이 없습니다. SQL 테이블을 먼저 생성하세요.</div>}
            </div>
          )}
          <a href="/admin" style={{display:'block', marginTop:'12px', background:'#FFD60A', textAlign:'center', padding:'10px', borderRadius:'10px', textDecoration:'none', color:'black', fontWeight:700, fontSize:'13px'}}>관리자 대시보드 바로가기</a>
        </div>
      )}

      <div style={{marginTop:'12px', display:'grid', gap:'8px'}}>
        <button onClick={logout} style={{background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:700, cursor:'pointer'}}>로그아웃</button>
        <div style={{textAlign:'center', fontSize:'11px', color:'#9CA3AF', padding:'12px'}}>FastPass v3.0.0 | GitHub + Neon + Vercel</div>
      </div>
    </main>
  )
}
