import React, { useState, useEffect } from "react";

export default function App() {
  useEffect(() => {
  if ("Notification" in window) {
    Notification.requestPermission();
  }
}, []);
  const [subjects, setSubjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [view, setView] = useState("home");
  const [currentSubject, setCurrentSubject] = useState(null);

  const [newSubject, setNewSubject] = useState({ name: "", teacher: "" });
  const [newActivity, setNewActivity] = useState({
    type: "Tarea",
    subject: "",
    date: "",
    description: "",
    done: false,
  });

  const messages = [
    "✨ ¡Muy bien! Sigue así 💜",
    "🌸 Eres increíble, no te detengas 💪",
    "💖 Un paso más cerca de tu meta",
    "🌷 Excelente trabajo, estoy orgulloso de ti",
    "💫 Cada tarea cuenta, sigue brillando",
    "🦋 Vas avanzando increíble",
    "🌼 Lo estás haciendo mejor de lo que crees",
    "🔥 Disciplina > motivación",
    "💜 Tú puedes con todo",
    "🌟 Un logro más desbloqueado"
  ];

  // Cargar
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("subjects"));
    const a = JSON.parse(localStorage.getItem("activities"));
    if (s) setSubjects(s);
    if (a) setActivities(a);
  }, []);

  // Guardar
  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  // Cuando cambian materias, asegura selección válida
  useEffect(() => {
    if (subjects.length > 0 && !newActivity.subject) {
      setNewActivity((prev) => ({ ...prev, subject: subjects[0].name }));
    }
  }, [subjects]);

  const addSubject = () => {
    if (!newSubject.name) return;
    setSubjects([...subjects, newSubject]);
    setNewSubject({ name: "", teacher: "" });
    setView("home");
  };

  const deleteSubject = (index) => {
    const name = subjects[index].name;
    setSubjects(subjects.filter((_, i) => i !== index));
    setActivities(activities.filter(a => a.subject !== name));
  };

const addActivity = () => {
  if (subjects.length === 0) {
    alert("Primero agrega una materia 💜");
    return;
  }

  if (!newActivity.subject) {
    alert("Selecciona una materia 💜");
    return;
  }

  const updatedActivities = [...activities, newActivity];
  setActivities(updatedActivities);

  if (Notification.permission === "granted") {
    new Notification("Nueva tarea 📚", {
      body: newActivity.description || newActivity.type,
    });
  }

  // Limpiar formulario
  setNewActivity({
    type: "Tarea",
    subject: subjects[0]?.name || "",
    date: "",
    description: "",
    done: false,
  });

  // Ir a inicio
  setView("home");

  // 🔥 FORZAR CAMBIO EN APK
  setTimeout(() => {
    window.location.reload();
  }, 100);
};
  
  const toggleDone = (activity) => {
    const updated = activities.map(a => {
      if (a === activity) {
        const next = { ...a, done: !a.done };
        if (!a.done) {
          setTimeout(() => alert(messages[Math.floor(Math.random() * messages.length)]), 120);
        }
        return next;
      }
      return a;
    });
    setActivities(updated);
  };

  const filtered = currentSubject ? activities.filter(a => a.subject === currentSubject.name) : [];

  const card = {
    background: "#ffffff",
    padding: "12px",
    borderRadius: "16px",
    marginBottom: "12px",
    boxShadow: "0 6px 16px rgba(139,92,246,0.12)",
    transition: "all .25s ease",
  };

  return (
    <div style={{ background: "#f5f0ff", minHeight: "100vh", padding: 16, maxWidth: 420, margin: "auto", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#6b4cd6", marginBottom: 16 }}>💜 Organizador de Tareas</h1>

      {view === "home" && (
        <div>
          {subjects.map((s, i) => (
            <div key={i} style={card}>
              <div style={{ cursor: "pointer" }} onClick={() => { setCurrentSubject(s); setView("subject"); }}>
                📁 <strong>{s.name}</strong>
                <div style={{ fontSize: 12, color: "gray" }}>{s.teacher}</div>
              </div>
              <button onClick={() => deleteSubject(i)} style={{ color: "red", fontSize: 12, marginTop: 6 }}>Eliminar</button>
            </div>
          ))}
        </div>
      )}

      {view === "subject" && currentSubject && (
        <div>
          <button onClick={() => setView("home")} style={{ color: "#6b4cd6" }}>⬅ Volver</button>
          <h2 style={{ color: "#6b4cd6" }}>{currentSubject.name}</h2>
          {filtered.map((a, i) => (
            <div key={i} style={{ ...card, opacity: a.done ? 0.7 : 1, transform: a.done ? "scale(.98)" : "scale(1)" }}>
              <div onClick={() => toggleDone(a)} style={{ fontWeight: "bold", cursor: "pointer" }}>
                {a.done ? "✅" : "⭕"} {a.type}
              </div>
              <div style={{ fontSize: 12 }}>📅 {a.date}</div>
              <div style={{ fontSize: 12, color: "gray" }}>{a.description}</div>
            </div>
          ))}
        </div>
      )}

      {view === "addSubject" && (
        <div>
          <h2 style={{ color: "#6b4cd6" }}>Agregar materia</h2>
          <input placeholder="Nombre" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            style={{ width: "100%", padding: 10, borderRadius: 10, marginBottom: 8, border: "1px solid #ddd" }} />
          <input placeholder="Profesor" value={newSubject.teacher} onChange={(e) => setNewSubject({ ...newSubject, teacher: e.target.value })}
            style={{ width: "100%", padding: 10, borderRadius: 10, marginBottom: 8, border: "1px solid #ddd" }} />
          <button onClick={addSubject} style={{ background: "#a78bfa", color: "white", padding: 10, width: "100%", borderRadius: 10 }}>Guardar</button>
        </div>
      )}

      {view === "addActivity" && (
        <div>
          <h2 style={{ color: "#6b4cd6" }}>Agregar actividad</h2>

          <select value={newActivity.type} onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
            style={{ width: "100%", padding: 10, borderRadius: 10, marginBottom: 8 }}>
            <option>Tarea</option>
            <option>Tarea exprés</option>
            <option>Proyecto</option>
            <option>Examen</option>
          </select>

          <select value={newActivity.subject} onChange={(e) => setNewActivity({ ...newActivity, subject: e.target.value })}
            style={{ width: "100%", padding: 10, borderRadius: 10, marginBottom: 8 }}>
            {subjects.map((s, i) => (
              <option key={i} value={s.name}>{s.name}</option>
            ))}
          </select>

          <input type="date" value={newActivity.date} onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
            style={{ width: "100%", padding: 10, borderRadius: 10, marginBottom: 8 }} />

          <textarea placeholder="Descripción" value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
            style={{ width: "100%", padding: 10, borderRadius: 10, marginBottom: 8 }} />

          <button onClick={addActivity} style={{ background: "#8b5cf6", color: "white", padding: 10, width: "100%", borderRadius: 10 }}>Guardar</button>
        </div>
      )}

      <button onClick={() => setShowMenu(!showMenu)}
        style={{ position: "fixed", bottom: 20, right: 20, background: "#8b5cf6", color: "white", borderRadius: "50%", width: 60, height: 60, fontSize: 24, boxShadow: "0 6px 16px rgba(0,0,0,.2)" }}>
        +
      </button>

      {showMenu && (
        <div style={{ position: "fixed", bottom: 90, right: 20, background: "white", padding: 10, borderRadius: 12, boxShadow: "0 6px 16px rgba(0,0,0,.15)" }}>
          <div style={{ cursor: "pointer" }} onClick={() => { setView("addSubject"); setShowMenu(false); }}>📚 Agregar materia</div>
          <div style={{ cursor: "pointer", marginTop: 6 }} onClick={() => { setView("addActivity"); setShowMenu(false); }}>📝 Agregar actividad</div>
        </div>
      )}
    </div>
  );
}
