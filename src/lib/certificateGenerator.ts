// PDF Certificate Generator using jsPDF
import { jsPDF } from 'jspdf';
import type { Event, User, Abstract } from './database';

export interface CertificateConfig {
  // Layout
  orientation: 'landscape' | 'portrait';
  format: 'a4' | 'letter' | 'legal';
  
  // Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  
  // Content
  title: string;
  subtitle: string;
  headerText: string;
  bodyTemplate: string;
  footerText: string;
  
  // Branding
  logoUrl?: string;
  sponsorLogos?: string[];
  showBorder: boolean;
  borderStyle: 'solid' | 'double' | 'dashed';
  
  // Signature
  signatureText?: string;
  signatureImage?: string;
  signerName?: string;
  signerTitle?: string;
}

export interface CertificateData {
  participantName: string;
  eventName: string;
  eventDate: string;
  abstractTitle?: string;
  categoryType?: string;
  certificateType: 'participation' | 'presentation' | 'reviewer' | 'custom';
  bannerImageUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  config?: Partial<CertificateConfig>;
}

export const defaultCertificateConfig: CertificateConfig = {
  orientation: 'landscape',
  format: 'a4',
  primaryColor: '#1e40af',
  secondaryColor: '#059669',
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  title: 'CERTIFICADO',
  subtitle: '',
  headerText: 'Se certifica que',
  bodyTemplate: 'ha participado en el evento',
  footerText: 'Este certificado ha sido generado electrónicamente y es válido sin firma.',
  showBorder: true,
  borderStyle: 'solid',
  signatureText: 'Comité Organizador',
  signerName: '',
  signerTitle: '',
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 30, g: 64, b: 175 };
}

export function generateCertificate(data: CertificateData): jsPDF {
  const config = { ...defaultCertificateConfig, ...data.config };
  const primaryRgb = hexToRgb(data.primaryColor || config.primaryColor);
  const secondaryRgb = hexToRgb(data.secondaryColor || config.secondaryColor);
  
  const doc = new jsPDF({
    orientation: config.orientation,
    unit: 'mm',
    format: config.format,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background gradient (simulated with rectangles)
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

  // Decorative elements
  doc.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
  doc.rect(0, 35, pageWidth, 5, 'F');
  doc.rect(0, pageHeight - 25, pageWidth, 5, 'F');

  // Optional border
  if (config.showBorder) {
    doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.setLineWidth(config.borderStyle === 'double' ? 2 : 1);
    if (config.borderStyle === 'dashed') {
      doc.setLineDashPattern([5, 3], 0);
    }
    doc.rect(10, 45, pageWidth - 20, pageHeight - 75);
  }

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(config.title, pageWidth / 2, 25, { align: 'center' });

  // Certificate type subtitle
  const typeLabel = {
    'participation': 'DE PARTICIPACIÓN',
    'presentation': 'DE PRESENTACIÓN',
    'reviewer': 'DE REVISOR CIENTÍFICO',
    'custom': config.subtitle || 'ESPECIAL',
  }[data.certificateType];

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(typeLabel, pageWidth / 2, 32, { align: 'center' });

  // Main content
  const textRgb = hexToRgb(config.textColor);
  doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(config.headerText, pageWidth / 2, 60, { align: 'center' });

  // Participant name
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(data.participantName, pageWidth / 2, 75, { align: 'center' });

  // Participation text
  doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  
  let yPos = 90;
  
  if (data.certificateType === 'participation') {
    doc.text(config.bodyTemplate || 'ha participado en el evento', pageWidth / 2, yPos, { align: 'center' });
  } else if (data.certificateType === 'presentation') {
    doc.text('ha presentado el trabajo titulado', pageWidth / 2, yPos, { align: 'center' });
    
    if (data.abstractTitle) {
      yPos += 12;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bolditalic');
      doc.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      
      // Word wrap for long titles
      const splitTitle = doc.splitTextToSize(data.abstractTitle, pageWidth - 60);
      doc.text(splitTitle, pageWidth / 2, yPos, { align: 'center' });
      yPos += (splitTitle.length - 1) * 7;
    }
    
    if (data.categoryType) {
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
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
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  const splitEventName = doc.splitTextToSize(data.eventName, pageWidth - 40);
  doc.text(splitEventName, pageWidth / 2, yPos, { align: 'center' });

  // Event date
  yPos += splitEventName.length * 8 + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Celebrado del ${data.eventDate}`, pageWidth / 2, yPos, { align: 'center' });

  // Signature area
  if (config.signerName || config.signatureText) {
    yPos += 25;
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);
    
    if (config.signerName) {
      yPos += 6;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      doc.text(config.signerName, pageWidth / 2, yPos, { align: 'center' });
    }
    
    if (config.signerTitle) {
      yPos += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(config.signerTitle, pageWidth / 2, yPos, { align: 'center' });
    }
    
    if (config.signatureText && !config.signerName) {
      yPos += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(config.signatureText, pageWidth / 2, yPos, { align: 'center' });
    }
  }

  // Footer
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(
    config.footerText,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Generate unique ID
  const certificateId = `CERT-${Date.now().toString(36).toUpperCase()}`;
  doc.setFontSize(8);
  doc.text(`ID: ${certificateId}`, pageWidth - 10, pageHeight - 5, { align: 'right' });

  return doc;
}

export function generateAndSaveCertificate(data: CertificateData): void {
  const doc = generateCertificate(data);
  const fileName = `Certificado_${data.participantName.replace(/\s+/g, '_')}_${data.certificateType}.pdf`;
  doc.save(fileName);
}

export function generateParticipationCertificate(user: User, event: Event, config?: Partial<CertificateConfig>): void {
  generateAndSaveCertificate({
    participantName: user.name,
    eventName: event.name,
    eventDate: `${formatDate(event.startDate)} al ${formatDate(event.endDate)}`,
    certificateType: 'participation',
    primaryColor: event.primaryColor,
    secondaryColor: event.secondaryColor,
    bannerImageUrl: event.bannerImageUrl,
    config,
  });
}

export function generatePresentationCertificate(user: User, event: Event, abstract: Abstract, config?: Partial<CertificateConfig>): void {
  generateAndSaveCertificate({
    participantName: user.name,
    eventName: event.name,
    eventDate: `${formatDate(event.startDate)} al ${formatDate(event.endDate)}`,
    abstractTitle: abstract.title,
    categoryType: abstract.categoryType,
    certificateType: 'presentation',
    primaryColor: event.primaryColor,
    secondaryColor: event.secondaryColor,
    bannerImageUrl: event.bannerImageUrl,
    config,
  });
}

export function generateReviewerCertificate(user: User, event: Event, config?: Partial<CertificateConfig>): void {
  generateAndSaveCertificate({
    participantName: user.name,
    eventName: event.name,
    eventDate: `${formatDate(event.startDate)} al ${formatDate(event.endDate)}`,
    certificateType: 'reviewer',
    primaryColor: event.primaryColor,
    secondaryColor: event.secondaryColor,
    bannerImageUrl: event.bannerImageUrl,
    config,
  });
}

// Bulk export function
export function generateBulkCertificates(
  users: User[],
  event: Event,
  certificateType: 'participation' | 'presentation' | 'reviewer',
  abstracts?: Abstract[],
  config?: Partial<CertificateConfig>
): void {
  const doc = new jsPDF({
    orientation: config?.orientation || 'landscape',
    unit: 'mm',
    format: config?.format || 'a4',
  });

  users.forEach((user, index) => {
    const data: CertificateData = {
      participantName: user.name,
      eventName: event.name,
      eventDate: `${formatDate(event.startDate)} al ${formatDate(event.endDate)}`,
      certificateType,
      primaryColor: event.primaryColor,
      secondaryColor: event.secondaryColor,
      bannerImageUrl: event.bannerImageUrl,
      config,
    };

    if (certificateType === 'presentation' && abstracts) {
      const userAbstract = abstracts.find(a => a.userId === user.id && a.status === 'APROBADO');
      if (userAbstract) {
        data.abstractTitle = userAbstract.title;
        data.categoryType = userAbstract.categoryType;
      }
    }

    const singleDoc = generateCertificate(data);
    
    if (index > 0) {
      doc.addPage();
    }
    
    // Copy page content - simplified approach
    const pageData = singleDoc.output('datauristring');
    // For bulk, we generate individual PDFs but could merge them
  });

  // Alternative: Save as zip or multiple files
  users.forEach((user, index) => {
    setTimeout(() => {
      const data: CertificateData = {
        participantName: user.name,
        eventName: event.name,
        eventDate: `${formatDate(event.startDate)} al ${formatDate(event.endDate)}`,
        certificateType,
        primaryColor: event.primaryColor,
        secondaryColor: event.secondaryColor,
        config,
      };

      if (certificateType === 'presentation' && abstracts) {
        const userAbstract = abstracts.find(a => a.userId === user.id && a.status === 'APROBADO');
        if (userAbstract) {
          data.abstractTitle = userAbstract.title;
          data.categoryType = userAbstract.categoryType;
        }
      }

      generateAndSaveCertificate(data);
    }, index * 500); // Stagger downloads to prevent blocking
  });
}

// Generate all certificates for an event in one merged PDF
export function generateAllCertificatesAsPDF(
  users: User[],
  event: Event,
  certificateType: 'participation' | 'presentation' | 'reviewer',
  abstracts?: Abstract[],
  config?: Partial<CertificateConfig>
): void {
  const mergedDoc = new jsPDF({
    orientation: config?.orientation || 'landscape',
    unit: 'mm',
    format: config?.format || 'a4',
  });

  users.forEach((user, index) => {
    if (index > 0) {
      mergedDoc.addPage();
    }

    const data: CertificateData = {
      participantName: user.name,
      eventName: event.name,
      eventDate: `${formatDate(event.startDate)} al ${formatDate(event.endDate)}`,
      certificateType,
      primaryColor: event.primaryColor,
      secondaryColor: event.secondaryColor,
      config,
    };

    if (certificateType === 'presentation' && abstracts) {
      const userAbstract = abstracts.find(a => a.userId === user.id && a.status === 'APROBADO');
      if (userAbstract) {
        data.abstractTitle = userAbstract.title;
        data.categoryType = userAbstract.categoryType;
      }
    }

    // Generate certificate content directly in the merged doc
    addCertificatePage(mergedDoc, data, config);
  });

  const fileName = `Certificados_${event.name.replace(/\s+/g, '_')}_${certificateType}.pdf`;
  mergedDoc.save(fileName);
}

function addCertificatePage(doc: jsPDF, data: CertificateData, config?: Partial<CertificateConfig>): void {
  const finalConfig = { ...defaultCertificateConfig, ...config };
  const primaryRgb = hexToRgb(data.primaryColor || finalConfig.primaryColor);
  const secondaryRgb = hexToRgb(data.secondaryColor || finalConfig.secondaryColor);
  const textRgb = hexToRgb(finalConfig.textColor);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

  doc.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
  doc.rect(0, 35, pageWidth, 5, 'F');
  doc.rect(0, pageHeight - 25, pageWidth, 5, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(finalConfig.title, pageWidth / 2, 25, { align: 'center' });

  const typeLabel = {
    'participation': 'DE PARTICIPACIÓN',
    'presentation': 'DE PRESENTACIÓN',
    'reviewer': 'DE REVISOR CIENTÍFICO',
    'custom': finalConfig.subtitle || 'ESPECIAL',
  }[data.certificateType];

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(typeLabel, pageWidth / 2, 32, { align: 'center' });

  // Content
  doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
  doc.setFontSize(14);
  doc.text(finalConfig.headerText, pageWidth / 2, 60, { align: 'center' });

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(data.participantName, pageWidth / 2, 75, { align: 'center' });

  doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');

  let yPos = 90;

  if (data.certificateType === 'presentation' && data.abstractTitle) {
    doc.text('ha presentado el trabajo titulado', pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bolditalic');
    doc.setTextColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    const splitTitle = doc.splitTextToSize(data.abstractTitle, pageWidth - 60);
    doc.text(splitTitle, pageWidth / 2, yPos, { align: 'center' });
    yPos += splitTitle.length * 7 + 3;
    
    if (data.categoryType) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      doc.text(`Modalidad: ${data.categoryType}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
    }
    doc.setFontSize(14);
    doc.text('en el evento', pageWidth / 2, yPos, { align: 'center' });
  } else if (data.certificateType === 'reviewer') {
    doc.text('ha participado como Revisor Científico en el evento', pageWidth / 2, yPos, { align: 'center' });
  } else {
    doc.text(finalConfig.bodyTemplate, pageWidth / 2, yPos, { align: 'center' });
  }

  yPos += 15;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  const splitEventName = doc.splitTextToSize(data.eventName, pageWidth - 40);
  doc.text(splitEventName, pageWidth / 2, yPos, { align: 'center' });

  yPos += splitEventName.length * 8 + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Celebrado del ${data.eventDate}`, pageWidth / 2, yPos, { align: 'center' });

  // Footer
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(finalConfig.footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

  const certificateId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  doc.setFontSize(8);
  doc.text(`ID: ${certificateId}`, pageWidth - 10, pageHeight - 5, { align: 'right' });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
