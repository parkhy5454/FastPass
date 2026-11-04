'use client'
import { useEffect, useState } from 'react'

const STATUSES = ['접수', '확인', '처리완료']
const CATEGORIES = ['전체', '버그', '건의', '오답', '기타']

export default function AdminInquiriesPage() {
  const [items, setItems] = useState<any[]>([])
  const [status, setStatus] = useState('전체')
  const [category, setCategory] = useState('전체')
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  async function load() {
    const q = new URLSearchParams()
    if (status !== '전체') q.set('status', status)
    if (category !== '전체') q.set('category', category)
    const res = await fetch(`/api/admin/inquiries?${q.toString()}`, { credentials: 'include' })
    const d = await res.json()
    if (!res.ok) return setError(d.error || '불러오기 실패')
    setError('')
    setItems(d.items || [])
    const next: Record<string, string> = {}
    ;(d.items || []).forEach((it: any) => { next[it.id] = it.adminReply || '' })
    setDrafts(next)
  }
  useEffect(() => { load() }, [status, category])

  async function patch(id: string, data: any) {
    const res = await fetch('/api/admin/inquiries', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ id, ...data }),
    })
    const d = await res.json()
    if (!res.ok) return alert(d.error || '저장 실패')
    load()
  }

  const chip = (active: boolean): React.CSSProperties => ({ padding: '6px 10px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 12, background: active ? '#1a1a2e' : '#E5E7EB', color: active ? 'white' : '#374151' })

  return (
    <main style={{ padding: 16, background: '#F8F9FB', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>문의 관리</h1>
      {error && <div style={{ color: '#B91C1C', marginBottom: 10 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {['전체', ...STATUSES].map(s => <button key={s} style={chip(status === s)} onClick={() => setStatus(s)}>{s}</button>)}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {CATEGORIES.map(c => <button key={c} style={chip(category === c)} onClick={() => setCategory(c)}>{c}</button>)}
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {items.length === 0 && <div style={{ color: '#6B7280' }}>문의가 없습니다</div>}
        {items.map(it => (
          <div key={it.id} style={{ background: 'white', borderRadius: 12, padding: 14, border: '1px solid #EEF2F7' }}>
            <div style={{ fontSize: 11, color: '#6B7280' }}>{it.category} · {it.userLoginId || it.userId} · {new Date(it.createdAt).toLocaleString('ko-KR')}</div>
            <div style={{ fontWeight: 800, margin: '4px 0' }}>{it.title}</div>
            {it.refInfo && <div style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}>대상 문항: {it.refInfo}</div>}
            <div style={{ fontSize: 13, whiteSpace: 'pre-wrap', marginBottom: 8 }}>{it.body}</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {STATUSES.map(s => <button key={s} style={chip(it.status === s)} onClick={() => patch(it.id, { status: s })}>{s}</button>)}
            </div>
            <textarea value={drafts[it.id] ?? ''} onChange={e => setDrafts({ ...drafts, [it.id]: e.target.value })} placeholder="답변 작성" style={{ width: '100%', minHeight: 70, padding: 10, borderRadius: 8, border: '1px solid #E5E7EB', boxSizing: 'border-box' }} />
            <button onClick={() => patch(it.id, { adminReply: drafts[it.id] ?? '' })} style={{ marginTop: 6, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#2B5CE6', color: 'white', fontWeight: 700, fontSize: 12 }}>답변 저장</button>
          </div>
        ))}
      </div>
    </main>
  )
}
