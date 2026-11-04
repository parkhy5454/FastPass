
'use client'
import { useState } from 'react'
export default function BookmarkButton({questionId, initialBookmarked=false}:{questionId:string, initialBookmarked?:boolean}){
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [loading, setLoading] = useState(false)
  const toggle = async () => {
    setLoading(true)
    try{
      const res = await fetch('/api/bookmarks', {method: bookmarked ? 'DELETE' : 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({questionId})})
      if(res.ok) setBookmarked(!bookmarked)
    }finally{ setLoading(false) }
  }
  return <button onClick={toggle} disabled={loading} style={{background: bookmarked ? '#FFD60A' : 'white', border: bookmarked ? '1.5px solid #FFD60A' : '1.5px solid #E5E7EB', borderRadius:'10px', padding:'8px 12px', fontSize:'12px', fontWeight:700}}>{bookmarked ? '⭐ 저장됨' : '☆ 저장'}</button>
}
