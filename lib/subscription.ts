
export const PLANS = {
  FREE: {id:'FREE', name:'무료', price:0, limits:{years:3, problems:1, wrongNotes:5, pdfs:1}},
  MONTHLY: {id:'MONTHLY', name:'월간 구독', price:9900, period:'1개월', discount:0, popular:true},
  YEARLY: {id:'YEARLY', name:'연간 구독', price:59900, period:'12개월', discount:50, originalPrice:118800},
  LIFETIME: {id:'LIFETIME', name:'평생 이용', price:149000, period:'평생', limit:100},
}

export const PRODUCTS = {
  AI_REPORT: {id:'AI_REPORT', name:'AI 오답 분석 리포트', price:4900, desc:'AI가 분석한 약점과 맞춤 학습법'},
  QA_10: {id:'QA_10', name:'1:1 질문 답변권 10회', price:19900, desc:'전문가에게 직접 질문'},
  MOCK_EXAM: {id:'MOCK_EXAM', name:'모의고사 응시권', price:2900, desc:'실전 모의고사 1회'},
  PASS_GUARANTEE: {id:'PASS_GUARANTEE', name:'합격 보장반', price:99000, desc:'불합격 시 1년 무료 연장'},
}

export function hasAccess(userPlan: string, feature: 'pdf'|'problem'|'wrongNote', currentCount: number, requestedCount?: number){
  const plan = PLANS[userPlan as keyof typeof PLANS] || PLANS.FREE
  if(userPlan !== 'FREE') return {allowed:true}

  const limits = PLANS.FREE.limits
  if(feature==='pdf' && currentCount >= limits.pdfs) return {allowed:false, reason:'무료는 PDF 1개만 볼 수 있습니다. 구독하면 무제한!'}
  if(feature==='problem' && (requestedCount||0) > limits.problems) return {allowed:false, reason:'무료는 예상문제 1개만. 구독하면 전체 공개!'}
  if(feature==='wrongNote' && currentCount >= limits.wrongNotes) return {allowed:false, reason:'오답노트는 5개까지만 저장. 구독하면 무제한!'}
  return {allowed:true}
}

export function calculatePointsUsage(totalPrice: number, points: number){
  // 포인트는 최대 30%만 사용 가능
  const maxUsable = Math.floor(totalPrice * 0.3)
  const usable = Math.min(points, maxUsable)
  const payAmount = totalPrice - usable
  return {usable, payAmount, maxUsable}
}
