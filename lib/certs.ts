// 자격증 목록 (설정 분류와 학습 화면이 함께 씁니다)
export type Level = '전체'|'기술사'|'기능장'|'기사'|'산업기사'|'기능사'
export type CertCategory = {name:string, count:number, level:Level, group:string, hot?:boolean}

export const LEVELS: Level[] = ['기술사','기능장','기사','산업기사','기능사']

export const ALL_CERTS: CertCategory[] = [
  {name:'전기기사', count:300, level:'기사', group:'전기', hot:true},
  {name:'전기공사기사', count:200, level:'기사', group:'전기'},
  {name:'전기철도기사', count:200, level:'기사', group:'전기'},
  {name:'전기공사산업기사', count:180, level:'산업기사', group:'전기'},
  {name:'건축전기설비기술사', count:150, level:'기술사', group:'전기'},
  {name:'발송배전기술사', count:120, level:'기술사', group:'전기'},
  {name:'전기응용기술사', count:120, level:'기술사', group:'전기'},
  {name:'전기안전기술사', count:130, level:'기술사', group:'전기'},
  {name:'철도신호기사', count:180, level:'기사', group:'전기'},
  {name:'전기철도기술사', count:100, level:'기술사', group:'전기'},
  {name:'소방설비기사(전기)', count:200, level:'기사', group:'전기'},
  {name:'전기기능장', count:250, level:'기능장', group:'전기'},
  {name:'전기산업기사', count:220, level:'산업기사', group:'전기'},
  {name:'전기공사기능사', count:150, level:'기능사', group:'전기'},
  {name:'철도신호산업기사', count:140, level:'산업기사', group:'전기'},
  {name:'건축전기설비기사', count:190, level:'기사', group:'전기'},
  {name:'전기기능사', count:160, level:'기능사', group:'전기'},
  {name:'토목기사', count:280, level:'기사', group:'토목', hot:true},
  {name:'토목산업기사', count:200, level:'산업기사', group:'토목'},
  {name:'측량및지형공간정보기사', count:180, level:'기사', group:'토목'},
  {name:'건설안전기사', count:220, level:'기사', group:'토목'},
  {name:'토목시공기술사', count:120, level:'기술사', group:'토목'},
  {name:'토질및기초기술사', count:100, level:'기술사', group:'토목'},
  {name:'건축기사', count:300, level:'기사', group:'건축', hot:true},
  {name:'건축산업기사', count:200, level:'산업기사', group:'건축'},
  {name:'기계기사', count:280, level:'기사', group:'기계', hot:true},
  {name:'기계설계기사', count:200, level:'기사', group:'기계'},
  {name:'일반기계기사', count:250, level:'기사', group:'기계'},
  {name:'정보처리기사', count:300, level:'기사', group:'정보통신', hot:true},
  {name:'정보통신기사', count:200, level:'기사', group:'정보통신'},
]
