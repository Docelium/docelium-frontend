# DOCELIUM

Logiciel de gestion de pharmacie hospitaliere pour les essais cliniques.

## Description

DOCELIUM est une plateforme web permettant de gerer la comptabilite des medicaments experimentaux (IMP) et non-experimentaux (NIMP) dans le cadre des essais cliniques. Il remplace les systemes Excel et papier traditionnellement utilises dans les Pharmacies a Usage Interieur (PUI).

### Problemes resolus

| Probleme Actuel | Solution DOCELIUM |
|-----------------|-------------------|
| Comptabilite IMP/NIMP via Excel et papier | Plateforme centralisee avec base de donnees |
| Aucune coherence systemique | Integration IWRS (CSV/API) |
| Pas d'audit trail robuste | Audit trail ALCOA+ complet |
| Reconstruction avant chaque monitoring | Stock temps reel, inspection-ready |
| Multiplication des protocoles/lots/kits | Gestion multi-protocoles standardisee |

### Conformite reglementaire

- **GCP** (Good Clinical Practice)
- **GMP** (Good Manufacturing Practice)
- **ALCOA+** (Attributable, Legible, Contemporaneous, Original, Accurate)
- **ICH-E6(R3)**
- **FDA 21 CFR Part 11**
- **ANSM / EMA**

## Stack Technique

| Categorie | Technologies |
|-----------|--------------|
| **Frontend** | Next.js 16, React 19, Material UI 7 |
| **Backend** | Next.js API Routes, Prisma 7, PostgreSQL |
| **Auth** | NextAuth.js 4 |
| **Validation** | Zod, React Hook Form |
| **Tests** | Vitest, Playwright, Testing Library |
| **Langage** | TypeScript 5 (strict) |

## Prerequis

- Node.js 20+
- PostgreSQL 16+ (ou Docker)
- npm ou yarn

## Installation

### 1. Cloner le repository

```bash
git clone <repository-url>
cd docelium
```

### 2. Installer les dependances

```bash
npm install
```

### 3. Configurer l'environnement

Copier le fichier d'exemple et configurer les variables :

```bash
cp .env.example .env
```

Variables requises :

```env
# Base de donnees
DATABASE_URL="postgresql://docelium:docelium_dev@localhost:5432/docelium"

# NextAuth
NEXTAUTH_SECRET="votre-secret-genere"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Demarrer PostgreSQL

Avec Docker :

```bash
docker-compose up -d
```

Ou utiliser une instance PostgreSQL existante.

### 5. Initialiser la base de donnees

```bash
# Generer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Charger les donnees de test
npm run db:seed
```

### 6. Demarrer l'application

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

## Utilisateurs de test

Apres le seed, les comptes suivants sont disponibles :

| Email | Mot de passe | Role |
|-------|--------------|------|
| admin@docelium.fr | Admin123! | Administrateur |
| pharmacien@docelium.fr | Pharma123! | Pharmacien |
| technicien@docelium.fr | Tech123! | Technicien |
| arc@docelium.fr | Arc123! | ARC (lecture seule) |
| auditeur@docelium.fr | Audit123! | Auditeur (lecture seule) |

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de developpement |
| `npm run build` | Build de production |
| `npm run start` | Demarrer en production |
| `npm run lint` | Linter ESLint |
| `npm run test` | Tests unitaires (Vitest) |
| `npm run test:ui` | Tests avec interface |
| `npm run test:coverage` | Tests avec couverture |
| `npm run test:e2e` | Tests E2E (Playwright) |
| `npm run test:e2e:ui` | Tests E2E avec interface |
| `npm run db:generate` | Generer client Prisma |
| `npm run db:migrate` | Appliquer migrations |
| `npm run db:push` | Push schema sans migration |
| `npm run db:seed` | Charger donnees de test |
| `npm run db:studio` | Interface Prisma Studio |

## Structure du projet

```
docelium/
├── prisma/
│   ├── schema.prisma      # Schema de base de donnees
│   └── seed.ts            # Donnees de test
├── src/
│   ├── app/
│   │   ├── (auth)/        # Pages authentification
│   │   │   └── login/
│   │   ├── (dashboard)/   # Pages protegees
│   │   │   ├── studies/   # Protocoles
│   │   │   ├── medications/ # Medicaments
│   │   │   ├── movements/ # Mouvements
│   │   │   └── stock/     # Vue stock
│   │   ├── api/           # Routes API
│   │   │   ├── auth/
│   │   │   ├── studies/
│   │   │   ├── medications/
│   │   │   ├── movements/
│   │   │   └── stock/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/          # Composants auth
│   │   ├── features/      # Composants metier
│   │   │   └── study/
│   │   │       └── blocks/ # Blocs protocole (A-N)
│   │   ├── layout/        # Header, Sidebar
│   │   ├── providers/     # Context providers
│   │   └── ui/            # Composants UI generiques
│   ├── contexts/          # React contexts
│   ├── lib/
│   │   ├── services/      # Logique metier
│   │   ├── validators/    # Schemas Zod
│   │   ├── auth.ts        # Config NextAuth
│   │   ├── auth-utils.ts  # Helpers auth
│   │   ├── prisma.ts      # Client Prisma
│   │   └── theme.ts       # Theme MUI
│   └── middleware.ts      # Protection routes
├── e2e/                   # Tests Playwright
├── docker-compose.yml
├── vitest.config.ts
├── playwright.config.ts
└── SPEC.md                # Specification complete
```

## Modules MVP

### 1. Authentification (RBAC)

Gestion des utilisateurs avec 5 roles :
- **Admin** : Acces complet
- **Pharmacien** : CRUD protocoles, medicaments, mouvements
- **Technicien** : Creation mouvements, lecture
- **ARC** : Lecture seule, exports
- **Auditeur** : Lecture seule, audit trail

### 2. Protocoles

Creation multi-etapes avec 11 blocs :
- **A** : Identification
- **B** : Organisation & Contacts
- **C** : Identifiants reglementaires
- **D** : Parametres operationnels
- **E** : Profil qualite donnees
- **G** : Calendrier des visites
- **H** : Contraintes patients
- **I** : Gouvernance temperature
- **L** : Gouvernance IWRS
- **M** : Equipements requis
- **N** : Surcharges site

### 3. Medicaments

Gestion des IMP/NIMP lies aux protocoles :
- Type (IMP/NIMP)
- Forme galenique
- Conditions de stockage
- Unite de comptage
- Configuration IWRS

### 4. Mouvements

5 types de mouvements :
- **Reception** : Entree en stock
- **Dispensation** : Delivrance patient
- **Retour** : Retour patient
- **Destruction** : Elimination
- **Transfert** : Changement d'emplacement

### 5. Stock

Vue temps reel du stock par :
- Protocole
- Medicament
- Lot (batch)
- Emplacement

## API Endpoints

### Authentification
- `POST /api/auth/signin` - Connexion
- `POST /api/auth/signout` - Deconnexion

### Protocoles
- `GET /api/studies` - Liste des protocoles
- `POST /api/studies` - Creer un protocole
- `GET /api/studies/[id]` - Detail protocole
- `PUT /api/studies/[id]` - Modifier protocole
- `DELETE /api/studies/[id]` - Supprimer protocole

### Medicaments
- `GET /api/medications` - Liste tous les medicaments
- `POST /api/medications` - Creer un medicament
- `GET /api/studies/[id]/medications` - Medicaments d'un protocole
- `GET /api/studies/[id]/medications/[medId]` - Detail medicament

### Mouvements
- `GET /api/movements` - Liste des mouvements
- `POST /api/movements` - Creer un mouvement
- `GET /api/movements/[id]` - Detail mouvement

### Stock
- `GET /api/stock` - Vue stock (filtres: studyId, medicationId, status)

## Tests

### Tests unitaires

```bash
npm run test
```

### Tests avec couverture

```bash
npm run test:coverage
```

Objectif : > 80% de couverture globale, > 90% pour les services critiques.

### Tests E2E

```bash
npm run test:e2e
```

## Developpement

### Regles de code

- TypeScript strict (pas de `any`)
- Validation Zod sur toutes les entrees API
- Tests avec chaque fonctionnalite
- Respect des enumerations du SPEC.md

### Ajouter une migration

```bash
npx prisma migrate dev --name nom_migration
```

### Visualiser la base

```bash
npm run db:studio
```

## Licence

Proprietaire - Tous droits reserves

## Support

Pour toute question ou probleme, contactez l'equipe de developpement.
