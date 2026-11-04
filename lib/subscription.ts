
export const PLANS = {
  FREE: {id:'FREE', name:'무료', price:0, limits:{years:3, problems:3, wrongNotes:5, pdfs:1}},
  MONTHLY: {id:'MONTHLY', name:'월간 구독', price:9900, period:'1개월', discount:0, popular:true, desc:'가장 인기!'},
  YEARLY: {id:'YEARLY', name:'연간 구독', price:59900, period:'12개월', discount:50, originalPrice:118800, desc:'50% 할인! 가장 추천', best:true},
  LIFETIME: {id:'LIFETIME', name:'평생 이용', price:149000, period:'평생', limit:100, left:23, desc:'한정 100명'},
  PASS_GUARANTEE: {id:'PASS_GUARANTEE', name:'합격 보장반', price:99000, period:'시험일까지', desc:'불합격 시 1년 연장'},
}

export const PRODUCTS = {
  AI_REPORT: {id:'AI_REPORT', name:'AI 오답 분석 리포트', price:4900, desc:'AI가 분석한 약점과 맞춤 학습법', margin:100},
  QA_10: {id:'QA_10', name:'1:1 질문 답변권 10회', price:19900, desc:'전문가에게 직접 질문', margin:80},
  MOCK_EXAM: {id:'MOCK_EXAM', name:'모의고사 응시권', price:2900, desc:'실전 모의고사 1회 + 해설', margin:100},
  STUDY_ROOM: {id:'STUDY_ROOM', name:'단톡방 스터디 월간', price:19900, desc:'매일 문제 + 전문가 답변 + 단톡방', margin:70},
}

export function hasAccess(userPlan: string, feature: 'pdf'|'problem'|'wrongNote', currentCount: number, requestedCount?: number){
  const plan = PLANS[userPlan as keyof typeof PLANS] || PLANS.FREE
  if(userPlan !== 'FREE') return {allowed:true}
  const limits = PLANS.FREE.limits
  if(feature==='pdf' && currentCount >= limits.pdfs) return {allowed:false, reason:`무료는 PDF ${limits.pdfs}개만 볼 수 있습니다. 구독하면 무제한!`}
  if(feature==='problem' && (requestedCount||currentCount) >= limits.problems) return {allowed:false, reason:`무료는 문제 ${limits.problems}개만. 구독하면 ${getTotalProblems()}개 전체 공개!`}
  if(feature==='wrongNote' && currentCount >= limits.wrongNotes) return {allowed:false, reason:`오답노트는 ${limits.wrongNotes}개까지만 저장. 구독하면 무제한!`}
  return {allowed:true}
}

export function calculatePointsUsage(totalPrice: number, points: number){
  const maxUsable = Math.floor(totalPrice * 0.3)
  const usable = Math.min(points, maxUsable)
  const payAmount = totalPrice - usable
  return {usable, payAmount, maxUsable, payRatio: Math.round((payAmount/totalPrice)*100)}
}

export function getTotalProblems(){ return 2997 }
export function getDiscountTimer(){ 
  const now = new Date()
  const end = new Date(now.getTime() + 24*60*60*1000)
  return end
}

export const DDAY_EXAMS = [
  {cert:'전기기사', date:'2026-05-15', dday:30, title:'30일 안에 합격?'},
  {cert:'토목기사', date:'2026-06-10', dday:56, title:'56일 완성반'},
  {cert:'건축기사', date:'2026-05-20', dday:35, title:'35일 합격 패키지'},
]
