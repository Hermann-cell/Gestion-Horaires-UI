import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generateTeacherPlanningPDF(
  enseignantName,
  specialites,
  seances,
  filename = "planning.pdf"
) {
  try {
    // Créer un conteneur temporaire pour la conversion
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "1000px";
    container.style.backgroundColor = "white";
    container.style.padding = "40px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#1e3a5f";

    // En-tête
    const header = document.createElement("div");
    header.style.borderBottom = "3px solid #1f3f8a";
    header.style.paddingBottom = "20px";
    header.style.marginBottom = "30px";

    const title = document.createElement("h1");
    title.textContent = "PLANNING ENSEIGNANT";
    title.style.margin = "0 0 10px 0";
    title.style.fontSize = "28px";
    title.style.fontWeight = "bold";
    title.style.color = "#1f3f8a";

    const teacherName = document.createElement("h2");
    teacherName.textContent = enseignantName;
    teacherName.style.margin = "5px 0";
    teacherName.style.fontSize = "20px";
    teacherName.style.color = "#4e73df";
    teacherName.style.fontWeight = "600";

    const teacherInfo = document.createElement("p");
    teacherInfo.style.margin = "10px 0 0 0";
    teacherInfo.style.fontSize = "14px";
    teacherInfo.style.color = "#666";
    teacherInfo.innerHTML = `<strong>Spécialité(s):</strong> ${
      specialites || "Non assignée"
    }<br/><strong>Généré le:</strong> ${new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;

    header.appendChild(title);
    header.appendChild(teacherName);
    header.appendChild(teacherInfo);
    container.appendChild(header);

    // Tableau des séances
    const tableContainer = document.createElement("div");
    tableContainer.style.marginTop = "20px";

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginBottom = "20px";
    table.style.fontSize = "13px";

    // En-tête du tableau
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.style.backgroundColor = "#f0f3f8";
    headerRow.style.borderBottom = "2px solid #1f3f8a";

    const headers = ["Date", "Jour", "Heure Début", "Heure Fin", "Cours", "Code", "Salle"];
    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      th.style.padding = "12px";
      th.style.textAlign = "left";
      th.style.fontWeight = "bold";
      th.style.color = "#1f3f8a";
      th.style.borderRight = "1px solid #e0e0e0";
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Corps du tableau
    const tbody = document.createElement("tbody");
    let rowIndex = 0;

    if (seances && seances.length > 0) {
      seances.forEach((seance) => {
        const row = document.createElement("tr");
        row.style.backgroundColor = rowIndex % 2 === 0 ? "white" : "#f9fafb";
        row.style.borderBottom = "1px solid #e0e0e0";

        const date = formatDate(seance.date);
        const day = getDayName(seance.date);
        const timeStart = formatTime(seance.heureDebut);
        const timeEnd = formatTime(seance.heureFin);
        const coursNom = seance.cours || "N/A";
        const coursCode = seance.codeCours || "-";
        const salle = seance.salle || "N/A";

        const cellData = [date, day, timeStart, timeEnd, coursNom, coursCode, salle];
        cellData.forEach((data, idx) => {
          const td = document.createElement("td");
          td.textContent = data;
          td.style.padding = "10px 12px";
          td.style.borderRight = idx < cellData.length - 1 ? "1px solid #e0e0e0" : "none";
          td.style.color = "#333";
          row.appendChild(td);
        });

        tbody.appendChild(row);
        rowIndex++;
      });
    } else {
      const row = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = headers.length;
      td.textContent = "Aucune séance trouvée";
      td.style.padding = "15px";
      td.style.textAlign = "center";
      td.style.color = "#999";
      row.appendChild(td);
      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);

    // Pied de page
    const footer = document.createElement("div");
    footer.style.marginTop = "40px";
    footer.style.borderTop = "1px solid #e0e0e0";
    footer.style.paddingTop = "15px";
    footer.style.fontSize = "12px";
    footer.style.color = "#999";
    footer.style.textAlign = "center";
    footer.innerHTML = `
      <p style="margin: 5px 0;">Gestion d'horaire - Système de Planification</p>
      <p style="margin: 0; font-size: 11px;">Ce document a été généré automatiquement et ne requiert pas de signature.</p>
    `;
    container.appendChild(footer);

    // Ajouter le conteneur au DOM temporairement
    document.body.appendChild(container);

    // Convertir en canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    // Créer le PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210; // Largeur A4 en mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Télécharger le PDF
    pdf.save(filename);

    // Nettoyer
    document.body.removeChild(container);

    return true;
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw error;
  }
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("fr-CA", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getDayName(value) {
  if (!value) return "-";
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  return days[new Date(value).getDay()];
}

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("fr-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
