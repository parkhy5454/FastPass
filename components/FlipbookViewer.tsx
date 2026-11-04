
'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  pdfUrl?: string
  title: string
  pages?: string[] // image urls
  allowDownload?: boolean
}

export default function FlipbookViewer({ pdfUrl, title, pages = [], allowDownload = true }: Props){
  const [currentPage, setCurrentPage] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<'next'|'prev'>('next')
  const audioRef = useRef<HTMLAudioElement>(null)
  const totalPages = pages.length || 10 // fallback

  function playFlipSound(){
    try{
      if(audioRef.current){
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(()=>{})
      }
    }catch{}
  }

  function nextPage(){
    if(currentPage >= totalPages - 1 || isFlipping) return
    setFlipDirection('next')
    setIsFlipping(true)
    playFlipSound()
    setTimeout(()=>{
      setCurrentPage(p=>p+1)
      setIsFlipping(false)
    }, 400)
  }

  function prevPage(){
    if(currentPage <= 0 || isFlipping) return
    setFlipDirection('prev')
    setIsFlipping(true)
    playFlipSound()
    setTimeout(()=>{
      setCurrentPage(p=>p-1)
      setIsFlipping(false)
    }, 400)
  }

  function handleDownload(){
    if(pdfUrl){
      const a = document.createElement('a')
      a.href = pdfUrl
      a.download = `${title}.pdf`
      a.target = '_blank'
      a.click()
    } else {
      alert('PDF 다운로드 링크가 없습니다. 관리자에게 문의하세요.')
    }
  }

  return (
    <div style={{width:'100%', maxWidth:'800px', margin:'0 auto', position:'relative'}}>
      {/* Sound element - paper flip */}
      <audio ref={audioRef} preload="auto">
        <source src="https://cdn.pixabay.com/audio/2022/03/24/audio_2a8ab2e7e1.mp3" type="audio/mpeg" />
      </audio>

      {/* Header with download */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', background:'white', padding:'12px 16px', borderRadius:'12px'}}>
        <div style={{fontWeight:800, fontSize:'14px', flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{title}</div>
        <div style={{display:'flex', gap:'8px', marginLeft:'12px'}}>
          <span style={{fontSize:'11px', color:'#6B7280', background:'#F3F4F6', padding:'6px 10px', borderRadius:'8px'}}>{currentPage+1} / {totalPages}</span>
          {allowDownload && (
            <button onClick={handleDownload} style={{background:'#FFD60A', border:'none', borderRadius:'8px', padding:'6px 14px', fontSize:'12px', fontWeight:700, cursor:'pointer'}}>📥 PDF 다운</button>
          )}
        </div>
      </div>

      {/* Flipbook container */}
      <div style={{position:'relative', width:'100%', aspectRatio:'3/4', background:'#111827', borderRadius:'16px', overflow:'hidden', boxShadow:'0 20px 40px rgba(0,0,0,0.3)', perspective:'2000px'}}>
        {/* Left page shadow */}
        <div style={{position:'absolute', left:0, top:0, width:'50%', height:'100%', background:'linear-gradient(to right, rgba(0,0,0,0.1), transparent)', zIndex:1, pointerEvents:'none'}} />

        {/* Current page */}
        <div style={{
          position:'absolute', inset:0,
          background: pages[currentPage] ? `url(${pages[currentPage]}) center/cover` : '#FFFBEB',
          display:'flex', alignItems:'center', justifyContent:'center',
          transform: isFlipping ? (flipDirection==='next' ? 'rotateY(-20deg)' : 'rotateY(20deg)') : 'rotateY(0deg)',
          transformOrigin: flipDirection==='next' ? 'left center' : 'right center',
          transition:'transform 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
          transformStyle:'preserve-3d',
          zIndex: isFlipping ? 2 : 1,
        }}>
          {!pages[currentPage] && (
            <div style={{textAlign:'center', padding:'20px'}}>
              <div style={{fontSize:'48px', marginBottom:'12px'}}>📄</div>
              <div style={{fontWeight:700}}>{title}</div>
              <div style={{fontSize:'12px', color:'#6B7280', marginTop:'8px'}}>페이지 {currentPage+1}</div>
              <div style={{fontSize:'11px', color:'#9CA3AF', marginTop:'12px', lineHeight:'1.5'}}>
                실제 PDF 업로드 후<br/>여기에 PDF 페이지가<br/>플립북으로 표시됩니다
              </div>
            </div>
          )}
        </div>

        {/* Next page preview during flip */}
        {isFlipping && (
          <div style={{
            position:'absolute', inset:0,
            background: pages[flipDirection==='next' ? currentPage+1 : currentPage-1] ? `url(${pages[flipDirection==='next' ? currentPage+1 : currentPage-1]}) center/cover` : '#FFFFFF',
            zIndex:1,
          }} />
        )}

        {/* Page curl effect - corner */}
        <div style={{
          position:'absolute',
          bottom:0, right:0,
          width:'60px', height:'60px',
          background:'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.2))',
          borderTopLeftRadius:'16px',
          zIndex:3,
          pointerEvents:'none',
          opacity: isFlipping ? 0 : 0.6,
          transition:'opacity 0.3s'
        }} />

        {/* Click areas for navigation */}
        <div onClick={prevPage} style={{position:'absolute', left:0, top:0, width:'50%', height:'100%', zIndex:4, cursor: currentPage>0 ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'flex-start', paddingLeft:'12px'}}>
          {currentPage>0 && <div style={{background:'rgba(0,0,0,0.5)', color:'white', borderRadius:'50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>‹</div>}
        </div>
        <div onClick={nextPage} style={{position:'absolute', right:0, top:0, width:'50%', height:'100%', zIndex:4, cursor: currentPage < totalPages-1 ? 'pointer' : 'default', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:'12px'}}>
          {currentPage < totalPages-1 && <div style={{background:'rgba(0,0,0,0.5)', color:'white', borderRadius:'50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>›</div>}
        </div>
      </div>

      {/* Controls */}
      <div style={{display:'flex', gap:'8px', marginTop:'16px'}}>
        <button onClick={prevPage} disabled={currentPage===0 || isFlipping} style={{flex:1, padding:'14px', borderRadius:'12px', border:'none', background: currentPage===0 ? '#F3F4F6' : '#111827', color: currentPage===0 ? '#9CA3AF' : 'white', fontWeight:700, cursor: currentPage===0 ? 'not-allowed' : 'pointer'}}>‹ 이전</button>
        <button onClick={nextPage} disabled={currentPage>=totalPages-1 || isFlipping} style={{flex:1, padding:'14px', borderRadius:'12px', border:'none', background: currentPage>=totalPages-1 ? '#F3F4F6' : '#FFD60A', color: currentPage>=totalPages-1 ? '#9CA3AF' : '#111827', fontWeight:800, cursor: currentPage>=totalPages-1 ? 'not-allowed' : 'pointer'}}>다음 ›</button>
      </div>

      {/* Progress bar */}
      <div style={{marginTop:'12px', background:'#E5E7EB', borderRadius:'10px', height:'6px', overflow:'hidden'}}>
        <div style={{width:`${((currentPage+1)/totalPages)*100}%`, height:'100%', background:'#FFD60A', transition:'width 0.4s'}} />
      </div>

      {/* Sound toggle and info */}
      <div style={{marginTop:'12px', background:'white', borderRadius:'12px', padding:'12px', fontSize:'11px', color:'#6B7280', display:'flex', justifyContent:'space-between'}}>
        <span>🔊 페이지 넘길 때 종이 소리 + 말리는 효과</span>
        <span>👆 클릭 또는 버튼으로 넘기기</span>
      </div>

      {allowDownload && pdfUrl && (
        <div style={{marginTop:'12px', background:'#ECFDF5', borderRadius:'12px', padding:'12px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{fontSize:'12px'}}><span style={{fontWeight:700}}>📥 PDF 원본 다운로드 가능</span><br/><span style={{fontSize:'11px', color:'#6B7280'}}>{title}.pdf</span></div>
          <button onClick={handleDownload} style={{background:'#10B981', color:'white', border:'none', borderRadius:'10px', padding:'10px 16px', fontSize:'12px', fontWeight:700, cursor:'pointer'}}>다운로드</button>
        </div>
      )}
    </div>
  )
}
