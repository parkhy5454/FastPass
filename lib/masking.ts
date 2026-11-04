
export function maskPhone(phone: string){
  if(!phone) return '-'
  // 010-1234-5678 -> 010-****-5678
  return phone.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3')
}

export function maskEmail(email: string){
  if(!email) return '-'
  // parkhy5454@gmail.com -> p*********@gmail.com
  const [local, domain] = email.split('@')
  if(!domain) return email
  if(local.length <= 2) return `${local[0]}*@${domain}`
  return `${local[0]}${'*'.repeat(local.length-2)}${local[local.length-1]}@${domain}`
}

export function maskName(name: string){
  if(!name) return '-'
  if(name.length <= 1) return name
  if(name.length === 2) return `${name[0]}*`
  return `${name[0]}${'*'.repeat(name.length-2)}${name[name.length-1]}`
}
