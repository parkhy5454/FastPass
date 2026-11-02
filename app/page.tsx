'use client'
export default function Home() {
  return (
    <main style={{minHeight:'100vh', background:'#0F0F0F', color:'white', padding:'24px'}}>
      <div style={{maxWidth:'420px', margin:'0 auto'}}>
        <h1 style={{fontSize:'32px', fontWeight:900}}>⚡ 전기 패스트패스</h1>
        <p style={{color:'#FFD60A', marginTop:'8px'}}>기능사부터 기술사까지, 6단계 올인원</p>
        <div style={{marginTop:'32px', display:'grid', gap:'12px'}}>
          <a href="/login" style={{background:'#FFD60A', color:'black', borderRadius:'16px', padding:'20px', textAlign:'center', fontWeight:'bold', textDecoration:'none'}}>로그인</a>
          <a href="/signup" style={{background:'#27272a', borderRadius:'16px', padding:'20px', textAlign:'center', color:'white', textDecoration:'none'}}>회원가입</a>
          <a href="/admin" style={{background:'#27272a', borderRadius:'16px', padding:'20px', textAlign:'center', color:'white', textDecoration:'none'}}>관리자</a>
        </div>
        <div style={{marginTop:'40px', fontSize:'12px', color:'#71717a'}}>GitHub + Neon + Vercel 배포 완료</div>
      </div>
    </main>
  )
}