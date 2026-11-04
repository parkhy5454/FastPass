
export function getFirstPurchaseDiscount(){
  const key = 'firstDiscountEnd'
  let end = localStorage.getItem(key)
  if(!end){
    const e = new Date(Date.now() + 24*60*60*1000).toISOString()
    localStorage.setItem(key, e)
    end = e
  }
  const endDate = new Date(end!)
  const now = new Date()
  const diff = endDate.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000*60*60))
  const minutes = Math.floor((diff % (1000*60*60)) / (1000*60))
  const seconds = Math.floor((diff % (1000*60)) / 1000)
  const expired = diff <= 0
  return {hours, minutes, seconds, expired, endDate}
}

export function getDiscountedPrice(price: number, discount: number){
  return Math.floor(price * (1 - discount/100))
}
