import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { successToast } from './toastServices';

/**
 * Génère un PDF professionnel des séances de cours
 * @param {array} seances - Tableau des séances [{cours, salle, date, heureDebut, heureFin, professeur}, ...]
 * @param {string} filename - Nom du fichier PDF
 */
export async function generateSeancesPDF(seances, filename) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm';
  container.style.backgroundColor = 'white';
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';
  document.body.appendChild(container);

  const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleDateString('fr-CA', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    try {
      return new Date(timeStr).toLocaleTimeString('fr-CA', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  // Trier les séances par date et heure
  const sortedSeances = [...seances].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    const timeA = new Date(a.heureDebut);
    const timeB = new Date(b.heureDebut);
    return timeA.getTime() - timeB.getTime();
  });

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1f3f8a; margin: 0; font-size: 28px;">
        Liste des Séances
      </h1>
      <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">
        ${sortedSeances.length} séance(s) - Généré le ${new Date().toLocaleDateString('fr-CA')}
      </p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #1f3f8a; color: white;">
          <th style="padding: 12px; text-align: left; border: 1px solid #1f3f8a; font-weight: bold;">Cours</th>
          <th style="padding: 12px; text-align: left; border: 1px solid #1f3f8a; font-weight: bold;">Professeur</th>
          <th style="padding: 12px; text-align: left; border: 1px solid #1f3f8a; font-weight: bold;">Salle</th>
          <th style="padding: 12px; text-align: left; border: 1px solid #1f3f8a; font-weight: bold;">Date</th>
          <th style="padding: 12px; text-align: left; border: 1px solid #1f3f8a; font-weight: bold;">Heure</th>
        </tr>
      </thead>
      <tbody>
        ${sortedSeances
          .map((seance, idx) => {
            const bgColor = idx % 2 === 0 ? '#f9fafb' : 'white';
            const coursName = seance.cours || 'N/A';
            const professorName = seance.professeur || 'Non assigné';
            const salleCode = seance.salle || 'N/A';
            return `
              <tr style="background-color: ${bgColor};">
                <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">${coursName}</td>
                <td style="padding: 10px; border: 1px solid #e0e0e0;">${professorName}</td>
                <td style="padding: 10px; border: 1px solid #e0e0e0;">
                  <span style="background-color: #e3f2fd; padding: 4px 8px; border-radius: 4px;">${salleCode}</span>
                </td>
                <td style="padding: 10px; border: 1px solid #e0e0e0;">${formatDate(seance.date)}</td>
                <td style="padding: 10px; border: 1px solid #e0e0e0;">${formatTime(seance.heureDebut)} - ${formatTime(seance.heureFin)}</td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 11px;">
      <p style="margin: 0;">Système de Gestion des Horaires</p>
      <p style="margin: 5px 0 0 0;">Document généré automatiquement - ${new Date().toLocaleString('fr-CA')}</p>
    </div>
  `;

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'A4',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(filename);

    successToast('PDF généré avec succès');
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
}
