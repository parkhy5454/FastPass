'use client'
import { useEffect, useState } from 'react'

export default function AuthorPage() {
  const [author, setAuthor] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [isBusiness, setIsBusiness] = useState(false)

  async function load() {
    const res = await fetch('/api/author', { credentials: 'include', cache: 'no-store' })
    const d = await res.json()
    setAuthor(d.author || null)
    setLoaded(true)
  }
  useEffect(() => { load() }, [])

  async function apply() {
    const res = await fetch('/api/author', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ displayName, isBusiness }),
    })
    const d = await res.json()
    if (!res.ok) return alert(d.error || '신청 실패')
    alert('저자 신청이 접수되었습니다. 관리자 승인 후 교재를 연결할 수 있습니다.')
    load()
  }

  const card: React.CSSProperties = { background: 'white', borderRadius: 14, padding: 16, border: '1px solid #EEF2F7', marginBottom: 12 }
  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', padding: 16, paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>저자 신청</div>
        {!loaded && <div style={{ color: '#6B7280' }}>불러오는 중...</div>}
        {loaded && author && (
          <div style={card}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>{author.displayName}</div>
            <div style={{ fontSize: 13, color: '#374151' }}>상태: <b>{author.status}</b></div>
            {author.status === '신청' && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>관리자 확인 중입니다.</div>}
            {author.status === '승인' && <div style={{ fontSize: 12, color: '#2E7D32', marginTop: 6 }}>승인되었습니다. 교재는 관리자가 연결합니다.</div>}
            {author.status === '중지' && <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 6 }}>이용이 중지된 상태입니다. 문의함으로 연락해 주세요.</div>}
          </div>
        )}
        {loaded && !author && (
          <div style={card}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 10 }}>교재를 판매하려면 저자 신청이 필요합니다. 교재 판매금액의 30%가 저자에게 지급됩니다.</div>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="저자명 (2~30자)" maxLength={30}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #E5E7EB', marginBottom: 10, boxSizing: 'border-box' }} />
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, marginBottom: 12 }}>
              <input type="checkbox" checked={isBusiness} onChange={e => setIsBusiness(e.target.checked)} /> 사업자 등록증이 있습니다
            </label>
            <button onClick={apply} disabled={displayName.trim().length < 2} style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: '#2B5CE6', color: 'white', fontWeight: 800 }}>신청하기</button>
          </div>
        )}
      </div>
    </main>
  )
}
