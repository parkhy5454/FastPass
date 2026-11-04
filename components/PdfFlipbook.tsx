'use client'
import { useEffect, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'

// PDF를 페이지 이미지로 그린 뒤 책장처럼 넘겨 보여 주는 플립북입니다.
type Props = { url: string; title: string }

let pdfjsPromise: Promise<any> | null = null
function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((m: any) => {
      m.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
      return m
    })
  }
  return pdfjsPromise
}

// 넘김 소리: 종이가 스치는 소리를 노이즈 + 필터 + 떨림으로 합성합니다(외부 음원 없음).
let audioCtx: AudioContext | null = null
function playPageSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const ctx = audioCtx
    if (ctx.state === 'suspended') ctx.resume()
    const dur = 0.6
    const len = Math.floor(ctx.sampleRate * dur)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const t = i / len
      // 천천히 올라갔다 길게 줄어드는 포락선
      const env = Math.sin(Math.PI * Math.min(1, t * 1.6)) * Math.pow(1 - t, 1.6)
      // 종이 결을 흉내 내는 빠른 떨림
      const flutter = 0.55 + 0.45 * Math.sin(i * 0.035 + Math.random() * 0.8)
      data[i] = (Math.random() * 2 - 1) * env * flutter
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 900
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 3000
    bp.Q.value = 0.5
    const gain = ctx.createGain()
    gain.gain.value = 0.35
    src.connect(hp).connect(bp).connect(gain).connect(ctx.destination)
    src.start()
  } catch {
    // 소리 재생이 막혀 있으면 조용히 넘어갑니다.
  }
}

export default function PdfFlipbook({ url, title }: Props) {
  const [pages, setPages] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')
  const [soundOn, setSoundOn] = useState(true)
  const soundRef = useRef(true)
  const flipRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const pdfjs = await loadPdfjs()
        const doc = await pdfjs.getDocument({ url }).promise
        if (cancelled) return
        setTotal(doc.numPages)
        const out: string[] = []
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i)
          const viewport = page.getViewport({ scale: 1.4 })
          const canvas = document.createElement('canvas')
          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('canvas')
          await page.render({ canvasContext: ctx, viewport }).promise
          out.push(canvas.toDataURL('image/jpeg', 0.85))
          if (cancelled) return
          setProgress(i)
          setPages([...out])
        }
      } catch (e: any) {
        if (!cancelled) setError('PDF를 불러오지 못했습니다. 저장소 설정(CORS)을 확인해 주세요.')
        console.error('PdfFlipbook load error:', e?.message)
      }
    })()
    return () => { cancelled = true }
  }, [url])

  useEffect(() => { soundRef.current = soundOn }, [soundOn])

  const onFlip = () => { if (soundRef.current) playPageSound() }
  const prev = () => flipRef.current?.pageFlip()?.flipPrev('bottom')
  const next = () => flipRef.current?.pageFlip()?.flipNext('bottom')

  if (error) return <div style={{ padding: 20, color: '#B91C1C', background: 'white', borderRadius: 12 }}>{error}</div>

  const ready = pages.length > 0
  const pageW = 560
  const pageH = 792

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '16px 8px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={prev} disabled={!ready} style={btn}>◀ 이전</button>
        <button onClick={next} disabled={!ready} style={btn}>다음 ▶</button>
        <button onClick={() => setSoundOn(s => !s)} style={btn}>{soundOn ? '🔊 소리 켬' : '🔇 소리 끔'}</button>
        <span style={{ fontSize: 12, color: '#6B7280' }}>{ready ? `${title}` : `페이지 준비 중 ${progress}/${total || '?'}`}</span>
      </div>

      {!ready && <div style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>로딩 중...</div>}

      {ready && (
        <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
          <HTMLFlipBook
            ref={flipRef}
            width={pageW}
            height={pageH}
            size="stretch"
            minWidth={280}
            maxWidth={pageW}
            minHeight={400}
            maxHeight={pageH}
            showCover={false}
            usePortrait={true}
            drawShadow={true}
            flippingTime={700}
            mobileScrollSupport={false}
            onFlip={onFlip}
            className="pdf-flipbook"
            style={{}}
            startPage={0}
            maxShadowOpacity={0.5}
            showPageCorners={true}
            disableFlipByClick={false}
            useMouseEvents={true}
            swipeDistance={30}
            clickEventForward={true}
            startZIndex={0}
            autoSize={true}
          >
            {pages.map((src, i) => (
              <div key={i} style={{ background: 'white' }}>
                <img src={src} alt={`${title} ${i + 1}페이지`} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' }} draggable={false} />
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      )}

      {ready && <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: '#6B7280' }}>{pages.length} / {total} 페이지 · 모서리를 끌거나 버튼으로 넘기세요</div>}
    </div>
  )
}

const btn: React.CSSProperties = { padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 10, background: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }
