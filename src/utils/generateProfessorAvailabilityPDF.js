import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { successToast } from "./toastServices";

export async function generateProfessorAvailabilityPDF(
  professorName,
  specialities,
  availabilities,
  filename = "disponibilites.pdf"
) {
  const container = document.createElement("div");

  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.width = "210mm";
  container.style.backgroundColor = "white";
  container.style.padding = "20px";
  container.style.fontFamily = "Arial, sans-serif";

  document.body.appendChild(container);

  // =========================
  // 🔥 HEURE ULTRA SAFE (INT ONLY)
  // =========================
  const formatTime = (value) => {
    const n = Number(value);

    if (Number.isFinite(n)) {
      return `${String(n).padStart(2, "0")}:00`;
    }

    // fallback si string "HH:mm"
    if (typeof value === "string") {
      const match = value.match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        return `${String(match[1]).padStart(2, "0")}:${match[2]}`;
      }
    }

    return "--:--";
  };

  const formatDay = (day) =>
    day ? day.charAt(0).toUpperCase() + day.slice(1) : "";

  // =========================
  // GROUP BY DAY
  // =========================
  const grouped = {};

  availabilities.forEach((a) => {
    const day = a.jour?.toLowerCase() || "inconnu";
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(a);
  });

  const order = [
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
    "dimanche",
  ];

  const sortedDays = order.filter((d) => grouped[d]);

  // =========================
  // HTML
  // =========================
  container.innerHTML = `
    <div style="text-align:center;margin-bottom:25px;">
      <h1 style="color:#1f3f8a;margin:0;">
        Disponibilités - ${professorName}
      </h1>
      <p style="color:#666;margin-top:8px;">
        Généré le ${new Date().toLocaleDateString("fr-CA")}
      </p>
    </div>

    <div style="background:#f0f3f8;padding:12px;border-radius:6px;margin-bottom:20px;">
      <strong>Spécialité(s):</strong> ${specialities || "Non assignée"}
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#1f3f8a;color:white;">
          <th style="padding:10px;text-align:left;border:1px solid #1f3f8a;">Jour</th>
          <th style="padding:10px;text-align:center;border:1px solid #1f3f8a;">Début</th>
          <th style="padding:10px;text-align:center;border:1px solid #1f3f8a;">Fin</th>
        </tr>
      </thead>
      <tbody>
        ${sortedDays
          .map((day, i) =>
            grouped[day]
              .map(
                (a, idx) => `
                <tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"};">
                  <td style="padding:8px;border:1px solid #ddd;font-weight:${
                    idx === 0 ? "bold" : "normal"
                  };">
                    ${idx === 0 ? formatDay(day) : ""}
                  </td>
                  <td style="padding:8px;border:1px solid #ddd;text-align:center;">
                    ${formatTime(a.heureDebut)}
                  </td>
                  <td style="padding:8px;border:1px solid #ddd;text-align:center;">
                    ${formatTime(a.heureFin)}
                  </td>
                </tr>
              `
              )
              .join("")
          )
          .join("")}
      </tbody>
    </table>

    <div style="text-align:center;margin-top:25px;font-size:11px;color:#999;">
      Système de gestion des horaires
    </div>
  `;

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
    });

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      10,
      10,
      imgWidth,
      imgHeight
    );

    pdf.save(filename);

    successToast("PDF généré avec succès");
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
}