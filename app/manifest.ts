
import { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '자격증 패스트패스',
    short_name: '패스트패스',
    description: '전기·토목·정보통신 등 모든 자격증 기출/예상문제',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F9FB',
    theme_color: '#FFD60A',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
