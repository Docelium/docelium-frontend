import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudyPhase } from '@prisma/client';
import {
  statusLabels,
  phaseLabels,
  destructionPolicyLabels,
  blindingLabels,
  returnPolicyLabels,
  temperatureGovernanceLabels,
  contactRoleLabels,
} from '@/lib/labels';

// Type for the study object returned by getStudyById
interface StudyForPdf {
  id: string;
  codeInternal: string;
  studyCode: string;
  acronym: string;
  siteNumber: string;
  euCtNumber: string | null;
  nctNumber: string | null;
  title: string;
  studyObjective: string | null;
  sponsor: string;
  phases: StudyPhase[];
  therapeuticArea: string | null;
  protocolStatus: keyof typeof statusLabels;
  siteActivationDate: Date | null;
  setupDate: Date | null;
  siteCenterClosureDate: Date | null;
  recruitmentStartDate: Date | null;
  recruitmentSuspensionDate: Date | null;
  recruitmentEndDate: Date | null;
  expectedRecruitment: number | null;
  startDate: Date | null;
  expectedEndDate: Date | null;
  actualEndDate: Date | null;

  // Bloc B
  contacts: Array<{ role: string; name: string; email: string; phone?: string }> | null;

  // Bloc C
  protocolVersion: string | null;
  protocolVersionDate: Date | null;
  amendments: Array<{ version: string; date: string }> | null;
  pharmacyManualVersion: string | null;
  pharmacyManualVersionDate: Date | null;
  euCtrApprovalReference: Date | null;
  ethicsApprovalDate: Date | null;
  ansmApprovalDate: Date | null;
  insuranceReference: string | null;
  eudamedId: string | null;

  // Bloc D
  blinded: keyof typeof blindingLabels;
  arms: string[] | null;
  cohorts: string[] | null;
  destructionPolicy: keyof typeof destructionPolicyLabels;
  destructionPolicyDetails: string | null;
  returnPolicy: keyof typeof returnPolicyLabels;
  hasIrtSystem: boolean;
  irtSystemName: string | null;

  // Bloc G
  visitSchedule: Array<{
    visit_code: string;
    day: number;
    requires_dispense: boolean;
    arm?: string | null;
  }> | null;
  treatmentCycles: {
    treatment_schema_type?: string;
    cycle_length?: number | null;
    max_cycles?: number | null;
  } | null;

  // Bloc H
  patientConstraints: {
    min_age?: number | null;
    max_age?: number | null;
    capped_dose?: boolean;
    capped_dose_condition?: string | null;
    requires_recent_weight_days?: number | null;
    weight_variation_threshold?: number | null;
    weight_reference?: string;
  } | null;

  // Bloc I
  temperatureGovernance: keyof typeof temperatureGovernanceLabels | null;
  excursionActionRequired: boolean;
  excursionTimeThreshold: string | null;

  // Bloc L
  iwrsGovernance: {
    iwrs_integration?: boolean;
    iwrs_integration_mode?: string;
    iwrs_endpoint?: string | null;
  } | null;

  // Bloc M
  protocolRequiredEquipments: string[];
  equipments: Array<{ code: string; name: string }>;

  // Bloc N
  siteOverrides: {
    requires_local_quarantine_step?: boolean;
    requires_extra_reception_fields?: string[];
    local_procedure_references?: Array<{ name: string; reference: string }>;
  } | null;

  // Comments
  blockComments: Record<string, string> | null;
}

function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR');
}

const PAGE_MARGIN = 14;
const CONTENT_WIDTH = 182; // 210 - 2*14

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  if (y > 265) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 37, 41);
  doc.text(title, PAGE_MARGIN, y);
  y += 2;
  doc.setDrawColor(63, 81, 181);
  doc.setLineWidth(0.5);
  doc.line(PAGE_MARGIN, y, PAGE_MARGIN + CONTENT_WIDTH, y);
  return y + 6;
}

function addField(doc: jsPDF, label: string, value: string, y: number): number {
  if (y > 275) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text(label, PAGE_MARGIN, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(33, 37, 41);
  const lines = doc.splitTextToSize(value || '-', CONTENT_WIDTH - 50);
  doc.text(lines, PAGE_MARGIN + 50, y);
  return y + Math.max(lines.length * 4.5, 6);
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 280) {
    doc.addPage();
    return 20;
  }
  return y;
}

export function generateStudyPdf(study: StudyForPdf): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header
  doc.setFillColor(63, 81, 181);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Protocole : ${study.codeInternal}`, PAGE_MARGIN, 14);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const headerInfo = [
    study.acronym && `Acronyme : ${study.acronym}`,
    `Statut : ${statusLabels[study.protocolStatus]}`,
    `Genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
  ].filter(Boolean).join('  |  ');
  doc.text(headerInfo, PAGE_MARGIN, 23);

  let y = 40;

  // === BLOC A : Identification ===
  y = addSectionTitle(doc, 'Bloc A - Identification', y);
  y = addField(doc, 'Code interne', study.codeInternal, y);
  if (study.studyCode) y = addField(doc, 'Code etude', study.studyCode, y);
  if (study.acronym) y = addField(doc, 'Acronyme', study.acronym, y);
  y = addField(doc, 'Titre', study.title, y);
  if (study.studyObjective) y = addField(doc, 'Objectif', study.studyObjective, y);
  y = addField(doc, 'Promoteur', study.sponsor, y);
  y = addField(doc, 'Phase(s)', (study.phases || []).map((p: StudyPhase) => phaseLabels[p]).join(', ') || '-', y);
  if (study.therapeuticArea) y = addField(doc, 'Indic. therapeutique', study.therapeuticArea, y);
  if (study.siteNumber) y = addField(doc, 'N° centre', study.siteNumber, y);
  if (study.euCtNumber) y = addField(doc, 'N° EU-CT', study.euCtNumber, y);
  if (study.nctNumber) y = addField(doc, 'N° NCT', study.nctNumber, y);

  // Dates
  y += 2;
  y = addField(doc, 'Activation centre', formatDate(study.siteActivationDate), y);
  y = addField(doc, 'Mise en place', formatDate(study.setupDate), y);
  y = addField(doc, 'Fermeture centre', formatDate(study.siteCenterClosureDate), y);
  y = addField(doc, 'Debut etude', formatDate(study.startDate), y);
  y = addField(doc, 'Fin prevue', formatDate(study.expectedEndDate), y);
  if (study.actualEndDate) y = addField(doc, 'Fin effective', formatDate(study.actualEndDate), y);

  // Recruitment
  y += 2;
  y = addField(doc, 'Debut recrutement', formatDate(study.recruitmentStartDate), y);
  if (study.recruitmentSuspensionDate) y = addField(doc, 'Suspension recrut.', formatDate(study.recruitmentSuspensionDate), y);
  y = addField(doc, 'Fin recrutement', formatDate(study.recruitmentEndDate), y);
  if (study.expectedRecruitment != null) y = addField(doc, 'Recrut. attendu', String(study.expectedRecruitment), y);

  // === BLOC B : Contacts ===
  const contacts = study.contacts as Array<{ role: string; name: string; email: string; phone?: string }> | null;
  if (contacts && contacts.length > 0) {
    y += 4;
    y = checkPageBreak(doc, y, 20);
    y = addSectionTitle(doc, 'Bloc B - Contacts', y);
    autoTable(doc, {
      startY: y,
      head: [['Role', 'Nom', 'Email', 'Telephone']],
      body: contacts.map((c) => [
        contactRoleLabels[c.role] || c.role,
        c.name,
        c.email,
        c.phone || '-',
      ]),
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [63, 81, 181], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }

  // === BLOC C : Reglementaire ===
  y += 4;
  y = checkPageBreak(doc, y, 30);
  y = addSectionTitle(doc, 'Bloc C - Reglementaire', y);
  y = addField(doc, 'Version protocole', study.protocolVersion || '-', y);
  y = addField(doc, 'Date version', formatDate(study.protocolVersionDate), y);
  y = addField(doc, 'Manuel pharmacie', study.pharmacyManualVersion || '-', y);
  y = addField(doc, 'Date manuel', formatDate(study.pharmacyManualVersionDate), y);
  y = addField(doc, 'Approbation EU-CTR', formatDate(study.euCtrApprovalReference), y);
  y = addField(doc, 'Approbation CPP', formatDate(study.ethicsApprovalDate), y);
  y = addField(doc, 'Approbation ANSM', formatDate(study.ansmApprovalDate), y);
  if (study.insuranceReference) y = addField(doc, 'Ref. assurance', study.insuranceReference, y);
  if (study.eudamedId) y = addField(doc, 'EUDAMED ID', study.eudamedId, y);

  // Amendments
  const amendments = study.amendments as Array<{ version: string; date: string }> | null;
  if (amendments && amendments.length > 0) {
    y += 2;
    y = checkPageBreak(doc, y, 15);
    autoTable(doc, {
      startY: y,
      head: [['Amendement', 'Date']],
      body: amendments.map((a) => [a.version, formatDate(a.date)]),
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [63, 81, 181], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }

  // === BLOC D : Parametres operationnels ===
  y += 4;
  y = checkPageBreak(doc, y, 30);
  y = addSectionTitle(doc, 'Bloc D - Parametres operationnels', y);
  y = addField(doc, 'Type d\'aveugle', blindingLabels[study.blinded], y);
  y = addField(doc, 'Politique destruction', destructionPolicyLabels[study.destructionPolicy], y);
  if (study.destructionPolicy === 'MIXED' && study.destructionPolicyDetails) {
    y = addField(doc, 'Details destruction', study.destructionPolicyDetails, y);
  }
  y = addField(doc, 'Politique retour', returnPolicyLabels[study.returnPolicy], y);
  y = addField(doc, 'Systeme IRT', study.hasIrtSystem ? (study.irtSystemName || 'Oui') : 'Non', y);

  const arms = study.arms as string[] | null;
  if (arms && arms.length > 0) {
    y = addField(doc, 'Bras', arms.join(', '), y);
  }
  const cohorts = study.cohorts as string[] | null;
  if (cohorts && cohorts.length > 0) {
    y = addField(doc, 'Cohortes', cohorts.join(', '), y);
  }

  // === BLOC G : Calendrier des visites ===
  const visits = study.visitSchedule as Array<{ visit_code: string; day: number; requires_dispense: boolean; arm?: string | null }> | null;
  if (visits && visits.length > 0) {
    y += 4;
    y = checkPageBreak(doc, y, 20);
    y = addSectionTitle(doc, 'Bloc G - Calendrier des visites', y);
    autoTable(doc, {
      startY: y,
      head: [['Code visite', 'Jour', 'Bras', 'Dispensation']],
      body: visits.map((v) => [
        v.visit_code,
        String(v.day),
        v.arm || '-',
        v.requires_dispense ? 'Oui' : 'Non',
      ]),
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [63, 81, 181], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
  }

  // Treatment cycles
  const cycles = study.treatmentCycles as { treatment_schema_type?: string; cycle_length?: number | null; max_cycles?: number | null } | null;
  if (cycles && (cycles.cycle_length || cycles.max_cycles)) {
    y = checkPageBreak(doc, y, 15);
    if (cycles.treatment_schema_type) y = addField(doc, 'Schema traitement', cycles.treatment_schema_type === 'CYCLE' ? 'Cyclique' : 'Autre', y);
    if (cycles.cycle_length) y = addField(doc, 'Duree cycle (jours)', String(cycles.cycle_length), y);
    if (cycles.max_cycles) y = addField(doc, 'Nombre max cycles', String(cycles.max_cycles), y);
  }

  // === BLOC H : Contraintes patient ===
  const pc = study.patientConstraints as StudyForPdf['patientConstraints'];
  if (pc && (pc.min_age != null || pc.max_age != null || pc.capped_dose || pc.requires_recent_weight_days != null)) {
    y += 4;
    y = checkPageBreak(doc, y, 20);
    y = addSectionTitle(doc, 'Bloc H - Contraintes patient', y);
    if (pc.min_age != null) y = addField(doc, 'Age minimum', `${pc.min_age} ans`, y);
    if (pc.max_age != null) y = addField(doc, 'Age maximum', `${pc.max_age} ans`, y);
    if (pc.capped_dose) {
      y = addField(doc, 'Dose cappee', 'Oui', y);
      if (pc.capped_dose_condition) y = addField(doc, 'Condition dose', pc.capped_dose_condition, y);
    }
    if (pc.requires_recent_weight_days != null) {
      y = addField(doc, 'Poids recent (jours)', String(pc.requires_recent_weight_days), y);
    }
    if (pc.weight_variation_threshold != null) {
      y = addField(doc, 'Seuil variation poids', `${pc.weight_variation_threshold}%`, y);
    }
    if (pc.weight_reference) {
      y = addField(doc, 'Reference poids', pc.weight_reference === 'BASELINE' ? 'Baseline' : 'Courant', y);
    }
  }

  // === BLOC I : Temperature ===
  if (study.temperatureGovernance) {
    y += 4;
    y = checkPageBreak(doc, y, 15);
    y = addSectionTitle(doc, 'Bloc I - Gouvernance temperature', y);
    y = addField(doc, 'Niveau', temperatureGovernanceLabels[study.temperatureGovernance], y);
    y = addField(doc, 'Action excursion', study.excursionActionRequired ? 'Requise' : 'Non requise', y);
    if (study.excursionTimeThreshold) y = addField(doc, 'Seuil temps excursion', study.excursionTimeThreshold, y);
  }

  // === BLOC L : IWRS ===
  const iwrs = study.iwrsGovernance as StudyForPdf['iwrsGovernance'];
  if (iwrs && iwrs.iwrs_integration) {
    y += 4;
    y = checkPageBreak(doc, y, 15);
    y = addSectionTitle(doc, 'Bloc L - IWRS', y);
    y = addField(doc, 'Integration IWRS', 'Oui', y);
    if (iwrs.iwrs_integration_mode) {
      const modeLabels: Record<string, string> = { MANUAL: 'Manuel', CSV: 'CSV', API: 'API' };
      y = addField(doc, 'Mode integration', modeLabels[iwrs.iwrs_integration_mode] || iwrs.iwrs_integration_mode, y);
    }
    if (iwrs.iwrs_endpoint) y = addField(doc, 'Endpoint IWRS', iwrs.iwrs_endpoint, y);
  }

  // === BLOC M : Equipements requis ===
  if (study.protocolRequiredEquipments.length > 0 || study.equipments.length > 0) {
    y += 4;
    y = checkPageBreak(doc, y, 15);
    y = addSectionTitle(doc, 'Bloc M - Equipements requis', y);
    if (study.protocolRequiredEquipments.length > 0) {
      y = addField(doc, 'Equipements protocole', study.protocolRequiredEquipments.join(', '), y);
    }
    if (study.equipments.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Code', 'Nom']],
        body: study.equipments.map((e) => [e.code, e.name]),
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [63, 81, 181], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 250] },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
    }
  }

  // === BLOC N : Personnalisations locales ===
  const so = study.siteOverrides as StudyForPdf['siteOverrides'];
  if (so && (so.requires_local_quarantine_step || (so.requires_extra_reception_fields && so.requires_extra_reception_fields.length > 0) || (so.local_procedure_references && so.local_procedure_references.length > 0))) {
    y += 4;
    y = checkPageBreak(doc, y, 20);
    y = addSectionTitle(doc, 'Bloc N - Personnalisations locales', y);
    if (so.requires_local_quarantine_step) {
      y = addField(doc, 'Quarantaine locale', 'Oui', y);
    }
    if (so.requires_extra_reception_fields && so.requires_extra_reception_fields.length > 0) {
      y = addField(doc, 'Champs reception', so.requires_extra_reception_fields.join(', '), y);
    }
    if (so.local_procedure_references && so.local_procedure_references.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [['Procedure', 'Reference']],
        body: so.local_procedure_references.map((p) => [p.name, p.reference]),
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [63, 81, 181], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 250] },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
    }
  }

  // === Commentaires par bloc ===
  const comments = study.blockComments as Record<string, string> | null;
  if (comments && Object.keys(comments).length > 0) {
    y += 4;
    y = checkPageBreak(doc, y, 20);
    y = addSectionTitle(doc, 'Commentaires', y);
    for (const [blockId, comment] of Object.entries(comments)) {
      y = checkPageBreak(doc, y, 10);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text(`Bloc ${blockId}`, PAGE_MARGIN, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(33, 37, 41);
      const lines = doc.splitTextToSize(comment, CONTENT_WIDTH);
      doc.text(lines, PAGE_MARGIN, y);
      y += lines.length * 4.5 + 3;
    }
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(`Docelium - ${study.codeInternal} - Page ${i}/${totalPages}`, PAGE_MARGIN, 290);
  }

  return Buffer.from(doc.output('arraybuffer'));
}
