'use client'
import { useEffect, useState } from 'react'

// 문제풀이: 응시 기록 목록과, 제출한 응시의 정답·해설
export default function ProblemsPage() {
  const [cert, setCert] = useState('')
  const [attemptId, setAttemptId] = useState('')
  const [list, setList] = useState<any[]>([])
  const [detail, setDetail] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const c = sp.get('cert') || ''
    const a = sp.get('attempt') || ''
    setCert(c); setAttemptId(a)
    if (a) {
      fetch(`/api/exam/attempts/${a}`, { credentials: 'include', cache: 'no-store' })
        .then(async r => { const d = await r.json(); if (!r.ok) setError(d.error || '불러오기 실패'); else setDetail(d) })
        .catch(() => setError('네트워크 오류'))
    } else {
      fetch(`/api/exam/attempts${c ? `?category=${encodeURIComponent(c)}` : ''}`, { credentials: 'include', cache: 'no-store' })
        .then(async r => { const d = await r.json(); if (!r.ok) setError(d.error || '불러오기 실패'); else setList(d.attempts || []) })
        .catch(() => setError('네트워크 오류'))
    }
  }, [])

  const wrap: React.CSSProperties = { padding: 16, background: '#F8F9FB', minHeight: '100vh' }
  const card: React.CSSProperties = { background: 'white', borderRadius: 12, padding: 14, marginBottom: 10, border: '1px solid #EEF2F7' }

  if (attemptId) {
    return (
      <main style={wrap}>
        <a href={`/learn/problems${cert ? `?cert=${encodeURIComponent(cert)}` : ''}`} style={{ fontSize: 13 }}>← 응시 기록</a>
        {error && <div style={{ color: '#B91C1C', marginTop: 10 }}>{error}</div>}
        {detail && (
          <>
            <div style={{ ...card, marginTop: 10 }}>
              <div style={{ fontWeight: 800 }}>{detail.attempt.category} · {detail.attempt.round}</div>
              <div style={{ fontSize: 28, fontWeight: 900, margin: '6px 0' }}>{detail.attempt.total}점 <span style={{ fontSize: 14, color: detail.attempt.passed ? '#15803D' : '#B91C1C' }}>{detail.attempt.passed ? '합격' : '불합격'}</span></div>
              {detail.attempt.timedOut && <div style={{ fontSize: 12, color: '#B45309' }}>시간 초과 후 제출되었습니다</div>}
              {detail.attempt.result?.bySubject && Object.entries(detail.attempt.result.bySubject).map(([k, v]: any) => (
                <div key={k} style={{ fontSize: 13 }}>{k}: {v.score}점 ({v.correct}/{v.total})</div>
              ))}
            </div>
            {detail.questions.map((q: any) => (
              <div key={q.id} style={card}>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{q.subject} · {q.number}번 · {q.correct ? '정답' : q.mine ? '오답' : '미응답'}</div>
                <div style={{ fontWeight: 700, margin: '6px 0', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{q.content}</div>
                {q.choices.map((c: string, i: number) => {
                  const isAnswer = i + 1 === q.answer
                  const isMine = i + 1 === q.mine
                  return (
                    <div key={i} style={{ padding: '8px 10px', marginBottom: 6, borderRadius: 8, fontSize: 13, background: isAnswer ? '#DCFCE7' : isMine ? '#FEE2E2' : '#F8FAFC', border: '1px solid #E5E7EB' }}>
                      {i + 1}. {c} {isAnswer && '✔ 정답'} {isMine && !isAnswer && '· 내 답'}
                    </div>
                  )
                })}
                {q.explanation && <div style={{ fontSize: 13, color: '#374151', marginTop: 8, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}><b>해설</b> {q.explanation}</div>}
                <div style={{ marginTop: 10, textAlign: 'right' }}>
                  <a href={`/inquiry?category=${encodeURIComponent('오답')}&ref=${encodeURIComponent(q.id)}&info=${encodeURIComponent(`${detail.attempt.category} ${detail.attempt.round} ${q.number}번`)}`}
                    style={{ fontSize: 12, color: '#B91C1C', fontWeight: 700, textDecoration: 'none', border: '1px solid #FECACA', borderRadius: 8, padding: '6px 10px', background: '#FFF5F5' }}>
                    이 문제 오류 신고
                  </a>
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    )
  }

  return (
    <main style={wrap}>
      <a href="/learn" style={{ fontSize: 13 }}>← 학습으로</a>
      <h1 style={{ fontSize: 18, fontWeight: 800, margin: '12px 0' }}>{cert || '전체'} 문제풀이 기록</h1>
      {error && <div style={{ color: '#B91C1C' }}>{error}</div>}
      {!error && list.length === 0 && <div style={{ color: '#6B7280' }}>아직 응시 기록이 없습니다. 모의고사를 풀어 보세요.</div>}
      {list.map(a => (
        <a key={a.id} href={`/learn/problems?attempt=${a.id}${cert ? `&cert=${encodeURIComponent(cert)}` : ''}`} style={{ ...card, display: 'block', textDecoration: 'none', color: '#111827' }}>
          <div style={{ fontWeight: 800 }}>{a.category} · {a.round}</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>{new Date(a.startedAt).toLocaleString('ko-KR')} · {a.submittedAt ? `${a.total}점 ${a.passed ? '합격' : '불합격'}` : '미제출'}</div>
        </a>
      ))}
    </main>
  )
}
