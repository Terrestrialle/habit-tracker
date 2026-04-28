import { useState, useRef, useEffect } from "react";
import sanitizeInput from "../utils/sanitizeInput";
import Tooltip from "./Tooltip";

import { DndContext, closestCenter } from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

function HabitList({
  habits,
  addHabit,
  renameHabit,
  deleteHabit,
  reorderHabits,
  updateHabitColor,
  updateHabitNote,
}) {
  const [creating, setCreating] = useState(false);
  const [newHabit, setNewHabit] = useState("");
  const [newHabitNote, setNewHabitNote] = useState("");

  const [menuOpen, setMenuOpen] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteValue, setEditingNoteValue] = useState("");

  const formRef = useRef(null);

  /* ---------- CANCEL CREATE HABIT ---------- */

  useEffect(() => {
    function handleClickOutside(e) {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setCreating(false);
      }
    }
    function closeMenu(e) {
      if (!e.target.closest(".habit-actions")) {
        setMenuOpen(null);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") {
        setCreating(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    document.addEventListener("mousedown", closeMenu);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
      document.addEventListener("mousedown", closeMenu);
    };
  }, []);

  /* ---------- CREATE HABIT ---------- */

  const handleCreate = () => {
    const clean = sanitizeInput(newHabit);
    if (!clean) return;

    const cleanNote = sanitizeInput(newHabitNote);

    addHabit(clean, cleanNote);

    setNewHabit("");
    setNewHabitNote("");
    setCreating(false);
  };

  /* ---------- DRAG ---------- */

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = habits.findIndex((h) => h.id === active.id);
    const newIndex = habits.findIndex((h) => h.id === over.id);

    reorderHabits(oldIndex, newIndex);
  };

  return (
    <div className="habit-list-panel">
      {!creating && (
        <button className="new-habit-btn" onClick={() => setCreating(true)}>
          + New Habit
        </button>
      )}

      {creating && (
        <div className="new-habit-form" ref={formRef}>
          <input
            className="new-habit-input"
            autoFocus
            placeholder="Habit name..."
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
          />

          <textarea
            className="new-habit-note-input"
            placeholder="Optional note..."
            maxLength={200}
            value={newHabitNote}
            onChange={(e) => setNewHabitNote(e.target.value)}
          />

          <button onClick={handleCreate}>Add</button>
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={habits.map((h) => h.id)}
          strategy={verticalListSortingStrategy}
        >
          {habits.map((habit, index) => (
            <SortableHabit
              key={habit.id}
              habit={habit}
              index={index}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              editingId={editingId}
              editingValue={editingValue}
              setEditingId={setEditingId}
              setEditingValue={setEditingValue}
              editingNoteId={editingNoteId}
              editingNoteValue={editingNoteValue}
              setEditingNoteId={setEditingNoteId}
              setEditingNoteValue={setEditingNoteValue}
              renameHabit={renameHabit}
              deleteHabit={deleteHabit}
              updateHabitNote={updateHabitNote}
              updateHabitColor={updateHabitColor}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default HabitList;

/* ====================================================== */
/* ================= SORTABLE HABIT ===================== */
/* ====================================================== */

function SortableHabit({
  habit,
  index,
  menuOpen,
  setMenuOpen,
  editingId,
  editingValue,
  setEditingId,
  setEditingValue,
  editingNoteId,
  editingNoteValue,
  setEditingNoteId,
  setEditingNoteValue,
  renameHabit,
  deleteHabit,
  updateHabitColor,
  updateHabitNote,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  /* ---------- RENAME ---------- */

  const startRename = () => {
    setEditingId(habit.id);
    setEditingValue(habit.name);
  };

  const saveRename = () => {
    const clean = sanitizeInput(editingValue);
    if (!clean) return;

    renameHabit(habit.id, clean);
    setEditingId(null);
  };

  /* ---------- SAVE NOTE ---------- */

  const saveNote = () => {
    const clean = sanitizeInput(editingNoteValue);

    updateHabitNote(habit.id, clean);

    setEditingNoteId(null);
  };

  return (
    <div ref={setNodeRef} style={style} className="habit-list-row">
      {/* DRAG */}

      <span className="drag-handle" {...attributes} {...listeners}>
        ⋮⋮
      </span>

      {/* NUMBER */}

      <span className="habit-number">{index + 1}</span>

      {/* MAIN */}

      <div className="habit-main">
        {editingId === habit.id ? (
          <input
            className="rename-input"
            autoFocus
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveRename();
              if (e.key === "Escape") setEditingId(null);
            }}
          />
        ) : (
          <Tooltip
            content={
              <>
                <strong>{habit.name}</strong>
                {habit.note && (
                  <>
                    <br />
                    <span>{habit.note}</span>
                  </>
                )}
              </>
            }
          >
            <span className="habit-name" onDoubleClick={startRename}>
              {habit.name}
            </span>
          </Tooltip>
        )}

        {editingNoteId === habit.id ? (
          <textarea
            className="habit-note-edit"
            autoFocus
            maxLength={200}
            value={editingNoteValue}
            onChange={(e) => setEditingNoteValue(e.target.value)}
            onBlur={saveNote}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveNote();
              if (e.key === "Escape") setEditingId(null);
            }}
          />
        ) : (
          habit.note && <div className="habit-note">{habit.note}</div>
        )}
      </div>

      {/* MENU */}

      <div className="habit-actions">
        <button
          className="menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(menuOpen === habit.id ? null : habit.id);
          }}
        >
          ⋯
        </button>

        {menuOpen === habit.id && (
          <div className="habit-menu">
            <div className="habit-color-picker">
              {[
                "#22c55e",
                "#3b82f6",
                "#a855f7",
                "#f59e0b",
                "#ef4444",
                "#06b6d4",
              ].map((color) => (
                <span
                  key={color}
                  className="color-dot"
                  style={{ backgroundColor: color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateHabitColor(habit.id, color);
                    setMenuOpen(null);
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => {
                setEditingId(habit.id);
                setEditingValue(habit.name);
                setMenuOpen(null);
              }}
            >
              Rename
            </button>

            <button
              onClick={() => {
                setEditingNoteId(habit.id);
                setEditingNoteValue(habit.note || "");
                setMenuOpen(null);
              }}
            >
              Edit Note
            </button>

            <button onClick={() => deleteHabit(habit.id)}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
