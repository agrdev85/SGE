// PDF Certificate Generator using jsPDF
import { jsPDF } from 'jspdf';
import type { Event, User, Abstract } from './database';

export interface CertificateData {
  participantName: string;
  eventName: string;
  eventDate: string;
  abstractTitle?: string;
  categoryType?: string;
  certificateType: 'participation' | 'presentation' | 'reviewer';
  bannerImageUrl?: string;
  primaryColor: string;
  secondaryColor: string;
}

export function generateCertificate(data: CertificateData): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background gradient (simulated with rectangles)
  doc.setFillColor(30, 64, 175); // Primary blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

  // Decorative elements
  doc.setFillColor(5, 150, 105); // Accent green
  doc.rect(0, 35, pageWidth, 5, 'F');
  doc.rect(0, pageHeight - 25, pageWidth, 5, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICADO', pageWidth / 2, 25, { align: 'center' });

  // Certificate type subtitle
  const typeLabel = {
    'participation': 'DE PARTICIPACIÓN',
    'presentation': 'DE PRESENTACIÓN',
    'reviewer': 'DE REVISOR CIENTÍFICO',
  }[data.certificateType];

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(typeLabel, pageWidth / 2, 32, { align: 'center' });

  // Main content
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Se certifica que', pageWidth / 2, 60, { align: 'center' });

  // Participant name
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text(data.participantName, pageWidth / 2, 75, { align: 'center' });

  // Participation text
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  
  let yPos = 90;
  
  if (data.certificateType === 'participation') {
    doc.text('ha participado en el evento', pageWidth / 2, yPos, { align: 'center' });
  } else if (data.certificateType === 'presentation') {
    doc.text('ha presentado el trabajo titulado', pageWidth / 2, yPos, { align: 'center' });
    
    if (data.abstractTitle) {
      yPos += 12;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bolditalic');
      doc.setTextColor(5, 150, 105);
      
      // Word wrap for long titles
      const splitTitle = doc.splitTextToSize(data.abstractTitle, pageWidth - 60);
      doc.text(splitTitle, pageWidth / 2, yPos, { align: 'center' });
      yPos += (splitTitle.length - 1) * 7;
    }
    
    if (data.categoryType) {
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(`Modalidad: ${data.categoryType}`, pageWidth / 2, yPos, { align: 'center' });
    }
    
    yPos += 10;
    doc.setFontSize(14);
    doc.text('en el evento', pageWidth / 2, yPos, { align: 'center' });
  } else if (data.certificateType === 'reviewer') {
    doc.text('ha participado como Revisor Científico en el evento', pageWidth / 2, yPos, { align: 'center' });
  }

  // Event name
  yPos += 15;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  const splitEventName = doc.splitTextToSize(data.eventName, pageWidth - 40);
  doc.text(splitEventName, pageWidth / 2, yPos, { align: 'center' });

  // Event date
  yPos += splitEventName.length * 8 + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Celebrado del ${data.eventDate}`, pageWidth / 2, yPos, { align: 'center' });

  // Footer
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(
    'Este certificado ha sido generado electrónicamente y es válido sin firma.',
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Generate unique ID
  const certificateId = `CERT-${Date.now().toString(36).toUpperCase()}`;
  doc.setFontSize(8);
  doc.text(`ID: ${certificateId}`, pageWidth - 10, pageHeight - 5, { align: 'right' });

  // Save
  const fileName = `Certificado_${data.participantName.replace(/\s+/g, '_')}_${data.certificateType}.pdf`;
  doc.save(fileName);
}

export function generateParticipationCertificate(user: User, event: Event): void {
  generateCertificate({
    participantName: user.name,
    eventName: event.name,
    eventDate: `${formatDate(event.startDate)} al ${formatDate(event.endDate)}`,
    certificateType: 'participation',
    primaryColor: event.primaryColor,
    secondaryColor: event.secondaryColor,
    bannerImageUrl: event.bannerImageUrl,
  });
}

export function generatePresentationCertificate(user: User, event: Event, abstract: Abstract): void {
  generateCertificate({
    participantName: user.name,
    eventName: event.name,
    eventDate: `${formatDate(event.startDate)} al ${formatDate(event.endDate)}`,
    abstractTitle: abstract.title,
    categoryType: abstract.categoryType,
    certificateType: 'presentation',
    primaryColor: event.primaryColor,
    secondaryColor: event.secondaryColor,
    bannerImageUrl: event.bannerImageUrl,
  });
}

export function generateReviewerCertificate(user: User, event: Event): void {
  generateCertificate({
    participantName: user.name,
    eventName: event.name,
    eventDate: `${formatDate(event.startDate)} al ${formatDate(event.endDate)}`,
    certificateType: 'reviewer',
    primaryColor: event.primaryColor,
    secondaryColor: event.secondaryColor,
    bannerImageUrl: event.bannerImageUrl,
  });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
