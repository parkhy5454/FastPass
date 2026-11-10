'use client'
import { useEffect, useState } from 'react'

export default function AdminGenPage() {
  const [drafts, setDrafts] = useState<any[]>([])
  const [open, setOpen] = useState<string>('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/gen', { credentials: 'include', cache: 'no-store' })
    const d = await res.json()
    setDrafts(d.drafts || [])
  }
  useEffect(() => { load() }, [])

  async function generate() {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/gen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ category: '전기기사' }) })
      const d = await res.json()
      if (!res.ok) alert(d.error || '생성 실패')
      else alert(`${d.round}회 초안 생성 (${d.source === 'sample' ? '샘플' : 'AI'}), 검증 오류 ${d.errorCount}건`)
      load()
    } finally { setBusy(false) }
  }

  async function act(id: string, action: 'approve' | 'reject') {
    const res = await fetch('/api/admin/gen', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ id, action }) })
    const d = await res.json()
    if (!res.ok) alert(d.error + (d.errors ? '\n' + d.errors.slice(0, 5).join('\n') : ''))
    load()
  }

  const btn = (bg: string): React.CSSProperties => ({ padding: '8px 12px', borderRadius: 8, border: 'none', background: bg, color: 'white', fontWeight: 700, fontSize: 12 })

  return (
    <main style={{ padding: 16, background: '#F8F9FB', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>문항 생성·검수</h1>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>생성된 초안은 승인하기 전까지 공개되지 않습니다. 샘플 초안은 공개할 수 없습니다.</div>
      <button onClick={generate} disabled={busy} style={{ ...btn('#2B5CE6'), marginBottom: 14, padding: '10px 14px' }}>{busy ? '생성 중...' : '다음 회차 초안 생성'}</button>
      <div style={{ display: 'grid', gap: 10 }}>
        {drafts.length === 0 && <div style={{ color: '#6B7280' }}>초안이 없습니다</div>}
        {drafts.map(d => (
          <div key={d.id} style={{ background: 'white', borderRadius: 12, padding: 14, border: '1px solid #EEF2F7' }}>
            <div style={{ fontWeight: 800 }}>{d.category} {d.round}회 · {d.source === 'sample' ? '샘플' : 'AI'} · {d.status}</div>
            <div style={{ fontSize: 12, color: d.errors?.length ? '#B91C1C' : '#2E7D32', margin: '4px 0 8px' }}>
              문항 {Array.isArray(d.payload) ? d.payload.length : 0}개 · 검증 오류 {Array.isArray(d.errors) ? d.errors.length : 0}건
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button onClick={() => setOpen(open === d.id ? '' : d.id)} style={btn('#6B7280')}>{open === d.id ? '닫기' : '문항 보기'}</button>
              {d.status === '검수대기' && <button onClick={() => act(d.id, 'approve')} style={btn('#2E7D32')}>승인(공개)</button>}
              {d.status === '검수대기' && <button onClick={() => act(d.id, 'reject')} style={btn('#B91C1C')}>반려</button>}
            </div>
            {open === d.id && (
              <div style={{ marginTop: 10, fontSize: 12, maxHeight: 360, overflow: 'auto' }}>
                {(d.errors || []).length > 0 && <div style={{ color: '#B91C1C', marginBottom: 8 }}>{d.errors.slice(0, 20).join('\n')}</div>}
                {(d.payload || []).map((q: any) => (
                  <div key={q.number} style={{ padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <b>{q.number}. [{q.subject}]</b> {q.content}
                    <div style={{ color: '#374151' }}>{(q.choices || []).map((c: string, i: number) => `${i + 1}) ${c}`).join('  ')} / 정답 {q.answer}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
