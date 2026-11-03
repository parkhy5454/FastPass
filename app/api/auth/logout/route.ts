
export async function POST(){
  const res = new Response(JSON.stringify({success:true}))
  res.headers.set('Set-Cookie', 'token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax')
  return res
}
export async function GET(){
  const res = new Response(JSON.stringify({success:true}))
  res.headers.set('Set-Cookie', 'token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax')
  return res
}
