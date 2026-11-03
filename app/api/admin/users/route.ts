
import { prisma } from '@/lib/db'
export async function GET(){
  try{
    const p:any = prisma
    if(!p.user){
      return Response.json([{ 
        id:'fallback_1', 
        loginId:'parkhy5454@gmail.com', 
        name:'박현용 (관리자)', 
        phone:'010-0000-0000', 
        interests:['전기기사','전기산업기사'], 
        role:'ADMIN', 
        password:'$2b$10$hashed',
        createdAt:new Date().toISOString() 
      }])
    }
    const users = await p.user.findMany({ orderBy:{ createdAt:'desc' }, take:500 })
    // 만약 0명이면 현재 관리자라도 하나 보여주기
    if(users.length===0){
      return Response.json([{
        id:'no_users',
        loginId:'아직 가입한 회원이 없습니다. 회원가입 테스트를 해보세요!',
        name:'테스트 필요',
        phone:'-',
        interests:[],
        role:'INFO',
        password:'',
        createdAt:new Date().toISOString()
      }])
    }
    return Response.json(users)
  }catch(e:any){
    console.error(e)
    // DB 에러시 fallback으로 현재 로그인 정보라도 반환
    return Response.json([{
      id:'error_fallback',
      loginId:`DB 에러: ${e.message.slice(0,100)}`,
      name:'DB 연결 확인 필요',
      phone:'Neon SQL Editor에서 테이블 생성 필요',
      interests:['전기기사'],
      role:'ERROR',
      password:'',
      createdAt:new Date().toISOString()
    }])
  }
}
