import { PrismaClient, UserRole, StudyPhase, MedicationType, DosageForm, StorageCondition, CountingUnit, DestructionPolicy, BlindingType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create users (one per role)
  const password = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@docelium.local' },
      update: { phone: '+33 1 00 00 00 00' },
      create: {
        email: 'admin@docelium.local',
        phone: '+33 1 00 00 00 00',
        passwordHash: password,
        firstName: 'Admin',
        lastName: 'System',
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { email: 'pharmacien@docelium.local' },
      update: { phone: '+33 6 11 22 33 44' },
      create: {
        email: 'pharmacien@docelium.local',
        phone: '+33 6 11 22 33 44',
        passwordHash: password,
        firstName: 'Jean',
        lastName: 'Dupont',
        role: UserRole.PHARMACIEN,
      },
    }),
    prisma.user.upsert({
      where: { email: 'technicien@docelium.local' },
      update: { phone: '+33 6 22 33 44 55' },
      create: {
        email: 'technicien@docelium.local',
        phone: '+33 6 22 33 44 55',
        passwordHash: password,
        firstName: 'Marie',
        lastName: 'Martin',
        role: UserRole.TECHNICIEN,
      },
    }),
    prisma.user.upsert({
      where: { email: 'arc@docelium.local' },
      update: { phone: '+33 6 33 44 55 66' },
      create: {
        email: 'arc@docelium.local',
        phone: '+33 6 33 44 55 66',
        passwordHash: password,
        firstName: 'Pierre',
        lastName: 'Bernard',
        role: UserRole.ARC,
      },
    }),
    prisma.user.upsert({
      where: { email: 'auditor@docelium.local' },
      update: { phone: '+33 6 44 55 66 77' },
      create: {
        email: 'auditor@docelium.local',
        phone: '+33 6 44 55 66 77',
        passwordHash: password,
        firstName: 'Sophie',
        lastName: 'Leroy',
        role: UserRole.AUDITOR,
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Get admin user for createdById
  const adminUser = users.find(u => u.role === 'ADMIN')!;

  // Create an example study with all SPEC fields
  const study = await prisma.study.upsert({
    where: { codeInternal: 'ONC-2025-TRIAL-01' },
    update: {},
    create: {
      // === BLOC A : Identification ===
      codeInternal: 'ONC-2025-TRIAL-01',
      euCtNumber: '2025-000567-29',
      nctNumber: 'NCT05687266',
      title: 'Etude clinique randomisee en double aveugle evaluant le medicament A versus placebo dans le traitement du cancer du poumon non a petites cellules',
      sponsor: 'Pharma Corp International',
      phase: StudyPhase.III,
      therapeuticArea: 'ONCOLOGY',
      siteActivationDate: new Date('2025-01-15'),
      expectedRecruitment: 150,

      // === BLOC B : Contacts ===
      contacts: [
        { role: 'PI', name: 'Dr. Jean-Pierre Martin', email: 'jp.martin@chu-paris.fr', phone: '+33 1 45 67 89 00' },
        { role: 'SC', name: 'Marie Durand', email: 'm.durand@chu-paris.fr', phone: '+33 1 45 67 89 01' },
        { role: 'CRA', name: 'Pierre Bernard', email: 'p.bernard@pharmacorp.com', phone: '+33 6 12 34 56 78' },
        { role: 'PM', name: 'Sophie Lefevre', email: 's.lefevre@pharmacorp.com', phone: '+33 6 98 76 54 32' },
      ],

      // === BLOC C : Regulatory Identifiers ===
      protocolVersion: 'V3.0',
      protocolVersionDate: new Date('2025-01-10'),
      amendments: [
        { version: 'Amendment 1', date: '2025-02-15' },
        { version: 'Amendment 2', date: '2025-05-20' },
      ],
      euCtrApprovalReference: new Date('2025-01-05'),
      ethicsApprovalReference: 'CPP-2025-A00123',
      insuranceReference: 'ASSUR-2025-56789',

      // === BLOC D : Parametres operationnels ===
      blinded: BlindingType.DOUBLE,
      arms: ['Bras A - Traitement', 'Bras B - Placebo'],
      cohorts: ['Cohorte 1 - Dose Standard', 'Cohorte 2 - Dose Elevee'],
      destructionPolicy: DestructionPolicy.LOCAL,
      requiresPatientForDispensation: true,
      allowsDispensationWithoutIwrs: false,
      temperatureTrackingEnabled: true,
      returnedMaterialReusable: false,

      // === BLOC E : Data Quality Profile ===
      dataQualityProfile: {
        requires_double_signature: true,
        requires_pharmacist_signature: true,
        requires_weight_recency_days: 7,
        comment_required_on_override: true,
      },

      // === BLOC G : Visit Schedule ===
      visitSchedule: [
        { visit_code: 'C1D1', day: 1, requires_dispense: true },
        { visit_code: 'C1D8', day: 8, requires_dispense: false },
        { visit_code: 'C1D15', day: 15, requires_dispense: false },
        { visit_code: 'C2D1', day: 22, requires_dispense: true },
        { visit_code: 'C2D8', day: 29, requires_dispense: false },
        { visit_code: 'C3D1', day: 43, requires_dispense: true },
      ],
      treatmentCycles: {
        cycle_length: 21,
        max_cycles: 6,
      },

      // === BLOC H : Patient Constraints ===
      patientConstraints: {
        min_age: 18,
        max_age: 75,
        min_weight: 45,
        requires_recent_weight_days: 7,
        weight_variation_threshold: 10,
        weight_reference: 'BASELINE',
      },

      // === BLOC I : Temperature Governance ===
      temperatureGovernance: 'FULL',
      excursionActionRequired: true,
      excursionTimeThreshold: '2h',

      // === BLOC L : IWRS Governance ===
      iwrsGovernance: {
        iwrs_integration: true,
        iwrs_integration_mode: 'API',
        iwrs_allows_partial_data: false,
        iwrs_requires_visit_code: true,
        iwrs_endpoint: 'https://iwrs.pharmacorp.com/api/v1',
      },

      // === BLOC M : Equipment Requirements ===
      protocolRequiredEquipments: [],

      // === BLOC N : Site Overrides ===
      siteOverrides: {
        requires_local_quarantine_step: true,
        requires_extra_reception_fields: ['Temperature_arrivee', 'Numero_conteneur'],
        local_procedure_references: [
          { name: 'Gestion des receptions', reference: 'PUI-ONC-2025-01' },
          { name: 'Destruction locale', reference: 'PUI-ONC-2025-02' },
        ],
      },

      // === Dates ===
      startDate: new Date('2025-01-15'),
      expectedEndDate: new Date('2027-06-30'),

      // === Metadata ===
      createdById: adminUser.id,
    },
  });

  console.log(`Created study: ${study.codeInternal}`);

  // Assign all non-admin users to the study
  const nonAdminUsers = users.filter((u) => u.role !== 'ADMIN');
  await Promise.all(
    nonAdminUsers.map((user) =>
      prisma.studyUserAssignment.upsert({
        where: {
          studyId_userId: {
            studyId: study.id,
            userId: user.id,
          },
        },
        update: {},
        create: {
          studyId: study.id,
          userId: user.id,
        },
      })
    )
  );

  console.log(`Assigned ${nonAdminUsers.length} users to study`);

  // Create example medications
  const medications = await Promise.all([
    prisma.medication.upsert({
      where: {
        studyId_code: {
          studyId: study.id,
          code: 'MED-001-A',
        },
      },
      update: {},
      create: {
        studyId: study.id,
        code: 'MED-001-A',
        name: 'Medicament Experimental A - 100mg',
        type: MedicationType.IMP,
        dosageForm: DosageForm.TABLET,
        strength: '100mg',
        manufacturer: 'Pharma Corp',
        storageCondition: StorageCondition.ROOM_TEMPERATURE,
        countingUnit: CountingUnit.UNIT,
        unitsPerPackage: 30,
        isBlinded: true,
        iwrsRequired: true,
      },
    }),
    prisma.medication.upsert({
      where: {
        studyId_code: {
          studyId: study.id,
          code: 'MED-001-B',
        },
      },
      update: {},
      create: {
        studyId: study.id,
        code: 'MED-001-B',
        name: 'Placebo A - Matching',
        type: MedicationType.IMP,
        dosageForm: DosageForm.TABLET,
        strength: '100mg',
        manufacturer: 'Pharma Corp',
        storageCondition: StorageCondition.ROOM_TEMPERATURE,
        countingUnit: CountingUnit.UNIT,
        unitsPerPackage: 30,
        isBlinded: true,
        iwrsRequired: true,
      },
    }),
    prisma.medication.upsert({
      where: {
        studyId_code: {
          studyId: study.id,
          code: 'MED-002',
        },
      },
      update: {},
      create: {
        studyId: study.id,
        code: 'MED-002',
        name: 'Premedication Antiemetique',
        type: MedicationType.NIMP,
        dosageForm: DosageForm.INJECTION,
        strength: '8mg/4ml',
        manufacturer: 'Generic Labs',
        storageCondition: StorageCondition.REFRIGERATED,
        storageInstructions: 'Conserver entre 2-8C. Proteger de la lumiere.',
        countingUnit: CountingUnit.VIAL,
        unitsPerPackage: 10,
        iwrsRequired: false,
      },
    }),
  ]);

  console.log(`Created ${medications.length} medications`);

  console.log('Seed completed successfully!');
  console.log('\nTest accounts:');
  console.log('- admin@docelium.local / password123 (ADMIN)');
  console.log('- pharmacien@docelium.local / password123 (PHARMACIEN)');
  console.log('- technicien@docelium.local / password123 (TECHNICIEN)');
  console.log('- arc@docelium.local / password123 (ARC)');
  console.log('- auditor@docelium.local / password123 (AUDITOR)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
