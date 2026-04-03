import React, { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import { LocalNotifications } from "@capacitor/local-notifications";

// ─── Colores y estilos globales ───────────────────────────────────────────────
const COLORS = {
  primary: "#8b5cf6",
  primaryLight: "#a78bfa",
  primaryBg: "#f5f0ff",
  white: "#ffffff",
  gray: "#9ca3af",
  danger: "#f87171",
  success: "#34d399",
  text: "#374151",
  textLight: "#6b7280",
};

const globalCard = {
  background: COLORS.white,
  padding: "14px 16px",
  borderRadius: "18px",
  marginBottom: "12px",
  boxShadow: "0 4px 20px rgba(139,92,246,0.12)",
  transition: "all 0.25s ease",
};

const globalBtn = {
  background: COLORS.primary,
  color: COLORS.white,
  padding: "12px",
  width: "100%",
  borderRadius: "14px",
  border: "none",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "8px",
};

const globalInput = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1.5px solid #e5e7eb",
  marginBottom: "10px",
  fontSize: "14px",
  outline: "none",
  fontFamily: "sans-serif",
  boxSizing: "border-box",
};

// ─── Mensajes motivacionales ──────────────────────────────────────────────────
const MESSAGES = [
  "✨ ¡Muy bien! Sigue así 💜",
  "🌸 Eres increíble, no te detengas 💪",
  "💖 Un paso más cerca de tu meta",
  "🌷 Excelente trabajo, ¡estoy orgulloso de ti!",
  "💫 Cada tarea cuenta, sigue brillando",
  "🦋 Vas avanzando de manera increíble",
  "🌼 Lo estás haciendo mejor de lo que crees",
  "🔥 Disciplina > motivación. ¡Tú lo demuestras!",
  "💜 Puedes con todo lo que se propone",
  "🌟 ¡Un logro más desbloqueado!",
];

const ACTIVITY_TYPES = ["Tarea", "Tarea exprés", "Proyecto", "Examen"];

const ACTIVITY_ICONS = {
  "Tarea": "📝",
  "Tarea exprés": "⚡",
  "Proyecto": "🗂️",
  "Examen": "📋",
};

// ─── Funciones de almacenamiento nativo ──────────────────────────────────────
async function saveData(key, value) {
  await Preferences.set({ key, value: JSON.stringify(value) });
}

async function loadData(key) {
  const { value } = await Preferences.get({ key });
  return value ? JSON.parse(value) : null;
}

// ─── Notificaciones nativas ───────────────────────────────────────────────────
async function requestNotificationPermission() {
  await LocalNotifications.requestPermissions();
}

async function scheduleNotification(activity) {
  if (!activity.date) return;
  const date = new Date(activity.date);
  date.setHours(8, 0, 0, 0); // Notificación a las 8am del día de entrega

  const id = Math.floor(Math.random() * 100000);

  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title: `📅 Recordatorio: ${activity.type}`,
        body: activity.description || `Entrega hoy en ${activity.subject}`,
        schedule: { at: date },
        sound: null,
        attachments: null,
        actionTypeId: "",
        extra: null,
      },
    ],
  });
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function App() {
  const [subjects, setSubjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [view, setView] = useState("home");
  const [currentSubject, setCurrentSubject] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [motivMsg, setMotivMsg] = useState(null);

  const [newSubject, setNewSubject] = useState({ name: "", teacher: "" });
  const [newActivity, setNewActivity] = useState({
    type: "Tarea",
    subject: "",
    date: "",
    description: "",
    done: false,
  });

  // ── Cargar datos al iniciar ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      await requestNotificationPermission();
      const s = await loadData("subjects");
      const a = await loadData("activities");
      if (s) setSubjects(s);
      if (a) setActivities(a);
    })();
  }, []);

  // ── Guardar materias cuando cambian ─────────────────────────────────────
  useEffect(() => {
    if (subjects.length >= 0) saveData("subjects", subjects);
  }, [subjects]);

  // ── Guardar actividades cuando cambian ──────────────────────────────────
  useEffect(() => {
    if (activities.length >= 0) saveData("activities", activities);
  }, [activities]);

  // ── Materia por defecto al abrir actividad ───────────────────────────────
  useEffect(() => {
    if (subjects.length > 0 && !newActivity.subject) {
      setNewActivity((p) => ({ ...p, subject: subjects[0].name }));
    }
  }, [subjects]);

  // ─── Acciones ───────────────────────────────────────────────────────────────
  const addSubject = () => {
    if (!newSubject.name.trim()) return;
    setSubjects([...subjects, newSubject]);
    setNewSubject({ name: "", teacher: "" });
    setView("home");
  };

  const deleteSubject = (idx) => {
    const name = subjects[idx].name;
    setSubjects(subjects.filter((_, i) => i !== idx));
    setActivities(activities.filter((a) => a.subject !== name));
    setView("home");
  };

  const addActivity = async () => {
    if (subjects.length === 0) {
      alert("Primero agrega una materia 💜");
      return;
    }
    const act = { ...newActivity, id: Date.now() };
    const updated = [...activities, act];
    setActivities(updated);
    await scheduleNotification(act);

    setNewActivity({
      type: "Tarea",
      subject: subjects[0]?.name || "",
      date: "",
      description: "",
      done: false,
    });
    setView(currentSubject ? "subject" : "home");
  };

  const toggleDone = (id) => {
    const updated = activities.map((a) => {
      if (a.id === id) {
        if (!a.done) {
          const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
          setMotivMsg(msg);
          setTimeout(() => setMotivMsg(null), 3000);
        }
        return { ...a, done: !a.done };
      }
      return a;
    });
    setActivities(updated);
  };

  const filtered = currentSubject
    ? activities.filter((a) => a.subject === currentSubject.name)
    : [];

  const pendientes = filtered.filter((a) => !a.done);
  const completadas = filtered.filter((a) => a.done);

  // ─── RENDERIZADO ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: COLORS.primaryBg,
        minHeight: "100vh",
        padding: "16px",
        maxWidth: "430px",
        margin: "0 auto",
        fontFamily: "'Segoe UI', sans-serif",
        paddingBottom: "90px",
      }}
    >
      {/* Mensaje motivacional flotante */}
      {motivMsg && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: COLORS.primary,
            color: "white",
            padding: "12px 24px",
            borderRadius: "20px",
            fontWeight: "bold",
            fontSize: "14px",
            zIndex: 9999,
            boxShadow: "0 8px 24px rgba(139,92,246,0.4)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {motivMsg}
        </div>
      )}

      {/* ── VISTA: HOME ─────────────────────────────────────────────────── */}
      {view === "home" && (
        <>
          <h1
            style={{
              color: COLORS.primary,
              marginBottom: "4px",
              fontSize: "22px",
            }}
          >
            💜 Mis Materias
          </h1>
          <p style={{ color: COLORS.textLight, fontSize: "13px", marginBottom: "16px" }}>
            Toca una materia para ver tus tareas
          </p>

          {subjects.length === 0 && (
            <div
              style={{
                ...globalCard,
                textAlign: "center",
                padding: "30px",
                color: COLORS.textLight,
              }}
            >
              <div style={{ fontSize: "40px" }}>📚</div>
              <p>Aún no tienes materias.</p>
              <p style={{ fontSize: "13px" }}>
                Toca el botón <strong>+</strong> para agregar una.
              </p>
            </div>
          )}

          {subjects.map((s, i) => {
            const total = activities.filter((a) => a.subject === s.name).length;
            const done = activities.filter(
              (a) => a.subject === s.name && a.done
            ).length;
            return (
              <div
                key={i}
                style={{ ...globalCard, cursor: "pointer" }}
                onClick={() => {
                  setCurrentSubject(s);
                  setView("subject");
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "16px" }}>
                      📁 {s.name}
                    </div>
                    <div style={{ fontSize: "12px", color: COLORS.textLight }}>
                      👩‍🏫 {s.teacher || "Sin profesor"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        background: COLORS.primaryBg,
                        color: COLORS.primary,
                        borderRadius: "10px",
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {done}/{total} ✅
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSubject(i);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: COLORS.danger,
                    fontSize: "12px",
                    marginTop: "8px",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Eliminar materia
                </button>
              </div>
            );
          })}
        </>
      )}

      {/* ── VISTA: MATERIA ──────────────────────────────────────────────── */}
      {view === "subject" && currentSubject && (
        <>
          <button
            onClick={() => setView("home")}
            style={{
              background: "none",
              border: "none",
              color: COLORS.primary,
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
              marginBottom: "8px",
            }}
          >
            ⬅ Volver
          </button>
          <h2 style={{ color: COLORS.primary, marginBottom: "4px" }}>
            {currentSubject.name}
          </h2>
          <p style={{ color: COLORS.textLight, fontSize: "12px", marginBottom: "16px" }}>
            👩‍🏫 {currentSubject.teacher}
          </p>

          {filtered.length === 0 && (
            <div
              style={{
                ...globalCard,
                textAlign: "center",
                padding: "30px",
                color: COLORS.textLight,
              }}
            >
              <div style={{ fontSize: "40px" }}>✨</div>
              <p>No hay actividades aún.</p>
            </div>
          )}

          {pendientes.length > 0 && (
            <>
              <p
                style={{
                  fontWeight: "600",
                  color: COLORS.textLight,
                  fontSize: "12px",
                  marginBottom: "8px",
                }}
              >
                PENDIENTES ({pendientes.length})
              </p>
              {pendientes.map((a) => (
                <ActivityCard key={a.id} a={a} toggleDone={toggleDone} />
              ))}
            </>
          )}

          {completadas.length > 0 && (
            <>
              <p
                style={{
                  fontWeight: "600",
                  color: COLORS.gray,
                  fontSize: "12px",
                  margin: "16px 0 8px",
                }}
              >
                COMPLETADAS ({completadas.length})
              </p>
              {completadas.map((a) => (
                <ActivityCard key={a.id} a={a} toggleDone={toggleDone} />
              ))}
            </>
          )}
        </>
      )}

      {/* ── VISTA: AGREGAR MATERIA ───────────────────────────────────────── */}
      {view === "addSubject" && (
        <>
          <button
            onClick={() => setView("home")}
            style={{
              background: "none",
              border: "none",
              color: COLORS.primary,
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            ⬅ Volver
          </button>
          <h2 style={{ color: COLORS.primary, marginBottom: "16px" }}>
            📚 Nueva Materia
          </h2>
          <input
            placeholder="Nombre de la materia"
            value={newSubject.name}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            style={globalInput}
          />
          <input
            placeholder="Nombre del profesor (opcional)"
            value={newSubject.teacher}
            onChange={(e) =>
              setNewSubject({ ...newSubject, teacher: e.target.value })
            }
            style={globalInput}
          />
          <button onClick={addSubject} style={globalBtn}>
            💾 Guardar materia
          </button>
        </>
      )}

      {/* ── VISTA: AGREGAR ACTIVIDAD ─────────────────────────────────────── */}
      {view === "addActivity" && (
        <>
          <button
            onClick={() => setView(currentSubject ? "subject" : "home")}
            style={{
              background: "none",
              border: "none",
              color: COLORS.primary,
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            ⬅ Volver
          </button>
          <h2 style={{ color: COLORS.primary, marginBottom: "16px" }}>
            📝 Nueva Actividad
          </h2>

          <label style={{ fontSize: "13px", color: COLORS.textLight }}>Tipo</label>
          <select
            value={newActivity.type}
            onChange={(e) =>
              setNewActivity({ ...newActivity, type: e.target.value })
            }
            style={{ ...globalInput, background: "white" }}
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <label style={{ fontSize: "13px", color: COLORS.textLight }}>
            Materia
          </label>
          <select
            value={newActivity.subject}
            onChange={(e) =>
              setNewActivity({ ...newActivity, subject: e.target.value })
            }
            style={{ ...globalInput, background: "white" }}
          >
            {subjects.map((s, i) => (
              <option key={i} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <label style={{ fontSize: "13px", color: COLORS.textLight }}>
            Fecha de entrega
          </label>
          <input
            type="date"
            value={newActivity.date}
            onChange={(e) =>
              setNewActivity({ ...newActivity, date: e.target.value })
            }
            style={globalInput}
          />

          <label style={{ fontSize: "13px", color: COLORS.textLight }}>
            Descripción (opcional)
          </label>
          <textarea
            placeholder="¿De qué trata esta actividad?"
            value={newActivity.description}
            onChange={(e) =>
              setNewActivity({ ...newActivity, description: e.target.value })
            }
            rows={3}
            style={{ ...globalInput, resize: "none" }}
          />

          <button onClick={addActivity} style={globalBtn}>
            💾 Guardar actividad
          </button>
        </>
      )}

      {/* ── BOTÓN FLOTANTE + ─────────────────────────────────────────────── */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
          color: "white",
          borderRadius: "50%",
          width: "62px",
          height: "62px",
          fontSize: "28px",
          border: "none",
          boxShadow: "0 6px 20px rgba(139,92,246,0.5)",
          cursor: "pointer",
          transition: "transform 0.2s ease",
          transform: showMenu ? "rotate(45deg)" : "rotate(0deg)",
          zIndex: 1000,
        }}
      >
        +
      </button>

      {showMenu && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "24px",
            background: "white",
            padding: "12px",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            zIndex: 999,
          }}
        >
          <MenuItem
            icon="📚"
            label="Agregar materia"
            onClick={() => {
              setView("addSubject");
              setShowMenu(false);
            }}
          />
          <MenuItem
            icon="📝"
            label="Agregar actividad"
            onClick={() => {
              setView("addActivity");
              setShowMenu(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function ActivityCard({ a, toggleDone }) {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "14px 16px",
        borderRadius: "18px",
        marginBottom: "10px",
        boxShadow: "0 4px 20px rgba(139,92,246,0.10)",
        opacity: a.done ? 0.6 : 1,
        transition: "all 0.25s ease",
        borderLeft: `4px solid ${a.done ? "#d1d5db" : "#8b5cf6"}`,
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "700", fontSize: "15px" }}>
            {ACTIVITY_ICONS[a.type] || "📌"} {a.type}
          </div>
          {a.date && (
            <div style={{ fontSize: "12px", color: "#8b5cf6", marginTop: "2px" }}>
              📅 {a.date}
            </div>
          )}
          {a.description && (
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
              {a.description}
            </div>
          )}
        </div>
        <button
          onClick={() => toggleDone(a.id)}
          style={{
            background: a.done ? "#d1d5db" : "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            fontSize: "16px",
            cursor: "pointer",
            marginLeft: "12px",
            flexShrink: 0,
          }}
        >
          {a.done ? "↩" : "✓"}
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 14px",
        cursor: "pointer",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: "600",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f0ff")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ fontSize: "20px" }}>{icon}</span>
      {label}
    </div>
  );
}
