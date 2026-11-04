'use client'
import { useEffect, useMemo, useRef, useState } from 'react'

type Q = { id: string; subject: string; number: number; content: string; choices: string[] }
type Round = { round: string; questionCount: number; durationMin: number; passScore: number; status: 'done' | 'open' | null }

// 실제 시험처럼 시간을 재고, 끝나면 자동으로 제출합니다.
export default function MockExamPage() {
  const [cert, setCert] = useState('')
  const [rounds, setRounds] = useState<Round[]>([])
  const [error, setError] = useState('')
  const [attemptId, setAttemptId] = useState('')
  const [questions, setQuestions] = useState<Q[]>([])
  const [deadline, setDeadline] = useState(0)
  const [offset, setOffset] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [cur, setCur] = useState(0)
  const [autoNext, setAutoNext] = useState(true)
  useEffect(() => {
    try { const v = localStorage.getItem('mock-auto-next'); if (v !== null) setAutoNext(v === '1') } catch {}
  }, [])
  const toggleAutoNext = (on: boolean) => {
    setAutoNext(on)
    try { localStorage.setItem('mock-auto-next', on ? '1' : '0') } catch {}
  }
  const [result, setResult] = useState<any>(null)
  const submittingRef = useRef(false)

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('cert') || '전기기사'
    setCert(c)
    fetch(`/api/exam/rounds?category=${encodeURIComponent(c)}`, { credentials: 'include', cache: 'no-store' })
      .then(async r => { const d = await r.json(); if (!r.ok) setError(d.error || '불러오기 실패'); else setRounds(d.rounds || []) })
      .catch(() => setError('네트워크 오류'))
  }, [])

  // 화면 시계 (1초마다)
  useEffect(() => {
    if (!attemptId || result) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [attemptId, result])

  const remainMs = deadline ? deadline - (now + offset) : 0

  async function submit(auto: boolean) {
    if (submittingRef.current || !attemptId) return
    submittingRef.current = true
    try {
      const res = await fetch('/api/exam/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ attemptId, answers }),
      })
      const d = await res.json()
      if (!res.ok) { setError(d.error || '제출 실패'); submittingRef.current = false; return }
      setResult({ ...d, auto })
    } catch {
      setError('네트워크 오류로 제출하지 못했습니다. 다시 눌러 주세요.')
      submittingRef.current = false
    }
  }

  // 시간이 끝나면 자동 제출
  useEffect(() => {
    if (attemptId && !result && deadline && remainMs <= 0) submit(true)
  }, [remainMs, attemptId, result, deadline])

  async function start(r: Round) {
    setError('')
    const res = await fetch('/api/exam/start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ category: cert, round: r.round }),
    })
    const d = await res.json()
    if (!res.ok) return setError(d.error || '시작 실패')
    const serverNowMs = Date.parse(d.serverNow)
    setOffset(serverNowMs - Date.now())
    setNow(Date.now())
    setDeadline(Date.parse(d.deadlineAt))
    setAttemptId(d.attemptId)
    setQuestions(d.questions)
    setAnswers({})
    setCur(0)
    submittingRef.current = false
  }

  const mm = Math.max(0, Math.floor(remainMs / 1000))
  const timeText = `${String(Math.floor(mm / 3600)).padStart(2, '0')}:${String(Math.floor((mm % 3600) / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])

  if (result) {
    return (
      <main style={{ padding: 20, background: '#F8F9FB', minHeight: '100vh' }}>
        <div style={{ background: 'white', borderRadius: 14, padding: 20, border: '1px solid #EEF2F7' }}>
          <div style={{ fontSize: 13, color: '#6B7280' }}>{result.auto ? '시간이 끝나 자동 제출되었습니다' : '제출 완료'}</div>
          <div style={{ fontSize: 32, fontWeight: 900, margin: '8px 0' }}>{result.total}점 <span style={{ fontSize: 16, color: result.passed ? '#15803D' : '#B91C1C' }}>{result.passed ? '합격' : '불합격'}</span></div>
          {result.bySubject && Object.entries(result.bySubject).map(([k, v]: any) => (
            <div key={k} style={{ fontSize: 13, padding: '4px 0' }}>{k}: {v.score}점 ({v.correct}/{v.total})</div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <a href={`/learn/problems?cert=${encodeURIComponent(cert)}&attempt=${attemptId}`} style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 10, background: '#1a1a2e', color: 'white', textDecoration: 'none', fontWeight: 700 }}>정답과 해설 보기</a>
            <a href="/learn" style={{ flex: 1, textAlign: 'center', padding: 12, borderRadius: 10, border: '1px solid #E5E7EB', color: '#111827', textDecoration: 'none', fontWeight: 700 }}>학습으로</a>
          </div>
        </div>
      </main>
    )
  }

  if (!attemptId) {
    return (
      <main style={{ padding: 20, background: '#F8F9FB', minHeight: '100vh', paddingBottom: 100 }}>
        <a href="/learn" style={{ fontSize: 13 }}>← 학습으로</a>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: '12px 0' }}>{cert} 모의고사</h1>
        {error && <div style={{ color: '#B91C1C', marginBottom: 12 }}>{error}</div>}
        {rounds.length === 0 && !error && <div style={{ color: '#6B7280' }}>등록된 회차가 없습니다</div>}
        {rounds.map(r => (
          <div key={r.round} style={{ background: 'white', borderRadius: 12, padding: 14, marginBottom: 10, border: '1px solid #EEF2F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800 }}>{r.round}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{r.questionCount}문항 · {r.durationMin}분 · 합격 {r.passScore}점</div>
            </div>
            {r.status === 'done' ? (
              <span style={{ padding: '10px 14px', borderRadius: 10, background: '#E5E7EB', color: '#6B7280', fontWeight: 700, fontSize: 13 }}>응시 완료</span>
            ) : (
              <button onClick={() => start(r)} style={{ padding: '10px 14px', borderRadius: 10, border: 'none', background: '#2B5CE6', color: 'white', fontWeight: 700, cursor: 'pointer' }}>{r.status === 'open' ? '이어서 응시' : '응시'}</button>
            )}
          </div>
        ))}
      </main>
    )
  }

  const q = questions[cur]
  return (
    <main style={{ padding: 16, background: '#F8F9FB', minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ position: 'sticky', top: 0, background: '#1a1a2e', color: 'white', borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, zIndex: 5 }}>
        <span>남은 시간 {timeText}</span>
        <span>{answeredCount}/{questions.length} 응답</span>
      </div>
      {error && <div style={{ color: '#B91C1C', margin: '10px 0', fontSize: 13 }}>{error}</div>}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', marginTop: 10 }}>
        <input type="checkbox" checked={autoNext} onChange={e => toggleAutoNext(e.target.checked)} />
        답을 고르면 자동으로 다음 문제
      </label>
      {q && (
        <div style={{ background: 'white', borderRadius: 14, padding: 16, marginTop: 12, border: '1px solid #EEF2F7' }}>
          <div style={{ fontSize: 12, color: '#6B7280' }}>{q.subject} · {cur + 1}/{questions.length}번</div>
          <div style={{ fontSize: 15, fontWeight: 700, margin: '10px 0', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{q.content}</div>
          {q.choices.map((c, i) => (
            <button key={i} onClick={() => {
              setAnswers({ ...answers, [q.id]: i + 1 })
              if (autoNext && cur < questions.length - 1) {
                const from = cur
                setTimeout(() => setCur(c => (c === from ? from + 1 : c)), 300)
              }
            }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: 12, marginBottom: 8, borderRadius: 10, border: answers[q.id] === i + 1 ? '2px solid #2B5CE6' : '1px solid #E5E7EB', background: answers[q.id] === i + 1 ? '#EFF6FF' : 'white', fontSize: 14, cursor: 'pointer' }}>
              {i + 1}. {c}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button disabled={cur === 0} onClick={() => setCur(cur - 1)} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white', fontWeight: 700 }}>이전</button>
        <button disabled={cur >= questions.length - 1} onClick={() => setCur(cur + 1)} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white', fontWeight: 700 }}>다음</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4, marginTop: 14 }}>
        {questions.map((x, i) => (
          <button key={x.id} onClick={() => setCur(i)} style={{ padding: '6px 0', fontSize: 11, borderRadius: 6, border: 'none', background: i === cur ? '#2B5CE6' : answers[x.id] ? '#CBD5E1' : '#F1F5F9', color: i === cur ? 'white' : '#111827', cursor: 'pointer' }}>{i + 1}</button>
        ))}
      </div>
      <button onClick={() => { if (confirm(`${questions.length - answeredCount}문항이 비어 있습니다. 제출할까요?`)) submit(false) }}
        style={{ position: 'fixed', bottom: 'calc(84px + env(safe-area-inset-bottom))', left: 16, right: 16, maxWidth: 448, margin: '0 auto', zIndex: 40, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: 14, borderRadius: 12, border: 'none', background: '#15803D', color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
        답안 제출
      </button>
    </main>
  )
}
