'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['버그', '건의', '오답', '기타']
const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  '접수': { bg: '#FFF9DB', color: '#8A6D00' },
  '확인': { bg: '#E3F2FD', color: '#1565C0' },
  '처리완료': { bg: '#E8F5E9', color: '#2E7D32' },
}

export default function InquiryPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'write' | 'mine'>('write')
  const [category, setCategory] = useState('버그')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [refId, setRefId] = useState('')
  const [refInfo, setRefInfo] = useState('')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // 오답 정정 등에서 넘어오면 문항 정보를 미리 채웁니다. 예: /inquiry?category=오답&ref=ID&info=...
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const c = sp.get('category'); if (c && CATEGORIES.includes(c)) { setCategory(c); setTab('write') }
      const r = sp.get('ref'); if (r) setRefId(r)
      const i = sp.get('info'); if (i) setRefInfo(i)
      if (sp.get('tab') === 'mine') setTab('mine')
    } catch {}
  }, [])

  async function loadMine() {
    const res = await fetch('/api/inquiries', { credentials: 'include' })
    if (res.status === 401) return router.push('/login')
    const d = await res.json()
    setItems(d.items || [])
  }
  useEffect(() => { if (tab === 'mine') loadMine() }, [tab])

  async function submit() {
    setLoading(true)
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ category, title, body, refId, refInfo }),
      })
      const d = await res.json()
      if (res.status === 401) return router.push('/login')
      if (!res.ok) throw new Error(d.error || '등록 실패')
      alert('문의가 접수되었습니다. 답변은 "내 문의"에서 확인하실 수 있습니다.')
      setTitle(''); setBody(''); setRefId(''); setRefInfo('')
      setTab('mine')
    } catch (e: any) { alert(e.message) } finally { setLoading(false) }
  }

  const input: React.CSSProperties = { width: '100%', padding: 12, borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box' }

  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', padding: 16, paddingBottom: 100 }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>문의함</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {(['write', 'mine'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', fontWeight: 700, background: tab === t ? '#1a1a2e' : 'white', color: tab === t ? 'white' : '#666' }}>
              {t === 'write' ? '문의 작성' : '내 문의'}
            </button>
          ))}
        </div>

        {tab === 'write' && (
          <div style={{ background: 'white', borderRadius: 14, padding: 16, border: '1px solid #EEF2F7', display: 'grid', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>문의 종류</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)} style={{ padding: '8px 12px', borderRadius: 8, border: category === c ? '2px solid #2B5CE6' : '1px solid #E5E7EB', background: category === c ? '#EFF6FF' : 'white', fontWeight: 700, fontSize: 13 }}>{c}</button>
                ))}
              </div>
            </div>
            {refInfo && <div style={{ fontSize: 12, color: '#374151', background: '#F3F4F6', padding: 10, borderRadius: 8 }}>대상 문항: {refInfo}</div>}
            <input style={input} placeholder="제목" value={title} maxLength={100} onChange={e => setTitle(e.target.value)} />
            <textarea style={{ ...input, minHeight: 160, resize: 'vertical' }} placeholder="내용을 자세히 적어 주세요 (5~2000자). 연락처 등 개인정보는 적지 마세요." value={body} maxLength={2000} onChange={e => setBody(e.target.value)} />
            <button onClick={submit} disabled={loading} style={{ padding: 14, borderRadius: 12, border: 'none', background: loading ? '#ccc' : '#2B5CE6', color: 'white', fontWeight: 800 }}>{loading ? '등록 중...' : '문의 등록'}</button>
          </div>
        )}

        {tab === 'mine' && (
          <div style={{ display: 'grid', gap: 10 }}>
            {items.length === 0 && <div style={{ textAlign: 'center', color: '#6B7280', padding: 30, background: 'white', borderRadius: 14 }}>등록한 문의가 없습니다</div>}
            {items.map(it => (
              <div key={it.id} style={{ background: 'white', borderRadius: 14, padding: 14, border: '1px solid #EEF2F7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>{it.category}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: STATUS_STYLE[it.status]?.bg, color: STATUS_STYLE[it.status]?.color }}>{it.status}</span>
                </div>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>{it.title}</div>
                {it.refInfo && <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>{it.refInfo}</div>}
                <div style={{ fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap' }}>{it.body}</div>
                {it.adminReply && <div style={{ marginTop: 10, padding: 10, background: '#F0F7FF', borderRadius: 8, fontSize: 13, whiteSpace: 'pre-wrap' }}><b>답변</b><br />{it.adminReply}</div>}
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 8 }}>{new Date(it.createdAt).toLocaleString('ko-KR')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
