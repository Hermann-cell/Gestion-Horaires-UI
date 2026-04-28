import { useEffect, useMemo, useState } from "react";
import { getSeances } from "@/api/seanceApi";
import { generateAcademicPlanningPDF } from "@/utils/generateAcademicPlanningPDF.js";
import { errorToast } from "@/utils/toastServices.js";
import { FiDownload } from "react-icons/fi";
import "@/styles/planning.css";

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAYS_FULL = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const ROOM_PALETTE = [
  "#2563eb",
  "#16a34a",
  "#7c3aed",
  "#ea580c",
  "#0891b2",
  "#dc2626",
  "#ca8a04",
  "#0f766e",
  "#9333ea",
  "#4f46e5",
  "#be123c",
  "#0369a1",
];

function normalizeText(value) {
  return String(value || "").trim();
}

function formatDateLabel(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Date invalide";

  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatHour(value) {
  if (!value) return "--:--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getMinutesFromDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return date.getHours() * 60 + date.getMinutes();
}

function startOfWeek(date) {
  const clone = new Date(date);
  const day = clone.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  clone.setDate(clone.getDate() + diff);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function endOfWeek(date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function addDays(date, days) {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstWeekStart = startOfWeek(firstDay);
  const lastWeekEnd = endOfWeek(lastDay);

  const days = [];
  let current = new Date(firstWeekStart);

  while (current <= lastWeekEnd) {
    days.push(new Date(current));
    current = addDays(current, 1);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}

function getContrastColor(hex) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? "#0f172a" : "#ffffff";
}

function hexToRgba(hex, alpha = 0.14) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildRoomColorMap(items) {
  const uniqueRooms = [
    ...new Set(
      items
        .map((item) => normalizeText(item.salleCode || item.salleNom || item.roomKey))
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));

  const map = {};
  uniqueRooms.forEach((room, index) => {
    map[room] = ROOM_PALETTE[index % ROOM_PALETTE.length];
  });

  return map;
}

function getViewRange(view, currentDate) {
  if (view === "day") {
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(currentDate);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  if (view === "week") {
    return {
      start: startOfWeek(currentDate),
      end: endOfWeek(currentDate),
    };
  }

  return {
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  };
}

function getPeriodLabel(view, currentDate) {
  if (view === "day") {
    return formatDateLabel(currentDate);
  }

  if (view === "week") {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);

    return `${start.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    })} – ${end.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;
  }

  return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

function moveDateByView(currentDate, view, direction) {
  const next = new Date(currentDate);

  if (view === "day") {
    next.setDate(next.getDate() + direction);
    return next;
  }

  if (view === "week") {
    next.setDate(next.getDate() + direction * 7);
    return next;
  }

  next.setMonth(next.getMonth() + direction);
  return next;
}

function getDayName(date) {
  const jsDay = date.getDay();
  return DAYS_FULL[jsDay === 0 ? 6 : jsDay - 1];
}

function mapSeance(raw) {
  const dateValue = raw?.date || raw?.jour || raw?.date_seance || null;
  const dateObj = new Date(dateValue);

  return {
    id: raw?.id ?? `${raw?.cours?.code || "seance"}-${dateValue || Math.random()}`,
    date: dateValue,
    dateObj,
    coursNom: raw?.cours?.nom || "Cours",
    coursCode: raw?.cours?.code || "",
    salleCode: raw?.salle?.code || "",
    salleNom: raw?.salle?.nom || "",
    professeur: raw?.professeur
      ? `${raw.professeur.prenom || ""} ${raw.professeur.nom || ""}`.trim() || "Non assigné"
      : "Non assigné",
    plageDebut: raw?.plageHoraire?.heure_debut || null,
    plageFin: raw?.plageHoraire?.heure_fin || null,
    heureDebut: formatHour(raw?.plageHoraire?.heure_debut),
    heureFin: formatHour(raw?.plageHoraire?.heure_fin),
    startMinutes: getMinutesFromDateTime(raw?.plageHoraire?.heure_debut),
    endMinutes: getMinutesFromDateTime(raw?.plageHoraire?.heure_fin),
    roomKey: raw?.salle?.code || raw?.salle?.nom || "Salle",
  };
}

function FilterSelect({ label, value, onChange, options, placeholder = "Tous" }) {
  return (
    <div className="planning-filter-field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ViewToggle({ view, onChange }) {
  const views = [
    { key: "month", label: "Mois" },
    { key: "week", label: "Semaine" },
    { key: "day", label: "Jour" },
    { key: "list", label: "Liste" },
  ];

  return (
    <div className="planning-view-toggle">
      {views.map((item) => (
        <button
          key={item.key}
          type="button"
          className={view === item.key ? "active" : ""}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function StatsPanel({ items }) {
  const roomCount = new Set(items.map((item) => item.roomKey)).size;
  const courseCount = new Set(items.map((item) => item.coursNom)).size;
  const teacherCount = new Set(items.map((item) => item.professeur)).size;

  return (
    <div className="planning-stats-grid">
      <div className="planning-stat-card">
        <span>Séances</span>
        <strong>{items.length}</strong>
      </div>
      <div className="planning-stat-card">
        <span>Salles utilisées</span>
        <strong>{roomCount}</strong>
      </div>
      <div className="planning-stat-card">
        <span>Cours visibles</span>
        <strong>{courseCount}</strong>
      </div>
      <div className="planning-stat-card">
        <span>Enseignants</span>
        <strong>{teacherCount}</strong>
      </div>
    </div>
  );
}

function Legend({ roomColorMap, visibleItems }) {
  const rooms = [...new Set(visibleItems.map((item) => item.roomKey))].sort((a, b) =>
    a.localeCompare(b)
  );

  if (!rooms.length) return null;

  return (
    <div className="planning-legend">
      {rooms.map((room) => (
        <div key={room} className="planning-legend-item">
          <span
            className="planning-legend-dot"
            style={{ backgroundColor: roomColorMap[room] }}
          />
          <span>{room}</span>
        </div>
      ))}
    </div>
  );
}

function MonthView({ currentDate, items, roomColorMap, onOpenDay }) {
  const matrix = getMonthMatrix(currentDate.getFullYear(), currentDate.getMonth());

  const itemsByDay = new Map();
  items.forEach((item) => {
    if (Number.isNaN(item.dateObj.getTime())) return;
    const key = item.dateObj.toISOString().slice(0, 10);
    const list = itemsByDay.get(key) || [];
    list.push(item);
    itemsByDay.set(key, list);
  });

  return (
    <div className="planning-month">
      <div className="planning-month-grid">
        {DAYS_SHORT.map((day) => (
          <div key={day} className="planning-month-head">
            {day}
          </div>
        ))}

        {matrix.flat().map((dayDate) => {
          const iso = dayDate.toISOString().slice(0, 10);
          const dayItems = (itemsByDay.get(iso) || []).sort(
            (a, b) => a.startMinutes - b.startMinutes
          );
          const isCurrentMonth = dayDate.getMonth() === currentDate.getMonth();
          const today = isSameDay(dayDate, new Date());

          return (
            <div
              key={iso}
              className={`planning-month-cell ${isCurrentMonth ? "" : "muted"} ${today ? "today" : ""
                }`}
            >
              <button
                type="button"
                className="planning-month-date"
                onClick={() => onOpenDay(dayDate)}
              >
                {dayDate.getDate()}
              </button>

              <div className="planning-month-events">
                {dayItems.slice(0, 4).map((item) => {
                  const color = roomColorMap[item.roomKey];
                  return (
                    <div
                      key={item.id}
                      className="planning-month-event"
                      style={{
                        backgroundColor: hexToRgba(color, 0.14),
                        borderLeftColor: color,
                      }}
                      title={`${item.heureDebut} - ${item.heureFin} | ${item.coursNom} | ${item.roomKey}`}
                    >
                      <strong>{item.heureDebut}</strong>
                      <span>{item.coursCode || item.coursNom}</span>
                    </div>
                  );
                })}

                {dayItems.length > 4 && (
                  <div className="planning-month-more">
                    +{dayItems.length - 4} autre(s)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ currentDate, items, roomColorMap, onOpenDay }) {
  const weekStart = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }).map((_, index) => addDays(weekStart, index));
  const hours = Array.from({ length: 16 }).map((_, i) => 7 + i);

  const itemsByDay = new Map();
  items.forEach((item) => {
    if (Number.isNaN(item.dateObj.getTime())) return;
    const key = item.dateObj.toISOString().slice(0, 10);
    const list = itemsByDay.get(key) || [];
    list.push(item);
    itemsByDay.set(key, list);
  });

  return (
    <div className="planning-week-wrapper">
      <div className="planning-week-shell">
        <div className="planning-week-time-column">
          <div className="planning-week-corner">Heure</div>
          {hours.map((hour) => (
            <div key={`hour-${hour}`} className="planning-week-time">
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        <div className="planning-week-days-area">
          <div className="planning-week-head-row">
            {days.map((day) => (
              <button
                key={day.toISOString()}
                type="button"
                className="planning-week-head"
                onClick={() => onOpenDay(day)}
              >
                <span>{getDayName(day)}</span>
                <strong>
                  {day.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </strong>
              </button>
            ))}
          </div>

          <div className="planning-week-columns">
            {days.map((day) => {
              const key = day.toISOString().slice(0, 10);
              const dayItems = (itemsByDay.get(key) || []).sort(
                (a, b) => a.startMinutes - b.startMinutes
              );

              return (
                <div key={key} className="planning-week-day-column">
                  {hours.map((hour) => (
                    <div key={`${key}-${hour}`} className="planning-week-slot" />
                  ))}

                  {dayItems.map((item) => {
                    const color = roomColorMap[item.roomKey];
                    const start = Math.max(item.startMinutes, 420);
                    const end =
                      item.endMinutes > item.startMinutes
                        ? item.endMinutes
                        : item.startMinutes + 60;

                    const top = ((start - 420) / 60) * 72;
                    const height = Math.max(((end - start) / 60) * 72, 56);

                    return (
                      <div
                        key={item.id}
                        className="planning-week-event"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: color,
                          color: getContrastColor(color),
                        }}
                        title={`${item.coursNom} - ${item.roomKey}`}
                      >
                        <div className="planning-week-event-time">
                          {item.heureDebut} - {item.heureFin}
                        </div>
                        <div className="planning-week-event-title">
                          {item.coursCode || item.coursNom}
                        </div>
                        <div className="planning-week-event-meta">{item.roomKey}</div>
                        <div className="planning-week-event-meta">{item.professeur}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayView({ currentDate, items, roomColorMap }) {
  const sortedItems = [...items].sort((a, b) => a.startMinutes - b.startMinutes);

  return (
    <div className="planning-day-view">
      <div className="planning-day-header">
        <h3>{formatDateLabel(currentDate)}</h3>
        <span>{sortedItems.length} séance(s)</span>
      </div>

      {sortedItems.length === 0 ? (
        <div className="planning-empty">Aucune séance pour cette journée.</div>
      ) : (
        <div className="planning-day-timeline">
          {sortedItems.map((item) => {
            const color = roomColorMap[item.roomKey];

            return (
              <div key={item.id} className="planning-day-row">
                <div className="planning-day-time">
                  <strong>{item.heureDebut}</strong>
                  <span>{item.heureFin}</span>
                </div>

                <div
                  className="planning-day-card"
                  style={{
                    borderLeftColor: color,
                    background: `linear-gradient(135deg, ${hexToRgba(
                      color,
                      0.18
                    )}, #ffffff)`,
                  }}
                >
                  <div className="planning-day-card-top">
                    <div>
                      <h4>{item.coursNom}</h4>
                      <p>{item.coursCode || "Cours"}</p>
                    </div>
                    <span
                      className="planning-room-badge"
                      style={{
                        backgroundColor: color,
                        color: getContrastColor(color),
                      }}
                    >
                      {item.roomKey}
                    </span>
                  </div>

                  <div className="planning-day-card-meta">
                    <span>Professeur : {item.professeur}</span>
                    <span>
                      Horaire : {item.heureDebut} - {item.heureFin}
                    </span>
                    <span>Salle : {item.salleNom || item.roomKey}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ListView({ items, roomColorMap }) {
  const groups = items.reduce((acc, item) => {
    if (Number.isNaN(item.dateObj.getTime())) return acc;
    const key = item.dateObj.toISOString().slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const orderedDates = Object.keys(groups).sort();

  if (!orderedDates.length) {
    return <div className="planning-empty">Aucune séance à afficher.</div>;
  }

  return (
    <div className="planning-list-view">
      {orderedDates.map((dateKey) => {
        const dayItems = groups[dateKey].sort((a, b) => a.startMinutes - b.startMinutes);
        const dateObj = new Date(dateKey);

        return (
          <section key={dateKey} className="planning-list-group">
            <div className="planning-list-group-header">
              <h3>{formatDateLabel(dateObj)}</h3>
              <span>{dayItems.length} séance(s)</span>
            </div>

            <div className="planning-list-items">
              {dayItems.map((item) => {
                const color = roomColorMap[item.roomKey];
                return (
                  <div key={item.id} className="planning-list-card">
                    <div
                      className="planning-list-color"
                      style={{ backgroundColor: color }}
                    />
                    <div className="planning-list-main">
                      <div className="planning-list-line-1">
                        <strong>{item.coursNom}</strong>
                        <span>{item.coursCode}</span>
                      </div>
                      <div className="planning-list-line-2">
                        <span>
                          {item.heureDebut} - {item.heureFin}
                        </span>
                        <span>{item.professeur}</span>
                        <span>{item.roomKey}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function Planning() {
  const [allSeances, setAllSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    salle: "",
    professeur: "",
    cours: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getSeances();
        console.log("Réponse séances :", response);

        const rows = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        const mapped = rows
          .map(mapSeance)
          .filter((item) => item.date && !Number.isNaN(item.dateObj.getTime()));

        setAllSeances(mapped);
      } catch (err) {
        console.error("Erreur planning :", err);
        setError("Erreur lors du chargement du planning.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const roomColorMap = useMemo(() => buildRoomColorMap(allSeances), [allSeances]);

  const options = useMemo(() => {
    return {
      salles: [...new Set(allSeances.map((item) => item.roomKey))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
      professeurs: [...new Set(allSeances.map((item) => item.professeur))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
      cours: [...new Set(allSeances.map((item) => item.coursNom))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    };
  }, [allSeances]);

  const filteredSeances = useMemo(() => {
    const search = filters.search.toLowerCase().trim();

    return allSeances.filter((item) => {
      const matchSearch =
        !search ||
        item.coursNom.toLowerCase().includes(search) ||
        item.coursCode.toLowerCase().includes(search) ||
        item.professeur.toLowerCase().includes(search) ||
        item.roomKey.toLowerCase().includes(search);

      const matchSalle = !filters.salle || item.roomKey === filters.salle;
      const matchProf =
        !filters.professeur || item.professeur === filters.professeur;
      const matchCours = !filters.cours || item.coursNom === filters.cours;

      return matchSearch && matchSalle && matchProf && matchCours;
    });
  }, [allSeances, filters]);

  const visibleSeances = useMemo(() => {
    const { start, end } = getViewRange(view, currentDate);

    return filteredSeances.filter(
      (item) => item.dateObj >= start && item.dateObj <= end
    );
  }, [filteredSeances, currentDate, view]);

  const resetFilters = () => {
    setFilters({
      search: "",
      salle: "",
      professeur: "",
      cours: "",
    });
  };

  const openDay = (date) => {
    setCurrentDate(new Date(date));
    setView("day");
  };

  const handleExportPlanningPDF = async () => {
    try {
      setIsExportingPDF(true);

      const planningData = filteredSeances.map((item) => ({
        cours: item.coursNom || "N/A",
        codeCours: item.coursCode || "",
        professeur: item.professeur || "Non assigné",
        salle: item.roomKey || "N/A",
        etape: item.etape || "N/A",
        date: item.dateObj,
        heureDebut: item.startDate,
        heureFin: item.endDate,
      }));

      const filename = `Planning_Academique_${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;

      await generateAcademicPlanningPDF(planningData, filename);
    } catch (err) {
      console.error("Erreur export PDF:", err);
      errorToast("Erreur lors de l'exportation du PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="planning-page">
        <div className="planning-loading">Chargement du planning...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="planning-page">
        <div className="planning-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="planning-page">
      <div className="planning-hero">
        <div>
          <h1>Planning académique</h1>
          <p className="planning-subtitle">
            Vue mensuelle, hebdomadaire, journalière et liste du planning.
          </p>
        </div>

        <div className="planning-hero-actions">
          <button
            type="button"
            className="planning-nav-btn"
            onClick={() => setCurrentDate(moveDateByView(currentDate, view, -1))}
          >
            ← Précédent
          </button>

          <div className="planning-period-chip">
            {getPeriodLabel(view, currentDate)}
          </div>

          <button
            type="button"
            className="planning-nav-btn"
            onClick={() => setCurrentDate(moveDateByView(currentDate, view, 1))}
          >
            Suivant →
          </button>
        </div>
      </div>

      <StatsPanel items={visibleSeances} />

      <div className="planning-toolbar">
        <ViewToggle view={view} onChange={setView} />

        <div className="planning-toolbar-right">
          <button
            type="button"
            className="planning-today-btn"
            onClick={() => setCurrentDate(new Date())}
          >
            Aujourd’hui
          </button>

          {/* <button
            type="button"
            className="planning-export-btn"
            onClick={handleExportPlanningPDF}
            disabled={isExportingPDF || filteredSeances.length === 0}
            style={{
              backgroundColor: isExportingPDF ? "#ccc" : "#28a745",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: isExportingPDF ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
            }}
          >
            <FiDownload size={16} />
            {isExportingPDF ? "Export..." : "Export PDF"}
          </button> */}

        </div>
      </div>

      <div className="planning-filters-card">
        <div className="planning-filters-grid">
          <div className="planning-filter-field planning-filter-search">
            <label>Recherche</label>
            <input
              type="text"
              placeholder="Cours, code, salle, professeur..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
            />
          </div>

          <FilterSelect
            label="Salle"
            value={filters.salle}
            onChange={(value) => setFilters((prev) => ({ ...prev, salle: value }))}
            options={options.salles}
          />

          <FilterSelect
            label="Professeur"
            value={filters.professeur}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, professeur: value }))
            }
            options={options.professeurs}
          />

          <FilterSelect
            label="Cours"
            value={filters.cours}
            onChange={(value) => setFilters((prev) => ({ ...prev, cours: value }))}
            options={options.cours}
          />
        </div>

        <div className="planning-filters-footer">
          <span>{visibleSeances.length} séance(s) visible(s)</span>
          <button
            type="button"
            className="planning-reset-btn"
            onClick={resetFilters}
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      <Legend roomColorMap={roomColorMap} visibleItems={visibleSeances} />

      <div className="planning-main-card">
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            items={visibleSeances}
            roomColorMap={roomColorMap}
            onOpenDay={openDay}
          />
        )}

        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            items={visibleSeances}
            roomColorMap={roomColorMap}
            onOpenDay={openDay}
          />
        )}

        {view === "day" && (
          <DayView
            currentDate={currentDate}
            items={visibleSeances}
            roomColorMap={roomColorMap}
          />
        )}

        {view === "list" && (
          <ListView items={visibleSeances} roomColorMap={roomColorMap} />
        )}
      </div>
    </div>
  );
}