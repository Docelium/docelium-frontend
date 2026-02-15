import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMedicationById } from '@/lib/services/medication.service';
import { getStudyById } from '@/lib/services/study.service';
import { notFound } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { MedicationType, DosageForm, StorageCondition, CountingUnit, DoseType, AdministrationRoute, MedicationStatus, DestructionPolicy } from '@prisma/client';
import LinkButton from '@/components/ui/LinkButton';
import AuditTrail from '@/components/features/AuditTrail';

const typeLabels: Record<MedicationType, string> = {
  IMP: 'Medicament experimental (IMP)',
  NIMP: 'Medicament non-experimental (NIMP)',
};

const typeColors: Record<MedicationType, 'primary' | 'secondary'> = {
  IMP: 'primary',
  NIMP: 'secondary',
};

const dosageFormLabels: Record<DosageForm, string> = {
  TABLET: 'Comprime',
  CAPSULE: 'Gelule',
  INJECTION: 'Injection',
  SOLUTION: 'Solution',
  CREAM: 'Creme',
  PATCH: 'Patch',
  INHALER: 'Inhalateur',
  SUPPOSITORY: 'Suppositoire',
  POWDER: 'Poudre',
  GEL: 'Gel',
  SPRAY: 'Spray',
  DROPS: 'Gouttes',
  OTHER: 'Autre',
};

const storageLabels: Record<StorageCondition, string> = {
  ROOM_TEMPERATURE: 'Temperature ambiante',
  REFRIGERATED: 'Refrigere (2-8C)',
  FROZEN: 'Congele',
  CONTROLLED_ROOM_TEMPERATURE: 'Temperature controlee',
  PROTECT_FROM_LIGHT: 'Proteger de la lumiere',
  OTHER: 'Autre',
};

const doseTypeLabels: Record<DoseType, string> = {
  FIXED: 'Dose fixe',
  PER_KG: 'Par kg',
  PER_M2: 'Par m\u00b2',
};

const countingUnitLabels: Record<CountingUnit, string> = {
  UNIT: 'Unite',
  BOX: 'Boite',
  VIAL: 'Flacon',
  AMPOULE: 'Ampoule',
  SYRINGE: 'Seringue',
  BOTTLE: 'Bouteille',
  SACHET: 'Sachet',
  BLISTER: 'Blister',
  KIT: 'Kit',
  OTHER: 'Autre',
};

const administrationRouteLabels: Record<AdministrationRoute, string> = {
  IV: 'Intraveineuse (IV)',
  PO: 'Orale (PO)',
  SC: 'Sous-cutanee (SC)',
  IM: 'Intramusculaire (IM)',
  TOPICAL: 'Topique',
  INHALED: 'Inhalee',
  RECTAL: 'Rectale',
  TRANSDERMAL: 'Transdermique',
  OPHTHALMIC: 'Ophtalmique',
  OTHER: 'Autre',
};

const medicationStatusLabels: Record<MedicationStatus, string> = {
  DRAFT: 'Brouillon',
  ACTIVE: 'Actif',
  WITHDRAWN: 'Retiré',
};

const statusColors: Record<MedicationStatus, 'default' | 'success' | 'error'> = {
  DRAFT: 'default',
  ACTIVE: 'success',
  WITHDRAWN: 'error',
};

const hazardCategoryLabels: Record<string, string> = {
  CYTOTOXIQUE: 'Cytotoxique',
  RADIOACTIF: 'Radioactif',
  BIOLOGIQUE: 'Biologique',
  CMR: 'CMR',
};

const wasteCategoryLabels: Record<string, string> = {
  DASRI: 'DASRI',
  DAOM: 'DAOM',
  CYTOTOXIQUE: 'Cytotoxique',
};

const destructionPolicyLabels: Record<DestructionPolicy, string> = {
  LOCAL: 'Locale',
  SPONSOR: 'Sponsor',
  MIXED: 'Mixte',
};

const complianceMethodLabels: Record<string, string> = {
  PILL_COUNT: 'Comptage de comprimes',
  DIARY: 'Journal patient',
  ELECTRONIC: 'Electronique',
  OTHER: 'Autre',
};

interface Props {
  params: Promise<{ id: string; medId: string }>;
}

export default async function MedicationDetailPage({ params }: Props) {
  const { id: studyId, medId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const [study, medication] = await Promise.all([
    getStudyById(studyId, session.user.id, session.user.role),
    getMedicationById(medId),
  ]);

  if (!study || !medication) {
    notFound();
  }

  const canEdit = ['ADMIN', 'PHARMACIEN'].includes(session.user.role) &&
    !['ARCHIVED', 'TERMINATED'].includes(study.protocolStatus);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <LinkButton href={`/studies/${studyId}/medications`} startIcon={<ArrowBackIcon />} color="inherit">
          Retour aux medicaments
        </LinkButton>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h4">
              {medication.code}
            </Typography>
            <Chip
              label={typeLabels[medication.type]}
              color={typeColors[medication.type]}
              size="small"
            />
            <Chip
              label={medicationStatusLabels[medication.status]}
              color={statusColors[medication.status]}
              size="small"
            />
            {medication.isPediatric && (
              <Chip label="Pediatrique" color="info" size="small" />
            )}
            {medication.isBlinded && (
              <Chip label="Aveugle" variant="outlined" size="small" />
            )}
          </Box>
          <Typography variant="h6" color="text.secondary">
            {medication.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Protocole: {study.codeInternal} - {study.title}
          </Typography>
        </Box>
        {canEdit && (
          <LinkButton
            href={`/studies/${studyId}/medications/${medId}/edit`}
            variant="outlined"
            startIcon={<EditIcon />}
          >
            Modifier
          </LinkButton>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations generales
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Forme galenique
                  </Typography>
                  <Typography variant="body2">{dosageFormLabels[medication.dosageForm]}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Dosage
                  </Typography>
                  <Typography variant="body2">{medication.strength || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Fabricant
                  </Typography>
                  <Typography variant="body2">{medication.manufacturer || '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Route d&apos;administration
                  </Typography>
                  <Typography variant="body2">
                    {medication.administrationRoute
                      ? administrationRouteLabels[medication.administrationRoute]
                      : '-'}
                  </Typography>
                </Grid>
                {medication.dciName && (
                  <Grid size={{ xs: 6, md: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      DCI
                    </Typography>
                    <Typography variant="body2">{medication.dciName}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {(medication.doseType || medication.dosage || medication.packaging || medication.protocolRequiredDose || medication.doseRounding) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Posologie
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {medication.doseType && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Type de dose
                      </Typography>
                      <Typography variant="body2">{doseTypeLabels[medication.doseType]}</Typography>
                    </Grid>
                  )}
                  {medication.dosage && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Dosage
                      </Typography>
                      <Typography variant="body2">{medication.dosage}</Typography>
                    </Grid>
                  )}
                  {medication.packaging && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Conditionnement
                      </Typography>
                      <Typography variant="body2">{medication.packaging}</Typography>
                    </Grid>
                  )}
                  {medication.protocolRequiredDose && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Dose requise selon protocole
                      </Typography>
                      <Typography variant="body2">{medication.protocolRequiredDose}</Typography>
                    </Grid>
                  )}
                  {medication.doseRounding && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Arrondi de dose
                      </Typography>
                      <Typography variant="body2">{medication.doseRounding}</Typography>
                    </Grid>
                  )}
                  {medication.requiresAnthropometricData && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Donnees anthropometriques
                      </Typography>
                      <Typography variant="body2">Requises</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          {(medication.requiresPreparation || medication.requiresReconstitution || medication.stabilityAfterPreparation || medication.dilutionType || medication.dilutionVolume || medication.dilutionFinalConcentration || medication.dilutionSolution || medication.requiredEquipments) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Preparation & Reconstitution
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {medication.requiresPreparation && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary">
                        Preparation
                      </Typography>
                      <Typography variant="body2">Requise</Typography>
                      {medication.preparationInstructions && (
                        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                          {medication.preparationInstructions}
                        </Typography>
                      )}
                    </Grid>
                  )}
                  {medication.requiresReconstitution && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary">
                        Reconstitution
                      </Typography>
                      <Typography variant="body2">Requise</Typography>
                      {medication.reconstitutionInstructions && (
                        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                          {medication.reconstitutionInstructions}
                        </Typography>
                      )}
                    </Grid>
                  )}
                  {medication.stabilityAfterPreparation && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Stabilite apres preparation
                      </Typography>
                      <Typography variant="body2">{medication.stabilityAfterPreparation}</Typography>
                    </Grid>
                  )}
                  {medication.dilutionType && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Type de dilution
                      </Typography>
                      <Typography variant="body2">{medication.dilutionType}</Typography>
                    </Grid>
                  )}
                  {medication.dilutionVolume && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Volume de dilution
                      </Typography>
                      <Typography variant="body2">{medication.dilutionVolume}</Typography>
                    </Grid>
                  )}
                  {medication.dilutionFinalConcentration && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Concentration finale
                      </Typography>
                      <Typography variant="body2">{medication.dilutionFinalConcentration}</Typography>
                    </Grid>
                  )}
                  {medication.dilutionSolution && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Solution de dilution
                      </Typography>
                      <Typography variant="body2">{medication.dilutionSolution}</Typography>
                    </Grid>
                  )}
                  {medication.requiredEquipments && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary">
                        Equipements requis
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{medication.requiredEquipments}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          {(medication.hazardCategories.length > 0 || medication.wasteCategory || medication.destructionPolicy || medication.complianceRequired) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Securite & Compliance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {medication.hazardCategories.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="caption" color="text.secondary">
                        Categories de danger
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                        {medication.hazardCategories.map((cat) => (
                          <Chip
                            key={cat}
                            label={hazardCategoryLabels[cat] || cat}
                            color="error"
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                  {medication.wasteCategory && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Categorie de dechets
                      </Typography>
                      <Typography variant="body2">{wasteCategoryLabels[medication.wasteCategory] || medication.wasteCategory}</Typography>
                    </Grid>
                  )}
                  {medication.destructionPolicy && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Politique de destruction
                      </Typography>
                      <Typography variant="body2">{destructionPolicyLabels[medication.destructionPolicy]}</Typography>
                    </Grid>
                  )}
                  <Grid size={{ xs: 6, md: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Compliance requise
                    </Typography>
                    <Typography variant="body2">{medication.complianceRequired ? 'Oui' : 'Non'}</Typography>
                  </Grid>
                  {medication.complianceMethod && (
                    <Grid size={{ xs: 6, md: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Methode de compliance
                      </Typography>
                      <Typography variant="body2">{complianceMethodLabels[medication.complianceMethod] || medication.complianceMethod}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stockage
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Condition de stockage
                  </Typography>
                  <Typography variant="body2">{storageLabels[medication.storageCondition]}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Unite de comptage
                  </Typography>
                  <Typography variant="body2">{countingUnitLabels[medication.countingUnit]}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Unites par conditionnement
                  </Typography>
                  <Typography variant="body2">{medication.unitsPerPackage}</Typography>
                </Grid>
                {medication.storageInstructions && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Instructions de stockage
                    </Typography>
                    <Typography variant="body2">{medication.storageInstructions}</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuration
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    IWRS requis
                  </Typography>
                  <Typography variant="body2">{medication.iwrsRequired ? 'Oui' : 'Non'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Produit en aveugle
                  </Typography>
                  <Typography variant="body2">{medication.isBlinded ? 'Oui' : 'Non'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Approvisionnement initial
                  </Typography>
                  <Typography variant="body2">
                    {medication.initialSupplyMode === 'MANUEL' ? 'Manuel' : medication.initialSupplyMode === 'AUTO' ? 'Automatique' : '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Reapprovisionnement
                  </Typography>
                  <Typography variant="body2">
                    {medication.resupplyMode === 'MANUEL' ? 'Manuel' : medication.resupplyMode === 'AUTO' ? 'Automatique' : '-'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Typography variant="caption" color="text.secondary">
                    Attribution des traitements
                  </Typography>
                  <Typography variant="body2">
                    {medication.treatmentAssignmentMode === 'IRT' ? 'IRT' : medication.treatmentAssignmentMode === 'MANUEL' ? 'Manuel' : '-'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiques
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Articles en stock
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {medication._count.stockItems}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Mouvements
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {medication._count.movements}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {medication.equipmentLinks && medication.equipmentLinks.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Equipements associes
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {medication.equipmentLinks.map((link) => (
                    <Box key={link.equipment.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {link.equipment.code} - {link.equipment.name}
                      </Typography>
                      {link.isRequired && (
                        <Chip label="Requis" size="small" color="warning" />
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <AuditTrail entityType="MEDICATION" entityId={medId} />
    </Box>
  );
}
