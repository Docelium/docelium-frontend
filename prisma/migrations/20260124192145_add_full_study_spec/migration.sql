-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR');

-- CreateEnum
CREATE TYPE "StudyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'TEMPORARILY_SUSPENDED', 'CLOSED_TO_ENROLLMENT', 'CLOSED_TO_TREATMENT', 'TERMINATED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StudyPhase" AS ENUM ('I', 'I_II', 'II', 'III', 'IV', 'OTHER');

-- CreateEnum
CREATE TYPE "ComplexityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "BlindingType" AS ENUM ('NONE', 'SINGLE', 'DOUBLE', 'TRIPLE');

-- CreateEnum
CREATE TYPE "ReturnPolicy" AS ENUM ('LOCAL_STOCK', 'SPONSOR_RETURN');

-- CreateEnum
CREATE TYPE "TemperatureGovernance" AS ENUM ('BASIC', 'FULL');

-- CreateEnum
CREATE TYPE "IwrsIntegrationMode" AS ENUM ('MANUAL', 'CSV', 'API');

-- CreateEnum
CREATE TYPE "MedicationType" AS ENUM ('IMP', 'NIMP');

-- CreateEnum
CREATE TYPE "DosageForm" AS ENUM ('TABLET', 'CAPSULE', 'INJECTION', 'SOLUTION', 'CREAM', 'PATCH', 'INHALER', 'SUPPOSITORY', 'POWDER', 'GEL', 'SPRAY', 'DROPS', 'OTHER');

-- CreateEnum
CREATE TYPE "StorageCondition" AS ENUM ('ROOM_TEMPERATURE', 'REFRIGERATED', 'FROZEN', 'CONTROLLED_ROOM_TEMPERATURE', 'PROTECT_FROM_LIGHT', 'OTHER');

-- CreateEnum
CREATE TYPE "DestructionPolicy" AS ENUM ('LOCAL', 'SPONSOR', 'MIXED');

-- CreateEnum
CREATE TYPE "CountingUnit" AS ENUM ('UNIT', 'BOX', 'VIAL', 'AMPOULE', 'SYRINGE', 'BOTTLE', 'SACHET', 'BLISTER', 'KIT', 'OTHER');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('RECEPTION', 'DISPENSATION', 'RETOUR', 'DESTRUCTION', 'TRANSFER');

-- CreateEnum
CREATE TYPE "ReturnReason" AS ENUM ('UNUSED', 'PARTIALLY_USED', 'EXPIRED', 'DAMAGED', 'PATIENT_WITHDRAWAL', 'PROTOCOL_DEVIATION', 'ADVERSE_EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReturnDestination" AS ENUM ('STOCK', 'QUARANTINE', 'DESTRUCTION', 'SPONSOR_RETURN');

-- CreateEnum
CREATE TYPE "DestructionMethod" AS ENUM ('INCINERATION', 'CHEMICAL', 'RETURN_TO_SPONSOR', 'OTHER');

-- CreateEnum
CREATE TYPE "StockItemStatus" AS ENUM ('AVAILABLE', 'QUARANTINE', 'RESERVED', 'EXPIRED', 'DESTROYED', 'RETURNED_TO_SPONSOR');

-- CreateEnum
CREATE TYPE "AccountingPeriodStatus" AS ENUM ('OPEN', 'PENDING_MONITORING', 'PENDING_PHARMACIST_SIGNATURE', 'LOCKED');

-- CreateEnum
CREATE TYPE "DestructionBatchStatus" AS ENUM ('DRAFT', 'PENDING_ARC_APPROVAL', 'ARC_APPROVED', 'ARC_REJECTED', 'PENDING_PHARMACIST_SIGNATURE', 'SIGNED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('USER', 'STUDY', 'MEDICATION', 'EQUIPMENT', 'STOCK_ITEM', 'MOVEMENT', 'ACCOUNTING_PERIOD', 'DESTRUCTION_BATCH', 'DOCUMENT', 'STUDY_ACCOUNTING_FINAL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILURE', 'USER_LOGOUT', 'PASSWORD_CHANGE', 'PASSWORD_RESET_REQUEST', 'CREATE_USER', 'UPDATE_USER', 'UPDATE_USER_ROLE', 'DEACTIVATE_USER', 'CREATE_STUDY', 'UPDATE_STUDY', 'UPDATE_STUDY_CONFIG', 'ACTIVATE_STUDY', 'SUSPEND_STUDY', 'CLOSE_STUDY', 'ARCHIVE_STUDY', 'CREATE_MEDICATION', 'UPDATE_MEDICATION', 'DEACTIVATE_MEDICATION', 'CREATE_EQUIPMENT', 'UPDATE_EQUIPMENT', 'DEACTIVATE_EQUIPMENT', 'LINK_EQUIPMENT_MEDICATION', 'UNLINK_EQUIPMENT_MEDICATION', 'CREATE_STOCK_ITEM', 'UPDATE_STOCK_ITEM', 'QUARANTINE_STOCK_ITEM', 'RELEASE_STOCK_ITEM', 'CREATE_MOVEMENT_RECEPTION', 'CREATE_MOVEMENT_DISPENSATION', 'CREATE_MOVEMENT_RETOUR', 'CREATE_MOVEMENT_DESTRUCTION', 'CREATE_MOVEMENT_TRANSFER', 'UPDATE_MOVEMENT', 'CANCEL_MOVEMENT', 'CREATE_ACCOUNTING_PERIOD', 'ACCOUNTING_PERIOD_SET_STATUS_OPEN', 'ACCOUNTING_PERIOD_SET_STATUS_PENDING_MONITORING', 'ACCOUNTING_PERIOD_SET_STATUS_PENDING_PHARMACIST_SIGNATURE', 'ACCOUNTING_PERIOD_SET_STATUS_LOCKED', 'ESIGN_MOVEMENT', 'ESIGN_ACCOUNTING_PERIOD', 'ESIGN_DESTRUCTION_BATCH', 'ESIGN_STUDY_ACCOUNTING_FINAL', 'ARC_SIGN_ACCOUNTING_PERIOD', 'CREATE_DESTRUCTION_BATCH', 'UPDATE_DESTRUCTION_BATCH', 'ADD_MOVEMENT_TO_DESTRUCTION_BATCH', 'REMOVE_MOVEMENT_FROM_DESTRUCTION_BATCH', 'ARC_APPROVE_DESTRUCTION_BATCH', 'ARC_REJECT_DESTRUCTION_BATCH', 'UPLOAD_DOCUMENT', 'DELETE_DOCUMENT', 'LINK_DOCUMENT_TO_ENTITY', 'EXPORT_GENERATED', 'EXPORT_CERTIFIED', 'EXPORT_VERIFIED');

-- CreateEnum
CREATE TYPE "EsignEntityType" AS ENUM ('MOVEMENT', 'DESTRUCTION_BATCH', 'ACCOUNTING_PERIOD', 'STUDY_ACCOUNTING_FINAL');

-- CreateEnum
CREATE TYPE "EsignPurpose" AS ENUM ('VALIDATE_DESTRUCTION_MOVEMENT', 'VALIDATE_DESTRUCTION_BATCH', 'LOCK_ACCOUNTING_PERIOD', 'LOCK_STUDY_ACCOUNTING_FINAL', 'ARC_APPROVAL', 'CONFIG_CHANGE_APPROVAL');

-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('PASSWORD_ONLY', 'PASSWORD_2FA', 'SSO_2FA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "passwordChangedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studies" (
    "id" TEXT NOT NULL,
    "protocol_status" "StudyStatus" NOT NULL DEFAULT 'DRAFT',
    "code_internal" TEXT NOT NULL,
    "eu_ct_number" TEXT,
    "nct_number" TEXT,
    "title" TEXT NOT NULL,
    "sponsor" TEXT NOT NULL,
    "phase" "StudyPhase" NOT NULL,
    "therapeutic_area" TEXT,
    "site_activation_date" TIMESTAMP(3),
    "expected_recruitment" INTEGER,
    "complexity_level" "ComplexityLevel" NOT NULL DEFAULT 'LOW',
    "contacts" JSONB,
    "protocol_version" TEXT,
    "protocol_version_date" TIMESTAMP(3),
    "amendments" JSONB,
    "eu_ctr_approval_reference" TIMESTAMP(3),
    "ethics_approval_reference" TEXT,
    "insurance_reference" TEXT,
    "eudamed_id" TEXT,
    "blinded" "BlindingType" NOT NULL DEFAULT 'NONE',
    "arms" JSONB,
    "cohorts" JSONB,
    "destruction_policy" "DestructionPolicy" NOT NULL DEFAULT 'LOCAL',
    "return_policy" "ReturnPolicy" NOT NULL DEFAULT 'LOCAL_STOCK',
    "requires_patient_for_dispensation" BOOLEAN NOT NULL DEFAULT true,
    "allows_dispensation_without_iwrs" BOOLEAN NOT NULL DEFAULT false,
    "temperature_tracking_enabled" BOOLEAN NOT NULL DEFAULT false,
    "returned_material_reusable" BOOLEAN NOT NULL DEFAULT false,
    "data_quality_profile" JSONB,
    "visit_schedule" JSONB,
    "treatment_cycles" JSONB,
    "patient_constraints" JSONB,
    "temperature_governance" "TemperatureGovernance",
    "excursion_action_required" BOOLEAN NOT NULL DEFAULT false,
    "excursion_time_threshold" TEXT,
    "iwrs_governance" JSONB,
    "protocol_required_equipments" TEXT[],
    "site_overrides" JSONB,
    "study_config" JSONB,
    "start_date" TIMESTAMP(3),
    "expected_end_date" TIMESTAMP(3),
    "actual_end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by_id" TEXT,

    CONSTRAINT "studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_user_assignments" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_user_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MedicationType" NOT NULL,
    "dosageForm" "DosageForm" NOT NULL,
    "strength" TEXT,
    "manufacturer" TEXT,
    "storageCondition" "StorageCondition" NOT NULL,
    "storageInstructions" TEXT,
    "countingUnit" "CountingUnit" NOT NULL,
    "unitsPerPackage" INTEGER NOT NULL DEFAULT 1,
    "destructionPolicy" "DestructionPolicy",
    "iwrsRequired" BOOLEAN NOT NULL DEFAULT false,
    "requiresEsign" BOOLEAN NOT NULL DEFAULT false,
    "isBlinded" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipments" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "serialNumber" TEXT,
    "countingUnit" "CountingUnit" NOT NULL DEFAULT 'UNIT',
    "requiresEsign" BOOLEAN NOT NULL DEFAULT false,
    "isReusable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_equipment_links" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medication_equipment_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_items" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "medicationId" TEXT,
    "equipmentId" TEXT,
    "batchNumber" TEXT NOT NULL,
    "kitNumber" TEXT,
    "initialQuantity" INTEGER NOT NULL,
    "currentQuantity" INTEGER NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "manufacturingDate" TIMESTAMP(3),
    "receptionDate" TIMESTAMP(3) NOT NULL,
    "status" "StockItemStatus" NOT NULL DEFAULT 'AVAILABLE',
    "quarantineReason" TEXT,
    "storageLocation" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "lockedByPeriodId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movements" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "medicationId" TEXT,
    "equipmentId" TEXT,
    "stockItemId" TEXT,
    "periodId" TEXT,
    "type" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "movementDate" TIMESTAMP(3) NOT NULL,
    "patientId" TEXT,
    "visitNumber" TEXT,
    "supplierName" TEXT,
    "deliveryNoteNumber" TEXT,
    "returnReason" "ReturnReason",
    "returnDestination" "ReturnDestination",
    "returnedQuantityUsed" INTEGER,
    "returnedQuantityUnused" INTEGER,
    "destructionMethod" "DestructionMethod",
    "destructionBatchId" TEXT,
    "destructionWitnessName" TEXT,
    "destructionCertificateNumber" TEXT,
    "transferFromLocation" TEXT,
    "transferToLocation" TEXT,
    "iwrsConfirmationNumber" TEXT,
    "notes" TEXT,
    "isSigned" BOOLEAN NOT NULL DEFAULT false,
    "signedBy" TEXT,
    "signedAt" TIMESTAMP(3),
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "performedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounting_periods" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "periodNumber" INTEGER NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "AccountingPeriodStatus" NOT NULL DEFAULT 'OPEN',
    "arcApprovalStatus" TEXT,
    "arcApprovedBy" TEXT,
    "arcApprovedAt" TIMESTAMP(3),
    "arcComments" TEXT,
    "pharmacistSignedBy" TEXT,
    "pharmacistSignedAt" TIMESTAMP(3),
    "totalReceptions" INTEGER,
    "totalDispensations" INTEGER,
    "totalReturns" INTEGER,
    "totalDestructions" INTEGER,
    "closingBalance" INTEGER,
    "dataHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounting_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destruction_batches" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "destructionDate" TIMESTAMP(3),
    "destructionMethod" "DestructionMethod" NOT NULL,
    "destructionLocation" TEXT,
    "witnessName" TEXT,
    "witnessFn" TEXT,
    "status" "DestructionBatchStatus" NOT NULL DEFAULT 'DRAFT',
    "arcApprovedBy" TEXT,
    "arcApprovedAt" TIMESTAMP(3),
    "arcRejectedReason" TEXT,
    "pharmacistSignedBy" TEXT,
    "pharmacistSignedAt" TIMESTAMP(3),
    "dataHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destruction_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_accounting_final" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalReceived" INTEGER,
    "totalDispensed" INTEGER,
    "totalReturned" INTEGER,
    "totalDestroyed" INTEGER,
    "totalReturnedToSponsor" INTEGER,
    "finalBalance" INTEGER,
    "pharmacistSignedBy" TEXT,
    "pharmacistSignedAt" TIMESTAMP(3),
    "arcApprovedBy" TEXT,
    "arcApprovedAt" TIMESTAMP(3),
    "dataHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_accounting_final_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "studyId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "linkedEntityType" TEXT,
    "linkedEntityId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "userRoleSnapshot" "UserRole",
    "action" "AuditAction" NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "studyId" TEXT,
    "periodId" TEXT,
    "batchId" TEXT,
    "detailsBefore" JSONB,
    "detailsAfter" JSONB,
    "clientInfo" JSONB,
    "hash" TEXT NOT NULL,
    "previousHash" TEXT,
    "signatureMetadata" JSONB,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "esignature_logs" (
    "id" TEXT NOT NULL,
    "entityType" "EsignEntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "signerUserId" TEXT NOT NULL,
    "signerRoleSnapshot" "UserRole" NOT NULL,
    "purpose" "EsignPurpose" NOT NULL,
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authMethod" "AuthMethod" NOT NULL,
    "authContext" JSONB,
    "signingDataHash" TEXT NOT NULL,
    "previousSignatureHash" TEXT,
    "metadata" JSONB,

    CONSTRAINT "esignature_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "studies_code_internal_key" ON "studies"("code_internal");

-- CreateIndex
CREATE UNIQUE INDEX "study_user_assignments_studyId_userId_key" ON "study_user_assignments"("studyId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "medications_studyId_code_key" ON "medications"("studyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "equipments_studyId_code_key" ON "equipments"("studyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "medication_equipment_links_medicationId_equipmentId_key" ON "medication_equipment_links"("medicationId", "equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_periods_studyId_periodNumber_key" ON "accounting_periods"("studyId", "periodNumber");

-- CreateIndex
CREATE UNIQUE INDEX "destruction_batches_studyId_batchNumber_key" ON "destruction_batches"("studyId", "batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "study_accounting_final_studyId_key" ON "study_accounting_final"("studyId");

-- CreateIndex
CREATE INDEX "audit_events_entityType_entityId_idx" ON "audit_events"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_events_studyId_idx" ON "audit_events"("studyId");

-- CreateIndex
CREATE INDEX "audit_events_userId_idx" ON "audit_events"("userId");

-- CreateIndex
CREATE INDEX "audit_events_timestamp_idx" ON "audit_events"("timestamp");

-- CreateIndex
CREATE INDEX "esignature_logs_entityType_entityId_idx" ON "esignature_logs"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "study_user_assignments" ADD CONSTRAINT "study_user_assignments_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_user_assignments" ADD CONSTRAINT "study_user_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_equipment_links" ADD CONSTRAINT "medication_equipment_links_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_equipment_links" ADD CONSTRAINT "medication_equipment_links_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "stock_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "accounting_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_destructionBatchId_fkey" FOREIGN KEY ("destructionBatchId") REFERENCES "destruction_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "destruction_batches" ADD CONSTRAINT "destruction_batches_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_accounting_final" ADD CONSTRAINT "study_accounting_final_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_studyId_fkey" FOREIGN KEY ("studyId") REFERENCES "studies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esignature_logs" ADD CONSTRAINT "esignature_logs_signerUserId_fkey" FOREIGN KEY ("signerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esignature_logs" ADD CONSTRAINT "esignature_movement" FOREIGN KEY ("entityId") REFERENCES "movements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esignature_logs" ADD CONSTRAINT "esignature_period" FOREIGN KEY ("entityId") REFERENCES "accounting_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esignature_logs" ADD CONSTRAINT "esignature_batch" FOREIGN KEY ("entityId") REFERENCES "destruction_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "esignature_logs" ADD CONSTRAINT "esignature_final" FOREIGN KEY ("entityId") REFERENCES "study_accounting_final"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
