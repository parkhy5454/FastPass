
import { NextRequest, NextResponse } from 'next/server'
// DEPRECATED - use /api/upload-pdf
export async function POST(req: NextRequest){
  return NextResponse.json({error:'이 API는 사용 안 함 - /api/upload-pdf를 사용하세요'}, {status:400})
}
