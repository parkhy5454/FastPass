
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient() as any

export type AuditAction = 'USER_DELETE'|'PASSWORD_RESET'|'PDF_UPLOAD'|'PDF_DELETE'|'REFUND'|'LOGIN'|'PAYMENT'|'PROBLEM_TYPE_CREATE'|'PROBLEM_TYPE_DELETE'

export async function logAudit(action: AuditAction, adminId: string, targetId: string, details?: any){
  try{
    // Try DB
    await prisma.auditLog?.create?.({
      data:{
        action,
        adminId,
        targetId,
        details: details ? JSON.stringify(details) : null,
        ip: details?.ip || null,
      }
    })
  }catch(e:any){
    // Fallback to console + memory
    console.log(`[AUDIT] ${new Date().toISOString()} ${action} by ${adminId} on ${targetId}`, details)
  }
}

export async function getAuditLogs(limit=50){
  try{
    const logs = await prisma.auditLog?.findMany?.({orderBy:{createdAt:'desc'}, take: limit}) || []
    return logs
  }catch{
    return []
  }
}
