import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { successToast } from './toastServices';

/**
 * Génère un PDF professionnel du planning académique
 * @param {array} planningData - Tableau des séances du planning
 * @param {string} filename - Nom du fichier PDF
 */
export async function generateAcademicPlanningPDF(planningData, filename) {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '297mm'; // A4 landscape
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

  // Grouper par jour et heure
  const groupedByDateAndTime = {};
  planningData.forEach((item) => {
    const date = formatDate(item.date);
    const timeRange = `${formatTime(item.heureDebut)} - ${formatTime(item.heureFin)}`;
    const key = `${date} | ${timeRange}`;
    if (!groupedByDateAndTime[key]) {
      groupedByDateAndTime[key] = [];
    }
    groupedByDateAndTime[key].push(item);
  });

  const sortedKeys = Object.keys(groupedByDateAndTime).sort();

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #1f3f8a; margin: 0; font-size: 24px;">
        Planning Académique
      </h1>
      <p style="color: #666; margin: 5px 0; font-size: 12px;">
        ${planningData.length} séance(s) - Généré le ${new Date().toLocaleDateString('fr-CA')}
      </p>
    </div>

    ${sortedKeys
      .map((key) => {
        const items = groupedByDateAndTime[key];
        return `
          <div style="margin-bottom: 25px; page-break-inside: avoid;">
            <div style="background-color: #4e73df; color: white; padding: 10px; border-radius: 4px 4px 0 0; font-weight: bold; font-size: 12px;">
              ${key}
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <thead>
                <tr style="background-color: #f0f3f8;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #e0e0e0; font-size: 11px; font-weight: bold;">Cours</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #e0e0e0; font-size: 11px; font-weight: bold;">Professeur</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #e0e0e0; font-size: 11px; font-weight: bold;">Salle</th>
                  <th style="padding: 8px; text-align: left; border: 1px solid #e0e0e0; font-size: 11px; font-weight: bold;">Étape</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map((item, idx) => {
                    const bgColor = idx % 2 === 0 ? 'white' : '#f9fafb';
                    return `
                      <tr style="background-color: ${bgColor};">
                        <td style="padding: 8px; border: 1px solid #e0e0e0; font-size: 11px; font-weight: bold;">
                          ${item.cours || 'N/A'}
                          <div style="font-size: 10px; color: #666;">${item.codeCours || ''}</div>
                        </td>
                        <td style="padding: 8px; border: 1px solid #e0e0e0; font-size: 11px;">
                          ${item.professeur || 'Non assigné'}
                        </td>
                        <td style="padding: 8px; border: 1px solid #e0e0e0; font-size: 11px;">
                          <span style="background-color: #e3f2fd; padding: 3px 6px; border-radius: 3px;">${item.salle || 'N/A'}</span>
                        </td>
                        <td style="padding: 8px; border: 1px solid #e0e0e0; font-size: 11px;">
                          ${item.etape || 'N/A'}
                        </td>
                      </tr>
                    `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>
        `;
      })
      .join('')}

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 10px;">
      <p style="margin: 0;">Système de Gestion des Horaires</p>
      <p style="margin: 3px 0 0 0;">Document généré automatiquement - ${new Date().toLocaleString('fr-CA')}</p>
    </div>
  `;

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'A4',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 10;
    pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);

    // Ajouter des pages supplémentaires si nécessaire
    if (imgHeight > pdfHeight - 20) {
      let remainingHeight = imgHeight;
      let pageIndex = 0;

      while (remainingHeight > 0) {
        if (pageIndex > 0) {
          pdf.addPage();
        }
        pageIndex++;
        remainingHeight -= pdfHeight - 20;
      }
    }

    pdf.save(filename);
    successToast('PDF généré avec succès');
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
}
