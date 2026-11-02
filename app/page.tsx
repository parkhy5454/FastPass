
'use client'
export default function Home(){
  return (
    <main style={{minHeight:'100vh', background:'#F8F9FB', color:'#111827', padding:'24px'}}>
      <div style={{maxWidth:'420px', margin:'0 auto'}}>
        <div style={{background:'white', borderRadius:'24px', padding:'32px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', marginTop:'40px'}}>
          <h1 style={{fontSize:'32px', fontWeight:900, margin:0}}>⚡ 전기 패스트패스</h1>
          <p style={{color:'#6B7280', marginTop:'8px'}}>기능사부터 기술사까지, 6단계 올인원</p>
          <div style={{marginTop:'32px', display:'grid', gap:'12px'}}>
            <a href="/login" style={{background:'#FFD60A', color:'black', borderRadius:'16px', padding:'18px', textAlign:'center', fontWeight:800, textDecoration:'none', display:'block'}}>로그인</a>
            <a href="/signup" style={{background:'#111827', borderRadius:'16px', padding:'18px', textAlign:'center', color:'white', textDecoration:'none', display:'block', fontWeight:700}}>회원가입</a>
            <a href="/admin" style={{background:'#F3F4F6', borderRadius:'16px', padding:'18px', textAlign:'center', color:'#374151', textDecoration:'none', display:'block', fontWeight:600, border:'1px solid #E5E7EB'}}>관리자 대시보드</a>
          </div>
          <div style={{marginTop:'24px', fontSize:'12px', color:'#9CA3AF', textAlign:'center'}}>최근 10년 기출 + 예상 300제 + 취업 정보</div>
        </div>
      </div>
    </main>
  )
}
