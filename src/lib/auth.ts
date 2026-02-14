import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        // Update lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Permission definitions
export const PERMISSIONS = {
  // Studies
  STUDY_CREATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  STUDY_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'] as UserRole[],
  STUDY_UPDATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  STUDY_DELETE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  STUDY_ACTIVATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  STUDY_ARCHIVE: ['ADMIN'] as UserRole[],

  // Medications
  MEDICATION_CREATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  MEDICATION_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'] as UserRole[],
  MEDICATION_UPDATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  MEDICATION_DEACTIVATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],

  // Equipments
  EQUIPMENT_CREATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  EQUIPMENT_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'] as UserRole[],
  EQUIPMENT_UPDATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  EQUIPMENT_DEACTIVATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],

  // Movements
  MOVEMENT_CREATE: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'] as UserRole[],
  MOVEMENT_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'] as UserRole[],
  MOVEMENT_UPDATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  MOVEMENT_ESIGN: ['ADMIN', 'PHARMACIEN'] as UserRole[],

  // Stock
  STOCK_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'] as UserRole[],
  STOCK_QUARANTINE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  STOCK_ADJUST: ['ADMIN', 'PHARMACIEN'] as UserRole[],

  // Accounting periods
  PERIOD_CREATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  PERIOD_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'] as UserRole[],
  PERIOD_UPDATE_STATUS: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  PERIOD_ESIGN: ['PHARMACIEN'] as UserRole[],
  PERIOD_ARC_APPROVE: ['ARC'] as UserRole[],

  // Destruction batches
  DESTRUCTION_BATCH_CREATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  DESTRUCTION_BATCH_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'] as UserRole[],
  DESTRUCTION_BATCH_UPDATE: ['ADMIN', 'PHARMACIEN'] as UserRole[],
  DESTRUCTION_BATCH_ARC_APPROVE: ['ARC'] as UserRole[],
  DESTRUCTION_BATCH_ESIGN: ['PHARMACIEN'] as UserRole[],

  // Audit
  AUDIT_READ: ['ADMIN', 'PHARMACIEN', 'ARC', 'AUDITOR'] as UserRole[],
  AUDIT_EXPORT: ['ADMIN', 'PHARMACIEN', 'AUDITOR'] as UserRole[],

  // Exports
  EXPORT_GENERATE: ['ADMIN', 'PHARMACIEN', 'ARC'] as UserRole[],
  EXPORT_CERTIFIED: ['PHARMACIEN'] as UserRole[],

  // Users
  USER_CREATE: ['ADMIN'] as UserRole[],
  USER_READ: ['ADMIN'] as UserRole[],
  USER_UPDATE: ['ADMIN'] as UserRole[],
  USER_DEACTIVATE: ['ADMIN'] as UserRole[],
  USER_ASSIGN_STUDY: ['ADMIN'] as UserRole[],
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export function checkPermission(userRole: UserRole, permission: PermissionKey): boolean {
  return PERMISSIONS[permission].includes(userRole);
}

export async function getAccessibleStudyIds(userId: string, role: UserRole): Promise<string[]> {
  // ADMIN et ARC voient tous les protocoles (ARC en lecture seule)
  if (role === 'ADMIN' || role === 'ARC' || role === 'AUDITOR') {
    const studies = await prisma.study.findMany({ select: { id: true } });
    return studies.map((s) => s.id);
  }

  const assignments = await prisma.studyUserAssignment.findMany({
    where: { userId },
    select: { studyId: true },
  });

  return assignments.map((a) => a.studyId);
}
