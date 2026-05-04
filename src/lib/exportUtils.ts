import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export const generatePDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const toastId = toast.loading('Génération du PDF en cours...');

  try {
    // Save original styles
    const originalStyle = element.style.cssText;
    
    // Temporarily ensure element is visible and properly sized
    element.style.display = 'block';
    element.style.position = 'absolute';
    element.style.top = '-9999px';
    element.style.left = '-9999px';
    element.style.transform = 'none';
    element.classList.remove('dark');

    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, 
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Restore original styles
    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);

    toast.success('PDF téléchargé avec succès !', { id: toastId });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    toast.error('Erreur lors de la génération du PDF', { id: toastId });
  }
};

export const printDocument = () => {
  window.print();
};

export const exportDataToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;
  
  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Create CSV string
  const csvRows = [];
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
