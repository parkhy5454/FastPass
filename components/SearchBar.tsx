
'use client'
import { useState } from 'react'
export default function SearchBar({onSearch}:{onSearch:(q:string)=>void}){
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(()=>{ if(typeof window==='undefined') return []; try{ return JSON.parse(localStorage.getItem('search_recent')||'[]') }catch{ return [] } })
  const handleSearch = (q:string) => {
    if(!q.trim()) return
    const newRecent = [q, ...recent.filter(r=>r!==q)].slice(0,5)
    setRecent(newRecent)
    localStorage.setItem('search_recent', JSON.stringify(newRecent))
    onSearch(q)
  }
  return (
    <div style={{background:'white', borderRadius:'16px', padding:'12px'}}>
      <div style={{display:'flex', gap:'8px'}}>
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') handleSearch(query) }} placeholder="문제 검색 (예: 변압기, 전기설비)" style={{flex:1, padding:'14px', borderRadius:'12px', border:'1.5px solid #E5E7EB', fontSize:'13px'}} />
        <button onClick={()=>handleSearch(query)} style={{background:'#111827', color:'white', border:'none', borderRadius:'12px', padding:'14px 20px', fontWeight:700}}>검색</button>
      </div>
      {recent.length>0 && <div style={{marginTop:'10px', display:'flex', gap:'6px', flexWrap:'wrap'}}><span style={{fontSize:'11px', color:'#9CA3AF'}}>최근:</span>{recent.map((r,i)=><button key={i} onClick={()=>{setQuery(r); handleSearch(r)}} style={{background:'#F3F4F6', border:'none', borderRadius:'20px', padding:'4px 10px', fontSize:'11px'}}>{r}</button>)}</div>}
    </div>
  )
}
