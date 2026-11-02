
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
      <body style={{margin:0, fontFamily:'Pretendard, system-ui, sans-serif', background:'#F8F9FB', color:'#111827'}}>{children}</body>
    </html>
  )
}
