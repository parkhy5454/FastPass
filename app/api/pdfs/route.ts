
import { NextRequest, NextResponse } from 'next/server'

let memoryPdfs: any[] = []

export async function GET(req: NextRequest){
  try{
    const {searchParams} = new URL(req.url)
    const qual = searchParams.get('qual')
    const type = searchParams.get('type')
    let pdfs = memoryPdfs
    if(qual) pdfs = pdfs.filter(p=> p.qual===qual || !p.qual)
    if(type && type!=='전체') pdfs = pdfs.filter(p=> p.problemType===type || p.title?.includes(type))
    return NextResponse.json({pdfs})
  }catch{
    return NextResponse.json({pdfs: []})
  }
}
