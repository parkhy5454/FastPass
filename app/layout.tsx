
import BottomTabs from '@/components/BottomTabs'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{margin:0, fontFamily:'Pretendard, system-ui, sans-serif', background:'#F8F9FB', color:'#111827'}}>
        <div style={{maxWidth:'480px', margin:'0 auto', minHeight:'100vh', background:'#F8F9FB', paddingBottom:'80px'}}>
          {children}
        </div>
        <BottomTabs />
      </body>
    </html>
  )
}
