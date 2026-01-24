# DOCELIUM - Spécification Technique Complète

## Version 1.0.0

---

# TABLE DES MATIERES

1. [Introduction et Contexte](#1-introduction-et-contexte)
2. [Glossaire et Définitions](#2-glossaire-et-définitions)
3. [Architecture Technique](#3-architecture-technique)
4. [Modèle de Données (Prisma Schema)](#4-modèle-de-données-prisma-schema)
5. [Système RBAC - Rôles et Permissions](#5-système-rbac---rôles-et-permissions)
6. [Module Authentification](#6-module-authentification)
7. [Module Protocoles (Études)](#7-module-protocoles-études)
8. [Module Médicaments](#8-module-médicaments)
9. [Module Équipements](#9-module-équipements)
10. [Module Mouvements](#10-module-mouvements)
11. [Module Comptabilité et Périodes](#11-module-comptabilité-et-périodes)
12. [Module Destruction](#12-module-destruction)
13. [Module Audit Trail](#13-module-audit-trail)
14. [Module E-Signature](#14-module-e-signature)
15. [Module Export et Reporting](#15-module-export-et-reporting)
16. [Interface Utilisateur (UI/UX)](#16-interface-utilisateur-uiux)
17. [API REST - Endpoints](#17-api-rest---endpoints)
18. [Plan d'Implémentation Step-by-Step](#18-plan-dimplémentation-step-by-step)
19. [Stratégie de Tests](#19-stratégie-de-tests)

---

# 1. Introduction et Contexte

## 1.1 Objectif du Projet

**DOCELIUM** est un logiciel de gestion de pharmacie hospitalière dédié aux essais cliniques. Il remplace les systèmes Excel et papier actuellement utilisés pour la comptabilité des médicaments expérimentaux (IMP) et non-expérimentaux (NIMP).

## 1.2 Problèmes Résolus

| Problème Actuel | Solution DOCELIUM |
|-----------------|-------------------|
| Comptabilité IMP/NIMP via Excel et papier | Plateforme centralisée avec base de données |
| Aucune cohérence systémique | Intégration IWRS (CSV/API) |
| Pas d'audit trail robuste | Audit trail ALCOA+ complet |
| Reconstruction avant chaque monitoring | Stock temps réel, inspection-ready |
| Multiplication des protocoles/lots/kits | Gestion multi-protocoles standardisée |

## 1.3 Conformité Réglementaire

Le système doit être conforme aux normes suivantes :
- **GCP** (Good Clinical Practice) : Bonnes Pratiques Cliniques
- **GMP** (Good Manufacturing Practice) : Bonnes Pratiques de Fabrication
- **ALCOA+** : Attributable, Legible, Contemporaneous, Original, Accurate + Complete, Consistent, Enduring, Available
- **ICH-E6(R3)** : Guidelines internationales pour les essais cliniques
- **FDA 21 CFR Part 11** : Signatures électroniques et enregistrements électroniques
- **ANSM / EMA** : Exigences européennes

## 1.4 Stack Technique

```
Frontend:
- Next.js 16.x (App Router)
- React 19.x
- Material UI (MUI) 7.x
- React Hook Form + Zod (validation)
- date-fns (manipulation de dates)

Backend:
- Next.js API Routes (App Router)
- Prisma ORM 7.x
- PostgreSQL
- NextAuth.js 4.x (authentification)
- bcryptjs (hachage mots de passe)

Utilitaires:
- uuid (génération d'identifiants)
- TypeScript 5.x
```

---

# 2. Glossaire et Définitions

## 2.1 Termes Métier

| Terme | Définition |
|-------|------------|
| **IMP** | Investigational Medicinal Product - Médicament expérimental faisant l'objet de l'essai clinique |
| **NIMP** | Non-Investigational Medicinal Product - Médicament auxiliaire utilisé dans l'essai mais non testé |
| **Protocole / Étude** | Essai clinique avec son propre ensemble de règles, médicaments et patients |
| **PUI** | Pharmacie à Usage Intérieur - Service hospitalier gérant les médicaments |
| **ARC** | Attaché de Recherche Clinique - Moniteur du promoteur qui vérifie la conformité |
| **Promoteur / Sponsor** | Entité finançant et organisant l'essai clinique |
| **IWRS/IRT** | Interactive Web Response System / Interactive Response Technology - Système de randomisation |
| **Lot / Batch** | Ensemble de médicaments produits ensemble, identifiés par un numéro unique |
| **Kit** | Ensemble de médicaments conditionnés ensemble pour un patient/visite |
| **DLU** | Date Limite d'Utilisation (expiry date) |
| **Dispensation** | Action de délivrer un médicament à un patient |
| **Retour** | Médicament revenant du patient vers la pharmacie |
| **Destruction** | Élimination définitive d'un médicament |
| **Période Comptable** | Intervalle de temps pendant lequel les mouvements sont regroupés pour validation |
| **SDV** | Source Data Verification - Vérification des données sources par l'ARC |
| **TMF** | Trial Master File - Dossier réglementaire de l'essai |
| **Close-Out** | Clôture de l'étude |

## 2.2 Termes Techniques

| Terme | Définition |
|-------|------------|
| **RBAC** | Role-Based Access Control - Contrôle d'accès basé sur les rôles |
| **Audit Trail** | Journal immuable traçant toutes les actions du système |
| **E-Signature** | Signature électronique valide légalement |
| **Hash** | Empreinte cryptographique permettant de vérifier l'intégrité des données |
| **Append-only** | Mode d'écriture où l'on ne peut qu'ajouter, jamais modifier ni supprimer |
| **JSONB** | Type PostgreSQL pour stocker du JSON avec indexation |
| **FK** | Foreign Key - Clé étrangère référençant une autre table |
| **UTC** | Coordinated Universal Time - Temps universel pour les horodatages |

---

# 3. Architecture Technique

## 3.1 Structure des Dossiers

```
docelium/
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   ├── seed.ts                # Données initiales
│   └── migrations/            # Migrations de base de données
├── src/
│   ├── app/                   # App Router Next.js
│   │   ├── (auth)/           # Routes authentification (layout sans sidebar)
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/      # Routes principales (layout avec sidebar)
│   │   │   ├── layout.tsx    # Layout avec sidebar
│   │   │   ├── page.tsx      # Dashboard principal
│   │   │   ├── studies/      # Gestion des protocoles
│   │   │   │   └── [id]/medications/  # Médicaments d'un protocole
│   │   │   ├── medications/  # Vue globale des médicaments (tous protocoles)
│   │   │   ├── equipments/   # Gestion des équipements
│   │   │   ├── movements/    # Gestion des mouvements
│   │   │   ├── stock/        # Vue du stock
│   │   │   ├── accounting/   # Périodes comptables
│   │   │   ├── destruction/  # Batches de destruction
│   │   │   ├── audit/        # Journal d'audit
│   │   │   ├── exports/      # Exports et rapports
│   │   │   ├── users/        # Gestion utilisateurs (admin)
│   │   │   └── settings/     # Paramètres
│   │   ├── api/              # API Routes
│   │   │   ├── auth/         # Endpoints authentification
│   │   │   ├── studies/
│   │   │   │   └── [id]/medications/  # Médicaments par protocole
│   │   │   ├── medications/  # API globale médicaments (GET tous, filtres)
│   │   │   ├── equipments/
│   │   │   ├── movements/
│   │   │   ├── stock/
│   │   │   ├── accounting-periods/
│   │   │   ├── destruction-batches/
│   │   │   ├── audit/
│   │   │   ├── exports/
│   │   │   ├── esign/
│   │   │   └── users/
│   │   ├── layout.tsx        # Layout racine
│   │   └── globals.css       # Styles globaux
│   ├── components/           # Composants React réutilisables
│   │   ├── ui/               # Composants UI génériques
│   │   │   ├── Sidebar/
│   │   │   ├── DataTable/
│   │   │   ├── FormFields/
│   │   │   ├── Modal/
│   │   │   ├── StatusBadge/
│   │   │   └── ...
│   │   ├── forms/            # Formulaires spécifiques
│   │   ├── layouts/          # Composants de layout
│   │   └── features/         # Composants par fonctionnalité
│   ├── lib/                  # Utilitaires et configuration
│   │   ├── prisma.ts         # Client Prisma singleton
│   │   ├── auth.ts           # Configuration NextAuth
│   │   ├── audit.ts          # Service audit trail
│   │   ├── esign.ts          # Service e-signature
│   │   ├── hash.ts           # Utilitaires de hachage
│   │   ├── permissions.ts    # Vérification des permissions
│   │   └── validators/       # Schémas Zod
│   ├── hooks/                # Hooks React personnalisés
│   ├── types/                # Types TypeScript
│   └── constants/            # Constantes et énumérations
├── public/                   # Assets statiques
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local               # Variables d'environnement
```

## 3.2 Principes d'Architecture

### 3.2.1 Separation of Concerns
- **API Routes** : Logique métier, validation, accès base de données
- **Components** : Affichage et interaction utilisateur
- **Lib** : Services partagés (audit, e-signature, permissions)

### 3.2.2 Sécurité
- Toutes les routes API vérifient l'authentification
- Vérification RBAC sur chaque endpoint
- Validation des données entrantes avec Zod
- Pas de données sensibles côté client

### 3.2.3 Audit Trail
- Chaque action métier génère un événement audit
- Les événements sont immuables (append-only)
- Chaînage cryptographique des événements

---

# 4. Modèle de Données (Prisma Schema)

## 4.1 Énumérations

**IMPORTANT** : Ces énumérations doivent être utilisées EXACTEMENT comme définies. Ne pas les interpréter ou les modifier.

```prisma
// ============================================
// ÉNUMÉRATIONS - À RESPECTER À LA LETTRE
// ============================================

// Rôles utilisateurs
enum UserRole {
  ADMIN
  PHARMACIEN
  TECHNICIEN
  ARC
  AUDITOR
}

// Statut d'une étude/protocole
enum StudyStatus {
  DRAFT
  ACTIVE
  SUSPENDED
  CLOSED
  ARCHIVED
}

// Phase de l'étude clinique
enum StudyPhase {
  PHASE_I
  PHASE_II
  PHASE_III
  PHASE_IV
  NA
}

// Type de médicament
enum MedicationType {
  IMP
  NIMP
}

// Forme galénique du médicament
enum DosageForm {
  TABLET
  CAPSULE
  INJECTION
  SOLUTION
  CREAM
  PATCH
  INHALER
  SUPPOSITORY
  POWDER
  GEL
  SPRAY
  DROPS
  OTHER
}

// Conditions de stockage
enum StorageCondition {
  ROOM_TEMPERATURE
  REFRIGERATED
  FROZEN
  CONTROLLED_ROOM_TEMPERATURE
  PROTECT_FROM_LIGHT
  OTHER
}

// Politique de destruction
enum DestructionPolicy {
  LOCAL_DESTRUCTION
  RETURN_TO_SPONSOR
  BOTH
}

// Unité de comptage
enum CountingUnit {
  UNIT
  BOX
  VIAL
  AMPOULE
  SYRINGE
  BOTTLE
  SACHET
  BLISTER
  KIT
  OTHER
}

// Type de mouvement
enum MovementType {
  RECEPTION
  DISPENSATION
  RETOUR
  DESTRUCTION
  TRANSFER
  ADJUSTMENT
}

// Raison du retour
enum ReturnReason {
  UNUSED
  PARTIALLY_USED
  EXPIRED
  DAMAGED
  PATIENT_WITHDRAWAL
  PROTOCOL_DEVIATION
  ADVERSE_EVENT
  OTHER
}

// Destination du retour (après retour patient)
enum ReturnDestination {
  STOCK
  QUARANTINE
  DESTRUCTION
  SPONSOR_RETURN
}

// Méthode de destruction
enum DestructionMethod {
  INCINERATION
  CHEMICAL
  RETURN_TO_SPONSOR
  OTHER
}

// Statut d'un lot en stock
enum StockItemStatus {
  AVAILABLE
  QUARANTINE
  RESERVED
  EXPIRED
  DESTROYED
  RETURNED_TO_SPONSOR
}

// Statut d'une période comptable
enum AccountingPeriodStatus {
  OPEN
  PENDING_MONITORING
  PENDING_PHARMACIST_SIGNATURE
  LOCKED
}

// Statut d'un batch de destruction
enum DestructionBatchStatus {
  DRAFT
  PENDING_ARC_APPROVAL
  ARC_APPROVED
  ARC_REJECTED
  PENDING_PHARMACIST_SIGNATURE
  SIGNED
  COMPLETED
}

// Type d'entité pour l'audit trail
enum AuditEntityType {
  USER
  STUDY
  MEDICATION
  EQUIPMENT
  STOCK_ITEM
  MOVEMENT
  ACCOUNTING_PERIOD
  DESTRUCTION_BATCH
  DOCUMENT
  STUDY_ACCOUNTING_FINAL
}

// Actions d'audit - Liste complète
enum AuditAction {
  // Sécurité / Authentification
  LOGIN_SUCCESS
  LOGIN_FAILURE
  USER_LOGOUT
  PASSWORD_CHANGE
  PASSWORD_RESET_REQUEST

  // Utilisateurs
  CREATE_USER
  UPDATE_USER
  UPDATE_USER_ROLE
  DEACTIVATE_USER

  // Études / Protocoles
  CREATE_STUDY
  UPDATE_STUDY
  UPDATE_STUDY_CONFIG
  ACTIVATE_STUDY
  SUSPEND_STUDY
  CLOSE_STUDY
  ARCHIVE_STUDY

  // Médicaments
  CREATE_MEDICATION
  UPDATE_MEDICATION
  DEACTIVATE_MEDICATION

  // Équipements
  CREATE_EQUIPMENT
  UPDATE_EQUIPMENT
  DEACTIVATE_EQUIPMENT
  LINK_EQUIPMENT_MEDICATION
  UNLINK_EQUIPMENT_MEDICATION

  // Stock
  CREATE_STOCK_ITEM
  UPDATE_STOCK_ITEM
  QUARANTINE_STOCK_ITEM
  RELEASE_STOCK_ITEM

  // Mouvements
  CREATE_MOVEMENT_RECEPTION
  CREATE_MOVEMENT_DISPENSATION
  CREATE_MOVEMENT_RETOUR
  CREATE_MOVEMENT_DESTRUCTION
  CREATE_MOVEMENT_TRANSFER
  CREATE_MOVEMENT_ADJUSTMENT
  UPDATE_MOVEMENT
  CANCEL_MOVEMENT

  // Périodes comptables
  CREATE_ACCOUNTING_PERIOD
  ACCOUNTING_PERIOD_SET_STATUS_OPEN
  ACCOUNTING_PERIOD_SET_STATUS_PENDING_MONITORING
  ACCOUNTING_PERIOD_SET_STATUS_PENDING_PHARMACIST_SIGNATURE
  ACCOUNTING_PERIOD_SET_STATUS_LOCKED

  // E-Signatures
  ESIGN_MOVEMENT
  ESIGN_ACCOUNTING_PERIOD
  ESIGN_DESTRUCTION_BATCH
  ESIGN_STUDY_ACCOUNTING_FINAL
  ARC_SIGN_ACCOUNTING_PERIOD

  // Destruction
  CREATE_DESTRUCTION_BATCH
  UPDATE_DESTRUCTION_BATCH
  ADD_MOVEMENT_TO_DESTRUCTION_BATCH
  REMOVE_MOVEMENT_FROM_DESTRUCTION_BATCH
  ARC_APPROVE_DESTRUCTION_BATCH
  ARC_REJECT_DESTRUCTION_BATCH

  // Documents
  UPLOAD_DOCUMENT
  DELETE_DOCUMENT
  LINK_DOCUMENT_TO_ENTITY

  // Exports
  EXPORT_GENERATED
  EXPORT_CERTIFIED
  EXPORT_VERIFIED
}

// Type d'entité signable
enum EsignEntityType {
  MOVEMENT
  DESTRUCTION_BATCH
  ACCOUNTING_PERIOD
  STUDY_ACCOUNTING_FINAL
}

// But de la signature
enum EsignPurpose {
  VALIDATE_DESTRUCTION_MOVEMENT
  VALIDATE_DESTRUCTION_BATCH
  LOCK_ACCOUNTING_PERIOD
  LOCK_STUDY_ACCOUNTING_FINAL
  ARC_APPROVAL
  CONFIG_CHANGE_APPROVAL
}

// Méthode d'authentification pour e-signature
enum AuthMethod {
  PASSWORD_ONLY
  PASSWORD_2FA
  SSO_2FA
}
```

## 4.2 Modèles de Données

```prisma
// ============================================
// MODÈLES DE DONNÉES
// ============================================

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  passwordHash      String
  firstName         String
  lastName          String
  role              UserRole
  isActive          Boolean   @default(true)
  lastLoginAt       DateTime?
  passwordChangedAt DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  movements         Movement[]
  auditEvents       AuditEvent[]
  esignatureLogs    EsignatureLog[]
  studyAssignments  StudyUserAssignment[]

  @@map("users")
}

model Study {
  id                    String      @id @default(uuid())
  code                  String      @unique  // Ex: "PROTO-2025-001"
  title                 String
  sponsorName           String
  phase                 StudyPhase
  status                StudyStatus @default(DRAFT)

  // Configuration
  iwrsMode              Boolean     @default(false)  // Intégration IWRS active
  iwrsEndpoint          String?     // URL API IWRS si applicable
  destructionPolicy     DestructionPolicy @default(LOCAL_DESTRUCTION)
  requireArcApproval    Boolean     @default(true)   // Visa ARC requis
  requireEsignDispensation Boolean  @default(false)  // E-sign pour dispensation

  // Dates
  startDate             DateTime?
  expectedEndDate       DateTime?
  actualEndDate         DateTime?

  // Champs personnalisés (flexibilité)
  customFields          Json?       // JSONB pour champs additionnels

  // Métadonnées
  isActive              Boolean     @default(true)
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  // Relations
  medications           Medication[]
  equipments            Equipment[]
  movements             Movement[]
  stockItems            StockItem[]
  accountingPeriods     AccountingPeriod[]
  destructionBatches    DestructionBatch[]
  documents             Document[]
  userAssignments       StudyUserAssignment[]
  auditEvents           AuditEvent[]
  studyAccountingFinal  StudyAccountingFinal?

  @@map("studies")
}

// Association utilisateurs - études (pour filtrage par protocole)
model StudyUserAssignment {
  id        String   @id @default(uuid())
  studyId   String
  userId    String
  assignedAt DateTime @default(now())

  study     Study    @relation(fields: [studyId], references: [id])
  user      User     @relation(fields: [userId], references: [id])

  @@unique([studyId, userId])
  @@map("study_user_assignments")
}

model Medication {
  id                    String          @id @default(uuid())
  studyId               String

  // Identification
  code                  String          // Code interne du médicament
  name                  String
  type                  MedicationType  // IMP ou NIMP

  // Caractéristiques
  dosageForm            DosageForm
  strength              String?         // Ex: "100mg", "5mg/ml"
  manufacturer          String?

  // Stockage
  storageCondition      StorageCondition
  storageInstructions   String?         // Instructions spécifiques

  // Comptabilité
  countingUnit          CountingUnit
  unitsPerPackage       Int             @default(1)

  // Configuration
  destructionPolicy     DestructionPolicy?  // Peut surcharger celle de l'étude
  iwrsRequired          Boolean         @default(false)  // Dispensation via IWRS
  requiresEsign         Boolean         @default(false)  // E-sign destruction
  isBlinded             Boolean         @default(false)  // Produit en aveugle

  // Métadonnées
  isActive              Boolean         @default(true)
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  // Relations
  study                 Study           @relation(fields: [studyId], references: [id])
  stockItems            StockItem[]
  movements             Movement[]
  equipmentLinks        MedicationEquipmentLink[]

  @@unique([studyId, code])
  @@map("medications")
}

model Equipment {
  id                    String          @id @default(uuid())
  studyId               String

  // Identification
  code                  String
  name                  String
  description           String?

  // Caractéristiques
  category              String?         // Ex: "CSTD", "Seringue", "Pompe"
  serialNumber          String?

  // Stock
  countingUnit          CountingUnit    @default(UNIT)

  // Configuration
  requiresEsign         Boolean         @default(false)
  isReusable            Boolean         @default(false)

  // Métadonnées
  isActive              Boolean         @default(true)
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  // Relations
  study                 Study           @relation(fields: [studyId], references: [id])
  stockItems            StockItem[]
  movements             Movement[]
  medicationLinks       MedicationEquipmentLink[]

  @@unique([studyId, code])
  @@map("equipments")
}

// Lien entre médicaments et équipements (ex: CSTD pour cytotoxique)
model MedicationEquipmentLink {
  id            String     @id @default(uuid())
  medicationId  String
  equipmentId   String
  isRequired    Boolean    @default(false)  // Équipement obligatoire
  createdAt     DateTime   @default(now())

  medication    Medication @relation(fields: [medicationId], references: [id])
  equipment     Equipment  @relation(fields: [equipmentId], references: [id])

  @@unique([medicationId, equipmentId])
  @@map("medication_equipment_links")
}

model StockItem {
  id                String          @id @default(uuid())
  studyId           String
  medicationId      String?         // Null si équipement
  equipmentId       String?         // Null si médicament

  // Identification du lot
  batchNumber       String          // Numéro de lot
  kitNumber         String?         // Numéro de kit si applicable

  // Quantités
  initialQuantity   Int
  currentQuantity   Int

  // Dates
  expiryDate        DateTime?
  manufacturingDate DateTime?
  receptionDate     DateTime

  // Statut
  status            StockItemStatus @default(AVAILABLE)
  quarantineReason  String?

  // Localisation
  storageLocation   String?         // Ex: "Frigo A, Étagère 2"

  // Verrouillage
  isLocked          Boolean         @default(false)
  lockedAt          DateTime?
  lockedByPeriodId  String?

  // Métadonnées
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  // Relations
  study             Study           @relation(fields: [studyId], references: [id])
  medication        Medication?     @relation(fields: [medicationId], references: [id])
  equipment         Equipment?      @relation(fields: [equipmentId], references: [id])
  movements         Movement[]

  @@map("stock_items")
}

model Movement {
  id                    String          @id @default(uuid())
  studyId               String
  medicationId          String?
  equipmentId           String?
  stockItemId           String?
  periodId              String?         // Période comptable associée

  // Type et données
  type                  MovementType
  quantity              Int
  movementDate          DateTime        // Date effective du mouvement

  // Patient (pour dispensation/retour)
  patientId             String?         // ID patient (peut être pseudonymisé)
  visitNumber           String?         // Numéro de visite

  // Réception
  supplierName          String?
  deliveryNoteNumber    String?

  // Retour spécifique
  returnReason          ReturnReason?
  returnDestination     ReturnDestination?
  returnedQuantityUsed  Int?            // Quantité utilisée (retour partiel)
  returnedQuantityUnused Int?           // Quantité non utilisée

  // Destruction spécifique
  destructionMethod     DestructionMethod?
  destructionBatchId    String?
  destructionWitnessName String?
  destructionCertificateNumber String?

  // Transfert spécifique
  transferFromLocation  String?
  transferToLocation    String?

  // Ajustement spécifique
  adjustmentReason      String?

  // IWRS
  iwrsConfirmationNumber String?

  // Données supplémentaires
  notes                 String?

  // E-Signature
  isSigned              Boolean         @default(false)
  signedBy              String?
  signedAt              DateTime?

  // Verrouillage
  isLocked              Boolean         @default(false)
  lockedAt              DateTime?

  // Utilisateur
  performedById         String

  // Métadonnées
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  // Relations
  study                 Study           @relation(fields: [studyId], references: [id])
  medication            Medication?     @relation(fields: [medicationId], references: [id])
  equipment             Equipment?      @relation(fields: [equipmentId], references: [id])
  stockItem             StockItem?      @relation(fields: [stockItemId], references: [id])
  period                AccountingPeriod? @relation(fields: [periodId], references: [id])
  destructionBatch      DestructionBatch? @relation(fields: [destructionBatchId], references: [id])
  performedBy           User            @relation(fields: [performedById], references: [id])
  esignatureLogs        EsignatureLog[]

  @@map("movements")
}

model AccountingPeriod {
  id                    String                  @id @default(uuid())
  studyId               String

  // Période
  periodNumber          Int                     // Numéro séquentiel
  periodLabel           String                  // Ex: "Janvier 2025", "Q1 2025"
  startDate             DateTime
  endDate               DateTime

  // Statut
  status                AccountingPeriodStatus  @default(OPEN)

  // Validation ARC
  arcApprovalStatus     String?                 // PENDING, APPROVED, REJECTED
  arcApprovedBy         String?
  arcApprovedAt         DateTime?
  arcComments           String?

  // Signature pharmacien
  pharmacistSignedBy    String?
  pharmacistSignedAt    DateTime?

  // Totaux calculés (snapshot au moment du verrouillage)
  totalReceptions       Int?
  totalDispensations    Int?
  totalReturns          Int?
  totalDestructions     Int?
  closingBalance        Int?

  // Hash pour vérification
  dataHash              String?

  // Métadonnées
  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt

  // Relations
  study                 Study                   @relation(fields: [studyId], references: [id])
  movements             Movement[]
  esignatureLogs        EsignatureLog[]

  @@unique([studyId, periodNumber])
  @@map("accounting_periods")
}

model DestructionBatch {
  id                    String                  @id @default(uuid())
  studyId               String

  // Identification
  batchNumber           String                  // Numéro du batch de destruction

  // Période
  destructionDate       DateTime?

  // Méthode
  destructionMethod     DestructionMethod
  destructionLocation   String?

  // Témoin
  witnessName           String?
  witnessFn             String?                 // Fonction du témoin

  // Statut
  status                DestructionBatchStatus  @default(DRAFT)

  // Validation ARC
  arcApprovedBy         String?
  arcApprovedAt         DateTime?
  arcRejectedReason     String?

  // Signature pharmacien
  pharmacistSignedBy    String?
  pharmacistSignedAt    DateTime?

  // Hash pour vérification
  dataHash              String?

  // Métadonnées
  createdAt             DateTime                @default(now())
  updatedAt             DateTime                @updatedAt

  // Relations
  study                 Study                   @relation(fields: [studyId], references: [id])
  movements             Movement[]              // Mouvements de destruction inclus
  esignatureLogs        EsignatureLog[]

  @@unique([studyId, batchNumber])
  @@map("destruction_batches")
}

// Comptabilité globale finale de l'étude
model StudyAccountingFinal {
  id                    String          @id @default(uuid())
  studyId               String          @unique

  // Statut
  status                String          @default("DRAFT")  // DRAFT, PENDING_SIGNATURE, LOCKED_FINAL

  // Totaux globaux
  totalReceived         Int?
  totalDispensed        Int?
  totalReturned         Int?
  totalDestroyed        Int?
  totalReturnedToSponsor Int?
  finalBalance          Int?

  // Signature
  pharmacistSignedBy    String?
  pharmacistSignedAt    DateTime?

  // ARC
  arcApprovedBy         String?
  arcApprovedAt         DateTime?

  // Hash
  dataHash              String?

  // Métadonnées
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  // Relations
  study                 Study           @relation(fields: [studyId], references: [id])
  esignatureLogs        EsignatureLog[]

  @@map("study_accounting_final")
}

model Document {
  id                    String          @id @default(uuid())
  studyId               String

  // Fichier
  fileName              String
  fileType              String          // MIME type
  fileSize              Int
  filePath              String          // Chemin stockage

  // Métadonnées
  description           String?
  category              String?         // Ex: "Attestation destruction", "Bon de livraison"

  // Liens
  linkedEntityType      String?         // Type d'entité liée
  linkedEntityId        String?         // ID de l'entité liée

  // Upload
  uploadedById          String
  uploadedAt            DateTime        @default(now())

  // Suppression logique
  isDeleted             Boolean         @default(false)
  deletedAt             DateTime?
  deletedBy             String?

  // Relations
  study                 Study           @relation(fields: [studyId], references: [id])

  @@map("documents")
}

// ============================================
// AUDIT TRAIL - Table append-only
// ============================================

model AuditEvent {
  id                    String          @id @default(uuid())
  timestamp             DateTime        @default(now())

  // Utilisateur
  userId                String?         // Peut être null pour événements système
  userRoleSnapshot      UserRole?       // Rôle au moment de l'action

  // Action
  action                AuditAction

  // Entité ciblée
  entityType            AuditEntityType
  entityId              String

  // Contexte
  studyId               String?
  periodId              String?
  batchId               String?

  // Données avant/après (JSONB)
  detailsBefore         Json?
  detailsAfter          Json?

  // Informations client
  clientInfo            Json?           // IP, user-agent

  // Chaînage cryptographique
  hash                  String
  previousHash          String?

  // Métadonnées e-signature si applicable
  signatureMetadata     Json?

  // Relations
  user                  User?           @relation(fields: [userId], references: [id])
  study                 Study?          @relation(fields: [studyId], references: [id])

  @@index([entityType, entityId])
  @@index([studyId])
  @@index([userId])
  @@index([timestamp])
  @@map("audit_events")
}

// ============================================
// E-SIGNATURE
// ============================================

model EsignatureLog {
  id                    String          @id @default(uuid())

  // Entité signée
  entityType            EsignEntityType
  entityId              String

  // Signataire
  signerUserId          String
  signerRoleSnapshot    UserRole

  // But de la signature
  purpose               EsignPurpose

  // Horodatage
  signedAt              DateTime        @default(now())

  // Méthode d'authentification
  authMethod            AuthMethod
  authContext           Json?           // Détails 2FA, SSO, etc.

  // Intégrité
  signingDataHash       String          // Hash du snapshot signé
  previousSignatureHash String?         // Chaînage optionnel

  // Métadonnées
  metadata              Json?

  // Relations
  signer                User            @relation(fields: [signerUserId], references: [id])
  movement              Movement?       @relation(fields: [entityId], references: [id], map: "esignature_movement")
  accountingPeriod      AccountingPeriod? @relation(fields: [entityId], references: [id], map: "esignature_period")
  destructionBatch      DestructionBatch? @relation(fields: [entityId], references: [id], map: "esignature_batch")
  studyAccountingFinal  StudyAccountingFinal? @relation(fields: [entityId], references: [id], map: "esignature_final")

  @@index([entityType, entityId])
  @@map("esignature_logs")
}
```

---

# 5. Système RBAC - Rôles et Permissions

## 5.1 Définition des Rôles

### ADMIN
- **Description** : Administrateur système
- **Responsabilités** : Gestion des utilisateurs, configuration globale, accès total
- **Accès** : Toutes les fonctionnalités

### PHARMACIEN
- **Description** : Pharmacien responsable des essais cliniques
- **Responsabilités** :
  - Validation et signature des documents comptables
  - Gestion des mouvements
  - E-signature des destructions et périodes comptables
- **Accès** : Études assignées, signature, validation

### TECHNICIEN
- **Description** : Préparateur en pharmacie
- **Responsabilités** :
  - Saisie des mouvements quotidiens
  - Gestion du stock
- **Accès** : Études assignées, saisie (pas de signature)

### ARC (Attaché de Recherche Clinique)
- **Description** : Moniteur du promoteur
- **Responsabilités** :
  - Vérification des données (SDV)
  - Approbation/visa des périodes et batches de destruction
- **Accès** : Lecture + approbation sur études assignées

### AUDITOR
- **Description** : Auditeur ou inspecteur
- **Responsabilités** :
  - Consultation de l'audit trail
  - Vérification de conformité
- **Accès** : Lecture seule

## 5.2 Matrice des Permissions

```typescript
// src/constants/permissions.ts

export const PERMISSIONS = {
  // Études
  STUDY_CREATE: ['ADMIN'],
  STUDY_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'],
  STUDY_UPDATE: ['ADMIN', 'PHARMACIEN'],
  STUDY_DELETE: ['ADMIN'],
  STUDY_ACTIVATE: ['ADMIN', 'PHARMACIEN'],
  STUDY_ARCHIVE: ['ADMIN'],

  // Médicaments
  MEDICATION_CREATE: ['ADMIN', 'PHARMACIEN'],
  MEDICATION_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'],
  MEDICATION_UPDATE: ['ADMIN', 'PHARMACIEN'],
  MEDICATION_DEACTIVATE: ['ADMIN', 'PHARMACIEN'],

  // Équipements
  EQUIPMENT_CREATE: ['ADMIN', 'PHARMACIEN'],
  EQUIPMENT_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'],
  EQUIPMENT_UPDATE: ['ADMIN', 'PHARMACIEN'],
  EQUIPMENT_DEACTIVATE: ['ADMIN', 'PHARMACIEN'],

  // Mouvements
  MOVEMENT_CREATE: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN'],
  MOVEMENT_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'],
  MOVEMENT_UPDATE: ['ADMIN', 'PHARMACIEN'],  // Avant verrouillage
  MOVEMENT_ESIGN: ['ADMIN', 'PHARMACIEN'],

  // Stock
  STOCK_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'],
  STOCK_QUARANTINE: ['ADMIN', 'PHARMACIEN'],
  STOCK_ADJUST: ['ADMIN', 'PHARMACIEN'],

  // Périodes comptables
  PERIOD_CREATE: ['ADMIN', 'PHARMACIEN'],
  PERIOD_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'],
  PERIOD_UPDATE_STATUS: ['ADMIN', 'PHARMACIEN'],
  PERIOD_ESIGN: ['PHARMACIEN'],
  PERIOD_ARC_APPROVE: ['ARC'],

  // Batches de destruction
  DESTRUCTION_BATCH_CREATE: ['ADMIN', 'PHARMACIEN'],
  DESTRUCTION_BATCH_READ: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR'],
  DESTRUCTION_BATCH_UPDATE: ['ADMIN', 'PHARMACIEN'],
  DESTRUCTION_BATCH_ARC_APPROVE: ['ARC'],
  DESTRUCTION_BATCH_ESIGN: ['PHARMACIEN'],

  // Audit
  AUDIT_READ: ['ADMIN', 'PHARMACIEN', 'ARC', 'AUDITOR'],
  AUDIT_EXPORT: ['ADMIN', 'PHARMACIEN', 'AUDITOR'],

  // Exports
  EXPORT_GENERATE: ['ADMIN', 'PHARMACIEN', 'ARC'],
  EXPORT_CERTIFIED: ['PHARMACIEN'],

  // Utilisateurs
  USER_CREATE: ['ADMIN'],
  USER_READ: ['ADMIN'],
  USER_UPDATE: ['ADMIN'],
  USER_DEACTIVATE: ['ADMIN'],
  USER_ASSIGN_STUDY: ['ADMIN'],
} as const;
```

## 5.3 Filtrage par Étude

Les utilisateurs non-ADMIN ne voient que les études auxquelles ils sont assignés via `StudyUserAssignment`.

```typescript
// src/lib/permissions.ts

export async function getAccessibleStudyIds(userId: string, role: UserRole): Promise<string[]> {
  if (role === 'ADMIN') {
    // Admin voit tout
    const studies = await prisma.study.findMany({ select: { id: true } });
    return studies.map(s => s.id);
  }

  // Autres rôles : uniquement études assignées
  const assignments = await prisma.studyUserAssignment.findMany({
    where: { userId },
    select: { studyId: true }
  });

  return assignments.map(a => a.studyId);
}

export function checkPermission(
  userRole: UserRole,
  permission: keyof typeof PERMISSIONS
): boolean {
  return PERMISSIONS[permission].includes(userRole);
}
```

---

# 6. Module Authentification

## 6.1 Configuration NextAuth

```typescript
// src/lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { createAuditEvent } from './audit';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.isActive) {
          // Log échec
          await createAuditEvent({
            action: 'LOGIN_FAILURE',
            entityType: 'USER',
            entityId: user?.id || 'unknown',
            detailsAfter: { email: credentials.email, reason: 'User not found or inactive' },
            clientInfo: { ip: req?.headers?.['x-forwarded-for'] }
          });
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          await createAuditEvent({
            action: 'LOGIN_FAILURE',
            entityType: 'USER',
            entityId: user.id,
            userId: user.id,
            detailsAfter: { reason: 'Invalid password' },
            clientInfo: { ip: req?.headers?.['x-forwarded-for'] }
          });
          return null;
        }

        // Mise à jour lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        // Log succès
        await createAuditEvent({
          action: 'LOGIN_SUCCESS',
          entityType: 'USER',
          entityId: user.id,
          userId: user.id,
          userRoleSnapshot: user.role,
          clientInfo: { ip: req?.headers?.['x-forwarded-for'] }
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
        };
      }
    })
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
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 heures
  },
};
```

## 6.2 Middleware de Protection

```typescript
// src/middleware.ts

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Routes protégées additionnelles selon le rôle
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Seul ADMIN peut accéder à /users
    if (path.startsWith('/users') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|login|forgot-password|_next/static|_next/image|favicon.ico).*)'
  ]
};
```

---

# 7. Module Protocoles (Études)

## 7.1 Vue d'Ensemble

Un **protocole** (ou étude) est l'entité centrale de DOCELIUM. Il représente un essai clinique avec toutes ses configurations, règles et contraintes.

### Cycle de Vie d'un Protocole

```
DRAFT ──────► ACTIVE ──────► CLOSED ──────► ARCHIVED
                │
                ▼
           TEMPORARILY_SUSPENDED
                │
                ▼
          CLOSED_TO_ENROLLMENT
                │
                ▼
          CLOSED_TO_TREATMENT
                │
                ▼
            TERMINATED
```

### Énumération des Statuts (À RESPECTER EXACTEMENT)

```typescript
enum ProtocolStatus {
  DRAFT                    // Brouillon, en cours de configuration
  ACTIVE                   // Actif, opérationnel
  TEMPORARILY_SUSPENDED    // Suspendu temporairement
  CLOSED_TO_ENROLLMENT     // Fermé aux inclusions (nouveaux patients)
  CLOSED_TO_TREATMENT      // Fermé au traitement
  TERMINATED               // Terminé (arrêt anticipé)
  ARCHIVED                 // Archivé (lecture seule)
}
```

---

## 7.2 STEPPER DE CRÉATION DE PROTOCOLE - Interface Multi-Étapes

### 7.2.1 Composant Stepper avec Timeline

**IMPORTANT** : La création d'un protocole se fait via un **formulaire multi-étapes (Stepper)** avec une **timeline horizontale** en haut de l'écran.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           CRÉATION D'UN NOUVEAU PROTOCOLE                                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐              │
│  │  A  │───►│  B  │───►│  C  │───►│  D  │───►│  E  │───►│  G  │───►│  H  │───►...       │
│  │ ✓  │    │ ✓  │    │ ●  │    │ ○  │    │ ○  │    │ ○  │    │ ○  │              │
│  └─────┘    └─────┘    └─────┘    └─────┘    └─────┘    └─────┘    └─────┘              │
│  Identif.  Contacts   Regulatory  Paramètres Quality    Visit    Patients              │
│                                                                                          │
│ ═══════════════════════════════════════════════════════════════════════════════════════ │
│                                                                                          │
│                         [ CONTENU DE L'ÉTAPE COURANTE ]                                 │
│                                                                                          │
│ ═══════════════════════════════════════════════════════════════════════════════════════ │
│                                                                                          │
│         [ ◄ Précédent ]                                         [ Suivant ► ]           │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

Légende Timeline :
  ✓ = Étape complétée (vert, cliquable pour revenir)
  ● = Étape courante (bleu)
  ○ = Étape à venir (gris, non cliquable)

Note: La suite des étapes après H : I → L → M → N
```

### 7.2.2 Comportement du Stepper

| Fonctionnalité | Description |
|----------------|-------------|
| **Navigation avant** | Bouton "Suivant" - Valide l'étape courante avant de passer à la suivante |
| **Navigation arrière** | Bouton "Précédent" ou clic sur étape complétée dans la timeline |
| **Clic sur timeline** | Permet de revenir aux étapes déjà validées uniquement |
| **Sauvegarde brouillon** | Bouton "Enregistrer brouillon" disponible à tout moment |
| **Validation par étape** | Chaque étape est validée individuellement avant passage |
| **Indicateurs visuels** | Couleurs et icônes indiquant l'état de chaque étape |
| **Erreurs** | Les erreurs de validation sont affichées dans l'étape concernée |

### 7.2.3 Composant React Stepper (MUI)

```typescript
// src/components/features/study/StudyCreationStepper.tsx

import { Stepper, Step, StepLabel, StepButton } from '@mui/material';

const STUDY_CREATION_STEPS = [
  { key: 'A', label: 'Identification', required: true },
  { key: 'B', label: 'Organisation & Contacts', required: true },
  { key: 'C', label: 'Regulatory Identifiers', required: true },
  { key: 'D', label: 'Paramètres opérationnels', required: true },
  { key: 'E', label: 'Data Quality Profile', required: false },
  { key: 'G', label: 'Visit Schedule', required: false },
  { key: 'H', label: 'Patient Constraints', required: false },
  { key: 'I', label: 'Temperature Governance', required: false },
  { key: 'L', label: 'IWRS Governance', required: true },
  { key: 'M', label: 'Equipment Requirements', required: false },
  { key: 'N', label: 'Site Overrides', required: false },
];

interface StudyCreationStepperProps {
  activeStep: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

export function StudyCreationStepper({
  activeStep,
  completedSteps,
  onStepClick
}: StudyCreationStepperProps) {
  return (
    <Stepper activeStep={activeStep} alternativeLabel nonLinear>
      {STUDY_CREATION_STEPS.map((step, index) => (
        <Step key={step.key} completed={completedSteps.has(index)}>
          <StepButton
            onClick={() => onStepClick(index)}
            disabled={index > activeStep && !completedSteps.has(index - 1)}
          >
            <StepLabel
              optional={!step.required ? <small>Optionnel</small> : undefined}
            >
              {step.label}
            </StepLabel>
          </StepButton>
        </Step>
      ))}
    </Stepper>
  );
}
```

---

## 7.3 LES 11 ÉTAPES DE CRÉATION (BLOCS A, B, C, D, E, G, H, I, L, M, N)

### BLOC A — Identification du Protocole

**Description** : Informations de base identifiant l'étude.

| Champ | Type | Obligatoire | Validation | Description |
|-------|------|-------------|------------|-------------|
| `protocol_status` | Enum | Oui | Voir énumération | Statut du protocole |
| `code_internal` | String | Oui | Unique, alphanumérique | Code interne (ex: "ONC-2024-TRIAL-01") |
| `eu_ct_number` | String | Non | Format EU-CTR | Numéro EU Clinical Trials (ex: "2024-000567-29") |
| `nct_number` | String | Oui | Format NCT | Numéro ClinicalTrials.gov (ex: "NCT05687266") |
| `title` | String (long) | Oui | Min 10 caractères | Titre complet de l'étude |
| `sponsor` | String | Oui | - | Nom du promoteur/sponsor |
| `phase` | Enum | Oui | Voir énumération | Phase de l'étude |
| `therapeutic_area` | String | Oui | - | Aire thérapeutique (ex: "ONCOLOGY") |
| `site_activation_date` | Date | Oui | - | Date d'activation du site |
| `expected_recruitment` | Integer | Oui | > 0 | Nombre de patients attendus |
| `complexity_level` | Enum | Oui | LOW, MEDIUM, HIGH | Niveau de complexité |

**Énumérations Bloc A** :

```typescript
enum StudyPhase {
  I        // Phase I
  I_II     // Phase I/II
  II       // Phase II
  III      // Phase III
  IV       // Phase IV
  OTHER    // Autre
}

enum ComplexityLevel {
  LOW
  MEDIUM
  HIGH
}
```

---

### BLOC B — Organisation & Contacts

**Description** : Contacts clés du protocole.

**Structure** : Table `study_contacts` ou champs JSONB dans `study`.

| Contact | Champs | Obligatoire |
|---------|--------|-------------|
| **Principal Investigator (PI)** | name, email, phone | Oui |
| **Study Coordinator (SC)** | name, email, phone | Oui |
| **CRA Promoteur** | name, email, phone | Oui |
| **Project Manager (Sponsor/CRO)** | name, email, phone | Non |

```typescript
interface StudyContact {
  role: 'PI' | 'SC' | 'CRA' | 'PM';
  name: string;
  email: string;
  phone?: string;
}
```

---

### BLOC C — Regulatory Identifiers

**Description** : Identifiants réglementaires et versioning du protocole.

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `protocol_version` | String | Oui | Version actuelle (ex: "V5.0") |
| `protocol_version_date` | Date | Oui | Date de la version |
| `amendments` | JSON Array | Non | Liste des amendements [{version, date}] |
| `eu_ctr_approval_reference` | Date | Non | Date d'approbation EU-CTR |
| `ethics_approval_reference` | String | Non | Référence approbation éthique (CPP) |
| `insurance_reference` | String | Non | Référence assurance |
| `eudamed_id` | String | Non | ID EUDAMED (si dispositif médical) |

```typescript
interface Amendment {
  version: string;  // Ex: "Amendment 1"
  date: string;     // Format ISO date
}
```

---

### BLOC D — Paramètres Opérationnels Généraux

**Description** : Configuration opérationnelle globale du protocole.

#### Section D.1 : Blinding (Aveugle)

| Champ | Type | Description |
|-------|------|-------------|
| `blinded` | Enum | Type d'aveugle |

```typescript
enum BlindingType {
  NONE    // Ouvert
  SINGLE  // Simple aveugle
  DOUBLE  // Double aveugle
  TRIPLE  // Triple aveugle
}
```

#### Section D.2 : Randomisation / Bras

| Champ | Type | Description |
|-------|------|-------------|
| `arms` | String[] | Liste des bras de traitement (ex: ["A", "B", "C"]) |
| `cohorts` | String[] | Liste des cohortes (ex: ["Cohorte 1", "Cohorte 2"]) |

#### Section D.3 : Destruction / Retour

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `destruction_policy` | Enum | LOCAL, SPONSOR, MIXED | Politique de destruction |
| `return_policy` | Enum | LOCAL_STOCK, SPONSOR_RETURN | Politique de retour |

```typescript
enum DestructionPolicy {
  LOCAL    // Destruction locale
  SPONSOR  // Retour au sponsor pour destruction
  MIXED    // Les deux possibles
}

enum ReturnPolicy {
  LOCAL_STOCK     // Retour en stock local
  SPONSOR_RETURN  // Retour au sponsor
}
```

#### Section D.4 : Exigences Mouvements

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `requires_patient_for_dispensation` | Boolean | true | Patient obligatoire pour dispensation |
| `allows_dispensation_without_iwrs` | Boolean | false | Dispensation sans IWRS autorisée |
| `temperature_tracking_enabled` | Boolean | false | Suivi température activé |
| `returned_material_reusable` | Boolean | false | Matériel retourné réutilisable |

---

### BLOC E — Data Quality Profile

**Description** : Paramétrage de la rigueur documentaire.

| Champ | Type | Description |
|-------|------|-------------|
| `requires_double_signature` | Boolean | Double signature requise |
| `requires_pharmacist_signature` | Boolean | Signature pharmacien requise |
| `requires_weight_recency_days` | Integer | Poids patient récent (en jours, ex: 7) |
| `comment_required_on_override` | Boolean | Commentaire obligatoire sur dérogation |

```typescript
interface DataQualityProfile {
  requires_double_signature: boolean;
  requires_pharmacist_signature: boolean;
  requires_weight_recency_days: number | null;
  comment_required_on_override: boolean;
}
```

---

### BLOC G — Visit Schedule / Treatment Schema

**Description** : Calendrier des visites et schéma de traitement.

#### Visit Schedule

```typescript
interface VisitScheduleItem {
  visit_code: string;     // Ex: "C1D1", "C1D8", "C2D1"
  day: number;            // Jour depuis début (1, 8, 22...)
  requires_dispense: boolean;  // Dispensation requise à cette visite
}

// Exemple
const visit_schedule: VisitScheduleItem[] = [
  { visit_code: "C1D1", day: 1, requires_dispense: true },
  { visit_code: "C1D8", day: 8, requires_dispense: false },
  { visit_code: "C2D1", day: 22, requires_dispense: true }
];
```

#### Treatment Cycles

```typescript
interface TreatmentCycles {
  cycle_length: number | null;  // Durée d'un cycle en jours (ex: 21)
  max_cycles: number | null;    // Nombre max de cycles (ex: 6)
}
```

---

### BLOC H — Patient Constraints

**Description** : Contraintes liées aux patients.

| Champ | Type | Description |
|-------|------|-------------|
| `min_age` | Integer | Âge minimum (ex: 18) |
| `max_age` | Integer | Âge maximum (optionnel) |
| `min_weight` | Float | Poids minimum en kg (optionnel) |
| `requires_recent_weight_days` | Integer | Poids récent requis (jours) |
| `weight_variation_threshold` | Float | Seuil variation poids (%, ex: 10) |
| `weight_reference` | Enum | BASELINE, CURRENT | Référence pour calcul dose |

```typescript
interface PatientConstraints {
  min_age: number | null;
  max_age: number | null;
  min_weight: number | null;
  requires_recent_weight_days: number | null;
  weight_variation_threshold: number | null;
  weight_reference: 'BASELINE' | 'CURRENT';
}
```

---

### BLOC I — Temperature Governance Model

**Description** : Politique de gestion de la chaîne du froid.

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `temperature_governance` | Enum | BASIC, FULL | Niveau de gouvernance température |
| `excursion_action_required` | Boolean | - | Action requise sur excursion |
| `excursion_time_threshold` | String | - | Seuil temps excursion (ex: "30m", "2h") |

```typescript
enum TemperatureGovernance {
  BASIC  // Suivi basique
  FULL   // Suivi complet avec alertes
}
```

**Règle de cohérence** : Si `temperature_tracking_enabled = true`, alors `temperature_governance` ne peut pas être vide.

---

### BLOC L — IWRS Governance

**Description** : Configuration de l'intégration IWRS.

| Champ | Type | Valeurs | Description |
|-------|------|---------|-------------|
| `iwrs_integration` | Boolean | - | Intégration IWRS activée |
| `iwrs_integration_mode` | Enum | MANUAL, CSV, API | Mode d'intégration |
| `iwrs_allows_partial_data` | Boolean | - | Données partielles acceptées |
| `iwrs_requires_visit_code` | Boolean | - | Code visite requis |
| `iwrs_endpoint` | String | - | URL endpoint API IWRS |

```typescript
enum IwrsIntegrationMode {
  MANUAL  // Saisie manuelle du numéro IWRS
  CSV     // Import fichier CSV
  API     // Intégration API temps réel
}

interface IwrsGovernance {
  iwrs_integration: boolean;
  iwrs_integration_mode: IwrsIntegrationMode;
  iwrs_allows_partial_data: boolean;
  iwrs_requires_visit_code: boolean;
  iwrs_endpoint: string | null;
}
```

**Règle de cohérence** : Si `iwrs_integration_mode = MANUAL`, alors `allows_dispensation_without_iwrs` doit être `true`.

---

### BLOC M — Linked Equipment Requirements

**Description** : Équipements obligatoires pour le protocole.

| Champ | Type | Description |
|-------|------|-------------|
| `protocol_required_equipments` | UUID[] | Liste des IDs équipements requis |

**Exemples d'équipements** :
- Systèmes CSTD (Closed System Transfer Device)
- Filtres 0.2 µm
- Protecteurs lumière
- Tubulures spécifiques
- Pompes à perfusion

```typescript
// Sélection depuis la liste des équipements déjà créés
interface EquipmentRequirement {
  equipment_id: string;
  is_mandatory: boolean;  // Obligatoire ou recommandé
}
```

---

### BLOC N — Centre-level Customization Overrides

**Description** : Personnalisations locales du centre/PUI.

| Champ | Type | Description |
|-------|------|-------------|
| `requires_local_quarantine_step` | Boolean | Étape quarantaine locale requise |
| `requires_extra_reception_fields` | String[] | Champs supplémentaires réception |
| `local_procedure_references` | Object[] | Références procédures locales |

```typescript
interface LocalProcedure {
  name: string;       // Ex: "Gestion des réceptions"
  reference: string;  // Ex: "PUI-ONC-2024-11"
}

interface SiteOverrides {
  requires_local_quarantine_step: boolean;
  requires_extra_reception_fields: string[];
  local_procedure_references: LocalProcedure[];
}
```

---

## 7.4 Modèle de Données Complet du Protocole

```prisma
model Study {
  id                    String      @id @default(uuid())

  // === BLOC A : Identification ===
  protocol_status       ProtocolStatus @default(DRAFT)
  code_internal         String      @unique
  eu_ct_number          String?
  nct_number            String
  title                 String
  sponsor               String
  phase                 StudyPhase
  therapeutic_area      String
  site_activation_date  DateTime
  expected_recruitment  Int
  complexity_level      ComplexityLevel

  // === BLOC B : Contacts ===
  contacts              Json        // Array de StudyContact

  // === BLOC C : Regulatory ===
  protocol_version      String
  protocol_version_date DateTime
  amendments            Json?       // Array de Amendment
  eu_ctr_approval_reference DateTime?
  ethics_approval_reference String?
  insurance_reference   String?
  eudamed_id            String?

  // === BLOC D : Paramètres opérationnels ===
  blinded               BlindingType @default(NONE)
  arms                  Json?       // String[]
  cohorts               Json?       // String[]
  destruction_policy    DestructionPolicy @default(LOCAL)
  return_policy         ReturnPolicy @default(LOCAL_STOCK)
  requires_patient_for_dispensation Boolean @default(true)
  allows_dispensation_without_iwrs Boolean @default(false)
  temperature_tracking_enabled Boolean @default(false)
  returned_material_reusable Boolean @default(false)

  // === BLOC E : Data Quality Profile ===
  data_quality_profile  Json?       // DataQualityProfile

  // === BLOC G : Visit Schedule ===
  visit_schedule        Json?       // VisitScheduleItem[]
  treatment_cycles      Json?       // TreatmentCycles

  // === BLOC H : Patient Constraints ===
  patient_constraints   Json?       // PatientConstraints

  // === BLOC I : Temperature ===
  temperature_governance TemperatureGovernance?

  // === BLOC L : IWRS ===
  iwrs_governance       Json?       // IwrsGovernance

  // === BLOC M : Equipment Requirements ===
  protocol_required_equipments String[] // Array d'equipment IDs

  // === BLOC N : Site Overrides ===
  site_overrides        Json?       // SiteOverrides

  // === Configuration consolidée ===
  study_config          Json?       // Objet consolidé généré au backend

  // === Métadonnées ===
  isActive              Boolean     @default(true)
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
  createdById           String

  // === Relations ===
  medications           Medication[]
  equipments            Equipment[]
  movements             Movement[]
  stockItems            StockItem[]
  accountingPeriods     AccountingPeriod[]
  destructionBatches    DestructionBatch[]
  documents             Document[]
  userAssignments       StudyUserAssignment[]
  auditEvents           AuditEvent[]
  studyAccountingFinal  StudyAccountingFinal?

  @@map("studies")
}
```

---

## 7.5 Règles de Validation Backend

### Validation par Bloc

```typescript
// src/lib/validators/study-blocks.ts

import { z } from 'zod';

// BLOC A
export const blocASchema = z.object({
  protocol_status: z.enum([
    'DRAFT', 'ACTIVE', 'TEMPORARILY_SUSPENDED',
    'CLOSED_TO_ENROLLMENT', 'CLOSED_TO_TREATMENT',
    'TERMINATED', 'ARCHIVED'
  ]),
  code_internal: z.string().min(1).max(50).regex(/^[A-Z0-9\-]+$/),
  nct_number: z.string().regex(/^NCT\d{8}$/),
  eu_ct_number: z.string().regex(/^\d{4}-\d{6}-\d{2}$/).optional().nullable(),
  title: z.string().min(10).max(500),
  sponsor: z.string().min(1).max(255),
  phase: z.enum(['I', 'I_II', 'II', 'III', 'IV', 'OTHER']),
  therapeutic_area: z.string().min(1),
  site_activation_date: z.coerce.date(),
  expected_recruitment: z.number().int().positive(),
  complexity_level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

// BLOC B
export const blocBSchema = z.object({
  contacts: z.array(z.object({
    role: z.enum(['PI', 'SC', 'CRA', 'PM']),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  })).refine(
    (contacts) => {
      const roles = contacts.map(c => c.role);
      return roles.includes('PI') && roles.includes('SC') && roles.includes('CRA');
    },
    { message: 'PI, SC et CRA sont obligatoires' }
  ),
});

// ... autres blocs

// Validation complète
export const fullStudySchema = blocASchema
  .merge(blocBSchema)
  .merge(blocCSchema)
  // ... etc
```

### Règles de Cohérence Inter-Blocs

```typescript
// Validations croisées à effectuer au backend

function validateStudyCoherence(data: StudyFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Règle 1: IWRS
  if (data.iwrs_governance?.iwrs_integration_mode === 'MANUAL'
      && !data.allows_dispensation_without_iwrs) {
    errors.push({
      field: 'allows_dispensation_without_iwrs',
      message: 'Doit être true si IWRS mode = MANUAL'
    });
  }

  // Règle 2: Température
  if (data.temperature_tracking_enabled
      && !data.temperature_governance) {
    errors.push({
      field: 'temperature_governance',
      message: 'Requis si temperature_tracking_enabled = true'
    });
  }

  // Règle 3: Patient constraints
  if (data.patient_constraints?.requires_recent_weight_days
      && !data.requires_patient_for_dispensation) {
    errors.push({
      field: 'requires_patient_for_dispensation',
      message: 'Doit être true si requires_recent_weight_days est défini'
    });
  }

  return errors;
}
```

---

## 7.6 Actions Backend à la Création

```typescript
// POST /api/studies

async function createStudy(data: CreateStudyInput, userId: string) {
  // 1. Validation complète des 11 blocs
  const validationErrors = validateAllBlocs(data);
  if (validationErrors.length > 0) {
    throw new ValidationException(validationErrors);
  }

  // 2. Vérification unicité code_internal
  const existing = await prisma.study.findUnique({
    where: { code_internal: data.code_internal }
  });
  if (existing) {
    throw new ConflictException('Code protocole déjà utilisé');
  }

  // 3. Génération study_config consolidé
  const studyConfig = generateStudyConfig(data);

  // 4. Insertion en base
  const study = await prisma.study.create({
    data: {
      ...data,
      study_config: studyConfig,
      createdById: userId,
    }
  });

  // 5. Audit trail
  await createAuditEvent({
    action: 'CREATE_STUDY',
    entityType: 'STUDY',
    entityId: study.id,
    userId,
    userRoleSnapshot: await getUserRole(userId),
    studyId: study.id,
    detailsAfter: study,
  });

  return study;
}
```

---

## 7.7 Interface Utilisateur - Liste et Fiche Protocole

### Liste des Protocoles

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  PROTOCOLES                                           [ + Nouveau Protocole ]  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Filtres: [Status ▼] [Phase ▼] [Aire thérapeutique ▼]  🔍 Rechercher...        │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ Code         │ Titre              │ Sponsor  │ Phase │ Status   │ ⋮    │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │ ONC-2024-01  │ Study of Drug X... │ PharmaX  │ III   │ 🟢 ACTIVE │ ⋮    │   │
│  │ HEM-2024-02  │ Trial for Drug Y...│ BioGen   │ II    │ 🟡 DRAFT  │ ⋮    │   │
│  │ CAR-2023-05  │ Cardio Study...    │ CardioC  │ IV    │ 🔴 CLOSED │ ⋮    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Affichage 1-10 sur 45        [ ◄ ] [ 1 ] [ 2 ] [ 3 ] ... [ ► ]                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Fiche Protocole (après création)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ◄ Retour    ONC-2024-TRIAL-01                              🟢 ACTIVE          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────┬────────────┬──────────┬───────┬───────────┬────────────┬───────┐  │
│  │ Général │ Médicaments│ Équipem. │ Stock │ Mouvements│ Comptabilité│ Audit │  │
│  └─────────┴────────────┴──────────┴───────┴───────────┴────────────┴───────┘  │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│                        [ CONTENU DE L'ONGLET SÉLECTIONNÉ ]                     │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  Actions: [ Modifier ] [ Suspendre ] [ Clôturer ] [ Exporter ]                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

# 8. Module Médicaments

## 8.1 Flux de Création d'un Médicament

**IMPORTANT** : Un médicament est toujours lié à un protocole.

```
1. SÉLECTION DU PROTOCOLE
   ↓
   - Le protocole doit être en DRAFT ou ACTIVE

2. SAISIE DES INFORMATIONS DE BASE
   ↓
   - Code, nom, type (IMP/NIMP)
   - Forme galénique, dosage

3. CONFIGURATION DU STOCKAGE
   ↓
   - Conditions de stockage
   - Instructions spécifiques

4. CONFIGURATION DE LA COMPTABILITÉ
   ↓
   - Unité de comptage
   - Unités par emballage

5. CONFIGURATION AVANCÉE
   ↓
   - Politique de destruction (peut surcharger celle du protocole)
   - IWRS requis
   - E-signature requise
   - Produit en aveugle

6. LIAISON ÉQUIPEMENTS (optionnel)
   ↓
   - Associer les équipements nécessaires (ex: CSTD pour cytotoxique)
```

## 8.2 Formulaire de Création/Édition

### Champs Obligatoires
| Champ | Type | Validation | Description |
|-------|------|------------|-------------|
| code | String | Unique par étude | Code interne (ex: "MED-001") |
| name | String | - | Nom du médicament |
| type | MedicationType | IMP ou NIMP | Type de produit |
| dosageForm | DosageForm | Enum | Forme galénique |
| storageCondition | StorageCondition | Enum | Condition de stockage |
| countingUnit | CountingUnit | Enum | Unité de comptage |

### Champs Optionnels
| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| strength | String | null | Dosage (ex: "100mg") |
| manufacturer | String | null | Fabricant |
| storageInstructions | String | null | Instructions spécifiques |
| unitsPerPackage | Int | 1 | Unités par emballage |
| destructionPolicy | DestructionPolicy | null | Surcharge politique étude |
| iwrsRequired | Boolean | false | Dispensation via IWRS |
| requiresEsign | Boolean | false | E-sign destruction |
| isBlinded | Boolean | false | Produit en aveugle |

## 8.3 Règles Métier

1. **Unicité** : Code unique au sein d'un protocole
2. **Modification** :
   - Possible si le protocole est DRAFT ou ACTIVE
   - Certains champs (type, countingUnit) non modifiables après premier mouvement
3. **Désactivation** :
   - Soft delete (isActive = false)
   - Impossible si stock > 0
4. **Liaison équipement** : Un équipement peut être marqué "requis" (dispensation bloquée sans)

## 8.4 Interface Utilisateur

### Liste Globale des Médicaments (`/medications`)
Accessible depuis le menu latéral, cette vue affiche tous les médicaments de tous les protocoles.

**Fonctionnalités** :
- Tableau : Code, Nom, Protocole, Type, Forme, Stockage, Stock actuel, Actions
- Filtres : Recherche texte, Protocole (dropdown), Type (IMP/NIMP)
- Badge coloré pour IMP (bleu) / NIMP (gris)
- Lien vers le protocole associé
- Actions : Voir, Éditer, Désactiver

### Liste des Médicaments (dans un protocole)
- Tableau : Code, Nom, Type, Forme, Stockage, Stock actuel, Actions
- Badge coloré pour IMP (bleu) / NIMP (gris)
- Actions : Voir, Éditer, Désactiver

### Création de Médicament (`/medications/new`)

**Règles de sélection du protocole** :
1. Le protocole est un champ **obligatoire**
2. Seuls les protocoles avec statut `DRAFT` ou `ACTIVE` sont proposés
3. **Si un seul protocole est disponible** : il est automatiquement sélectionné et affiché en lecture seule (non modifiable)
4. **Si plusieurs protocoles sont disponibles** : l'utilisateur doit sélectionner dans un dropdown

### Fiche Médicament
- Informations générales
- Configuration
- Équipements liés
- Stock par lot
- Historique des mouvements

---

# 9. Module Équipements

## 9.1 Flux de Création

Similaire aux médicaments, les équipements sont liés à un protocole.

## 9.2 Formulaire

### Champs Obligatoires
| Champ | Type | Description |
|-------|------|-------------|
| code | String | Code unique par étude |
| name | String | Nom de l'équipement |

### Champs Optionnels
| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| description | String | null | Description |
| category | String | null | Catégorie (CSTD, Seringue...) |
| serialNumber | String | null | Numéro de série |
| countingUnit | CountingUnit | UNIT | Unité de comptage |
| requiresEsign | Boolean | false | E-sign destruction |
| isReusable | Boolean | false | Équipement réutilisable |

## 9.3 Liaison Médicament-Équipement

Un équipement peut être lié à plusieurs médicaments avec un flag "requis" :
- Si `isRequired = true` : La dispensation du médicament nécessite cet équipement
- Si `isRequired = false` : Équipement optionnel/recommandé

---

# 10. Module Mouvements

## 10.1 Types de Mouvements

### RECEPTION
**Description** : Entrée de stock depuis un fournisseur/sponsor

**Champs spécifiques** :
- `supplierName` : Nom du fournisseur
- `deliveryNoteNumber` : Numéro du bon de livraison
- Création automatique d'un `StockItem`

**Flux** :
```
1. Sélection du protocole et médicament/équipement
2. Saisie des informations du lot
   - Numéro de lot (batchNumber)
   - Numéro de kit (optionnel)
   - Date de péremption
   - Quantité reçue
3. Informations fournisseur
4. Localisation de stockage
5. Validation → Création StockItem + Movement
```

### DISPENSATION
**Description** : Sortie de stock vers un patient

**Champs spécifiques** :
- `patientId` : Identifiant patient
- `visitNumber` : Numéro de visite
- `iwrsConfirmationNumber` : Si IWRS actif

**Flux** :
```
1. Sélection du protocole et médicament
2. Sélection du lot (StockItem) - proposer FIFO/FEFO
3. Saisie informations patient
   - ID patient
   - Numéro de visite
4. Quantité dispensée
5. Si IWRS requis → Saisie numéro confirmation IWRS
6. Si équipement requis → Sélection équipement
7. Validation → Décrémentation stock + Movement
```

**Règles** :
- Vérifier stock disponible
- Vérifier non périmé
- Vérifier statut lot = AVAILABLE
- Si `requireEsignDispensation` → E-signature requise

### RETOUR
**Description** : Retour de médicament depuis un patient

**Champs spécifiques** :
- `patientId`, `visitNumber`
- `returnReason` : Raison du retour (enum)
- `returnDestination` : Destination (enum)
- `returnedQuantityUsed` : Quantité utilisée
- `returnedQuantityUnused` : Quantité non utilisée

**Flux** :
```
1. Sélection du protocole et médicament
2. Informations patient (peut rechercher dispensation précédente)
3. Raison du retour (enum ReturnReason)
   - UNUSED, PARTIALLY_USED, EXPIRED, DAMAGED, etc.
4. Quantités
   - Utilisée
   - Non utilisée
5. Destination (enum ReturnDestination)
   - STOCK : Retour en stock (si réutilisable)
   - QUARANTINE : Mise en quarantaine
   - DESTRUCTION : Destruction directe
   - SPONSOR_RETURN : Retour sponsor
6. Validation → Mise à jour selon destination
```

### DESTRUCTION
**Description** : Destruction définitive de médicaments/équipements

**Champs spécifiques** :
- `destructionMethod` : Méthode (enum)
- `destructionBatchId` : Batch de destruction associé
- `destructionWitnessName` : Nom du témoin
- `destructionCertificateNumber` : Numéro certificat

**Flux** :
```
1. Sélection protocole et produit
2. Sélection lot(s) à détruire
3. Quantité
4. Méthode de destruction (enum DestructionMethod)
5. Informations témoin
6. Association à un batch de destruction (optionnel mais recommandé)
7. E-signature pharmacien (si requis)
8. Validation → Stock à 0, statut DESTROYED
```

### TRANSFER
**Description** : Transfert entre localisations

**Champs spécifiques** :
- `transferFromLocation` : Localisation source
- `transferToLocation` : Localisation destination

### ADJUSTMENT
**Description** : Ajustement de stock (correction d'erreur, inventaire)

**Champs spécifiques** :
- `adjustmentReason` : Raison obligatoire

**Règles** :
- Nécessite justification obligatoire
- E-signature recommandée
- Génère alerte audit

## 10.2 Règles Transversales

1. **Verrouillage** : Un mouvement dans une période LOCKED ne peut plus être modifié
2. **Signature** : Certains mouvements nécessitent une e-signature (configurable)
3. **Audit** : Chaque mouvement génère un événement audit
4. **Horodatage** : Date du mouvement = date saisie serveur (pas client)
5. **Stock négatif** : Interdit (validation avant décrémentation)

## 10.3 Interface Utilisateur

### Formulaire de Mouvement
- Stepper multi-étapes adapté au type de mouvement
- Validation en temps réel
- Sélection intelligente des lots (FIFO/FEFO)
- Calcul automatique du stock résultant

### Liste des Mouvements
- Filtres : Type, Période, Médicament, Patient, Date
- Colonnes : Date, Type, Produit, Lot, Quantité, Patient, Utilisateur, Signé
- Export CSV

---

# 11. Module Comptabilité et Périodes

## 11.1 Concept de Période Comptable

Une **période comptable** regroupe les mouvements d'un intervalle de temps pour :
- Réconciliation des stocks
- Validation par l'ARC (monitoring)
- Signature par le pharmacien
- Verrouillage des données

## 11.2 Cycle de Vie d'une Période

```
1. OPEN (Ouverte)
   ↓
   - Période en cours d'utilisation
   - Mouvements peuvent être ajoutés
   - Modifications possibles

2. PENDING_MONITORING (En attente monitoring)
   ↓
   - Période soumise pour vérification ARC
   - Modifications possibles (mais trackées)
   - ARC peut approuver ou rejeter

3. PENDING_PHARMACIST_SIGNATURE (En attente signature)
   ↓
   - ARC a approuvé
   - Attend signature pharmacien
   - Modifications bloquées

4. LOCKED (Verrouillée)
   ↓
   - Pharmacien a signé
   - Aucune modification possible
   - Mouvements verrouillés (is_locked = true)
   - Données immuables
```

## 11.3 Création d'une Période

```typescript
// Champs
{
  studyId: string;          // Protocole
  periodNumber: number;     // Auto-incrémenté
  periodLabel: string;      // Ex: "Janvier 2025"
  startDate: DateTime;
  endDate: DateTime;
}
```

**Règles** :
- Pas de chevauchement de dates au sein d'un protocole
- `periodNumber` auto-incrémenté par protocole
- La période précédente doit être LOCKED avant d'en créer une nouvelle (optionnel mais recommandé)

## 11.4 Workflow de Validation

### Passage à PENDING_MONITORING
- Action : Pharmacien ou Admin
- Effet : L'ARC peut maintenant accéder pour vérification

### Approbation ARC
- Action : ARC clique "Approuver" ou "Rejeter"
- Si approuvé : `arcApprovalStatus = 'APPROVED'`, `arcApprovedBy`, `arcApprovedAt`
- Si rejeté : `arcApprovalStatus = 'REJECTED'`, commentaire obligatoire
- Passage automatique à PENDING_PHARMACIST_SIGNATURE si approuvé

### Signature Pharmacien
- Action : E-signature pharmacien (mot de passe + éventuellement 2FA)
- Effet :
  - Status → LOCKED
  - Tous les mouvements de la période → `is_locked = true`
  - Calcul et stockage des totaux (snapshot)
  - Génération du hash d'intégrité

## 11.5 Totaux Calculés

Au verrouillage, calcul et stockage de :
```typescript
{
  totalReceptions: number;      // Somme des réceptions
  totalDispensations: number;   // Somme des dispensations
  totalReturns: number;         // Somme des retours
  totalDestructions: number;    // Somme des destructions
  closingBalance: number;       // Solde de clôture
}
```

## 11.6 Comptabilité Globale (Close-Out)

À la fin de l'étude, une **comptabilité globale** (`StudyAccountingFinal`) agrège toutes les périodes :
- Totaux globaux
- Signature finale pharmacien
- Visa ARC final
- Passage de l'étude en CLOSED

---

# 12. Module Destruction

## 12.1 Concept de Batch de Destruction

Un **batch de destruction** regroupe plusieurs mouvements de destruction pour :
- Attestation groupée
- Visa ARC
- Signature pharmacien
- Traçabilité consolidée

## 12.2 Cycle de Vie

```
1. DRAFT
   ↓
   - Batch en cours de constitution
   - Ajout/retrait de mouvements possible

2. PENDING_ARC_APPROVAL
   ↓
   - Batch soumis pour visa ARC
   - ARC peut approuver ou rejeter

3. ARC_APPROVED ou ARC_REJECTED
   ↓
   - Si approuvé → PENDING_PHARMACIST_SIGNATURE
   - Si rejeté → Retour DRAFT avec motif

4. PENDING_PHARMACIST_SIGNATURE
   ↓
   - Attend signature pharmacien

5. SIGNED
   ↓
   - Pharmacien a signé
   - Mouvements verrouillés

6. COMPLETED
   ↓
   - Attestation de destruction générée
   - Archivage
```

## 12.3 Création d'un Batch

1. Création du batch avec métadonnées :
   - Méthode de destruction
   - Lieu de destruction
   - Témoin (nom, fonction)

2. Ajout des mouvements de destruction :
   - Sélection parmi les mouvements de type DESTRUCTION non encore associés
   - Ou création de nouveaux mouvements de destruction

3. Soumission pour approbation

## 12.4 Attestation de Destruction

Document PDF généré contenant :
- En-tête : Protocole, Centre, Dates
- Liste des produits détruits (lot, quantité, péremption)
- Méthode et lieu de destruction
- Visa ARC (nom, date)
- Signature pharmacien (e-signature, date, hash)
- QR code de vérification

---

# 13. Module Audit Trail

## 13.1 Principes ALCOA+

| Principe | Implémentation |
|----------|----------------|
| **Attributable** | `userId`, `userRoleSnapshot` sur chaque événement |
| **Legible** | Format JSON structuré, interface de consultation |
| **Contemporaneous** | `timestamp` serveur (UTC), pas client |
| **Original** | Données avant/après conservées |
| **Accurate** | Hash cryptographique, chaînage |
| **Complete** | Tous les événements sont tracés |
| **Consistent** | Format uniforme, énumérations strictes |
| **Enduring** | Append-only, pas de suppression |
| **Available** | Interface de recherche, exports |

## 13.2 Structure d'un Événement

```typescript
interface AuditEvent {
  id: string;
  timestamp: DateTime;

  // Qui
  userId: string | null;
  userRoleSnapshot: UserRole | null;

  // Quoi
  action: AuditAction;

  // Sur quoi
  entityType: AuditEntityType;
  entityId: string;

  // Contexte
  studyId: string | null;
  periodId: string | null;
  batchId: string | null;

  // Données
  detailsBefore: JSON | null;  // État avant modification
  detailsAfter: JSON | null;   // État après modification

  // Client
  clientInfo: {
    ip: string;
    userAgent: string;
  } | null;

  // Intégrité
  hash: string;
  previousHash: string | null;
}
```

## 13.3 Génération du Hash

```typescript
// src/lib/audit.ts

import crypto from 'crypto';

export function generateAuditHash(event: Partial<AuditEvent>, previousHash: string | null): string {
  const data = JSON.stringify({
    action: event.action,
    timestamp: event.timestamp,
    userId: event.userId,
    entityType: event.entityType,
    entityId: event.entityId,
    detailsAfter: event.detailsAfter,
    previousHash: previousHash
  });

  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function createAuditEvent(params: CreateAuditEventParams): Promise<AuditEvent> {
  // Récupérer le dernier hash
  const lastEvent = await prisma.auditEvent.findFirst({
    orderBy: { timestamp: 'desc' },
    select: { hash: true }
  });

  const previousHash = lastEvent?.hash || null;

  const event = {
    ...params,
    timestamp: new Date(),
    hash: '', // Calculé après
    previousHash
  };

  event.hash = generateAuditHash(event, previousHash);

  return prisma.auditEvent.create({ data: event });
}
```

## 13.4 Interface de Consultation

### Vue Globale "Journal d'Audit"
- Accessible : ADMIN, PHARMACIEN (lecture), ARC/AUDITOR (filtré par protocole)
- Filtres :
  - Période (date début/fin)
  - Étude
  - Type d'entité
  - Type d'action
  - Utilisateur
- Colonnes :
  - Date/heure
  - Utilisateur
  - Rôle
  - Action
  - Entité
  - Résumé
- Lien "Voir détail" → Modal avec before/after

### Vue par Entité
Sur chaque fiche (étude, médicament, mouvement...), onglet "Audit/Historique" :
- Timeline verticale
- Événements liés à cette entité
- Filtrage par type d'action

---

# 14. Module E-Signature

## 14.1 Principes

L'e-signature dans DOCELIUM :
- Authentifie l'utilisateur (ré-authentification)
- Lie l'identité à l'action
- Garantit l'intégrité (hash)
- Est traçable (audit)

## 14.2 Entités Signables

1. **Mouvements** (destruction, certaines dispensations)
2. **Batches de destruction**
3. **Périodes comptables**
4. **Comptabilité globale finale**

## 14.3 Workflow de Signature

```typescript
// Flux côté frontend
1. Utilisateur clique "Signer"
2. Modal s'affiche avec :
   - Récapitulatif de ce qui sera signé
   - Champ mot de passe
   - (Optionnel) Champ OTP si 2FA activé
3. Validation credentials
4. Appel API /esign

// Flux côté backend
1. Vérifier authentification récente
2. Vérifier mot de passe (ré-authentification)
3. Vérifier 2FA si activé
4. Vérifier droits (PHARMACIEN pour signature, ARC pour visa)
5. Vérifier prérequis métier (status correct, etc.)
6. Générer snapshot des données
7. Calculer hash du snapshot
8. Créer entrée dans esignature_logs
9. Mettre à jour entité (signed_by, signed_at, status)
10. Créer audit_event
11. Retourner succès
```

## 14.4 Structure EsignatureLog

```typescript
{
  id: string;
  entityType: EsignEntityType;
  entityId: string;
  signerUserId: string;
  signerRoleSnapshot: UserRole;
  purpose: EsignPurpose;
  signedAt: DateTime;
  authMethod: AuthMethod;
  authContext: JSON;           // Détails 2FA, etc.
  signingDataHash: string;     // Hash du snapshot
  previousSignatureHash: string | null;
  metadata: JSON;
}
```

## 14.5 Interface Utilisateur

### Bouton de Signature
- Visible uniquement si conditions remplies
- Icône de signature
- Libellé selon contexte ("Signer la destruction", "Valider la période")

### Modal de Signature
```
┌─────────────────────────────────────────┐
│         Signature Électronique          │
├─────────────────────────────────────────┤
│                                         │
│  Vous allez signer :                    │
│  • Période comptable Q1 2025            │
│  • Protocole PROTO-2025-001             │
│  • 45 mouvements inclus                 │
│  • Solde: 120 unités                    │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Mot de passe : [________________]      │
│                                         │
│  Code OTP :     [______] (si 2FA)       │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  [ Annuler ]          [ Signer ]        │
│                                         │
└─────────────────────────────────────────┘
```

### Indicateur de Signature
- Badge "Signé" avec icône
- Au survol : Nom signataire, date, méthode
- Clic : Détails complets de la signature

---

# 15. Module Export et Reporting

## 15.1 Types d'Exports

| Export | Contenu | Statuts | Formats |
|--------|---------|---------|---------|
| Mouvements bruts | 1 ligne = 1 mouvement | Tous | CSV, JSON |
| Stock IMP/NIMP | Quantités par lot | OPEN, LOCKED | CSV, PDF |
| Stock équipements | Stock équipements | OPEN, LOCKED | CSV, PDF |
| Return Liability | Traitements attendus en retour | OPEN | CSV, PDF |
| Sponsor Return | Produits à renvoyer | OPEN, LOCKED | CSV, PDF |
| Batch destruction | Mouvements + visa + signature | LOCKED | PDF certifié |
| Période comptable | Solde + mouvements | OPEN, LOCKED | CSV, PDF |
| Comptabilité globale | Toutes périodes | OPEN, LOCKED | CSV, PDF |

## 15.2 Export PDF Certifié

Structure du document :
1. **En-tête réglementaire** : Centre, Protocole, Date génération
2. **Page de synthèse** : Période, Statut, Hash, Signatures
3. **Tableau des données** : Format auditable
4. **Annexe audit** : Résumé des événements liés
5. **QR code** : document_id, document_hash, timestamp

## 15.3 Vérification d'Intégrité

Un export certifié (période LOCKED) doit produire exactement le même hash à chaque génération.

```typescript
// Génération du hash d'export
function generateExportHash(data: ExportData): string {
  const canonicalJson = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(canonicalJson).digest('hex');
}
```

## 15.4 Traçabilité des Exports

Chaque génération d'export crée un événement audit :
- `EXPORT_GENERATED` : Export provisoire
- `EXPORT_CERTIFIED` : Export signé/verrouillé
- `EXPORT_VERIFIED` : Vérification d'intégrité

---

# 16. Interface Utilisateur (UI/UX)

## 16.1 Layout Principal

```
┌─────────────────────────────────────────────────────────────────────┐
│  DOCELIUM                              [User] ▼  [Notifications]   │
├─────────┬───────────────────────────────────────────────────────────┤
│         │                                                           │
│  ☰      │   Breadcrumb: Dashboard > Protocoles > PROTO-001         │
│         │                                                           │
│ ┌─────┐ │   ┌─────────────────────────────────────────────────────┐ │
│ │ 📊  │ │   │                                                     │ │
│ │Dash │ │   │                     CONTENU                         │ │
│ └─────┘ │   │                                                     │ │
│ ┌─────┐ │   │                                                     │ │
│ │ 📋  │ │   │                                                     │ │
│ │Proto│ │   │                                                     │ │
│ └─────┘ │   │                                                     │ │
│ ┌─────┐ │   │                                                     │ │
│ │ 💊  │ │   │                                                     │ │
│ │Stock│ │   │                                                     │ │
│ └─────┘ │   │                                                     │ │
│ ┌─────┐ │   │                                                     │ │
│ │ 📦  │ │   │                                                     │ │
│ │Mvts │ │   └─────────────────────────────────────────────────────┘ │
│ └─────┘ │                                                           │
│ ┌─────┐ │                                                           │
│ │ 📊  │ │                                                           │
│ │Compt│ │                                                           │
│ └─────┘ │                                                           │
│ ┌─────┐ │                                                           │
│ │ 🗑️  │ │                                                           │
│ │Destr│ │                                                           │
│ └─────┘ │                                                           │
│ ┌─────┐ │                                                           │
│ │ 📝  │ │                                                           │
│ │Audit│ │                                                           │
│ └─────┘ │                                                           │
│ ┌─────┐ │                                                           │
│ │ 📤  │ │                                                           │
│ │Exprt│ │                                                           │
│ └─────┘ │                                                           │
│         │                                                           │
│ ─────── │                                                           │
│ ┌─────┐ │                                                           │
│ │ ⚙️  │ │                                                           │
│ │Param│ │                                                           │
│ └─────┘ │                                                           │
└─────────┴───────────────────────────────────────────────────────────┘
```

## 16.2 Menu Latéral (Sidebar)

```typescript
// Structure du menu
const menuItems = [
  {
    label: 'Dashboard',
    icon: 'Dashboard',
    path: '/',
    roles: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR']
  },
  {
    label: 'Protocoles',
    icon: 'Science',
    path: '/studies',
    roles: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR']
  },
  {
    label: 'Medicaments',
    icon: 'Medication',
    path: '/medications',
    roles: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR']
  },
  {
    label: 'Stock',
    icon: 'Inventory',
    path: '/stock',
    roles: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR']
  },
  {
    label: 'Mouvements',
    icon: 'SwapHoriz',
    path: '/movements',
    roles: ['ADMIN', 'PHARMACIEN', 'TECHNICIEN', 'ARC', 'AUDITOR']
  },
  {
    label: 'Comptabilité',
    icon: 'AccountBalance',
    path: '/accounting',
    roles: ['ADMIN', 'PHARMACIEN', 'ARC', 'AUDITOR']
  },
  {
    label: 'Destructions',
    icon: 'Delete',
    path: '/destruction',
    roles: ['ADMIN', 'PHARMACIEN', 'ARC', 'AUDITOR']
  },
  {
    label: 'Journal d\'audit',
    icon: 'History',
    path: '/audit',
    roles: ['ADMIN', 'PHARMACIEN', 'ARC', 'AUDITOR']
  },
  {
    label: 'Exports',
    icon: 'FileDownload',
    path: '/exports',
    roles: ['ADMIN', 'PHARMACIEN', 'ARC']
  },
  // Séparateur
  {
    label: 'Utilisateurs',
    icon: 'People',
    path: '/users',
    roles: ['ADMIN']
  },
  {
    label: 'Paramètres',
    icon: 'Settings',
    path: '/settings',
    roles: ['ADMIN', 'PHARMACIEN']
  }
];
```

## 16.3 Composants UI Standards

### DataTable
- Tri sur colonnes
- Pagination
- Filtres
- Sélection multiple
- Actions en ligne
- Export

### StatusBadge
```typescript
const STATUS_COLORS = {
  // Études
  DRAFT: 'default',
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  CLOSED: 'error',
  ARCHIVED: 'default',

  // Périodes
  OPEN: 'info',
  PENDING_MONITORING: 'warning',
  PENDING_PHARMACIST_SIGNATURE: 'warning',
  LOCKED: 'success',

  // Stock
  AVAILABLE: 'success',
  QUARANTINE: 'warning',
  EXPIRED: 'error',
  DESTROYED: 'default',
};
```

### Formulaires
- Stepper pour formulaires multi-étapes
- Validation en temps réel avec messages d'erreur
- Champs conditionnels selon le contexte
- Boutons d'action clairs

## 16.4 Thème et Couleurs

```typescript
// src/theme.ts

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',        // Bleu professionnel
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',        // Violet pour accents
    },
    success: {
      main: '#2e7d32',        // Vert pour validations
    },
    warning: {
      main: '#ed6c02',        // Orange pour alertes
    },
    error: {
      main: '#d32f2f',        // Rouge pour erreurs
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 500 },
    h2: { fontSize: '1.75rem', fontWeight: 500 },
    h3: { fontSize: '1.5rem', fontWeight: 500 },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 240,
        },
      },
    },
  },
});
```

---

# 17. API REST - Endpoints

## 17.1 Conventions

- Base URL: `/api`
- Format: JSON
- Authentification: Session NextAuth (cookie)
- Erreurs: `{ error: string, code: string, details?: any }`

## 17.2 Endpoints par Module

### Authentification
```
POST   /api/auth/signin          # Connexion (géré par NextAuth)
POST   /api/auth/signout         # Déconnexion
GET    /api/auth/session         # Session courante
POST   /api/auth/change-password # Changement mot de passe
```

### Utilisateurs (ADMIN)
```
GET    /api/users                # Liste utilisateurs
POST   /api/users                # Créer utilisateur
GET    /api/users/:id            # Détail utilisateur
PATCH  /api/users/:id            # Modifier utilisateur
DELETE /api/users/:id            # Désactiver utilisateur
POST   /api/users/:id/assign-study  # Assigner à une étude
DELETE /api/users/:id/unassign-study/:studyId  # Retirer d'une étude
```

### Protocoles (Études)
```
GET    /api/studies              # Liste des études accessibles
POST   /api/studies              # Créer étude
GET    /api/studies/:id          # Détail étude
PATCH  /api/studies/:id          # Modifier étude
POST   /api/studies/:id/activate # Activer
POST   /api/studies/:id/suspend  # Suspendre
POST   /api/studies/:id/close    # Clôturer
POST   /api/studies/:id/archive  # Archiver
GET    /api/studies/:id/audit    # Audit de l'étude
```

### Médicaments
```
# Vue globale (tous protocoles)
GET    /api/medications                          # Liste tous les médicaments (filtres: studyId, type, search)

# Par protocole
GET    /api/studies/:studyId/medications        # Liste médicaments d'un protocole
POST   /api/studies/:studyId/medications        # Créer médicament

# Détail et modifications
GET    /api/studies/:studyId/medications/:id    # Détail médicament
PATCH  /api/studies/:studyId/medications/:id    # Modifier médicament
DELETE /api/studies/:studyId/medications/:id    # Désactiver médicament
POST   /api/medications/:id/link-equipment      # Lier équipement
DELETE /api/medications/:id/unlink-equipment/:equipmentId
```

**Filtres pour GET /api/medications** :
| Paramètre | Type | Description |
|-----------|------|-------------|
| studyId | string | Filtrer par protocole |
| type | 'IMP' \| 'NIMP' | Filtrer par type |
| search | string | Recherche dans code et nom |

### Équipements
```
GET    /api/studies/:studyId/equipments         # Liste équipements
POST   /api/studies/:studyId/equipments         # Créer équipement
GET    /api/equipments/:id                       # Détail équipement
PATCH  /api/equipments/:id                       # Modifier équipement
DELETE /api/equipments/:id                       # Désactiver équipement
```

### Stock
```
GET    /api/studies/:studyId/stock              # Stock par étude
GET    /api/stock/:id                            # Détail lot
PATCH  /api/stock/:id                            # Modifier lot (localisation)
POST   /api/stock/:id/quarantine                 # Mettre en quarantaine
POST   /api/stock/:id/release                    # Libérer de quarantaine
```

### Mouvements
```
GET    /api/studies/:studyId/movements          # Liste mouvements
POST   /api/movements                            # Créer mouvement
GET    /api/movements/:id                        # Détail mouvement
PATCH  /api/movements/:id                        # Modifier mouvement
POST   /api/movements/:id/esign                  # E-signer mouvement
```

### Périodes Comptables
```
GET    /api/studies/:studyId/accounting-periods  # Liste périodes
POST   /api/accounting-periods                   # Créer période
GET    /api/accounting-periods/:id               # Détail période
PATCH  /api/accounting-periods/:id/status        # Changer statut
POST   /api/accounting-periods/:id/arc-approve   # Approbation ARC
POST   /api/accounting-periods/:id/arc-reject    # Rejet ARC
POST   /api/accounting-periods/:id/esign         # E-signature pharmacien
GET    /api/accounting-periods/:id/summary       # Résumé/totaux
```

### Batches de Destruction
```
GET    /api/studies/:studyId/destruction-batches # Liste batches
POST   /api/destruction-batches                  # Créer batch
GET    /api/destruction-batches/:id              # Détail batch
PATCH  /api/destruction-batches/:id              # Modifier batch
POST   /api/destruction-batches/:id/add-movement # Ajouter mouvement
DELETE /api/destruction-batches/:id/remove-movement/:movementId
POST   /api/destruction-batches/:id/submit       # Soumettre pour approbation
POST   /api/destruction-batches/:id/arc-approve  # Approbation ARC
POST   /api/destruction-batches/:id/arc-reject   # Rejet ARC
POST   /api/destruction-batches/:id/esign        # E-signature pharmacien
```

### Comptabilité Globale
```
GET    /api/studies/:studyId/accounting-final    # Comptabilité globale
POST   /api/studies/:studyId/accounting-final/prepare  # Préparer clôture
POST   /api/studies/:studyId/accounting-final/esign    # E-signature finale
```

### Audit
```
GET    /api/audit                               # Journal global (filtres en query)
GET    /api/audit/by-entity                     # Par entité (type, id en query)
GET    /api/studies/:studyId/audit              # Audit par étude
```

### E-Signature
```
POST   /api/esign/verify-credentials            # Vérifier credentials
POST   /api/esign/movements/:id                 # Signer mouvement
POST   /api/esign/accounting-periods/:id        # Signer période
POST   /api/esign/destruction-batches/:id       # Signer batch
POST   /api/esign/studies/:id/accounting-final  # Signer compta finale
```

### Exports
```
GET    /api/exports/movements                   # Export mouvements
GET    /api/exports/stock                       # Export stock
GET    /api/exports/accounting-period/:id       # Export période
GET    /api/exports/destruction-batch/:id       # Export batch (attestation)
GET    /api/exports/study-final/:studyId        # Export compta globale
GET    /api/exports/audit                       # Export audit trail
```

---

# 18. Plan d'Implémentation Step-by-Step

## Phase 1 : Fondations

### Étape 1.1 : Configuration du Projet
```bash
# Actions :
1. Initialiser le projet Next.js (si pas déjà fait)
2. Configurer TypeScript strictement
3. Installer les dépendances (voir package.json existant)
4. Configurer Prisma avec PostgreSQL
5. Créer le schéma Prisma complet (voir Section 4)
6. Exécuter les migrations initiales
```

### Étape 1.2 : Authentification
```bash
# Actions :
1. Configurer NextAuth.js avec CredentialsProvider
2. Créer les pages /login et /forgot-password
3. Implémenter le middleware de protection des routes
4. Créer le seed pour un utilisateur ADMIN initial
5. Tester le flux de connexion/déconnexion
```

### Étape 1.3 : Layout et Navigation
```bash
# Actions :
1. Créer le composant Sidebar (collapsible)
2. Créer le layout principal avec AppBar
3. Implémenter le menu selon les rôles
4. Créer la page Dashboard vide
5. Tester la navigation
```

## Phase 2 : Module Utilisateurs

### Étape 2.1 : CRUD Utilisateurs
```bash
# Actions :
1. Créer la page /users (liste)
2. Créer le formulaire de création utilisateur
3. Implémenter les API routes :
   - GET /api/users
   - POST /api/users
   - GET /api/users/:id
   - PATCH /api/users/:id
   - DELETE /api/users/:id
4. Implémenter la validation Zod
5. Ajouter l'audit trail sur chaque action
```

### Étape 2.2 : Assignation aux Études
```bash
# Actions :
1. Créer l'interface d'assignation (modal ou page dédiée)
2. Implémenter les API routes d'assignation
3. Tester le filtrage par étude selon les assignations
```

## Phase 3 : Module Protocoles

### Étape 3.1 : CRUD Protocoles
```bash
# Actions :
1. Créer la page /studies (liste avec filtres)
2. Créer le formulaire de création protocole (stepper)
3. Implémenter les API routes
4. Créer la fiche protocole avec onglets
5. Implémenter le workflow de statuts (DRAFT → ACTIVE → ...)
```

### Étape 3.2 : Configuration Protocole
```bash
# Actions :
1. Implémenter l'édition des paramètres (IWRS, destruction_policy...)
2. Gérer les champs personnalisés (customFields)
3. Tester les transitions de statut
```

## Phase 4 : Module Médicaments

### Étape 4.1 : CRUD Médicaments
```bash
# Actions :
1. Créer la liste des médicaments (dans fiche protocole)
2. Créer le formulaire de création (respecter le flux)
3. Implémenter les API routes
4. Gérer les énumérations exactes
5. Implémenter la désactivation (soft delete)
```

### Étape 4.2 : Liaison Équipements
```bash
# Actions :
1. Créer l'interface de liaison
2. Implémenter les API routes
3. Gérer le flag "isRequired"
```

## Phase 5 : Module Équipements

### Étape 5.1 : CRUD Équipements
```bash
# Actions :
1. Similaire aux médicaments
2. Créer liste, formulaire, API
3. Gérer les liaisons avec médicaments
```

## Phase 6 : Module Stock

### Étape 6.1 : Vue du Stock
```bash
# Actions :
1. Créer la page /stock avec vue globale
2. Filtres par protocole, médicament, statut
3. Indicateurs visuels (expiration, quarantaine)
```

### Étape 6.2 : Gestion du Stock
```bash
# Actions :
1. Détail d'un lot (StockItem)
2. Mise en quarantaine / libération
3. Modification de localisation
```

## Phase 7 : Module Mouvements

### Étape 7.1 : Réceptions
```bash
# Actions :
1. Formulaire de réception (stepper)
2. Création automatique de StockItem
3. API route POST /api/movements (type: RECEPTION)
4. Audit trail
```

### Étape 7.2 : Dispensations
```bash
# Actions :
1. Formulaire de dispensation
2. Sélection intelligente du lot (FIFO/FEFO)
3. Vérification équipements requis
4. Intégration IWRS (si actif)
5. E-signature (si requis)
```

### Étape 7.3 : Retours
```bash
# Actions :
1. Formulaire de retour
2. Gestion des quantités (utilisé/non utilisé)
3. Choix de destination
4. Mise à jour stock selon destination
```

### Étape 7.4 : Destructions
```bash
# Actions :
1. Formulaire de destruction
2. E-signature pharmacien
3. Liaison avec batch de destruction
```

### Étape 7.5 : Transferts et Ajustements
```bash
# Actions :
1. Formulaires spécifiques
2. Justification obligatoire pour ajustements
```

## Phase 8 : Module Comptabilité

### Étape 8.1 : Périodes Comptables
```bash
# Actions :
1. Créer la page /accounting
2. CRUD périodes
3. Workflow de statuts
4. Calcul des totaux
```

### Étape 8.2 : Approbation ARC
```bash
# Actions :
1. Interface ARC pour validation
2. Commentaires de rejet
3. Notifications
```

### Étape 8.3 : E-Signature Période
```bash
# Actions :
1. Modal de signature
2. Verrouillage des mouvements
3. Génération du hash d'intégrité
```

## Phase 9 : Module Destruction

### Étape 9.1 : Batches de Destruction
```bash
# Actions :
1. CRUD batches
2. Ajout/retrait de mouvements
3. Workflow de validation
```

### Étape 9.2 : Attestation
```bash
# Actions :
1. Génération PDF
2. Inclusion signatures
3. QR code de vérification
```

## Phase 10 : Module Audit Trail

### Étape 10.1 : Journal d'Audit
```bash
# Actions :
1. Créer la page /audit
2. Filtres avancés
3. Vue détaillée before/after
```

### Étape 10.2 : Audit par Entité
```bash
# Actions :
1. Onglet "Audit" sur chaque fiche
2. Timeline des événements
```

## Phase 11 : Module E-Signature

### Étape 11.1 : Framework E-Signature
```bash
# Actions :
1. Service centralisé de signature
2. Modal réutilisable
3. Vérification credentials
4. Génération hash
5. Stockage dans esignature_logs
```

## Phase 12 : Module Exports

### Étape 12.1 : Exports CSV/JSON
```bash
# Actions :
1. API routes d'export
2. Interface de sélection
```

### Étape 12.2 : Exports PDF Certifiés
```bash
# Actions :
1. Génération PDF (utiliser une lib comme @react-pdf/renderer ou puppeteer)
2. Inclusion des signatures
3. QR code
4. Vérification d'intégrité
```

## Phase 13 : Finitions

### Étape 13.1 : Tests
```bash
# Actions :
# Voir Section 19 - Stratégie de Tests pour les détails complets
# Les tests doivent être implémentés EN CONTINU tout au long du développement
# Objectif : Coverage maximum (>80% pour les services critiques)

1. Tests unitaires des services (Jest/Vitest)
2. Tests d'intégration des API (supertest)
3. Tests E2E des workflows critiques (Playwright)
4. Tests des composants React (React Testing Library)
```

### Étape 13.2 : Optimisations
```bash
# Actions :
1. Performance des requêtes
2. Mise en cache
3. Pagination
```

### Étape 13.3 : Documentation
```bash
# Actions :
1. Documentation API (Swagger/OpenAPI)
2. Guide utilisateur
3. Guide administrateur
```

---

# 19. Stratégie de Tests

## 19.1 Principe Fondamental

> **RÈGLE ABSOLUE** : Les tests doivent être implémentés EN CONTINU, à chaque étape du développement, et non pas à la fin du projet. Chaque fonctionnalité développée doit être accompagnée de ses tests correspondants.

**Objectif de coverage** : Minimum 80% de couverture globale, avec 90%+ pour les services critiques (mouvements, comptabilité, audit trail).

## 19.2 Stack de Tests

```bash
# Installation des dépendances de test
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw playwright @playwright/test supertest @types/supertest
```

```json
// package.json - Scripts de test
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:ci": "vitest --coverage --reporter=junit && playwright test"
  }
}
```

## 19.3 Configuration Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// MSW Server setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 19.4 Types de Tests par Couche

### 19.4.1 Tests Unitaires - Services/Lib

**Objectif** : Tester la logique métier isolée.

```typescript
// src/lib/services/__tests__/movement.service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MovementService } from '../movement.service';
import { prisma } from '@/lib/prisma';
import { MovementType, MovementStatus } from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    movement: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    stockItem: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('MovementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createReception', () => {
    it('should create a reception movement and update stock', async () => {
      const mockMovement = {
        id: 'mov-123',
        type: MovementType.RECEPTION,
        quantity: 10,
        status: MovementStatus.COMPLETED,
      };

      vi.mocked(prisma.movement.create).mockResolvedValue(mockMovement);
      vi.mocked(prisma.stockItem.update).mockResolvedValue({ quantity: 10 });

      const result = await MovementService.createReception({
        studyId: 'study-1',
        medicationId: 'med-1',
        quantity: 10,
        lotNumber: 'LOT-001',
        expirationDate: new Date('2025-12-31'),
        userId: 'user-1',
      });

      expect(result).toEqual(mockMovement);
      expect(prisma.movement.create).toHaveBeenCalledOnce();
    });

    it('should throw error if quantity is negative', async () => {
      await expect(
        MovementService.createReception({
          studyId: 'study-1',
          medicationId: 'med-1',
          quantity: -5,
          lotNumber: 'LOT-001',
          expirationDate: new Date('2025-12-31'),
          userId: 'user-1',
        })
      ).rejects.toThrow('Quantity must be positive');
    });

    it('should throw error if lot is expired', async () => {
      await expect(
        MovementService.createReception({
          studyId: 'study-1',
          medicationId: 'med-1',
          quantity: 10,
          lotNumber: 'LOT-001',
          expirationDate: new Date('2020-01-01'), // Date passée
          userId: 'user-1',
        })
      ).rejects.toThrow('Cannot receive expired lot');
    });
  });

  describe('createDispensation', () => {
    it('should validate sufficient stock before dispensation', async () => {
      vi.mocked(prisma.stockItem.findUnique).mockResolvedValue({
        id: 'stock-1',
        quantity: 5, // Stock insuffisant
      });

      await expect(
        MovementService.createDispensation({
          studyId: 'study-1',
          medicationId: 'med-1',
          patientId: 'patient-1',
          quantity: 10, // Demande 10, stock = 5
          userId: 'user-1',
        })
      ).rejects.toThrow('Insufficient stock');
    });
  });
});
```

### 19.4.2 Tests Unitaires - Validators (Zod)

```typescript
// src/lib/validators/__tests__/study-blocks.test.ts

import { describe, it, expect } from 'vitest';
import { blocASchema, blocBSchema, blocDSchema } from '../study-blocks';

describe('Study Block Validators', () => {
  describe('blocASchema - Identification', () => {
    it('should validate a correct bloc A', () => {
      const validData = {
        protocol_status: 'DRAFT',
        code_internal: 'ONC-2024-001',
        nct_number: 'NCT12345678',
        title: 'A Phase III Study of Drug X in Cancer Patients',
        sponsor: 'Pharma Corp',
        phase: 'III',
        therapeutic_area: 'ONCOLOGY',
        site_activation_date: new Date('2024-01-15'),
        expected_recruitment: 150,
        complexity_level: 'HIGH',
      };

      const result = blocASchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid NCT number format', () => {
      const invalidData = {
        protocol_status: 'DRAFT',
        code_internal: 'ONC-2024-001',
        nct_number: 'NCT1234', // Invalid - too short
        title: 'A valid title here',
        sponsor: 'Pharma Corp',
        phase: 'III',
        therapeutic_area: 'ONCOLOGY',
        site_activation_date: new Date(),
        expected_recruitment: 150,
        complexity_level: 'HIGH',
      };

      const result = blocASchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('nct_number');
    });

    it('should reject invalid protocol status', () => {
      const invalidData = {
        protocol_status: 'INVALID_STATUS',
        code_internal: 'ONC-2024-001',
        nct_number: 'NCT12345678',
        title: 'A valid title here',
        sponsor: 'Pharma Corp',
        phase: 'III',
        therapeutic_area: 'ONCOLOGY',
        site_activation_date: new Date(),
        expected_recruitment: 150,
        complexity_level: 'HIGH',
      };

      const result = blocASchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative expected_recruitment', () => {
      const invalidData = {
        protocol_status: 'DRAFT',
        code_internal: 'ONC-2024-001',
        nct_number: 'NCT12345678',
        title: 'A valid title here',
        sponsor: 'Pharma Corp',
        phase: 'III',
        therapeutic_area: 'ONCOLOGY',
        site_activation_date: new Date(),
        expected_recruitment: -10,
        complexity_level: 'HIGH',
      };

      const result = blocASchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('blocBSchema - Contacts', () => {
    it('should require PI, SC and CRA contacts', () => {
      const missingContacts = {
        contacts: [
          { role: 'PI', name: 'Dr. Smith', email: 'smith@hospital.com' },
          // Missing SC and CRA
        ],
      };

      const result = blocBSchema.safeParse(missingContacts);
      expect(result.success).toBe(false);
    });

    it('should accept valid contacts with all required roles', () => {
      const validContacts = {
        contacts: [
          { role: 'PI', name: 'Dr. Smith', email: 'smith@hospital.com' },
          { role: 'SC', name: 'Jane Doe', email: 'jane@hospital.com' },
          { role: 'CRA', name: 'John Monitor', email: 'cra@sponsor.com' },
        ],
      };

      const result = blocBSchema.safeParse(validContacts);
      expect(result.success).toBe(true);
    });
  });
});
```

### 19.4.3 Tests d'Intégration - API Routes

```typescript
// src/app/api/studies/__tests__/route.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

vi.mock('@/lib/prisma');
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('API /api/studies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/studies', () => {
    it('should return 401 if not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new Request('http://localhost/api/studies');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return studies for authenticated user', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-1', role: 'PHARMACIEN' },
      });

      vi.mocked(prisma.study.findMany).mockResolvedValue([
        { id: 'study-1', code_internal: 'ONC-001', title: 'Study 1' },
        { id: 'study-2', code_internal: 'ONC-002', title: 'Study 2' },
      ]);

      const request = new Request('http://localhost/api/studies');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
    });

    it('should filter studies by user assignments for non-admin roles', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-1', role: 'TECHNICIEN' },
      });

      const request = new Request('http://localhost/api/studies');
      await GET(request);

      expect(prisma.study.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userAssignments: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('POST /api/studies', () => {
    it('should return 403 for non-authorized roles', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-1', role: 'TECHNICIEN' }, // Cannot create studies
      });

      const request = new Request('http://localhost/api/studies', {
        method: 'POST',
        body: JSON.stringify({ code_internal: 'TEST-001' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('should create study for PHARMACIEN', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-1', role: 'PHARMACIEN' },
      });

      vi.mocked(prisma.study.create).mockResolvedValue({
        id: 'new-study',
        code_internal: 'ONC-003',
      });

      const studyData = {
        protocol_status: 'DRAFT',
        code_internal: 'ONC-003',
        nct_number: 'NCT12345678',
        title: 'New Study Title Here',
        sponsor: 'Sponsor Name',
        phase: 'III',
        therapeutic_area: 'ONCOLOGY',
        site_activation_date: '2024-01-15',
        expected_recruitment: 100,
        complexity_level: 'MEDIUM',
      };

      const request = new Request('http://localhost/api/studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studyData),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    });

    it('should return 400 for invalid data', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-1', role: 'PHARMACIEN' },
      });

      const request = new Request('http://localhost/api/studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code_internal: '' }), // Invalid
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});
```

### 19.4.4 Tests Composants React

```typescript
// src/components/features/study/__tests__/StudyCreationStepper.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudyCreationStepper } from '../StudyCreationStepper';

describe('StudyCreationStepper', () => {
  const defaultProps = {
    activeStep: 0,
    completedSteps: new Set<number>(),
    onStepClick: vi.fn(),
  };

  it('should render all 11 steps', () => {
    render(<StudyCreationStepper {...defaultProps} />);

    expect(screen.getByText('Identification')).toBeInTheDocument();
    expect(screen.getByText('Organisation & Contacts')).toBeInTheDocument();
    expect(screen.getByText('Regulatory Identifiers')).toBeInTheDocument();
    expect(screen.getByText('IWRS Governance')).toBeInTheDocument();
  });

  it('should highlight active step', () => {
    render(<StudyCreationStepper {...defaultProps} activeStep={2} />);

    const activeStep = screen.getByText('Regulatory Identifiers').closest('.MuiStep-root');
    expect(activeStep).toHaveClass('Mui-active');
  });

  it('should mark completed steps', () => {
    const completedSteps = new Set([0, 1]);
    render(
      <StudyCreationStepper
        {...defaultProps}
        activeStep={2}
        completedSteps={completedSteps}
      />
    );

    const completedStep = screen.getByText('Identification').closest('.MuiStep-root');
    expect(completedStep).toHaveClass('Mui-completed');
  });

  it('should call onStepClick when clicking completed step', async () => {
    const onStepClick = vi.fn();
    const completedSteps = new Set([0, 1]);

    render(
      <StudyCreationStepper
        {...defaultProps}
        activeStep={2}
        completedSteps={completedSteps}
        onStepClick={onStepClick}
      />
    );

    await userEvent.click(screen.getByText('Identification'));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it('should disable future steps', () => {
    render(<StudyCreationStepper {...defaultProps} activeStep={1} />);

    const futureStepButton = screen.getByText('Paramètres opérationnels')
      .closest('button');
    expect(futureStepButton).toBeDisabled();
  });

  it('should show "Optionnel" label for optional steps', () => {
    render(<StudyCreationStepper {...defaultProps} />);

    // E, G, H, I, M, N are optional
    const optionalLabels = screen.getAllByText('Optionnel');
    expect(optionalLabels.length).toBeGreaterThan(0);
  });
});
```

### 19.4.5 Tests E2E avec Playwright

```typescript
// e2e/auth.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'pharmacien@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/bienvenue/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/identifiants invalides/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'pharmacien@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    await expect(page).toHaveURL(/.*login/);
  });
});
```

```typescript
// e2e/study-creation.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Study Creation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as PHARMACIEN
    await page.goto('/login');
    await page.fill('input[name="email"]', 'pharmacien@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should navigate through all creation steps', async ({ page }) => {
    await page.goto('/studies/new');

    // Step A - Identification
    await expect(page.getByText('Identification')).toBeVisible();
    await page.fill('input[name="code_internal"]', 'ONC-E2E-001');
    await page.fill('input[name="nct_number"]', 'NCT12345678');
    await page.fill('input[name="title"]', 'E2E Test Study for Automation');
    await page.fill('input[name="sponsor"]', 'Test Sponsor Inc.');
    await page.selectOption('select[name="phase"]', 'III');
    await page.fill('input[name="therapeutic_area"]', 'ONCOLOGY');
    await page.fill('input[name="expected_recruitment"]', '100');
    await page.click('button:has-text("Suivant")');

    // Step B - Contacts
    await expect(page.getByText('Organisation & Contacts')).toBeVisible();
    // ... fill contacts
    await page.click('button:has-text("Suivant")');

    // Continue through all steps...
  });

  test('should validate required fields before proceeding', async ({ page }) => {
    await page.goto('/studies/new');

    // Try to proceed without filling required fields
    await page.click('button:has-text("Suivant")');

    await expect(page.getByText(/ce champ est requis/i)).toBeVisible();
  });

  test('should allow navigation back to completed steps', async ({ page }) => {
    await page.goto('/studies/new');

    // Complete step A
    await page.fill('input[name="code_internal"]', 'ONC-NAV-001');
    await page.fill('input[name="nct_number"]', 'NCT12345678');
    await page.fill('input[name="title"]', 'Navigation Test Study');
    await page.fill('input[name="sponsor"]', 'Test Sponsor');
    await page.selectOption('select[name="phase"]', 'II');
    await page.fill('input[name="therapeutic_area"]', 'CARDIOLOGY');
    await page.fill('input[name="expected_recruitment"]', '50');
    await page.click('button:has-text("Suivant")');

    // Now on step B, click back to step A
    await page.click('[data-testid="step-A"]');

    // Verify we're back on step A with data preserved
    await expect(page.getByDisplayValue('ONC-NAV-001')).toBeVisible();
  });

  test('should save draft at any step', async ({ page }) => {
    await page.goto('/studies/new');

    await page.fill('input[name="code_internal"]', 'ONC-DRAFT-001');
    await page.fill('input[name="title"]', 'Draft Study');

    await page.click('button:has-text("Enregistrer brouillon")');

    await expect(page.getByText(/brouillon enregistré/i)).toBeVisible();
  });
});
```

```typescript
// e2e/dispensation.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Dispensation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'technicien@test.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
  });

  test('should create a dispensation with patient info', async ({ page }) => {
    await page.goto('/movements/new?type=DISPENSATION');

    // Select study
    await page.selectOption('select[name="studyId"]', { label: 'ONC-2024-001' });

    // Select medication
    await page.selectOption('select[name="medicationId"]', { label: 'Drug X 100mg' });

    // Enter patient info
    await page.fill('input[name="patientNumber"]', 'PAT-001');
    await page.fill('input[name="visitCode"]', 'C1D1');

    // Enter quantity
    await page.fill('input[name="quantity"]', '30');

    // Submit
    await page.click('button[type="submit"]');

    await expect(page.getByText(/dispensation créée/i)).toBeVisible();
  });

  test('should show warning when stock is low', async ({ page }) => {
    await page.goto('/movements/new?type=DISPENSATION');

    await page.selectOption('select[name="studyId"]', { label: 'ONC-2024-001' });
    await page.selectOption('select[name="medicationId"]', { label: 'Drug Y 50mg' }); // Low stock med

    await expect(page.getByText(/stock faible/i)).toBeVisible();
  });

  test('should prevent dispensation exceeding available stock', async ({ page }) => {
    await page.goto('/movements/new?type=DISPENSATION');

    await page.selectOption('select[name="studyId"]', { label: 'ONC-2024-001' });
    await page.selectOption('select[name="medicationId"]', { label: 'Drug X 100mg' });
    await page.fill('input[name="patientNumber"]', 'PAT-002');
    await page.fill('input[name="quantity"]', '9999'); // Exceeds stock

    await page.click('button[type="submit"]');

    await expect(page.getByText(/stock insuffisant/i)).toBeVisible();
  });
});
```

## 19.5 Configuration Playwright

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 19.6 MSW - Mocking API pour Tests

```typescript
// src/test/mocks/handlers.ts

import { http, HttpResponse } from 'msw';

export const handlers = [
  // Studies
  http.get('/api/studies', () => {
    return HttpResponse.json([
      { id: 'study-1', code_internal: 'ONC-001', title: 'Study 1', status: 'ACTIVE' },
      { id: 'study-2', code_internal: 'ONC-002', title: 'Study 2', status: 'DRAFT' },
    ]);
  }),

  http.post('/api/studies', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: 'new-study', ...body },
      { status: 201 }
    );
  }),

  // Movements
  http.get('/api/movements', ({ request }) => {
    const url = new URL(request.url);
    const studyId = url.searchParams.get('studyId');

    return HttpResponse.json([
      { id: 'mov-1', type: 'RECEPTION', quantity: 100, studyId },
      { id: 'mov-2', type: 'DISPENSATION', quantity: 30, studyId },
    ]);
  }),

  // Auth
  http.post('/api/auth/signin', async ({ request }) => {
    const body = await request.json();
    if (body.email === 'pharmacien@test.com' && body.password === 'TestPassword123!') {
      return HttpResponse.json({ user: { id: 'user-1', role: 'PHARMACIEN' } });
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),
];
```

```typescript
// src/test/mocks/server.ts

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

## 19.7 Tests Spécifiques par Module

### Matrice de Couverture Requise

| Module | Unitaire | Intégration | E2E | Coverage Min |
|--------|----------|-------------|-----|--------------|
| Auth / RBAC | ✓ | ✓ | ✓ | 90% |
| Mouvements | ✓ | ✓ | ✓ | 90% |
| Stock / Comptabilité | ✓ | ✓ | ✓ | 90% |
| Audit Trail | ✓ | ✓ | - | 85% |
| E-Signature | ✓ | ✓ | ✓ | 90% |
| Études / Protocoles | ✓ | ✓ | ✓ | 85% |
| Médicaments | ✓ | ✓ | - | 80% |
| Équipements | ✓ | ✓ | - | 80% |
| Export / Reporting | ✓ | ✓ | - | 75% |
| UI Components | ✓ | - | - | 70% |

### Tests Critiques Obligatoires

```typescript
// Liste des scénarios OBLIGATOIRES à tester

const CRITICAL_TEST_SCENARIOS = [
  // Auth & RBAC
  'login_with_valid_credentials',
  'login_with_invalid_credentials',
  'role_based_access_control_enforcement',
  'session_expiration_handling',

  // Stock Movements
  'reception_creates_stock',
  'dispensation_decreases_stock',
  'dispensation_blocked_if_insufficient_stock',
  'return_increases_stock',
  'destruction_decreases_stock',
  'transfer_between_protocols',

  // Stock Integrity
  'stock_balance_always_correct',
  'negative_stock_prevented',
  'lot_expiration_validation',
  'quarantine_prevents_dispensation',

  // Accounting Periods
  'period_creation_and_locking',
  'movements_blocked_in_locked_period',
  'stock_snapshot_at_period_close',

  // Audit Trail
  'all_actions_logged',
  'audit_immutability',
  'user_attribution_correct',

  // E-Signature
  'signature_with_valid_password',
  'signature_rejected_with_wrong_password',
  'signature_hash_verification',

  // Data Integrity
  'concurrent_stock_updates_handled',
  'transaction_rollback_on_error',
];
```

## 19.8 CI/CD Integration

```yaml
# .github/workflows/test.yml

name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  e2e-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: docelium_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Setup database
        run: |
          npx prisma migrate deploy
          npx prisma db seed
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/docelium_test

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/docelium_test

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  coverage-gate:
    needs: [unit-tests]
    runs-on: ubuntu-latest
    steps:
      - name: Check coverage threshold
        run: |
          # Fail if coverage is below 80%
          if [ "$COVERAGE" -lt 80 ]; then
            echo "Coverage ($COVERAGE%) is below threshold (80%)"
            exit 1
          fi
```

## 19.9 Règles de Développement

### Mode Test (Test Mode Toggle)

Les formulaires de création complexes doivent inclure un **toggle "Mode test"** pour faciliter le développement et les tests.

**Implémentation** :
```typescript
// État local dans le composant
const [testMode, setTestMode] = useState(false);

// Données de test pré-définies
const testFormData = {
  // Valeurs réalistes pour chaque champ du formulaire
};

// Handler du toggle
const handleTestModeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
  const enabled = e.target.checked;
  setTestMode(enabled);
  if (enabled) {
    setFormData(prev => ({ ...testFormData, ...preservedFields }));
  } else {
    setFormData(prev => ({ ...initialFormData, ...preservedFields }));
  }
};
```

**Formulaires concernés** :
1. **Création de protocole** (`/studies/new`) - Pré-remplit tous les blocs du stepper
2. **Création de médicament** (`/medications/new`) - Pré-remplit les informations du médicament (préserve le protocole sélectionné)

**Règles** :
- Le toggle est visible uniquement en environnement de développement (`NODE_ENV !== 'production'`) ou pour les utilisateurs ADMIN
- Les données de test doivent être réalistes et valides selon les validators Zod
- Le toggle doit préserver certains champs contextuels (ex: protocole sélectionné lors de la création d'un médicament)
- Position UI : en haut du formulaire, avec un label explicite "Mode test"

### Workflow TDD Recommandé

```
1. AVANT d'écrire le code :
   → Écrire le test qui décrit le comportement attendu
   → Le test doit échouer (RED)

2. Écrire le code minimal :
   → Implémenter juste ce qu'il faut pour que le test passe
   → Le test doit passer (GREEN)

3. Refactorer :
   → Améliorer le code sans casser les tests
   → Les tests doivent toujours passer (REFACTOR)
```

### Checklist avant PR

```markdown
## Checklist Tests (obligatoire avant merge)

- [ ] Tests unitaires ajoutés pour les nouvelles fonctions
- [ ] Tests d'intégration pour les nouveaux endpoints API
- [ ] Tests E2E pour les nouveaux workflows utilisateur
- [ ] Tous les tests existants passent
- [ ] Coverage global ≥ 80%
- [ ] Coverage des fichiers modifiés ≥ 80%
- [ ] Pas de tests skippés sans justification
```

---

# ANNEXES

## A. Schémas Zod de Validation

```typescript
// src/lib/validators/study.ts

import { z } from 'zod';

export const createStudySchema = z.object({
  code: z.string().min(1).max(50).regex(/^[A-Z0-9\-]+$/),
  title: z.string().min(1).max(255),
  sponsorName: z.string().min(1).max(255),
  phase: z.enum(['PHASE_I', 'PHASE_II', 'PHASE_III', 'PHASE_IV', 'NA']),
  iwrsMode: z.boolean().default(false),
  iwrsEndpoint: z.string().url().optional().nullable(),
  destructionPolicy: z.enum(['LOCAL_DESTRUCTION', 'RETURN_TO_SPONSOR', 'BOTH']).default('LOCAL_DESTRUCTION'),
  requireArcApproval: z.boolean().default(true),
  requireEsignDispensation: z.boolean().default(false),
  startDate: z.coerce.date().optional().nullable(),
  expectedEndDate: z.coerce.date().optional().nullable(),
});

export const updateStudySchema = createStudySchema.partial();
```

## B. Exemple de Service Audit

```typescript
// src/lib/audit.ts

import { prisma } from './prisma';
import { AuditAction, AuditEntityType, UserRole } from '@prisma/client';
import crypto from 'crypto';

interface CreateAuditEventParams {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  userId?: string | null;
  userRoleSnapshot?: UserRole | null;
  studyId?: string | null;
  periodId?: string | null;
  batchId?: string | null;
  detailsBefore?: object | null;
  detailsAfter?: object | null;
  clientInfo?: object | null;
}

export async function createAuditEvent(params: CreateAuditEventParams) {
  const lastEvent = await prisma.auditEvent.findFirst({
    orderBy: { timestamp: 'desc' },
    select: { hash: true }
  });

  const previousHash = lastEvent?.hash || null;
  const timestamp = new Date();

  const hashData = JSON.stringify({
    action: params.action,
    timestamp: timestamp.toISOString(),
    userId: params.userId,
    entityType: params.entityType,
    entityId: params.entityId,
    detailsAfter: params.detailsAfter,
    previousHash
  });

  const hash = crypto.createHash('sha256').update(hashData).digest('hex');

  return prisma.auditEvent.create({
    data: {
      timestamp,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      userId: params.userId,
      userRoleSnapshot: params.userRoleSnapshot,
      studyId: params.studyId,
      periodId: params.periodId,
      batchId: params.batchId,
      detailsBefore: params.detailsBefore || undefined,
      detailsAfter: params.detailsAfter || undefined,
      clientInfo: params.clientInfo || undefined,
      hash,
      previousHash,
    }
  });
}
```

## C. Configuration Variables d'Environnement

```env
# .env.local

# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/docelium"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-tres-long-et-aleatoire"

# Application
NODE_ENV="development"
```

---

# FIN DE LA SPÉCIFICATION

Cette spécification est la référence unique pour le développement de DOCELIUM. Toute modification doit être approuvée et documentée.

**Version** : 1.0.0
**Date** : Janvier 2025
**Auteur** : Équipe DOCELIUM
