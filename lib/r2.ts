import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Cloudflare R2 연결 설정. 값이 하나라도 없으면 null을 돌려줍니다.
export function getR2() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
  return { client, bucket }
}

// DB의 pdfUrl에는 객체 키(flipbooks/...)를 저장합니다.
// 예전에 저장된 공개 주소(https://.../flipbooks/...)에서도 키를 꺼낼 수 있게 합니다.
export function pdfKeyFrom(stored: string | null | undefined): string | null {
  if (!stored) return null
  const i = stored.indexOf('flipbooks/')
  if (i === -1) return null
  return stored.slice(i)
}

// 짧은 시간만 유효한 서명 주소를 만듭니다 (10분).
export async function signPdfUrl(stored: string | null | undefined): Promise<string | null> {
  const key = pdfKeyFrom(stored)
  const r2 = getR2()
  if (!key || !r2) return null
  const cmd = new GetObjectCommand({ Bucket: r2.bucket, Key: key })
  return getSignedUrl(r2.client, cmd, { expiresIn: 600 })
}
