import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFGenerationOptions {
  filename: string;
  invoiceNumber: string;
  scale?: number;
  quality?: number;
}

export async function generatePDFFromHTML(
  elementId: string,
  options: PDFGenerationOptions
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Add loading state
    const originalDisplay = element.style.display;
    element.style.display = 'block';

    // Generate canvas from HTML with higher scale for quality
    const canvas = await html2canvas(element, {
      scale: options.scale || 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#0F172A',
      windowHeight: element.scrollHeight,
      windowWidth: element.scrollWidth,
    });

    // Calculate dimensions for A4 page
    const A4_WIDTH = 210; // mm
    const A4_HEIGHT = 297; // mm
    const DPI = 96;
    const MM_TO_PX = DPI / 25.4;

    // Get canvas dimensions
    const imgWidth = canvas.width / MM_TO_PX;
    const imgHeight = canvas.height / MM_TO_PX;

    // Create PDF with calculated dimensions
    let pdf: jsPDF;
    
    if (imgHeight > A4_HEIGHT) {
      // For multi-page invoices, use auto height
      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [A4_WIDTH, imgHeight],
      });
    } else {
      // For single page, use standard A4
      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
    }

    const imgData = canvas.toDataURL('image/png', options.quality || 0.95);
    const pdfWidth = A4_WIDTH - 20; // Leave margins
    const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

    // Add image centered with margins
    const xMargin = 10;
    const yMargin = 10;
    pdf.addImage(imgData, 'PNG', xMargin, yMargin, pdfWidth, pdfHeight);

    // Save the PDF
    pdf.save(`${options.filename}-${options.invoiceNumber}.pdf`);

    // Restore display state
    element.style.display = originalDisplay;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export async function downloadPDFFromHTML(
  elementId: string,
  options: PDFGenerationOptions
): Promise<void> {
  try {
    await generatePDFFromHTML(elementId, options);
  } catch (error) {
    console.error('Failed to download PDF:', error);
    throw new Error('Failed to download invoice PDF');
  }
}

export function printHTML(elementId: string): void {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Create print window
    const printWindow = window.open('', '', 'height=auto,width=auto');
    if (!printWindow) {
      throw new Error('Unable to open print window');
    }

    // Write document
    printWindow.document.write('<!DOCTYPE html>');
    printWindow.document.write('<html>');
    printWindow.document.write('<head>');
    printWindow.document.write('<title>Invoice</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('@page { margin: 0; }');
    printWindow.document.write('body { margin: 0; padding: 0; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head>');
    printWindow.document.write('<body>');
    printWindow.document.write(element.outerHTML);
    printWindow.document.write('</body>');
    printWindow.document.write('</html>');
    printWindow.document.close();

    // Trigger print
    printWindow.focus();
    printWindow.print();
  } catch (error) {
    console.error('Error printing invoice:', error);
    throw error;
  }
}
