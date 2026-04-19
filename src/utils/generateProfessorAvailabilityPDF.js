import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { successToast } from './toastServices';

/**
 * Génère un PDF professionnel des disponibilités d'un professeur
 * @param {string} professorName - Nom du professeur
 * @param {string} specialities - Spécialités (texte)
 * @param {array} availabilities - Tableau des disponibilités [{jour, heureDebut, heureFin}, ...]
 * @param {string} filename - Nom du fichier PDF
 */
export async function generateProfessorAvailabilityPDF(
  professorName,
  specialities,
  availabilities,
  filename
) {
  // Créer un conteneur HTML invisible
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm';
  container.style.backgroundColor = 'white';
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';
  document.body.appendChild(container);

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

  // Grouper par jour
  const groupedByDay = {};
  availabilities.forEach((av) => {
    const day = av.jour?.toLowerCase() || 'inconnu';
    if (!groupedByDay[day]) {
      groupedByDay[day] = [];
    }
    groupedByDay[day].push(av);
  });

  const dayOrder = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const sortedDays = dayOrder.filter((d) => groupedByDay[d]);

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1f3f8a; margin: 0; font-size: 28px;">
        Disponibilités - ${professorName}
      </h1>
      <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">
        Généré le ${new Date().toLocaleDateString('fr-CA')}
      </p>
    </div>

    <div style="background-color: #f0f3f8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0; color: #1f3f8a; font-weight: bold;">
        <strong>Spécialité(s):</strong> ${specialities || 'Non assignée'}
      </p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #1f3f8a; color: white;">
          <th style="padding: 12px; text-align: left; border: 1px solid #1f3f8a; font-weight: bold;">Jour</th>
          <th style="padding: 12px; text-align: left; border: 1px solid #1f3f8a; font-weight: bold;">Heure début</th>
          <th style="padding: 12px; text-align: left; border: 1px solid #1f3f8a; font-weight: bold;">Heure fin</th>
        </tr>
      </thead>
      <tbody>
        ${sortedDays
          .map((day, dayIndex) => {
            const availsForDay = groupedByDay[day] || [];
            return availsForDay
              .map((av, avIndex) => {
                const bgColor = dayIndex % 2 === 0 ? '#f9fafb' : 'white';
                return `
                  <tr style="background-color: ${bgColor};">
                    <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: ${avIndex === 0 ? 'bold' : 'normal'}; color: #1f3f8a;">
                      ${avIndex === 0 ? day.charAt(0).toUpperCase() + day.slice(1) : ''}
                    </td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">${formatTime(av.heureDebut)}</td>
                    <td style="padding: 10px; border: 1px solid #e0e0e0;">${formatTime(av.heureFin)}</td>
                  </tr>
                `;
              })
              .join('');
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
    // Convertir le HTML en image avec canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    // Créer le PDF
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
