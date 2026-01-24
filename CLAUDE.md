# DOCELIUM - Instructions pour Claude

## Contexte
Logiciel de gestion de pharmacie hospitalière pour les essais cliniques.
Remplace les systèmes Excel/papier pour la comptabilité des médicaments expérimentaux (IMP/NIMP).

## Stack Technique
- Next.js 16 (App Router)
- React 19
- Material UI (MUI) 7
- Prisma 7 + PostgreSQL
- NextAuth.js 4
- TypeScript 5 (strict)
- Zod pour validation
- Vitest + Playwright pour tests

## Règles de Développement

### Tests Obligatoires
- Implémenter les tests avec CHAQUE fonctionnalité (pas à la fin)
- Coverage minimum : 80% global, 90% pour services critiques
- Tests unitaires (Vitest), intégration (supertest), E2E (Playwright)

### Code Style
- TypeScript strict, pas de `any`
- Validation Zod sur toutes les entrées API
- Respecter les énumérations EXACTES du SPEC.md (ne pas interpréter)

### Architecture
- App Router Next.js (src/app/)
- Services dans src/lib/services/
- Composants dans src/components/
- Validators dans src/lib/validators/

## MVP - Modules Prioritaires
1. Authentification (RBAC simplifié)
2. Protocoles (création multi-étapes : A, B, C, D, E, G, H, I, L, M, N)
3. Médicaments (liés à un protocole)
4. Mouvements (RECEPTION, DISPENSATION, RETOUR, DESTRUCTION, TRANSFER)

## Commandes
- `npm run dev` : Serveur de développement
- `npm run test` : Tests unitaires
- `npm run test:e2e` : Tests E2E
- `npm run db:migrate` : Migrations Prisma
- `npm run db:studio` : Interface Prisma Studio

## Référence
- Voir SPEC.md pour spécification complète
- Blocs F, J, K exclus du MVP (Phase 2)
