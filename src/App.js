import React, { useState, useEffect } from "react";

export default function App() {
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
    "🔥 Disciplina > motivación, sigue así",
    "💜 Estoy seguro que lograrás todo",
    "🌟 Un logro más desbloqueado",
  ];

  // 💾 CARGAR DATOS
  useEffect(() => {
    const savedSubjects = JSON.parse(localStorage.getItem("subjects"));
    const savedActivities = JSON.parse(localStorage.getItem("activities"));
    if (savedSubjects) setSubjects(savedSubjects);
    if (savedActivities) setActivities(savedActivities);
  }, []);

  // 💾 GUARDAR DATOS
  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem("activities", JSON.stringify(activities));
  }, [activities]);

  const addSubject = () => {
    if (!newSubject.name) return;
    setSubjects([...subjects, newSubject]);
    setNewSubject({ name: "", teacher: "" });
    setView("home");
  };

  const deleteSubject = (index) => {
    const subjectName = subjects[index].name;
    const updated = subjects.filter((_, i) => i !== index);
    setSubjects(updated);
    setActivities(activities.filter((a) => a.subject !== subjectName));
  };

  const addActivity = () => {
    if (!newActivity.subject) return;
    setActivities([...activities, newActivity]);
    setNewActivity({
      type: "Tarea",
      subject: "",
      date: "",
      description: "",
      done: false,
    });
    setView("home");
  };

  const toggleDone = (activity) => {
    const updated = activities.map((a) => {
      if (a === activity) {
        const updatedActivity = { ...a, done: !a.done };
        if (!a.done) {
          setTimeout(() => {
            alert(messages[Math.floor(Math.random() * messages.length)]);
          }, 100);
        }
        return updatedActivity;
      }
      return a;
    });
    setActivities(updated);
  };

  const filteredActivities = currentSubject
    ? activities.filter((a) => a.subject === currentSubject.name)
    : [];

  const cardStyle = {
    background: "white",
    padding: "12px",
    borderRadius: "16px",
    marginBottom: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
  };

  return (
    <div
      style={{
        background: "#f5f0ff",
        minHeight: "100vh",
        padding: "16px",
        maxWidth: "420px",
        margin: "auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "22px",
          fontWeight: "bold",
          marginBottom: "16px",
          color: "#6b4cd6",
        }}
      >
        💜 Organizador de Tareas
      </h1>

      {view === "home" && (
        <div>
          {subjects.map((s, i) => (
            <div key={i} style={cardStyle}>
              <div
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setCurrentSubject(s);
                  setView("subject");
                }}
              >
                📁 <strong>{s.name}</strong>
                <div style={{ fontSize: "12px", color: "gray" }}>
                  {s.teacher}
                </div>
              </div>
              <button
                onClick={() => deleteSubject(i)}
                style={{ fontSize: "12px", color: "red", marginTop: "6px" }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      {view === "subject" && currentSubject && (
        <div>
          <button
            onClick={() => setView("home")}
            style={{ marginBottom: "8px", color: "#6b4cd6" }}
          >
            ⬅ Volver
          </button>
          <h2 style={{ color: "#6b4cd6" }}>{currentSubject.name}</h2>
          {filteredActivities.map((a, i) => (
            <div
              key={i}
              style={{
                ...cardStyle,
                transform: a.done ? "scale(0.98)" : "scale(1)",
                opacity: a.done ? 0.7 : 1,
              }}
            >
              <div
                onClick={() => toggleDone(a)}
                style={{ cursor: "pointer", fontWeight: "bold" }}
              >
                {a.done ? "✅" : "⭕"} {a.type}
              </div>
              <div style={{ fontSize: "12px" }}>📅 {a.date}</div>
              <div style={{ fontSize: "12px", color: "gray" }}>
                {a.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "addSubject" && (
        <div>
          <h2 style={{ color: "#6b4cd6" }}>Agregar materia</h2>
          <input
            placeholder="Nombre"
            value={newSubject.name}
            onChange={(e) =>
              setNewSubject({ ...newSubject, name: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
          />
          <input
            placeholder="Profesor"
            value={newSubject.teacher}
            onChange={(e) =>
              setNewSubject({ ...newSubject, teacher: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
          />
          <button
            onClick={addSubject}
            style={{
              background: "#a78bfa",
              color: "white",
              padding: "10px",
              width: "100%",
              borderRadius: "10px",
              transition: "0.3s",
            }}
          >
            Guardar
          </button>
        </div>
      )}

      {view === "addActivity" && (
        <div>
          <h2 style={{ color: "#6b4cd6" }}>Agregar actividad</h2>

          <select
            value={newActivity.type}
            onChange={(e) =>
              setNewActivity({ ...newActivity, type: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "10px",
            }}
          >
            <option>Tarea</option>
            <option>Tarea exprés</option>
            <option>Proyecto</option>
            <option>Examen</option>
          </select>

          <select
            value={newActivity.subject}
            onChange={(e) =>
              setNewActivity({ ...newActivity, subject: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "10px",
            }}
          >
            <option value="">Seleccionar materia</option>
            {subjects.map((s, i) => (
              <option key={i}>{s.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={newActivity.date}
            onChange={(e) =>
              setNewActivity({ ...newActivity, date: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "10px",
            }}
          />

          <textarea
            placeholder="Descripción"
            value={newActivity.description}
            onChange={(e) =>
              setNewActivity({ ...newActivity, description: e.target.value })
            }
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "10px",
            }}
          />

          <button
            onClick={addActivity}
            style={{
              background: "#8b5cf6",
              color: "white",
              padding: "10px",
              width: "100%",
              borderRadius: "10px",
            }}
          >
            Guardar
          </button>
        </div>
      )}

      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#8b5cf6",
          color: "white",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontSize: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          transition: "0.3s",
        }}
      >
        +
      </button>

      {showMenu && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            background: "white",
            padding: "10px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div
            onClick={() => {
              setView("addSubject");
              setShowMenu(false);
            }}
            style={{ cursor: "pointer" }}
          >
            📚 Agregar materia
          </div>
          <div
            onClick={() => {
              setView("addActivity");
              setShowMenu(false);
            }}
            style={{ cursor: "pointer", marginTop: "6px" }}
          >
            📝 Agregar actividad
          </div>
        </div>
      )}
    </div>
  );
}
