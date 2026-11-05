'use client'
import { useEffect, useState } from 'react'

const STATUSES = ['신청', '승인', '중지']

export default function AdminAuthorsPage() {
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/admin/authors', { credentials: 'include', cache: 'no-store' })
    const d = await res.json()
    if (!res.ok) return setError(d.error || '불러오기 실패')
    setError(''); setItems(d.authors || [])
  }
  useEffect(() => { load() }, [])

  async function setStatus(id: string, status: string) {
    const res = await fetch('/api/admin/authors', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ id, status }),
    })
    const d = await res.json()
    if (!res.ok) return alert(d.error || '저장 실패')
    load()
  }

  const chip = (on: boolean): React.CSSProperties => ({ padding: '6px 10px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 12, background: on ? '#1a1a2e' : '#E5E7EB', color: on ? 'white' : '#374151' })

  return (
    <main style={{ padding: 16, background: '#F8F9FB', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>저자 관리</h1>
      {error && <div style={{ color: '#B91C1C', marginBottom: 10 }}>{error}</div>}
      <div style={{ display: 'grid', gap: 10 }}>
        {items.length === 0 && <div style={{ color: '#6B7280' }}>신청한 저자가 없습니다</div>}
        {items.map(a => (
          <div key={a.id} style={{ background: 'white', borderRadius: 12, padding: 14, border: '1px solid #EEF2F7' }}>
            <div style={{ fontWeight: 800 }}>{a.displayName} {a.isBusiness ? '(사업자)' : '(개인)'}</div>
            <div style={{ fontSize: 11, color: '#6B7280', margin: '4px 0 8px' }}>신청: {new Date(a.createdAt).toLocaleDateString('ko-KR')} · 상태: {a.status}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {STATUSES.map(s => <button key={s} style={chip(a.status === s)} onClick={() => setStatus(a.id, s)}>{s}</button>)}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
