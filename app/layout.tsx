
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{margin:0, fontFamily:'system-ui, sans-serif', background:'#0F0F0F'}}>{children}</body>
    </html>
  )
}
