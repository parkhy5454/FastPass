
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const QUALIFICATIONS = ['전기기사', '전기산업기사', '전기공사기사', '전기공사산업기사', '토목기사', '토목산업기사', '건축기사', '건축산업기사', '건축전기설비기술사', '발송배전기술사', '건축전기설비기사', '정보통신기사', '소방설비기사', '기계기사']

export default function MyPage(){
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('referral')
  const [stats, setStats] = useState<any>({count:0, paidCount:0, points:0, totalUsers:0})
  const [members, setMembers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState('')
  const [pdfTypes, setPdfTypes] = useState<any[]>([
    {id:'default-1', name:'기출문제', category:'전기기사', count:0},
    {id:'default-2', name:'예상문제', category:'전기기사', count:0},
  ])
  const [selectedType, setSelectedType] = useState('전체')
  const [newTypeName, setNewTypeName] = useState('')
  const [qualification, setQualification] = useState('전기기사')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File|null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      if(!d.user){ router.push('/login'); return }
      setUser(d.user)
    }).catch(()=>{})
    fetch('/api/referral/stats').then(r=>r.json()).then(setStats).catch(()=>{})
    fetch('/api/admin/users').then(r=>r.json()).then(d=>{
      if(d.users) setMembers(d.users)
      if(d.stats) setStats((prev:any)=>({...prev, ...d.stats}))
    }).catch(()=>{})
    // Load problem types from API + localStorage
    loadProblemTypes()
  },[])

  function loadProblemTypes(){
    // 1. From API
    fetch('/api/admin/problem-types').then(r=>r.json()).then(d=>{
      if(d.types && d.types.length>0){
        const defaults = [
          {id:'default-1', name:'기출문제', category:'전기기사', count:0},
          {id:'default-2', name:'예상문제', category:'전기기사', count:0},
        ]
        const all = [...defaults]
        d.types.forEach((t:any)=>{
          if(!all.find(a=> a.name===t.name && a.category===t.category)){
            all.push(t)
          }
        })
        setPdfTypes(all)
      }
    }).catch(()=>{
      // 2. Fallback localStorage
      try{
        const saved = JSON.parse(localStorage.getItem('problemTypes')||'[]')
        if(saved.length>0){
          setPdfTypes(prev=>{
            const merged = [...prev]
            saved.forEach((t:any)=>{
              if(!merged.find(m=> m.name===t.name && m.category===t.category)){
                merged.push(t)
              }
            })
            return merged
          })
        }
      }catch{}
    })

    // Also flipbooks for count
    fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=>{
      if(d.flipbooks){
        const counts: Record<string, number> = {}
        d.flipbooks.forEach((f:any)=>{ const key = `${f.category}-${f.type}`; counts[key] = (counts[key]||0)+1 })
        setPdfTypes(prev=> prev.map(t=> ({...t, count: counts[`${t.category}-${t.name}`]||0})))
      }
    }).catch(()=>{})
  }

  if(!user) return <div style={{padding:40, textAlign:'center', background:'#F5F7FB', minHeight:'100vh'}}>로딩중...</div>

  const referralCode = `${user.loginId||'user'}-CMVZ`
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${referralCode}` : ''

  function copy(text:string, type:string){
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(()=>setCopied(''), 2000)
  }

  async function createProblemType(){
    if(!newTypeName.trim()) return alert('유형 이름을 입력하세요')
    const fullName = newTypeName.trim() // 예: "123회 예상문제"
    // Check duplicate for this qualification
    if(pdfTypes.find(t=> t.name===fullName && t.category===qualification)){
      return alert('이미 존재하는 유형입니다')
    }

    const newType = {id: Date.now().toString(), name: fullName, category: qualification, count:0}

    // Save to API
    try{
      const res = await fetch('/api/admin/problem-types', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({name: fullName, category: qualification})
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error||'생성 실패')
    }catch(e:any){
      console.log('API save failed, using localStorage:', e.message)
    }

    // Save to localStorage for immediate sync
    try{
      const existing = JSON.parse(localStorage.getItem('problemTypes')||'[]')
      existing.push(newType)
      localStorage.setItem('problemTypes', JSON.stringify(existing))
      // Dispatch event for learn page
      window.dispatchEvent(new Event('problemTypesUpdated'))
    }catch{}

    setPdfTypes([...pdfTypes, newType])
    setNewTypeName('')
    alert(`"${qualification} - ${fullName}" 유형이 생성되었습니다! 학습 페이지에서 확인하세요.`)
  }

  async function deleteType(id:string, name:string){
    if(!confirm(`"${name}" 유형을 삭제할까요?`)) return

    try{
      await fetch(`/api/admin/problem-types?id=${id}`, {method:'DELETE'}).catch(()=>{})
    }catch{}

    try{
      const existing = JSON.parse(localStorage.getItem('problemTypes')||'[]')
      localStorage.setItem('problemTypes', JSON.stringify(existing.filter((t:any)=> t.id!==id && t.name!==name)))
      window.dispatchEvent(new Event('problemTypesUpdated'))
    }catch{}

    setPdfTypes(pdfTypes.filter(t=>t.id!==id))
  }

  async function uploadPdf(){
    if(!title.trim()) return alert('제목을 입력하세요')
    if(!file) return alert('PDF 파일을 선택하세요')
    setUploading(true)
    try{
      const form = new FormData()
      form.append('file', file)
      form.append('title', title)
      form.append('category', qualification)
      form.append('type', selectedType==='전체' ? (pdfTypes.find(t=>t.category===qualification)?.name||'기출문제') : selectedType)
      const res = await fetch('/api/admin/upload-pdf', {method:'POST', body: form})
      const data = await res.json()
      if(!res.ok) throw new Error(data.error||'업로드 실패')
      alert('업로드 성공!')
      setTitle(''); setFile(null)
      loadProblemTypes()
    }catch(e:any){
      alert(e.message)
    }finally{
      setUploading(false)
    }
  }

  const filteredMembers = members.filter((m:any)=> 
    !search || m.loginId?.includes(search) || m.name?.includes(search) || m.email?.includes(search)
  )

  // Filter types by current qualification
  const filteredTypes = pdfTypes.filter(t=> t.category===qualification || t.id.startsWith('default-'))
  const totalCount = filteredTypes.reduce((a,b)=>a+b.count,0)

  return (
    <div style={{minHeight:'100vh', background:'#F5F7FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:'16px 16px 0'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <div style={{fontSize:20, fontWeight:800, color:'#1a1a2e'}}>MY / 설정</div>
          <button onClick={async()=>{ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login' }} style={{padding:'8px 14px', background:'#FFE0E0', color:'#C53030', border:'none', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer'}}>로그아웃</button>
        </div>

        <div style={{background:'white', borderRadius:16, padding:16, marginBottom:12, border:'1px solid #EEF2F7'}}>
          <div style={{display:'flex', gap:6, alignItems:'center', marginBottom:6}}>
            <span style={{fontSize:13, fontWeight:700, color:'#1a1a2e'}}>내 정보</span>
            <span style={{fontSize:10, background:'#FFD600', padding:'2px 8px', borderRadius:10, fontWeight:700}}>배포자 관리자</span>
          </div>
          <div style={{fontSize:13, fontWeight:700, color:'#1a1a2e'}}>{user.loginId} / ADMIN</div>
          <div style={{fontSize:11, color:'#888', marginTop:2}}>관심: {user.interest||'건축전기설비기사'} / 포인트: {stats.points||0}P</div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12}}>
          <button onClick={()=>setActiveTab('referral')} style={{padding:'12px', background: activeTab==='referral' ? 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)' : 'white', color: activeTab==='referral' ? '#1a1a2e' : '#888', border: activeTab==='referral' ? 'none' : '1px solid #EEF2F7', borderRadius:12, fontSize:13, fontWeight: activeTab==='referral' ? 800 : 600, cursor:'pointer', boxShadow: activeTab==='referral' ? '0 4px 12px rgba(255,214,0,0.3)' : 'none'}}>친구추천</button>
          <button onClick={()=>setActiveTab('members')} style={{padding:'12px', background: activeTab==='members' ? 'linear-gradient(135deg, #4285F4 0%, #3367D6 100%)' : 'white', color: activeTab==='members' ? 'white' : '#888', border: activeTab==='members' ? 'none' : '1px solid #EEF2F7', borderRadius:12, fontSize:13, fontWeight: activeTab==='members' ? 800 : 600, cursor:'pointer', boxShadow: activeTab==='members' ? '0 4px 12px rgba(66,133,244,0.3)' : 'none'}}>회원 {members.length||stats.totalUsers||0}</button>
          <button onClick={()=>setActiveTab('pdf')} style={{padding:'12px', background: activeTab==='pdf' ? 'linear-gradient(135deg, #7C4DFF 0%, #651FFF 100%)' : 'white', color: activeTab==='pdf' ? 'white' : '#888', border: activeTab==='pdf' ? 'none' : '1px solid #EEF2F7', borderRadius:12, fontSize:13, fontWeight: activeTab==='pdf' ? 800 : 600, cursor:'pointer', boxShadow: activeTab==='pdf' ? '0 4px 12px rgba(124,77,255,0.3)' : 'none'}}>PDF {pdfTypes.reduce((a,b)=>a+b.count,0)}</button>
        </div>

        {activeTab==='referral' && (
          <div style={{background:'white', borderRadius:16, padding:16, border:'2px solid #FFE066', marginBottom:12}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}}>
              <div style={{fontSize:14, fontWeight:800, color:'#1a1a2e'}}>친구 추천 포인트</div>
              <span style={{fontSize:10, background:'#FFD600', padding:'4px 8px', borderRadius:10, fontWeight:700}}>최대 5000P</span>
            </div>
            <div style={{fontSize:11, color:'#666', marginBottom:4}}>친구가 <b>가입하면 1000P</b>, <b>결제하면 5000P</b> 추가!</div>
            <div style={{fontSize:11, color:'#666', marginBottom:12, display:'flex', alignItems:'center', gap:6}}>
              내 추천코드: <span style={{background:'#F1F3F5', padding:'2px 8px', borderRadius:6, fontWeight:700, fontSize:11}}>{referralCode}</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:8, marginBottom:12}}>
              <button style={{padding:'12px 4px', background:'#FFF9DB', border:'1.5px solid #FFE066', borderRadius:12, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4}}><span style={{fontSize:18}}>💬</span>카톡</button>
              <button style={{padding:'12px 4px', background:'#FFF0F5', border:'1.5px solid #FFB6D9', borderRadius:12, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4}}><span style={{fontSize:16}}>💌</span>문자</button>
              <button style={{padding:'12px 4px', background:'#F0F4FF', border:'1.5px solid #B6D0FF', borderRadius:12, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4}}><span style={{fontSize:16}}>📧</span>이메일</button>
              <button onClick={()=>copy(referralLink, 'link')} style={{padding:'12px 4px', background: copied==='link' ? '#34A853' : 'linear-gradient(135deg, #4285F4 0%, #3367D6 100%)', border:'none', borderRadius:12, fontSize:11, fontWeight:700, cursor:'pointer', color:'white', display:'flex', flexDirection:'column', alignItems:'center', gap:4, boxShadow: '0 2px 8px rgba(66,133,244,0.3)'}}><span style={{fontSize:16}}>{copied==='link' ? '✓' : '🔗'}</span>{copied==='link' ? '복사됨!' : '복사'}</button>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12}}>
              <div style={{background:'#F8F9FA', borderRadius:10, padding:10, textAlign:'center'}}><div style={{fontSize:16, fontWeight:800, color:'#4285F4'}}>{stats.count||0}명</div><div style={{fontSize:10, color:'#888', marginTop:2}}>추천 가입</div></div>
              <div style={{background:'#F8F9FA', borderRadius:10, padding:10, textAlign:'center'}}><div style={{fontSize:16, fontWeight:800, color:'#34A853'}}>{stats.paidCount||0}명</div><div style={{fontSize:10, color:'#888', marginTop:2}}>결제 완료</div></div>
              <div style={{background:'#F8F9FA', borderRadius:10, padding:10, textAlign:'center'}}><div style={{fontSize:16, fontWeight:800, color:'#FB8C00'}}>{stats.points||0}P</div><div style={{fontSize:10, color:'#888', marginTop:2}}>받은 포인트</div></div>
            </div>
            <div style={{background:'#FFF9DB', borderRadius:8, padding:10, fontSize:10, color:'#8B6914', wordBreak:'break-all', lineHeight:'1.4'}}>추천링크: {referralLink}</div>
          </div>
        )}

        {activeTab==='members' && (
          <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
            <div style={{fontSize:14, fontWeight:800, marginBottom:12, color:'#1a1a2e'}}>회원 관리</div>
            <div style={{display:'flex', gap:8, marginBottom:12}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="아이디, 이름, 이메일 검색" style={{flex:1, padding:'10px 12px', border:'1px solid #E9ECEF', borderRadius:8, fontSize:12}} />
              <button onClick={()=>{ const csv = 'loginId,name,email,role\n' + filteredMembers.map((m:any)=> `${m.loginId},${m.name||''},${m.email||''},${m.role||''}`).join('\n'); const blob = new Blob([csv], {type:'text/csv'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='members.csv'; a.click() }} style={{padding:'10px 14px', background:'#F1F3F5', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer'}}>CSV</button>
            </div>
            <div style={{fontSize:11, color:'#888', marginBottom:8}}>총 {filteredMembers.length}명</div>
            <div style={{maxHeight:400, overflowY:'auto'}}>
              {filteredMembers.map((m:any)=>(
                <div key={m.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F1F3F5'}}>
                  <div>
                    <div style={{fontSize:12, fontWeight:600, color:'#1a1a2e'}}>{m.loginId} {m.role==='ADMIN' && <span style={{background:'#FFD600', padding:'1px 6px', borderRadius:8, fontSize:9}}>ADMIN</span>}</div>
                    <div style={{fontSize:10, color:'#888'}}>{m.name||''} {m.email ? `• ${m.email}` : ''}</div>
                  </div>
                  <button onClick={async()=>{ if(!confirm(`${m.loginId} 비밀번호를 1234로 초기화할까요?`)) return; const res = await fetch('/api/admin/reset-password', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({userId: m.id})}); const d = await res.json(); alert(d.ok ? '초기화 완료: 1234' : d.error) }} style={{padding:'4px 8px', background:'#FFF1F1', color:'#E53E3E', border:'1px solid #FFE0E0', borderRadius:6, fontSize:10, cursor:'pointer'}}>초기화</button>
                </div>
              ))}
              {filteredMembers.length===0 && <div style={{textAlign:'center', padding:20, color:'#888', fontSize:12}}>회원이 없습니다</div>}
            </div>
          </div>
        )}

        {activeTab==='pdf' && (
          <div style={{background:'white', borderRadius:16, padding:16, border:'1px solid #EEF2F7', marginBottom:12}}>
            <div style={{fontSize:14, fontWeight:800, marginBottom:12, color:'#1a1a2e'}}>PDF 관리</div>

            <div style={{background:'#FFFEF5', border:'1.5px dashed #FFE066', borderRadius:12, padding:12, marginBottom:12}}>
              <div style={{fontSize:11, color:'#888', marginBottom:6, fontWeight:600}}>현재 자격증: <b style={{color:'#1a1a2e'}}>{qualification}</b>의 문제 유형</div>
              <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:10}}>
                <button onClick={()=>setSelectedType('전체')} style={{padding:'6px 12px', background: selectedType==='전체' ? '#FFD600' : 'white', color: selectedType==='전체' ? '#1a1a2e' : '#666', border:'1px solid #FFE066', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer'}}>전체 ({totalCount})</button>
                {filteredTypes.map(t=>(
                  <button key={t.id} onClick={()=>setSelectedType(t.name)} style={{padding:'6px 12px', background: selectedType===t.name ? '#FFD600' : 'white', color: selectedType===t.name ? '#1a1a2e' : '#666', border:'1px solid #FFE066', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4}}>
                    {t.name.includes('기출') ? '📄' : t.name.includes('예상') ? '⭐' : '📝'} {t.name} ({t.count}) <span onClick={(e)=>{ e.stopPropagation(); deleteType(t.id, t.name) }} style={{color:'#E53E3E', marginLeft:2, fontWeight:800}}>X</span>
                  </button>
                ))}
              </div>

              <div style={{display:'flex', gap:8}}>
                <input value={newTypeName} onChange={e=>setNewTypeName(e.target.value)} placeholder="새 유형 예: 123회 예상문제" style={{flex:1, padding:'8px 12px', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11}} onKeyDown={e=> e.key==='Enter' && createProblemType()} />
                <button onClick={createProblemType} style={{padding:'8px 14px', background:'#1a1a2e', color:'white', border:'none', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer'}}>생성</button>
              </div>
              <div style={{fontSize:10, color:'#888', marginTop:6}}>💡 생성하면 학습 페이지 상단 버튼과 연동됩니다 - "{qualification}" 카테고리에 추가!</div>
            </div>

            <div style={{background:'#F8F9FA', borderRadius:12, padding:14}}>
              <div style={{fontSize:12, fontWeight:700, marginBottom:8, color:'#1a1a2e'}}>자격증 분류</div>
              <select value={qualification} onChange={e=>setQualification(e.target.value)} style={{width:'100%', padding:'10px 12px', border:'1px solid #E9ECEF', borderRadius:8, fontSize:12, marginBottom:12, background:'white'}}>
                {QUALIFICATIONS.map(q=> <option key={q} value={q}>{q}</option>)}
              </select>
              <div style={{fontSize:12, fontWeight:700, marginBottom:8, color:'#1a1a2e'}}>제목</div>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="제목 입력" style={{width:'100%', padding:'10px 12px', border:'1px solid #E9ECEF', borderRadius:8, fontSize:12, marginBottom:12, boxSizing:'border-box'}} />
              <div style={{fontSize:12, fontWeight:700, marginBottom:8, color:'#1a1a2e'}}>PDF 파일</div>
              <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12}}>
                <label style={{padding:'8px 14px', background:'white', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11, cursor:'pointer', fontWeight:600}}>
                  파일 선택
                  <input type='file' accept='.pdf' onChange={e=>setFile(e.target.files?.[0]||null)} style={{display:'none'}} />
                </label>
                <span style={{fontSize:11, color:'#888'}}>{file ? file.name : '선택된 파일 없음'}</span>
              </div>
              <button onClick={uploadPdf} disabled={uploading} style={{width:'100%', padding:12, background: uploading ? '#ccc' : '#FFD600', color:'#1a1a2e', border:'none', borderRadius:10, fontWeight:800, fontSize:13, cursor: uploading ? 'not-allowed' : 'pointer'}}>
                {uploading ? '업로드 중...' : `${selectedType==='전체' ? (filteredTypes[0]?.name||'기출문제') : selectedType} 업로드`}
              </button>
            </div>

            <div style={{marginTop:12, fontSize:10, color:'#888', background:'#F0F4FF', padding:10, borderRadius:8}}>
              <div>📚 현재: <b>{qualification}</b> - <b>{selectedType==='전체' ? (filteredTypes[0]?.name||'기출문제') : selectedType}</b> 유형으로 업로드됩니다</div>
              <div style={{marginTop:4}}>💡 학습 페이지에서 {qualification} {selectedType} 필터로 보입니다</div>
              <div style={{marginTop:4, color:'#4285F4', fontWeight:600}}>→ 상단에 "123회 예상문제" 버튼이 생성되면 학습 페이지에서도 같은 이름으로 나타납니다!</div>
            </div>
          </div>
        )}

        <button onClick={async()=>{ await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/login' }} style={{width:'100%', padding:14, background:'#E53E3E', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:13, cursor:'pointer', marginBottom:80}}>
          로그아웃 - {user.loginId}
        </button>
      </div>
    </div>
  )
}
