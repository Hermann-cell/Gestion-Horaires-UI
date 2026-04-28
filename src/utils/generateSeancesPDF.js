import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { successToast } from "./toastServices";

export async function generateSeancesPDF(seances, filename = "seances.pdf") {
  const container = document.createElement("div");

  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.width = "210mm";
  container.style.background = "white";
  container.style.padding = "20px";
  container.style.fontFamily = "Arial, sans-serif";

  document.body.appendChild(container);

  // =========================
  // 🔹 DATE (SAFE TORONTO)
  // =========================
  const formatDate = (value) => {
    if (!value) return "--";

    const date = new Date(value);

    return new Intl.DateTimeFormat("fr-CA", {
      timeZone: "America/Toronto",
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // =========================
  // 🔹 HEURE (FIX DEFINITIF COMME PLANNING ENSEIGNANT)
  // =========================
  const formatTime = (value) => {
    if (!value) return "--:--";

    /**
     * CAS 1 : ISO (backend)
     */
    if (typeof value === "string" && (value.includes("T") || value.includes("Z"))) {
      const date = new Date(value);

      return new Intl.DateTimeFormat("fr-CA", {
        timeZone: "America/Toronto",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    }

    /**
     * CAS 2 : heure simple "08:00"
     * 👉 IMPORTANT : on NE PAS utiliser new Date(value)
     */
    if (typeof value === "string" && value.includes(":")) {
      const [h, m] = value.split(":").map(Number);

      const date = new Date();
      date.setHours(h, m, 0, 0);

      return new Intl.DateTimeFormat("fr-CA", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date);
    }

    return value;
  };

  // =========================
  // 🔹 TRI
  // =========================
  const sortedSeances = [...seances].sort((a, b) =>
    new Date(a.date) - new Date(b.date)
  );

  // =========================
  // 🔹 HTML PDF
  // =========================
  container.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;">
      <h2 style="color:#1f3f8a;margin:0;">Liste des Séances</h2>
      <p style="color:#666;">${sortedSeances.length} séance(s)</p>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#1f3f8a;color:white;">
          <th style="padding:10px;">Cours</th>
          <th style="padding:10px;">Professeur</th>
          <th style="padding:10px;">Salle</th>
          <th style="padding:10px;">Date</th>
          <th style="padding:10px;">Heure</th>
        </tr>
      </thead>

      <tbody>
        ${sortedSeances
          .map(
            (s, i) => `
            <tr style="background:${i % 2 ? "#f9fafb" : "white"};">
              <td style="padding:8px;border:1px solid #ddd;">${s.cours || "N/A"}</td>
              <td style="padding:8px;border:1px solid #ddd;">${s.professeur || "Non assigné"}</td>
              <td style="padding:8px;border:1px solid #ddd;">${s.salle || "N/A"}</td>
              <td style="padding:8px;border:1px solid #ddd;">${formatDate(s.date)}</td>
              <td style="padding:8px;border:1px solid #ddd;">
                ${formatTime(s.heureDebut)} - ${formatTime(s.heureFin)}
              </td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    </table>
  `;

  // =========================
  // 🔹 PDF GENERATION
  // =========================
  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: "#fff",
      useCORS: true,
    });

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, imgWidth, imgHeight);

    pdf.save(filename);

    successToast("PDF généré avec succès");
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    document.body.removeChild(container);
  }
}