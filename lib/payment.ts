
export async function verifyPayment(impUid: string, amount: number){ return { verified:true, amount } }
export function generatePgTid(){ return 'tid_'+Date.now() }
