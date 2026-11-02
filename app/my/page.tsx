
'use client'
import { useEffect, useState } from 'react'
const ADMIN_IDS = ['parkhy5454', 'demo', 'admin', 'modio', 'tony']
export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [stats, setStats] = useState<any>({totalUsers:0, totalRevenue:0, todayJoins:0})
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({name:'', phone:'', interests:''})
  const [activeAdminTab, setActiveAdminTab] = useState<'users'|'payments'|'stats'>('users')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      setUser(d.user)
      setLoading(false)
      if(d.user){ setForm({name:d.user.name, phone:d.user.phone, interests: (d.user.interests||[]).join(', ')}) }
      const isAdmin = d.user?.role==='ADMIN' || ADMIN_IDS.includes(d.user?.loginId)
      if(isAdmin){
        fetch('/api/admin/users').then(r=>r.json()).then(data=> setUsers(Array.isArray(data)? data : data.users || [])).catch(()=>{})
        fetch('/api/admin/purchases').then(r=>r.json()).then(data=> setPurchases(Array.isArray(data)? data : [])).catch(()=>{})
        fetch('/api/admin/stats').then(r=>r.json()).then(setStats).catch(()=>{})
      }
    }).catch(()=>setLoading(false))
  },[])

  async function save(){
    const res = await fetch('/api/user/update', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form, interests: form.interests.split(',').map((s:string)=>s.trim()).filter(Boolean)})})
    if(res.ok){ alert('수정 완료'); setEdit(false); location.reload() } else alert('실패')
  }
  async function logout(){ await fetch('/api/auth/logout', {method:'POST'}); location.href='/login' }

  const filteredUsers = users.filter((u:any)=> 
    !search || u.loginId?.includes(search) || u.name?.includes(search) || u.phone?.includes(search)
  )

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}>로그인이 필요합니다. <a href="/login">로그인</a></main>

  const isAdminView = user.role==='ADMIN' || ADMIN_IDS.includes(user.loginId)

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <h1 style={{fontSize:'22px', fontWeight:800, margin:'8px 0 16px'}}>⚙️ MY / 설정</h1>
      
      <div style={{background:'white', borderRadius:'20px', padding:'20px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontWeight:700}}>내 정보 {isAdminView && <span style={{background:'#FFD60A', padding:'2px 8px', borderRadius:'8px', fontSize:'10px', marginLeft:'8px'}}>관리자 (배포자)</span>}</div>
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

      {isAdminView ? (
        <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
          <div style={{fontWeight:800, fontSize:'16px', marginBottom:'4px'}}>📊 관리자 대시보드 - 회원가입자 관리</div>
          <div style={{fontSize:'12px', color:'#9CA3AF', marginBottom:'16px'}}>배포자 {user.loginId} 전용 - ID 고정 권한</div>
          
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'16px'}}>
            <div style={{background:'#F8F9FB', borderRadius:'12px', padding:'14px', textAlign:'center'}}>
              <div style={{fontSize:'22px', fontWeight:800}}>{users.length}</div>
              <div style={{fontSize:'11px', color:'#6B7280'}}>총 회원</div>
            </div>
            <div style={{background:'#FFF7CC', borderRadius:'12px', padding:'14px', textAlign:'center'}}>
              <div style={{fontSize:'20px', fontWeight:800}}>{stats.totalRevenue ? `${stats.totalRevenue.toLocaleString()}원` : `${purchases.reduce((a:any,b:any)=>a+(b.amount||0),0).toLocaleString()}원`}</div>
              <div style={{fontSize:'11px', color:'#92400E'}}>총 매출</div>
            </div>
            <div style={{background:'#E0F2FE', borderRadius:'12px', padding:'14px', textAlign:'center'}}>
              <div style={{fontSize:'22px', fontWeight:800}}>{stats.todayJoins ?? users.filter((u:any)=>{ const d=new Date(u.createdAt); const t=new Date(); return d.toDateString()===t.toDateString() }).length}</div>
              <div style={{fontSize:'11px', color:'#0369A1'}}>오늘 가입</div>
            </div>
          </div>

          <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
            {(['users','payments','stats'] as const).map(tab=>(
              <button key={tab} onClick={()=>setActiveAdminTab(tab)} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', fontSize:'12px', fontWeight:700, cursor:'pointer', background: activeAdminTab===tab ? '#111827' : '#F3F4F6', color: activeAdminTab===tab ? 'white' : '#6B7280'}}>
                {tab==='users' ? `회원 ${users.length}명` : tab==='payments' ? `결제 ${purchases.length}건` : '통계'}
              </button>
            ))}
          </div>

          {activeAdminTab==='users' && (
            <div>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="아이디, 이름, 전화번호 검색" style={{width:'100%', padding:'12px', borderRadius:'12px', border:'1px solid #E5E7EB', fontSize:'13px', marginBottom:'12px', boxSizing:'border-box'}} />
              <div style={{background:'#F8F9FB', borderRadius:'12px', padding:'12px', maxHeight:'500px', overflow:'auto'}}>
                <div style={{fontSize:'12px', fontWeight:700, marginBottom:'8px', color:'#6B7280'}}>가입자 목록 ({filteredUsers.length}명)</div>
                {filteredUsers.map((u:any)=>(
                  <div key={u.id} style={{background:'white', borderRadius:'12px', padding:'14px', marginBottom:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div style={{fontWeight:800, fontSize:'14px'}}>{u.loginId} - {u.name}</div>
                      <span style={{fontSize:'10px', background: ADMIN_IDS.includes(u.loginId) || u.role==='ADMIN' ? '#FFD60A' : '#F3F4F6', padding:'3px 8px', borderRadius:'8px', fontWeight:700}}>{ADMIN_IDS.includes(u.loginId) || u.role==='ADMIN' ? '관리자' : '일반'}</span>
                    </div>
                    <div style={{fontSize:'13px', color:'#374151', marginTop:'6px', lineHeight:'1.5'}}>
                      📞 {u.phone}<br/>
                      🎯 {u.interests?.length ? u.interests.join(', ') : '없음'}<br/>
                      📅 {new Date(u.createdAt).toLocaleString('ko-KR')}
                    </div>
                    <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'4px', fontFamily:'monospace'}}>{u.id}</div>
                  </div>
                ))}
                {filteredUsers.length===0 && <div style={{padding:'30px', textAlign:'center'}}><div style={{fontSize:'40px'}}>👥</div><div style={{fontSize:'13px', color:'#6B7280', marginTop:'8px'}}>아직 가입한 회원이 없습니다.<br/>회원가입 테스트를 해보세요!</div></div>}
              </div>
              <div style={{display:'flex', gap:'8px', marginTop:'12px'}}>
                <button onClick={()=>{ const csv = 'loginId,name,phone,interests,createdAt,role\n' + users.map((u:any)=>`"${u.loginId}","${u.name}","${u.phone}","${(u.interests||[]).join(',')}","${u.createdAt}","${u.role}"`).join('\n'); const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`회원목록_${new Date().toISOString().slice(0,10)}.csv`; a.click() }} style={{flex:1, background:'#F3F4F6', border:'none', borderRadius:'12px', padding:'12px', fontSize:'13px', fontWeight:700, cursor:'pointer'}}>📥 CSV 다운로드</button>
                <button onClick={()=>{ fetch('/api/admin/users').then(r=>r.json()).then(data=> setUsers(Array.isArray(data)? data : data.users || [])); alert('새로고침 완료') }} style={{flex:1, background:'#FFD60A', border:'none', borderRadius:'12px', padding:'12px', fontSize:'13px', fontWeight:800, cursor:'pointer'}}>🔄 새로고침</button>
              </div>
            </div>
          )}

          {activeAdminTab==='payments' && (
            <div>
              {purchases.length===0 ? (
                <div style={{padding:'40px', textAlign:'center', background:'#F8F9FB', borderRadius:'12px'}}>
                  <div style={{fontSize:'40px'}}>💳</div>
                  <div style={{fontSize:'13px', color:'#6B7280', marginTop:'8px'}}>아직 결제 내역이 없습니다.</div>
                </div>
              ) : purchases.map((p:any)=>(
                <div key={p.id} style={{background:'#F8F9FB', borderRadius:'12px', padding:'14px', marginBottom:'8px'}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}><span style={{fontWeight:700}}>{p.user?.loginId || p.userId?.slice(0,12)}</span><span style={{fontWeight:800, color:'#10B981'}}>{p.amount?.toLocaleString()}원</span></div>
                  <div style={{fontSize:'12px', color:'#6B7280', marginTop:'4px'}}>{p.flipbookId} | {new Date(p.createdAt).toLocaleString()}</div>
                  <div style={{fontSize:'11px', marginTop:'4px'}}><span style={{background: p.verified ? '#DCFCE7' : '#FEE2E2', color: p.verified ? '#15803D' : '#B91C1C', padding:'2px 6px', borderRadius:'6px'}}>{p.verified ? '✅ 검증됨' : '⏳ 미검증'}</span> {p.pgTid || ''}</div>
                </div>
              ))}
            </div>
          )}

          {activeAdminTab==='stats' && (
            <div style={{display:'grid', gap:'12px'}}>
              <div style={{background:'#F8F9FB', borderRadius:'12px', padding:'16px'}}>
                <div style={{fontSize:'13px', fontWeight:700}}>자격증별 관심도</div>
                <div style={{marginTop:'12px', display:'grid', gap:'8px'}}>
                  {['전기기사','전기산업기사','전기공사기사','기능사','기술사'].map((cert)=>(
                    <div key={cert} style={{display:'flex', justifyContent:'space-between', fontSize:'13px', background:'white', padding:'10px 12px', borderRadius:'8px'}}><span>{cert}</span><span style={{fontWeight:800}}>{users.filter((u:any)=>u.interests?.some((x:string)=>x.includes(cert))).length}명</span></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{background:'white', borderRadius:'20px', padding:'20px', marginTop:'12px', textAlign:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
          <div style={{fontSize:'13px', color:'#6B7280'}}>일반 회원입니다.</div>
          <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'4px'}}>관리자 문의: parkhy5454</div>
        </div>
      )}

      <div style={{marginTop:'16px', display:'grid', gap:'8px'}}>
        <button onClick={logout} style={{background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px', fontWeight:700, cursor:'pointer'}}>로그아웃</button>
        <div style={{textAlign:'center', fontSize:'11px', color:'#9CA3AF', padding:'12px'}}>FastPass v3.0 | 배포자: {user.loginId} | 회원 {users.length}명 관리중</div>
      </div>
    </main>
  )
}
