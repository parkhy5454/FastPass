'use client'
import { useState } from 'react'

const TEMPLATE = '자격증,회차,과목,문항번호,문제,보기1,보기2,보기3,보기4,정답,해설\n전기기사,2022년 2회,전기자기학,1,"예시 문제 내용",보기A,보기B,보기C,보기D,4,"해설 내용"\n'

// 관리자: CSV로 문제 일괄 등록
export default function AdminExamPage() {
  const [csv, setCsv] = useState('')
  const [durationMin, setDurationMin] = useState(150)
  const [passScore, setPassScore] = useState(60)
  const [subjectMin, setSubjectMin] = useState(0)
  const [msg, setMsg] = useState('')
  const [errors, setErrors] = useState<any[]>([])
  const [busy, setBusy] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setCsv(await f.text())
    setMsg(`${f.name} 불러옴`)
    setErrors([])
  }

  function downloadTemplate() {
    const blob = new Blob(['﻿' + TEMPLATE], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'exam_template.csv'
    a.click()
  }

  async function upload() {
    if (!csv.trim()) return setMsg('CSV 파일을 먼저 고르세요')
    setBusy(true); setMsg(''); setErrors([])
    try {
      const res = await fetch('/api/admin/exam/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ csv, durationMin, passScore, subjectMin }),
      })
      const d = await res.json()
      if (!res.ok) {
        setMsg(d.error || '업로드 실패')
        setErrors(d.errors || [])
      } else {
        setMsg(`저장 완료: 문제 ${d.questions}개, 회차 ${d.rounds}개`)
      }
    } catch {
      setMsg('네트워크 오류')
    } finally {
      setBusy(false)
    }
  }

  const box: React.CSSProperties = { background: 'white', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid #EEF2F7' }
  const input: React.CSSProperties = { padding: 8, border: '1px solid #E5E7EB', borderRadius: 8, width: 120 }

  return (
    <main style={{ padding: 20, background: '#F8F9FB', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>모의고사 문제 CSV 등록</h1>
      <div style={box}>
        <button onClick={downloadTemplate} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>빈 양식 내려받기</button>
        <div style={{ marginTop: 12 }}><input type="file" accept=".csv,text/csv" onChange={onFile} /></div>
      </div>
      <div style={box}>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>시험 설정 (회차가 처음 만들어질 때만 적용됩니다)</div>
        <label style={{ fontSize: 12, marginRight: 12 }}>시험 시간(분) <input type="number" value={durationMin} onChange={e => setDurationMin(Number(e.target.value))} style={input} /></label>
        <label style={{ fontSize: 12, marginRight: 12 }}>합격 평균(점) <input type="number" value={passScore} onChange={e => setPassScore(Number(e.target.value))} style={input} /></label>
        <label style={{ fontSize: 12 }}>과목 최저(점) <input type="number" value={subjectMin} onChange={e => setSubjectMin(Number(e.target.value))} style={input} /></label>
      </div>
      <button onClick={upload} disabled={busy} style={{ padding: '12px 16px', borderRadius: 10, border: 'none', background: '#1a1a2e', color: 'white', fontWeight: 800, cursor: 'pointer' }}>{busy ? '저장 중...' : '문제 저장'}</button>
      {msg && <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700 }}>{msg}</div>}
      {errors.length > 0 && (
        <div style={{ ...box, marginTop: 12, color: '#B91C1C', fontSize: 12 }}>
          {errors.slice(0, 50).map((e, i) => <div key={i}>{e.line}행: {e.message}</div>)}
          {errors.length > 50 && <div>…외 {errors.length - 50}건</div>}
        </div>
      )}
    </main>
  )
}
