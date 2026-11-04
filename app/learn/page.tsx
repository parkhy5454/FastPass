
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Level = '전체'|'기술사'|'기능장'|'기사'|'산업기사'|'기능사'
type CertCategory = {name:string, count:number, level:Level, group:string, hot?:boolean}

const LEVELS: Level[] = ['기술사','기능장','기사','산업기사','기능사']

const ALL_CERTS: CertCategory[] = [
  {name:'전기기사', count:300, level:'기사', group:'전기', hot:true},
  {name:'전기공사기사', count:200, level:'기사', group:'전기'},
  {name:'전기철도기사', count:200, level:'기사', group:'전기'},
  {name:'전기공사산업기사', count:180, level:'산업기사', group:'전기'},
  {name:'건축전기설비기술사', count:150, level:'기술사', group:'전기'},
  {name:'발송배전기술사', count:120, level:'기술사', group:'전기'},
  {name:'전기응용기술사', count:120, level:'기술사', group:'전기'},
  {name:'전기안전기술사', count:130, level:'기술사', group:'전기'},
  {name:'철도신호기사', count:180, level:'기사', group:'전기'},
  {name:'전기철도기술사', count:100, level:'기술사', group:'전기'},
  {name:'소방설비기사(전기)', count:200, level:'기사', group:'전기'},
  {name:'전기기능장', count:250, level:'기능장', group:'전기'},
  {name:'전기산업기사', count:220, level:'산업기사', group:'전기'},
  {name:'전기공사기능사', count:150, level:'기능사', group:'전기'},
  {name:'철도신호산업기사', count:140, level:'산업기사', group:'전기'},
  {name:'건축전기설비기사', count:190, level:'기사', group:'전기'},
  {name:'전기기능사', count:160, level:'기능사', group:'전기'},
  {name:'토목기사', count:280, level:'기사', group:'토목', hot:true},
  {name:'토목산업기사', count:200, level:'산업기사', group:'토목'},
  {name:'측량및지형공간정보기사', count:180, level:'기사', group:'토목'},
  {name:'건설안전기사', count:220, level:'기사', group:'토목'},
  {name:'토목시공기술사', count:120, level:'기술사', group:'토목'},
  {name:'토질및기초기술사', count:100, level:'기술사', group:'토목'},
  {name:'건축기사', count:300, level:'기사', group:'건축', hot:true},
  {name:'건축산업기사', count:200, level:'산업기사', group:'건축'},
  {name:'기계기사', count:280, level:'기사', group:'기계', hot:true},
  {name:'기계설계기사', count:200, level:'기사', group:'기계'},
  {name:'일반기계기사', count:250, level:'기사', group:'기계'},
  {name:'정보처리기사', count:300, level:'기사', group:'정보통신', hot:true},
  {name:'정보통신기사', count:200, level:'기사', group:'정보통신'},
]

export default function LearnPage(){
  const [user,setUser]=useState<any>(null)
  const [level,setLevel]=useState<Level>('기사')
  const [selectedCert,setSelectedCert]=useState<string>('전기기사')
  const [flipbooks,setFlipbooks]=useState<any[]>([])
  useEffect(()=>{ fetch('/api/admin/flipbooks').then(r=>r.json()).then(d=> setFlipbooks(Array.isArray(d)?d:[])).catch(()=>{}) },[])
  const [problemTypes,setProblemTypes]=useState<any[]>([])
  useEffect(()=>{ fetch('/api/admin/problem-types').then(r=>r.json()).then(d=> setProblemTypes(Array.isArray(d?.types)?d.types:[])).catch(()=>{}) },[])
  const [myInterests,setMyInterests]=useState<string[]>(['전기기사'])
  const [interestGroups,setInterestGroups]=useState<string[]>(['전기'])
  const [onlyMine,setOnlyMine]=useState(true)
  const [isLoadingAuth,setIsLoadingAuth]=useState(true)
  const router=useRouter()

  useEffect(()=>{
    // Fixed auth check - don't immediately redirect, handle gracefully
    fetch('/api/auth/me', {credentials:'include', cache:'no-store'})
      .then(async r=>{
        const d = await r.json()
        console.log('auth/me:', d)
        if(d.user){
          setUser(d.user)
          if(d.user.interests){
            const ints = d.user.interests.split(',').map((s:string)=>s.trim()).filter(Boolean)
            if(ints.length>0){
              const groups = ['전기','토목','건축','기계','정보통신']
              const foundGroups = ints.filter((i:string)=> groups.includes(i))
              const foundCerts = ints.filter((i:string)=> !groups.includes(i))
              if(foundGroups.length>0) setInterestGroups(foundGroups)
              if(foundCerts.length>0) setMyInterests(foundCerts)
              else if(foundGroups.length>0){
                const certsInGroups = ALL_CERTS.filter(c=> foundGroups.includes(c.group)).map(c=> c.name)
                setMyInterests(certsInGroups.slice(0,16))
              }
            }
          }
        } else {
          // For debugging - show what happened, but still allow access with localStorage
          console.log('No user in response, trying localStorage fallback')
          // Try localStorage fallback for dev
          const localUser = localStorage.getItem('user')
          if(localUser){
            try{
              const parsed = JSON.parse(localUser)
              setUser(parsed)
            }catch{}
          }
        }
      })
      .catch(e=>{
        console.log('auth error', e)
        // Don't redirect immediately - try localStorage
        const localUser = localStorage.getItem('user')
        if(localUser){
          try{
            const parsed = JSON.parse(localUser)
            setUser(parsed)
          }catch{}
        }
      })
      .finally(()=> setIsLoadingAuth(false))
  },[])

  const filteredCerts = onlyMine
    ? ALL_CERTS.filter(c=> myInterests.includes(c.name) || interestGroups.includes(c.group))
    : ALL_CERTS

  const levelFiltered = filteredCerts.filter(c=> c.level===level)


  if(isLoadingAuth){
    return <div style={{padding:40, textAlign:'center', background:'#F8F9FB', minHeight:'100vh', color:'#888'}}>로딩중...</div>
  }

  // If no user after all attempts, show login prompt but not auto-redirect loop
  if(!user){
    return (
      <div style={{minHeight:'100vh', background:'#F8F9FB', display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
        <div style={{background:'white', borderRadius:16, padding:24, textAlign:'center', maxWidth:320, width:'100%', border:'1px solid #EEF2F7'}}>
          <div style={{fontSize:24, marginBottom:10}}>🔒</div>
          <div style={{fontSize:14, fontWeight:700, marginBottom:6}}>로그인이 필요합니다</div>
          <div style={{fontSize:11, color:'#888', marginBottom:16}}>학습을 위해 로그인해주세요</div>
          <button onClick={()=> router.push('/login')} style={{width:'100%', padding:12, background:'#FFD600', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer'}}>로그인하러 가기</button>
          <button onClick={()=>{ setUser({loginId:'demo', name:'테스트', interests:'전기'}); setMyInterests(ALL_CERTS.filter(c=> c.group==='전기').map(c=> c.name).slice(0,16)) }} style={{width:'100%', marginTop:8, padding:10, background:'white', border:'1px solid #E9ECEF', borderRadius:10, fontSize:11, cursor:'pointer'}}>임시로 둘러보기 (테스트)</button>
          <div style={{marginTop:12, fontSize:10, color:'#AAA'}}>디버그: /api/auth/me가 user를 반환하지 않음. 쿠키 확인 필요</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', background:'white'}}>
        <div style={{padding:20, paddingBottom:12}}>
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
            <span style={{fontSize:20}}>📚</span>
            <span style={{fontSize:18, fontWeight:800, color:'#1a1a2e'}}>학습</span>
          </div>
          <div style={{fontSize:12, color:'#888', marginBottom:12}}>원하는 자격증 레벨을 선택하세요</div>

          <div style={{background:'#FFFEF5', border:'1px solid #FFE066', borderRadius:12, padding:10, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <div style={{fontSize:12, fontWeight:700, color:'#1a1a2e'}}>
              <span style={{marginRight:4}}>👤</span>내 관심: {interestGroups.join(', ') || '전기'} ({myInterests.length}개)
            </div>
            <div style={{display:'flex', gap:6}}>
              <button onClick={()=> setOnlyMine(!onlyMine)} style={{padding:'4px 10px', background: onlyMine ? '#1a1a2e' : 'white', color: onlyMine ? 'white' : '#666', border:'1px solid #E9ECEF', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer'}}>
                {onlyMine ? `16개만` : '전체보기'}
              </button>
              <button onClick={()=> router.push('/settings')} style={{padding:'4px 8px', background:'white', border:'1px solid #E9ECEF', borderRadius:20, fontSize:11, cursor:'pointer'}}>내 선택 1개</button>
            </div>
          </div>

          <div style={{display:'flex', gap:6, overflowX:'auto', paddingBottom:4}}>
            {LEVELS.map(l=>(
              <button key={l} onClick={()=> setLevel(l)} style={{padding:'8px 14px', background: level===l ? '#1a1a2e' : '#F1F3F5', color: level===l ? 'white' : '#666', border:'none', borderRadius:20, fontSize:12, fontWeight: level===l ? 700 : 500, whiteSpace:'nowrap', cursor:'pointer'}}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{padding: '0 16px 16px 16px'}}>
          <div style={{fontSize:13, fontWeight:800, color:'#1a1a2e', marginBottom:10, display:'flex', alignItems:'center', gap:6}}>
            <span style={{width:3, height:16, background:'#4285F4', borderRadius:2}}></span>
            {level} ({levelFiltered.length}개)
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {levelFiltered.length===0 ? (
              <div style={{padding:40, textAlign:'center', background:'white', border:'1px solid #EEF2F7', borderRadius:16, color:'#888', fontSize:12}}>
                해당 레벨에 문제가 없습니다<br/>MY → 관심 자격증을 추가하세요
              </div>
            ) : levelFiltered.map(cert=>(
              <div key={cert.name} style={{
                background:'white',
                border: selectedCert===cert.name ? '2px solid #4285F4' : '1px solid #EEF2F7',
                borderRadius:16,
                padding:14,
                boxShadow: selectedCert===cert.name ? '0 4px 12px rgba(66,133,244,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
                cursor:'pointer'
              }} onClick={()=> setSelectedCert(cert.name)}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                  <div>
                    <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
                      <span style={{fontSize:14, fontWeight:800, color:'#1a1a2e'}}>{cert.name}</span>
                      {cert.hot && <span style={{padding:'2px 6px', background:'#FFD600', color:'#1a1a2e', borderRadius:8, fontSize:9, fontWeight:800}}>HOT</span>}
                    </div>
                    <div style={{fontSize:11, color:'#888'}}>{cert.count}문제 보유 • {cert.level}</div>
                    <div style={{display:'flex', gap:6, marginTop:6}}>
                      {(()=>{
                        const defaults: string[] = ['기출문제','예상문제']
                        const dbTypes: string[] = problemTypes.filter((t:any)=> t.category===cert.name).map((t:any)=> String(t.name))
                        const fbTypes: string[] = flipbooks.filter((f:any)=> f.category===cert.name && f.type).map((f:any)=> String(f.type))
                        const all: string[] = Array.from(new Set([...defaults, ...dbTypes, ...fbTypes]))
                        return all.map((t:string)=>(
                          <span key={t} onClick={(e)=>{ e.stopPropagation(); router.push(`/learn/flipbooks?cert=${encodeURIComponent(cert.name)}&type=${encodeURIComponent(t)}`) }}
                            style={{padding:'3px 8px', background:'#EFF6FF', color:'#3367D6', borderRadius:12, fontSize:10, fontWeight:600, cursor:'pointer'}}>{t}</span>
                        ))
                      })()}
                    </div>
                  </div>
                  <div style={{width:40, height:40, background:'#F0F7FF', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>📘</div>
                </div>

                <div style={{display:'flex', gap:8, marginTop:10}}>
                  <button onClick={(e)=>{ e.stopPropagation(); router.push(`/learn/mock?cert=${encodeURIComponent(cert.name)}`) }} style={{flex:1, padding:10, background:'linear-gradient(135deg, #2B5CE6 0%, #1A4CD4 100%)', color:'white', border:'none', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer'}}>모의고사</button>
                  <button onClick={(e)=>{ e.stopPropagation(); router.push(`/learn/problems?cert=${encodeURIComponent(cert.name)}`) }} style={{flex:1, padding:10, background:'#EFF6FF', color:'#3367D6', border:'1px solid #D6E4FF', borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer'}}>문제풀기</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
