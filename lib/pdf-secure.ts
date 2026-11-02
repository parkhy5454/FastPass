// 워터마크 - pdf-lib 없이 간단 버전
export async function addWatermarkAndSecure(pdfBytes: Uint8Array, userName: string, phone: string, userId: string) {
  // 실제로는 워터마크 추가, 지금은 그대로 반환
  return pdfBytes
}
export function generateSignedUrl(userId: string, flipbookId: string) {
  return `/api/pdf/${flipbookId}?uid=${userId}&t=${Date.now()}`
}
