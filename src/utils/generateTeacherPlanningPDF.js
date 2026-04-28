import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generateTeacherPlanningPDF(
  enseignantName,
  specialites,
  seances,
  filename = "planning.pdf"
) {
  try {
    // Conteneur temporaire
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "1000px";
    container.style.backgroundColor = "white";
    container.style.padding = "40px";
    container.style.fontFamily = "Arial, sans-serif";
    container.style.color = "#1e3a5f";

    // =========================
    // 🔹 HEADER
    // =========================
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

    const teacherInfo = document.createElement("p");
    teacherInfo.style.margin = "10px 0 0 0";
    teacherInfo.style.fontSize = "14px";
    teacherInfo.style.color = "#666";
    teacherInfo.innerHTML = `
      <strong>Spécialité(s):</strong> ${specialites || "Non assignée"}<br/>
      <strong>Généré le:</strong> ${getTodayFR()}
    `;

    header.appendChild(title);
    header.appendChild(teacherName);
    header.appendChild(teacherInfo);
    container.appendChild(header);

    // =========================
    // 🔹 TABLE
    // =========================
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "13px";

    const headers = [
      "Date",
      "Jour",
      "Heure Début",
      "Heure Fin",
      "Cours",
      "Code",
      "Salle",
    ];

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.style.backgroundColor = "#f0f3f8";

    headers.forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      th.style.padding = "12px";
      th.style.textAlign = "left";
      th.style.color = "#1f3f8a";
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    if (seances?.length) {
      seances.forEach((s, i) => {
        const row = document.createElement("tr");
        row.style.backgroundColor = i % 2 === 0 ? "#fff" : "#f9fafb";

        const values = [
          formatDate(s.date),
          getDayName(s.date),
          formatTime(s.heureDebut),
          formatTime(s.heureFin),
          s.cours || "N/A",
          s.codeCours || "-",
          s.salle || "N/A",
        ];

        values.forEach((val) => {
          const td = document.createElement("td");
          td.textContent = val;
          td.style.padding = "10px";
          row.appendChild(td);
        });

        tbody.appendChild(row);
      });
    } else {
      const row = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = headers.length;
      td.textContent = "Aucune séance trouvée";
      td.style.textAlign = "center";
      td.style.padding = "15px";
      row.appendChild(td);
      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    container.appendChild(table);

    // =========================
    // 🔹 FOOTER
    // =========================
    const footer = document.createElement("div");
    footer.style.marginTop = "40px";
    footer.style.textAlign = "center";
    footer.style.fontSize = "12px";
    footer.style.color = "#999";
    footer.innerHTML = `
      <p>Gestion d'horaire - Système de Planification</p>
      <p>Document généré automatiquement</p>
    `;
    container.appendChild(footer);

    document.body.appendChild(container);

    // =========================
    // 🔹 PDF
    // =========================
    const canvas = await html2canvas(container, { scale: 2 });
    const pdf = new jsPDF();

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(filename);

    document.body.removeChild(container);

    return true;
  } catch (error) {
    console.error("Erreur PDF:", error);
    throw error;
  }
}

// =========================
// 🔹 UTILITAIRES
// =========================
function toDate(value) {
  return value ? new Date(value) : null;
}

function formatDate(value) {
  if (!value) return "-";
  return toDate(value).toLocaleDateString("fr-CA");
}

function getDayName(value) {
  if (!value) return "-";

  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];

  return days[toDate(value).getDay()];
}

function formatTime(value) {
  if (!value) return "-";

  // ✅ Cas 1 : "08:00:00"
  if (typeof value === "string" && value.includes(":")) {
    return value.slice(0, 5); // → "08:00"
  }

  // ✅ Cas 2 : 8 ou 9 (number)
  if (typeof value === "number") {
    return `${String(value).padStart(2, "0")}:00`;
  }

  // ✅ Cas 3 : vraie date (fallback safe)
  const date = new Date(value);

  return date.toLocaleTimeString("fr-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getTodayFR() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}