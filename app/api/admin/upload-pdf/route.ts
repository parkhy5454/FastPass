
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT, isAdmin, validatePDFFile, validatePDFMagicBytes, sanitizeInput } from '@/lib/security'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

export async function POST(req: NextRequest){
  try{
    // 1. Auth check
    const token = cookies().get('token')?.value
    if(!token) return NextResponse.json({error:'인증 필요'},{status:401})

    const payload = verifyJWT(token)
    if(!payload || !isAdmin(payload.loginId, payload.role)){
      return NextResponse.json({error:'관리자 권한 필요'},{status:403})
    }

    // 2. Parse form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    let title = formData.get('title') as string
    let category = formData.get('category') as string
    let type = formData.get('type') as string

    if(!file) return NextResponse.json({error:'파일 필요'},{status:400})

    // 3. Validate file
    const fileError = validatePDFFile(file)
    if(fileError) return NextResponse.json({error: fileError},{status:400})

    // 4. Validate magic bytes
    const buffer = await file.arrayBuffer()
    const magicError = await validatePDFMagicBytes(buffer)
    if(magicError) return NextResponse.json({error: magicError},{status:400})

    // 5. Sanitize inputs
    title = sanitizeInput(title||'')
    category = sanitizeInput(category||'전기기사')
    type = sanitizeInput(type||'기출문제')

    if(!title || title.length < 2) return NextResponse.json({error:'제목 2자 이상'},{status:400})
    if(title.length > 200) return NextResponse.json({error:'제목 200자 이하'},{status:400})

    // 6. Validate category and type against whitelist
    const allowedCategories = ['전기기사','전기공사기사','전기철도기사','전기산업기사','전기기능사','전기기능장','정보통신기사','정보처리기사','전자기사','토목기사','토목산업기사','측량및지형공간정보기사','기계기사','기계설계기사','가스기사','건축기사','소방설비기사(전기)']
    if(!allowedCategories.includes(category)){
      category = '전기기사' // Default safe value
    }

    // 7. Upload to Blob with safe filename
    const safeFileName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.pdf`
    const blob = await put(`flipbooks/${safeFileName}`, buffer, {
      access: 'public',
      contentType: 'application/pdf',
    })

    // 8. Save to DB
    const flipbook = await prisma.flipbook.create({
      data:{
        title,
        category,
        type,
        url: blob.url,
        fileName: safeFileName,
        fileSize: file.size,
        uploadedBy: payload.id,
      } as any
    }).catch(async()=>{
      // Fallback if schema different
      return await prisma.flipbook.create({
        data:{
          title,
          category,
          type,
          pdfUrl: blob.url,
        } as any
      })
    })

    return NextResponse.json({ok:true, flipbook})

  }catch(e:any){
    console.error('Upload error:', e.message)
    return NextResponse.json({error:'업로드 실패: '+e.message},{status:500})
  }
}
