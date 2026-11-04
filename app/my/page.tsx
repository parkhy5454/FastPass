
'use client'
import { useEffect, useState } from 'react'

function isAdminUser(loginId:string, role:string){
  if(!loginId) return false
  const id=loginId.toLowerCase()
  return role==='ADMIN' || id.includes('parkhy5454')
}

export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [flipbooks, setFlipbooks] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [problemTypes, setProblemTypes] = useState<any[]>([{id:'1', name:'기출문제', icon:'📜'}, {id:'2', name:'예상문제', icon:'⭐'}])
  const [selectedType, setSelectedType] = useState('전체')
  const [uploadCategory, setUploadCategory] = useState('전기기사')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadType, setUploadType] = useState('기출문제')
  const [uploading, setUploading] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile'|'member'|'flipbook'>('profile')
  const [referralCode, setReferralCode] = useState('')
  const [referralStats, setReferralStats] = useState<any>({count:0, points:0, paidCount:0, referredUsers:[]})
  const [copied, setCopied] = useState(false)

  const allQualifications = ['전기기사','전기공사기사','전기철도기사','전기산업기사','전기기능사','전기기능장','정보통신기사','정보처리기사','전자기사','토목기사','토목산업기사','측량및지형공간정보기사','기계기사','기계설계기사','가스기사','건축기사','소방설비기사(전기)']

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      setUser(d.user)
      setLoading(false)
      if(d.user){
        const c = `${d.user.loginId}-${(d.user.id||'').slice(0,4).toUpperCase()}`
        setReferralCode(c)
      }
      loadData()
      // referral stats
      fetch('/api/referral/stats').then(r=>r.json()).then(s=> setReferralStats(s)).catch(()=>{})
    }).catch(()=>setLoading(false))
  },[])

  function loadData(){
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=> setFlipbooks(Array.isArray(d)? d : [])).catch(()=>{})
    fetch('/api/admin/problem-types').then(r=>r.json()).then(d=>{ if(Array.isArray(d) && d.length>0) setProblemTypes(d) }).catch(()=>{})
    fetch('/api/admin/users').then(r=>r.json()).then(d=> setMembers(Array.isArray(d) ? d : d.users||[])).catch(()=>{})
  }

  async function handleLogout(){
    if(!confirm('로그아웃 하시겠습니까?')) return
    try{
      await fetch('/api/auth/logout', {method:'POST'})
      localStorage.clear()
      sessionStorage.clear()
    }catch{}
    location.href='/login'
  }

  async function handleCreateType(){
    if(!newTypeName.trim()) return
    const name = newTypeName.trim()
    if(problemTypes.some((t:any)=>t.name===name)) return
    const icon = name.includes('예상') ? '⭐' : name.includes('기출') ? '📜' : '📁'
    const newType = { id: Date.now().toString(), name, icon }
    setProblemTypes(prev => [...prev, newType])
    setNewTypeName('')
    try{
      const res=await fetch('/api/admin/problem-types', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name, icon})})
      const data=await res.json()
      if(res.ok && data.id) setProblemTypes(prev => prev.map((t:any)=> t.name===name ? data : t))
    }catch{}
    setSelectedType(name)
    setUploadType(name)
  }

  const filtered = flipbooks.filter(f=> selectedType==='전체' ? true : f.type===selectedType)
  const referralLink = typeof window !== 'undefined' ? `${location.origin}/signup?ref=${referralCode}` : ''

  const shareKakao = async () => {
    const msg = `[자격증 패스트패스] ${user?.name||'친구'}님이 초대!\n전기·토목·정보통신 등 모든 자격증 학습\n가입시 1000P! ${referralLink}`
    try{
      if((navigator as any).share){
        await (navigator as any).share({title:'자격증 패스트패스 초대', text:msg, url:referralLink})
        return
      }
    }catch{}
    await navigator.clipboard.writeText(msg)
    alert('초대 메시지가 복사됐어요! 카톡에 붙여넣기 해주세요 💬')
  }
  const shareSMS = () => {
    const msg = `[자격증 패스트패스] ${user?.name}님 초대! 가입시 1000P ${referralLink}`
    location.href = `sms:?&body=${encodeURIComponent(msg)}`
  }
  const shareEmail = () => {
    const sub = `[자격증 패스트패스] ${user?.name}님이 초대했어요`
    const body = `${user?.name}님이 추천한 자격증 패스트패스! 가입 링크: ${referralLink}`
    location.href = `mailto:?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`
  }
  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(()=>setCopied(false),2000)
  }

  if(loading) return <main style={{padding:'20px'}}>로딩중...</main>
  if(!user) return <main style={{padding:'20px'}}><div>로그인 필요</div><button onClick={()=>location.href='/login'} style={{marginTop:'12px', background:'#111827', color:'white', padding:'12px 20px', borderRadius:'10px', border:'none'}}>로그인으로</button></main>

  return (
    <main style={{padding:'20px', paddingBottom:'100px', background:'#F8F9FB', minHeight:'100vh'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{fontSize:'18px', fontWeight:800}}>⚙️ MY / 설정</h1>
        <button onClick={handleLogout} style={{background:'#FEE2E2', color:'#DC2626', border:'1px solid #FECACA', borderRadius:'10px', padding:'10px 16px', fontSize:'13px', fontWeight:800}}>🚪 로그아웃</button>
      </div>

      <div style={{background:'white', borderRadius:'16px', padding:'16px', marginTop:'16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div style={{fontWeight:700, fontSize:'14px'}}>내 정보 <span style={{background:'#FFD60A', fontSize:'11px', padding:'3px 8px', borderRadius:'10px'}}>{isAdminUser(user.loginId, user.role) ? '배포자 관리자' : '일반 회원'}</span></div>
          <div style={{fontSize:'13px', marginTop:'6px', fontWeight:600}}>{user.loginId} / {user.role}</div>
          <div style={{fontSize:'11px', color:'#6B7280', marginTop:'4px'}}>관심: {(user.interests||[]).join(', ') || '없음'} / 포인트: {(user.points||0).toLocaleString()}P</div>
        </div>
      </div>

      {/* 탭 */}
      <div style={{background:'white', borderRadius:'16px', padding:'12px', marginTop:'12px', display:'flex', gap:'8px'}}>
        <button onClick={()=>setActiveTab('profile')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', background: activeTab==='profile' ? '#111827' : '#F3F4F6', color: activeTab==='profile' ? 'white' : '#6B7280', fontWeight:700, fontSize:'13px'}}>🎁 친구추천</button>
        <button onClick={()=>setActiveTab('member')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', background: activeTab==='member' ? '#111827' : '#F3F4F6', color: activeTab==='member' ? 'white' : '#6B7280', fontWeight:700, fontSize:'13px'}}>👥 회원 {members.length}</button>
        <button onClick={()=>setActiveTab('flipbook')} style={{flex:1, padding:'12px', borderRadius:'12px', border:'none', background: activeTab==='flipbook' ? '#111827' : '#F3F4F6', color: activeTab==='flipbook' ? 'white' : '#6B7280', fontWeight:700, fontSize:'13px'}}>📚 {flipbooks.length}</button>
      </div>

      {/* 친구 추천 탭 - 기본으로 보이게! */}
      {activeTab==='profile' && (
        <div style={{marginTop:'12px'}}>
          <div style={{background:'white', borderRadius:'20px', padding:'20px', border:'2px solid #FFD60A'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontWeight:800, fontSize:'16px'}}>🎁 친구 추천 포인트</div>
              <span style={{background:'#FFD60A', padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:800}}>최대 5000P</span>
            </div>
            <div style={{marginTop:'8px', fontSize:'12px', color:'#6B7280', lineHeight:'1.6'}}>
              친구가 <b style={{color:'#111827'}}>가입하면 1000P</b>, <b style={{color:'#2563EB'}}>결제하면 5000P 추가!</b><br/>
              내 추천코드: <b style={{background:'#F3F4F6', padding:'3px 8px', borderRadius:'6px'}}>{referralCode}</b>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'8px', marginTop:'16px'}}>
              <button onClick={shareKakao} style={{background:'#FEE500', border:'none', borderRadius:'14px', padding:'12px 4px', fontWeight:700, fontSize:'12px'}}><div style={{fontSize:'22px'}}>💬</div>카톡</button>
              <button onClick={shareSMS} style={{background:'#EFF6FF', border:'1.5px solid #BFDBFE', borderRadius:'14px', padding:'12px 4px', fontWeight:700, fontSize:'12px', color:'#2563EB'}}><div style={{fontSize:'22px'}}>💌</div>문자</button>
              <button onClick={shareEmail} style={{background:'#F3F4F6', border:'none', borderRadius:'14px', padding:'12px 4px', fontWeight:700, fontSize:'12px'}}><div style={{fontSize:'22px'}}>📧</div>이메일</button>
              <button onClick={copyLink} style={{background: copied ? '#22C55E' : '#111827', color:'white', border:'none', borderRadius:'14px', padding:'12px 4px', fontWeight:700, fontSize:'12px'}}><div style={{fontSize:'22px'}}>{copied ? '✅' : '🔗'}</div>{copied ? '복사됨!' : '복사'}</button>
            </div>
            <div style={{marginTop:'16px', background:'#F8F9FB', borderRadius:'14px', padding:'14px', display:'flex', justifyContent:'space-around', textAlign:'center'}}>
              <div><div style={{fontSize:'18px', fontWeight:800, color:'#2563EB'}}>{referralStats.count}명</div><div style={{fontSize:'10px', color:'#6B7280'}}>추천 가입</div></div>
              <div style={{width:'1px', background:'#E5E7EB'}}/>
              <div><div style={{fontSize:'18px', fontWeight:800, color:'#22C55E'}}>{referralStats.paidCount}명</div><div style={{fontSize:'10px', color:'#6B7280'}}>결제 완료</div></div>
              <div style={{width:'1px', background:'#E5E7EB'}}/>
              <div><div style={{fontSize:'18px', fontWeight:800}}>{(referralStats.points||0).toLocaleString()}P</div><div style={{fontSize:'10px', color:'#6B7280'}}>받은 포인트</div></div>
            </div>
            {referralStats.referredUsers?.length>0 && (
              <div style={{marginTop:'14px'}}>
                <div style={{fontSize:'12px', fontWeight:700, marginBottom:'6px'}}>추천한 친구 목록</div>
                {referralStats.referredUsers.slice(0,5).map((u:any)=>(
                  <div key={u.id} style={{display:'flex', justifyContent:'space-between', fontSize:'12px', padding:'8px 0', borderBottom:'1px solid #F3F4F6'}}>
                    <span>{u.name} ({u.loginId})</span>
                    <span style={{fontWeight:700, color: u.hasPaid ? '#2563EB' : '#9CA3AF'}}>{u.hasPaid ? '✅ 결제 +5000P' : '가입 +1000P'}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{marginTop:'12px', background:'#FFFBEB', borderRadius:'10px', padding:'10px', fontSize:'11px', color:'#92400E', wordBreak:'break-all'}}>🔗 추천링크: {referralLink}<br/>💡 1P = 1원, 문제집 구매시 사용 가능</div>
          </div>

          <div style={{background:'white', borderRadius:'16px', padding:'16px', marginTop:'12px'}}>
            <button onClick={handleLogout} style={{width:'100%', background:'#DC2626', color:'white', border:'none', borderRadius:'12px', padding:'16px', fontSize:'14px', fontWeight:800}}>🚪 로그아웃 - {user.loginId}</button>
          </div>
        </div>
      )}

      {activeTab==='member' && (
        <div style={{background:'white', borderRadius:'16px', padding:'16px', marginTop:'12px'}}>
          <div style={{fontWeight:700, fontSize:'13px'}}>회원 목록 - {members.length}명</div>
          {members.slice(0,20).map((m:any)=>(
            <div key={m.id} style={{background:'#F8F9FB', borderRadius:'10px', padding:'10px', marginTop:'8px', display:'flex', justifyContent:'space-between'}}>
              <div><div style={{fontWeight:700, fontSize:'12px'}}>{m.loginId}</div><div style={{fontSize:'11px', color:'#6B7280'}}>{m.name} - {(m.interests||[]).join(', ')}</div></div>
              <div style={{fontSize:'11px', color:'#6B7280'}}>{m.role}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab==='flipbook' && (
        <div style={{background:'white', borderRadius:'20px', padding:'16px', marginTop:'12px}}>
          <div style={{fontWeight:800, fontSize:'14px'}}>📚 기출 / 예상 문제 PDF 관리</div>
          <div style={{background:'#FFFBEB', borderRadius:'16px', padding:'12px', border:'1px dashed #F59E0B', marginTop:'12px', marginBottom:'12px'}}>
            <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'10px'}}>
              <button onClick={()=>{setSelectedType('전체'); setUploadType('기출문제')}} style={{padding:'10px 14px', borderRadius:'20px', border:'none', background: selectedType==='전체' ? '#FFD60A' : '#111827', color: selectedType==='전체' ? '#111827' : 'white', fontSize:'12px', fontWeight:800}}>전체 ({flipbooks.length})</button>
              {problemTypes.map((t:any)=>{
                const count = flipbooks.filter(f=>f.type===t.name).length
                const isSel = selectedType===t.name
                return (
                  <div key={t.id} style={{display:'flex', alignItems:'center', background: isSel ? '#FFD60A' : 'white', borderRadius:'20px', border: isSel ? '2px solid #111827' : '1px solid #E5E7EB', padding:'0 2px 0 10px'}}>
                    <button onClick={()=>{setSelectedType(t.name); setUploadType(t.name)}} style={{background:'transparent', border:'none', fontSize:'12px', fontWeight:800, padding:'8px 2px'}}>{t.icon} {t.name} ({count})</button>
                    <button onClick={async()=>{ if(!confirm(`${t.name} 삭제?`)) return; setProblemTypes(prev=>prev.filter((x:any)=>x.id!==t.id)); try{ await fetch('/api/admin/problem-types', {method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:t.id})}) }catch{} }} style={{background:'transparent', border:'none', padding:'6px 8px', color:'#DC2626'}}>✕</button>
                  </div>
                )
              })}
            </div>
            <div style={{display:'flex', gap:'6px'}}>
              <input value={newTypeName} onChange={e=>setNewTypeName(e.target.value)} placeholder="새 유형 예: 123회 예상문제" style={{flex:1, padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB', fontSize:'12px'}} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); handleCreateType() } }} />
              <button onClick={handleCreateType} style={{background:'#111827', color:'white', border:'none', borderRadius:'10px', padding:'12px 20px', fontSize:'13px', fontWeight:800}}>생성</button>
            </div>
          </div>
          <div style={{background:'#F8F9FB', borderRadius:'16px', padding:'12px', border:'1px solid #F3F4F6', marginBottom:'16px'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
              {problemTypes.map((t:any)=>{
                const count = flipbooks.filter(f=>f.type===t.name).length
                const isSelected = selectedType===t.name
                return (
                  <button key={'bottom-'+t.id} onClick={()=>{setSelectedType(t.name); setUploadType(t.name)}} style={{padding:'14px', borderRadius:'12px', border: isSelected ? '2px solid #111827' : '1px solid #E5E7EB', fontWeight:700, fontSize:'13px', background: isSelected ? '#FFD60A' : '#F3F4F6'}}>
                    {t.icon} {t.name} ({count}개)
                  </button>
                )
              })}
            </div>
          </div>
          <form onSubmit={async(e)=>{ e.preventDefault(); const fileInput=document.getElementById('pdfFile') as HTMLInputElement; const file=fileInput?.files?.[0]; if(!file || !uploadTitle.trim()){ alert('제목과 파일 필요'); return } setUploading(true); try{ const fd=new FormData(); fd.append('file', file); fd.append('title', uploadTitle); fd.append('category', uploadCategory); fd.append('type', uploadType); const res=await fetch('/api/admin/upload-pdf', {method:'POST', body:fd}); if(res.ok){ alert('업로드 완료!'); setUploadTitle(''); if(fileInput) fileInput.value=''; loadData() } } finally{ setUploading(false) } }} style={{background:'#F8F9FB', borderRadius:'16px', padding:'16px', display:'grid', gap:'12px'}}>
            <div><div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>자격증 분류</div><select value={uploadCategory} onChange={e=>setUploadCategory(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB', background:'white'}}>{allQualifications.map((name, idx)=> <option key={idx} value={name}>{name}</option>)}</select></div>
            <div><div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>제목</div><input value={uploadTitle} onChange={e=>setUploadTitle(e.target.value)} placeholder="제목 입력" style={{width:'100%', padding:'12px', borderRadius:'10px', border:'1px solid #E5E7EB'}} /></div>
            <div><div style={{fontSize:'12px', fontWeight:600, marginBottom:'6px'}}>PDF 파일</div><div style={{display:'flex', gap:'8px', background:'white', padding:'10px', borderRadius:'10px', border:'1px solid #E5E7EB'}}><label htmlFor="pdfFile" style={{background:'#F3F4F6', padding:'8px 14px', borderRadius:'8px', fontSize:'12px', cursor:'pointer'}}>파일 선택</label><input id="pdfFile" type="file" accept=".pdf" style={{display:'none'}} /><span style={{fontSize:'12px', color:'#6B7280'}}>선택된 파일 없음</span></div></div>
            <button type="submit" disabled={uploading} style={{background:'#FFD60A', border:'none', borderRadius:'12px', padding:'14px', fontWeight:800}}>{uploading?'업로드중...':`📤 ${uploadType} 업로드`}</button>
          </form>
        </div>
      )}
    </main>
  )
}
