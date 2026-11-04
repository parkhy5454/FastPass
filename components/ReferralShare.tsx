
'use client'
import { useState } from 'react'

export default function ReferralShare({user, stats}: {user:any, stats:any}){
  const [copied, setCopied] = useState('')
  const loginId = user?.loginId || 'user'
  const code = `${loginId}-${Math.random().toString(36).slice(2,6).toUpperCase()}`
  const link = typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${loginId}` : ''

  function copy(text:string, type:string){
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(()=>setCopied(''), 2000)
  }

  return (
    <div>
      <div style={{fontSize:16, fontWeight:800, marginBottom:4, color:'#1a1a2e'}}>🎁 친구 추천</div>
      <div style={{fontSize:12, color:'#888', marginBottom:16}}>친구가 가입하면 1,000P, 결제하면 5,000P!</div>

      {/* 추천 코드 - 밝은 디자인 */}
      <div style={{background:'#F8F9FA', borderRadius:12, padding:14, marginBottom:12, border:'1px solid #EEF2F7'}}>
        <div style={{fontSize:11, color:'#888', marginBottom:6, fontWeight:600}}>내 추천 코드</div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <div style={{flex:1, background:'white', border:'1px solid #E9ECEF', borderRadius:10, padding:'12px 14px', fontWeight:800, fontSize:15, color:'#1a1a2e', letterSpacing:'0.5px'}}>{code}</div>
          <button 
            onClick={()=>copy(code, 'code')} 
            style={{
              padding:'12px 18px', 
              background: copied==='code' ? '#34A853' : '#FFD600', 
              color: copied==='code' ? 'white' : '#1a1a2e', 
              border:'none', 
              borderRadius:10, 
              fontSize:13, 
              fontWeight:700, 
              cursor:'pointer',
              boxShadow: '0 2px 8px rgba(255,214,0,0.3)',
              transition:'all 0.2s',
              display:'flex', alignItems:'center', gap:6
            }}
          >
            {copied==='code' ? '✓ 복사됨' : '🔗 복사'}
          </button>
        </div>
      </div>

      {/* 추천 링크 */}
      <div style={{background:'#F8F9FA', borderRadius:12, padding:14, marginBottom:16, border:'1px solid #EEF2F7'}}>
        <div style={{fontSize:11, color:'#888', marginBottom:6, fontWeight:600}}>내 추천 링크</div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <div style={{flex:1, background:'white', border:'1px solid #E9ECEF', borderRadius:10, padding:'12px 14px', fontSize:12, color:'#666', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{link}</div>
          <button 
            onClick={()=>copy(link, 'link')} 
            style={{
              padding:'12px 18px', 
              background: copied==='link' ? '#34A853' : 'white', 
              color: copied==='link' ? 'white' : '#1a1a2e', 
              border: copied==='link' ? 'none' : '1.5px solid #E9ECEF', 
              borderRadius:10, 
              fontSize:13, 
              fontWeight:700, 
              cursor:'pointer',
              transition:'all 0.2s',
              whiteSpace:'nowrap'
            }}
          >
            {copied==='link' ? '✓ 복사됨' : '복사'}
          </button>
        </div>
      </div>

      {/* 공유 버튼 - 밝고 컬러풀하게! */}
      <div style={{background:'#FFF9DB', border:'1.5px solid #FFE066', borderRadius:14, padding:16, marginBottom:16}}>
        <div style={{fontSize:13, fontWeight:700, marginBottom:12, color:'#1a1a2e'}}>📤 친구에게 공유하기</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
          <button 
            onClick={()=>{ if(navigator.share) navigator.share({title:'자격증 패스트패스', text:'자격증 공부 같이 하자!', url:link}).catch(()=>{}) }} 
            style={{
              padding:'12px 8px', 
              background:'#FEE500', 
              border:'none', 
              borderRadius:12, 
              fontSize:12, 
              fontWeight:700, 
              cursor:'pointer',
              color:'#3C1E1E',
              display:'flex', flexDirection:'column', alignItems:'center', gap:4,
              boxShadow:'0 2px 8px rgba(254,229,0,0.3)'
            }}
          >
            <span style={{fontSize:18}}>💬</span>카톡 공유
          </button>
          <button 
            onClick={()=>copy(link, 'share')} 
            style={{
              padding:'12px 8px', 
              background: copied==='share' ? '#34A853' : 'white', 
              border: copied==='share' ? 'none' : '1.5px solid #E9ECEF', 
              borderRadius:12, 
              fontSize:12, 
              fontWeight:700, 
              cursor:'pointer',
              color: copied==='share' ? 'white' : '#1a1a2e',
              display:'flex', flexDirection:'column', alignItems:'center', gap:4,
              transition:'all 0.2s'
            }}
          >
            <span style={{fontSize:18}}>{copied==='share' ? '✓' : '🔗'}</span>{copied==='share' ? '복사됨!' : '링크 복사'}
          </button>
          <button 
            onClick={()=>window.open(`sms:?&body=${encodeURIComponent('자격증 패스트패스 추천! '+link)}`)} 
            style={{
              padding:'12px 8px', 
              background:'white', 
              border:'1.5px solid #E9ECEF', 
              borderRadius:12, 
              fontSize:12, 
              fontWeight:700, 
              cursor:'pointer',
              color:'#1a1a2e',
              display:'flex', flexDirection:'column', alignItems:'center', gap:4
            }}
          >
            <span style={{fontSize:18}}>💌</span>문자 공유
          </button>
        </div>
      </div>

      {/* 친구추천 버튼 - 밝은 노란색! */}
      <div style={{display:'flex', gap:8, marginBottom:16}}>
        <button 
          style={{
            flex:1,
            padding:'14px', 
            background:'linear-gradient(135deg, #FFD600 0%, #FFB800 100%)', 
            border:'none', 
            borderRadius:12, 
            fontSize:14, 
            fontWeight:800, 
            cursor:'pointer',
            color:'#1a1a2e',
            boxShadow:'0 4px 12px rgba(255,214,0,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6
          }}
        >
          🎁 친구추천
        </button>
        <button 
          style={{
            flex:1,
            padding:'14px', 
            background:'white', 
            border:'1.5px solid #E9ECEF', 
            borderRadius:12, 
            fontSize:14, 
            fontWeight:700, 
            cursor:'pointer',
            color:'#1a1a2e',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6
          }}
        >
          📊 추천 현황
        </button>
      </div>

      {/* 추천 현황 */}
      {stats?.referredUsers?.length > 0 && (
        <div style={{background:'white', border:'1px solid #EEF2F7', borderRadius:12, padding:14}}>
          <div style={{fontSize:13, fontWeight:700, marginBottom:10, color:'#1a1a2e'}}>👥 추천한 친구 {stats.referredUsers.length}명</div>
          {stats.referredUsers.slice(0,5).map((u:any)=>(
            <div key={u.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #F1F3F5', fontSize:13}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <div style={{width:28, height:28, background:'#F1F3F5', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700}}>{(u.name||u.loginId||'U')[0]}</div>
                <span style={{fontWeight:600, color:'#1a1a2e'}}>{u.name||u.loginId}</span>
              </div>
              <span style={{background: u.hasPaid ? '#E6F4EA' : '#F1F3F5', color: u.hasPaid ? '#137333' : '#888', fontSize:11, padding:'4px 8px', borderRadius:12, fontWeight:600}}>{u.hasPaid ? '💰 결제 +5000P' : '✅ 가입 +1000P'}</span>
            </div>
          ))}
        </div>
      )}

      {(!stats?.referredUsers || stats.referredUsers.length===0) && (
        <div style={{background:'white', border:'1px dashed #E9ECEF', borderRadius:12, padding:24, textAlign:'center'}}>
          <div style={{fontSize:32, marginBottom:8}}>🎁</div>
          <div style={{fontSize:13, color:'#888', fontWeight:500}}>아직 추천한 친구가 없어요</div>
          <div style={{fontSize:11, color:'#AAA', marginTop:4}}>위 링크를 친구에게 공유해보세요!</div>
        </div>
      )}
    </div>
  )
}
