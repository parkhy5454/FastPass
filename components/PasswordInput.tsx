
'use client'
import { useState } from 'react'
export default function PasswordInput({ value, onChange, placeholder, name }: any){
  const [show, setShow] = useState(false)
  return (
    <div style={{position:'relative', display:'flex', alignItems:'center'}}>
      <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} name={name}
        style={{width:'100%', padding:'12px 40px 12px 12px', borderRadius:'12px', border:'1px solid #333', background:'#27272a', color:'white'}} />
      <button type="button" onClick={()=>setShow(!show)} style={{position:'absolute', right:'8px', background:'none', border:'none', cursor:'pointer', fontSize:'18px'}}>
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  )
}
