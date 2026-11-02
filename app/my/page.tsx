
'use client'
import { useEffect, useState } from 'react'
export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [stats, setStats] = useState<any>({totalUsers:0, totalRevenue:0, todayJoins:0})
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({name:'', phone:'', interests:''})
  const [activeAdminTab, setActiveAdminTab] = useState<'users'|'payments'|'stats'>('users')
  const [search, setSearch] = useState('')

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      setUser(d.user)
      if(d.user){ setForm({name:d.user.name, phone:d.user.phone, interests: (d.user.interests||[]).join(', ')}) }
      if(d.user?.role==='ADMIN'){
        fetch('/api/admin/users').then(r=>r.json()).then(setUsers).catch(()=>{})
        fetch('/api/admin/purchases').then(r=>r.json()).then(setPurchases).catch(()=>{})
        fetch('/api/admin/stats').then(r=>r.json()).then(setStats).catch(()=>{})
      }
    })
  },[])

  async function save(){
    const res = await fetch('/api/user/update', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, interests: form.interests.split(',').map((s:string)=>s.trim()).filter(Boolean)})})
    if(res.ok){ alert('수정 완료'); setEdit(false); location.reload() } else alert('실패')
  }
  async function logout(){ await fetch('/api/auth/logout', {method:'POST'}); location.href='/login' }

  const filteredUsers = users.filter((u:any)=> 
    !search || u.loginId.includes(search) || u.name.includes(search) || u.phone.includes(search)
  )

  if(!user) return <main style={{padding:'20px'}}>로그인이 필요합니다. <a href="/login">로그인</a></main>

  return (
    <main style={{padding:'20px'}}>
      <h1 style={{fontSize:'22px', fontWeight:800, margin:'8px 0 16px'}}>⚙️ MY / 설정</h1>
      
      <div style={{background:'white', borderRadius:'20px', padding:'20px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontWeight:700}}>내 정보 {user.role==='ADMIN' && <span style={{background:'#FFD60A', padding:'2px 8px', borderRadius:'8px', fontSize:'10px', marginLeft:'8px'}}>관리자</span>}</div>
          <button onClick={()=>setEdit(!edit)} style={{background: edit ? '#111827' : '#F3F4F6', color: edit ? 'white' : '#111827', border:'none', borderRadius:'10px', padding:'6px 12px', fontSize:'12px', fontWeight:700, cursor:'pointer'}}>{edit ? '취소' : '수정'}</button>
        </div>
        {!edit ? (
          <div style={{marginTop:'14px', display:'grid', gap:'10px', fontSize:'14px'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>아이디</span><span style={{fontWeight:600}}>{user.loginId}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>이름</span><span style={{fontWeight:600}}>{user.name}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>전화번호</span><span style={{fontWeight:600}}>{user.phone}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span style={{color:'#9CA3AF'}}>관심자격증</span><span style={{fontWeight:600}}>{user.interests?.join(', ')}</span></div>
          </div>
        ) : (
          <div style={{marginTop:'14px', display:'grid', gap:'10px'}}>
            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="이름" style={{padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB'}} />
            <input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="전화번호" style={{padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB'}} />
            <input value={form.interests} onChange={e=>setForm({...form, interests:e.target.value})} placeholder="관심자격증 (쉼표 구분)" style={{padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB'}} />
            <button onClick={save} style={{background:'#FFD60A', border:'none', borderRadius:'10px', padding:'12px', fontWeight:800, cursor:'pointer'}}>저장하기</button>
          </div>
        )}
      </div>

      {user.role==='ADMIN' && (
        <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
          <div style={{fontWeight:800, fontSize:'16px', marginBottom:'4px'}}>📊 관리자 대시보드</div>
          <div style={{fontSize:'12px', color:'#9CA3AF', marginBottom:'16px'}}>배포자 전용 - 회원 및 결제 관리</div>
          
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'16px'}}>
            <div style={{background:'#F8F9FB', borderRadius:'12px', padding:'14px', textAlign:'center'}}>
              <div style={{fontSize:'20px', fontWeight:800}}>{stats.totalUsers || users.length}</div>
              <div style={{fontSize:'11px', color:'#6B7280'}}>총 회원</div>
            </div>
            <div style={{background:'#FFF7CC', borderRadius:'12px', padding:'14px', textAlign:'center'}}>
              <div style={{fontSize:'20px', fontWeight:800}}>{stats.totalRevenue ? `${(stats.totalRevenue/1000).toFixed(0)}k` : '0'}원</div>
              <div style={{fontSize:'11px', color:'#92400E'}}>총 매출</div>
            </div>
            <div style={{background:'#E0F2FE', borderRadius:'12px', padding:'14px', textAlign:'center'}}>
              <div style={{fontSize:'20px', fontWeight:800}}>{stats.todayJoins || 0}</div>
              <div style={{fontSize:'11px', color:'#0369A1'}}>오늘 가입</div>
            </div>
          </div>

          <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
            {(['users','payments','stats'] as const).map(tab=>(
              <button key={tab} onClick={()=>setActiveAdminTab(tab)} style={{flex:1, padding:'10px', borderRadius:'10px', border:'none', fontSize:'12px', fontWeight:700, cursor:'pointer', background: activeAdminTab===tab ? '#111827' : '#F3F4F6', color: activeAdminTab===tab ? 'white' : '#6B7280'}}>
                {tab==='users' ? `회원 (${users.length})` : tab==='payments' ? `결제 (${purchases.length})` : '통계'}
              </button>
            ))}
          </div>

          {activeAdminTab==='users' && (
            <div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="아이디, 이름, 전화번호 검색" style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #E5E7EB', fontSize:'13px', marginBottom:'12px', boxSizing:'border-box'}} />
              <div style={{maxHeight:'400px', overflow:'auto'}}>
                {filteredUsers.map((u:any)=>(
                  <div key={u.id} style={{padding:'12px', borderBottom:'1px solid #F3F4F6', fontSize:'12px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <span style={{fontWeight:700}}>{u.loginId} - {u.name}</span>
                      <span style={{fontSize:'10px', background: u.role==='ADMIN'?'#FFD60A':'#F3F4F6', padding:'2px 6px', borderRadius:'6px'}}>{u.role}</span>
                    </div>
                    <div style={{color:'#374151', marginTop:'4px'}}>📞 {u.phone} | 🎯 {u.interests?.join(', ') || '없음'}</div>
                    <div style={{color:'#9CA3AF', fontSize:'11px', marginTop:'2px'}}>{new Date(u.createdAt).toLocaleString()} | ID: {u.id.slice(0,8)}...</div>
                  </div>
                ))}
                {filteredUsers.length===0 && <div style={{padding:'20px', textAlign:'center', color:'#9CA3AF', fontSize:'13px'}}>회원이 없습니다. 테이블을 생성하세요.<br/>Neon SQL Editor에서 CREATE TABLE 실행</div>}
              </div>
              <div style={{display:'flex', gap:'8px', marginTop:'12px'}}>
                <button onClick={()=>{ const csv = 'loginId,name,phone,interests,createdAt\n' + users.map((u:any)=>`${u.loginId},${u.name},${u.phone},"${u.interests?.join(',')}",${u.createdAt}`).join('\n'); const blob = new Blob([csv], {type:'text/csv'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='users.csv'; a.click() }} style={{flex:1, background:'#F3F4F6', border:'none', borderRadius:'10px', padding:'10px', fontSize:'12px', fontWeight:600, cursor:'pointer'}}>CSV 다운로드</button>
                <a href="/admin" style={{flex:1, background:'#FFD60A', textAlign:'center', padding:'10px', borderRadius:'10px', textDecoration:'none', color:'black', fontWeight:700, fontSize:'12px'}}>전체 관리자 페이지</a>
              </div>
            </div>
          )}

          {activeAdminTab==='payments' && (
            <div>
              {purchases.length===0 ? (
                <div style={{padding:'30px', textAlign:'center'}}>
                  <div style={{fontSize:'32px'}}>💳</div>
                  <div style={{fontSize:'13px', color:'#6B7280', marginTop:'8px'}}>아직 결제 내역이 없습니다.</div>
                  <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'4px'}}>사용자가 플립북을 구매하면 여기에 표시됩니다.</div>
                </div>
              ) : purchases.map((p:any)=>(
                <div key={p.id} style={{padding:'12px', borderBottom:'1px solid #F3F4F6', fontSize:'12px'}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}><span style={{fontWeight:600}}>{p.user?.loginId || p.userId.slice(0,8)}</span><span style={{fontWeight:700, color:'#10B981'}}>{p.amount?.toLocaleString()}원</span></div>
                  <div style={{color:'#6B7280', marginTop:'2px'}}>{p.flipbookId} | {new Date(p.createdAt).toLocaleString()}</div>
                  <div style={{fontSize:'10px', color: p.verified ? '#10B981' : '#EF4444'}}>{p.verified ? '✅ 검증됨' : '⏳ 미검증'} | {p.pgTid || 'no tid'}</div>
                </div>
              ))}
            </div>
          )}

          {activeAdminTab==='stats' && (
            <div style={{display:'grid', gap:'10px'}}>
              <div style={{background:'#F8F9FB', borderRadius:'12px', padding:'16px'}}>
                <div style={{fontSize:'13px', fontWeight:700}}>자격증별 관심도</div>
                <div style={{marginTop:'10px', display:'grid', gap:'6px'}}>
                  {['전기기사','전기산업기사','전기공사기사','기능사','기술사'].map((cert,i)=>(
                    <div key={cert} style={{display:'flex', justifyContent:'space-between', fontSize:'12px'}}><span>{cert}</span><span style={{fontWeight:600}}>{users.filter((u:any)=>u.interests?.some((x:string)=>x.includes(cert))).length}명</span></div>
                  ))}
                </div>
              </div>
              <div style={{background:'#F8F9FB', borderRadius:'12px', padding:'16px'}}>
                <div style={{fontSize:'13px', fontWeight:700}}>최근 가입 추이 (7일)</div>
                <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'8px'}}>실제 데이터가 쌓이면 그래프가 표시됩니다.</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{marginTop:'12px', display:'grid', gap:'8px'}}>
        <button onClick={logout} style={{background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:700, cursor:'pointer'}}>로그아웃</button>
        <div style={{textAlign:'center', fontSize:'11px', color:'#9CA3AF', padding:'12px'}}>FastPass v3.0 | 관리자: {user.loginId} | Neon + Vercel</div>
      </div>
    </main>
  )
}
