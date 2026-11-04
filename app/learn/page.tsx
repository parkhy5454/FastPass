
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const QUAL_FAMILIES: Record<string, string[]> = {
  '전기': ['전기기사','전기공사기사','전기철도기사','전기공사산업기사','건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사','철도신호기사','전기철도기술사','소방설비기사(전기)','전기기능장','전기산업기사','전기공사기능사','철도신호산업기사','건축전기설비기사','전기기능사'],
  '토목': ['토목기사','토목산업기사','측량및지형공간정보기사','건설안전기사','토목시공기술사','토질및기초기술사'],
  '건축': ['건축기사','건축산업기사'],
  '기계': ['기계기사','기계설계기사','일반기계기사'],
  '정보통신': ['정보처리기사','정보통신기사'],
}

type ProblemType = { id:string, qual:string, name:string, count?:number, createdAt:string }

export default function LearnPage(){
  const [user,setUser]=useState<any>(null)
  const [selectedQual,setSelectedQual]=useState('전기기사')
  const [selectedType,setSelectedType]=useState('전체')
  const [problemTypes,setProblemTypes]=useState<ProblemType[]>([])
  const [myFamilies,setMyFamilies]=useState<string[]>([])
  const [onlyMine,setOnlyMine]=useState(false)
  const [pdfs,setPdfs]=useState<any[]>([])
  const router=useRouter()

  useEffect(()=>{
    fetch('/api/auth/me',{credentials:'include'}).then(r=>r.json()).then(d=>{
      if(d.user){
        setUser(d.user)
        // Determine my families from user.interest or qual
        const interests = d.user.interestFamilies || d.user.interests || []
        if(interests.length>0) setMyFamilies(interests)
        else {
          // infer from qual
          for(const [fam, quals] of Object.entries(QUAL_FAMILIES)){
            if(quals.includes(d.user.qual || selectedQual)){
              setMyFamilies([fam])
              break
            }
          }
        }
      }
    }).catch(()=>{})

    loadProblemTypes()

    const handler = () => loadProblemTypes()
    window.addEventListener('problemTypesUpdated', handler)
    window.addEventListener('storage', handler)
    return ()=> {
      window.removeEventListener('problemTypesUpdated', handler)
      window.removeEventListener('storage', handler)
    }
  },[])

  useEffect(()=>{ loadPdfs() },[selectedQual, selectedType])

  function loadProblemTypes(){
    try{
      const raw = localStorage.getItem('problemTypes')
      if(raw){
        const parsed = JSON.parse(raw) as ProblemType[]
        setProblemTypes(parsed)
        // Auto select first type for current qual if not selected
        const forQual = parsed.filter(t=> t.qual===selectedQual)
        if(forQual.length>0 && selectedType==='전체'){
          // keep 전체 as default but show types
        }
        return
      }
    }catch{}
    // Fallback API
    fetch('/api/problem-types').then(r=>r.json()).then(data=>{
      if(data.problemTypes){
        setProblemTypes(data.problemTypes)
        localStorage.setItem('problemTypes', JSON.stringify(data.problemTypes))
      }
    }).catch(()=>{})
  }

  async function loadPdfs(){
    try{
      const res = await fetch(`/api/pdfs?qual=${encodeURIComponent(selectedQual)}`)
      const data = await res.json()
      setPdfs(data.pdfs||[])
    }catch{ setPdfs([]) }
  }

  const allQuals = Object.values(QUAL_FAMILIES).flat()
  const displayQuals = onlyMine && myFamilies.length>0 ? allQuals.filter(q=> myFamilies.some(f=> QUAL_FAMILIES[f]?.includes(q))) : allQuals
  const typesForQual = problemTypes.filter(t=> t.qual===selectedQual)
  const hasCustomTypes = typesForQual.length>0

  // For the image case: show "기출 10년" "예상문제" etc
  const defaultTypes = [
    {id:'default_10y', qual:selectedQual, name:'기출 10년', count:300},
    {id:'default_expected', qual:selectedQual, name:'예상문제', count:300},
  ]
  const displayTypes = hasCustomTypes ? typesForQual : defaultTypes

  const filteredPdfs = selectedType==='전체' ? pdfs : pdfs.filter((p:any)=> p.problemType===selectedType || p.type===selectedType)

  return (
    <div style={{minHeight:'100vh', background:'#F8F9FB', paddingBottom:100}}>
      <div style={{maxWidth:480, margin:'0 auto', padding:16}}>
        <div style={{fontSize:18, fontWeight:800, color:'#1a1a2e', marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span>학습</span>
          <button onClick={()=> setOnlyMine(!onlyMine)} style={{fontSize:11, padding:'6px 10px', background: onlyMine ? '#1a1a2e' : 'white', color: onlyMine ? 'white' : '#666', border:'1px solid #E9ECEF', borderRadius:8, cursor:'pointer'}}>
            {onlyMine ? '★ 내 관심만' : '전체 보기'}
          </button>
        </div>

        <div style={{background:'white', borderRadius:16, padding:12, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{fontSize:11, fontWeight:700, marginBottom:8}}>자격증 선택 ({displayQuals.length}개)</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:6, maxHeight:120, overflowY:'auto'}}>
            {displayQuals.slice(0,20).map(q=> (
              <button key={q} onClick={()=> { setSelectedQual(q); setSelectedType('전체') }} style={{padding:'6px 10px', background: selectedQual===q ? '#1a1a2e' : 'white', color: selectedQual===q ? 'white' : '#666', border:'1px solid #E9ECEF', borderRadius:8, fontSize:11, fontWeight: selectedQual===q ? 700 : 400, cursor:'pointer'}}>
                {q}
              </button>
            ))}
          </div>
          <div style={{fontSize:10, color:'#888', marginTop:8}}>선택: {selectedQual} {myFamilies.length>0 && `(관심: ${myFamilies.join(', ')})`}</div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:12, border:'1px solid #EEF2F7', marginBottom:12}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
            <div style={{fontSize:11, fontWeight:700}}>{selectedQual} - 문제 유형 (MY 폴더와 연동됨)</div>
            <div style={{fontSize:10, color:'#3367D6', background:'#EFF6FF', padding:'2px 6px', borderRadius:6}}>{hasCustomTypes ? `${typesForQual.length}개 연동` : '기본 2개'}</div>
          </div>

          <div style={{display:'flex', gap:6, overflowX:'auto', paddingBottom:4}}>
            <button onClick={()=> setSelectedType('전체')} style={{whiteSpace:'nowrap', padding:'8px 12px', background: selectedType==='전체' ? 'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)' : 'white', color: selectedType==='전체' ? '#1a1a2e' : '#666', border: selectedType==='전체' ? 'none' : '1px solid #E9ECEF', borderRadius:20, fontSize:11, fontWeight:700, cursor:'pointer'}}>전체</button>
            {displayTypes.map(t=> (
              <button key={t.id} onClick={()=> setSelectedType(t.name)} style={{whiteSpace:'nowrap', padding:'8px 12px', background: selectedType===t.name ? '#1a1a2e' : 'white', color: selectedType===t.name ? 'white' : '#333', border:'1px solid #E9ECEF', borderRadius:20, fontSize:11, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:4}}>
                <span style={{width:6, height:6, background: hasCustomTypes ? '#34A853' : '#888', borderRadius:3, display:'inline-block'}}></span>
                {t.name} {t.count ? `(${t.count})` : ''}
              </button>
            ))}
          </div>

          {hasCustomTypes ? (
            <div style={{fontSize:10, color:'#2E7D32', background:'#E8F5E9', padding:'6px 10px', borderRadius:8, marginTop:8}}>
              ✓ MY에서 생성한 폴더 {typesForQual.length}개가 학습 탭에 연동됨! (예: {typesForQual.map(t=> t.name).join(', ')})
            </div>
          ) : (
            <div style={{fontSize:10, color:'#856404', background:'#FFF3CD', padding:'6px 10px', borderRadius:8, marginTop:8}}>
              💡 MY 페이지 → 자격증 폴더에서 "{selectedQual} - 2022년 2회 기출문제" 생성하면 여기에 자동 표시됨!
            </div>
          )}

          {/* This matches the image: 300문제 보유 • 기사 / 기출 10년 / 예상문제 */}
          <div style={{marginTop:12, display:'flex', gap:8}}>
            <div style={{flex:1, background:'#F8F9FA', borderRadius:12, padding:12, border:'1px solid #EEF2F7'}}>
              <div style={{fontSize:11, color:'#888'}}>300문제 보유 • 기사</div>
              <div style={{display:'flex', gap:6, marginTop:8}}>
                <span style={{fontSize:11, background:'white', border:'1px solid #FFD600', padding:'4px 8px', borderRadius:16, fontWeight:600}}>기출 10년</span>
                <span style={{fontSize:11, background:'white', border:'1px solid #E9ECEF', padding:'4px 8px', borderRadius:16}}>예상문제</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{background:'white', borderRadius:16, padding:12, border:'1px solid #EEF2F7'}}>
          <div style={{fontSize:12, fontWeight:700, marginBottom:8}}>
            {selectedQual} - {selectedType} 문제 목록
            <span style={{fontSize:10, color:'#888', fontWeight:400, marginLeft:6}}>{filteredPdfs.length}개 PDF</span>
          </div>
          {filteredPdfs.length===0 ? (
            <div style={{padding:30, textAlign:'center', color:'#888', fontSize:12}}>
              {selectedType==='전체' ? `${selectedQual}에 등록된 PDF가 없습니다` : `${selectedQual} - ${selectedType}에 등록된 PDF가 없습니다`}<br/>
              <div style={{fontSize:11, marginTop:8, background:'#FFF9DB', padding:8, borderRadius:8, display:'inline-block'}}>
                MY 페이지 → {selectedQual} 폴더 → "{selectedType !== '전체' ? selectedType : '2022년 2회 기출문제'}" 생성 → PDF 업로드
              </div>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {filteredPdfs.map((pdf:any, i:number)=> (
                <div key={i} onClick={()=> router.push(`/flipbook/${pdf.id}`)} style={{padding:'12px', background:'#F8F9FA', borderRadius:10, border:'1px solid #EEF2F7', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div><div style={{fontSize:12, fontWeight:600}}>📄 {pdf.title||pdf.fileName||`${selectedQual} ${selectedType}`}</div><div style={{fontSize:10, color:'#888', marginTop:2}}>{pdf.problemType||selectedType} • {pdf.pages||0}페이지</div></div>
                  <div style={{fontSize:11, background:'#FFD600', padding:'4px 8px', borderRadius:8, fontWeight:700}}>보기</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
