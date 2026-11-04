import { prisma } from './db'

export type AuditAction = 'USER_DELETE' | 'PASSWORD_RESET' | 'PDF_UPLOAD' | 'PDF_DELETE' | 'REFUND' | 'LOGIN' | 'PAYMENT' | 'PROBLEM_TYPE_CREATE' | 'PROBLEM_TYPE_DELETE' | 'EXAM_UPLOAD'

export async function logAudit(action: AuditAction, adminId: string, targetId: string, details?: any) {
  try {
    await (prisma as any).auditLog.create({
      data: {
        action,
        adminId: String(adminId),
        targetId: String(targetId),
        details: details ? JSON.stringify(details) : null,
      },
    })
  } catch (e) {
    // DB 기록이 실패해도 서비스 동작은 막지 않고 서버 로그에 남깁니다
    console.log(`[AUDIT] ${new Date().toISOString()} ${action} by ${adminId} on ${targetId}`, details)
  }
}

export async function getAuditLogs(limit = 50) {
  try {
    return await (prisma as any).auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit })
  } catch {
    return []
  }
}
