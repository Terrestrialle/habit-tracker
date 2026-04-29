import { useState, useRef, useEffect } from "react";
import sanitizeInput from "../utils/sanitizeInput";
import Tooltip from "./Tooltip";
import { createPortal } from "react-dom";
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
  const [menuPos, setMenuPos] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteValue, setEditingNoteValue] = useState("");

  const [isAnyDragging, setIsAnyDragging] = useState(false);

  const formRef = useRef(null);

  /* ---------- GLOBAL EVENTS ---------- */

  useEffect(() => {
    function handleClickOutside(e) {
      if (formRef.current && !formRef.current.contains(e.target)) {
        setCreating(false);
      }
    }

    function closeMenu(e) {
      if (!e.target.closest(".habit-menu") && !e.target.closest(".menu-btn")) {
        setMenuOpen(null);
        setMenuPos(null);
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") {
        setCreating(false);
        setMenuOpen(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;

    const updatePosition = () => {
      const btn = document.querySelector(`[data-menu-id="${menuOpen}"]`);
      if (!btn) return;

      const rect = btn.getBoundingClientRect();

      const menuWidth = 160;
      const padding = 8;

      const x = Math.min(rect.right, window.innerWidth - menuWidth - padding);

      setMenuPos({
        x,
        y: rect.bottom,
      });
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [menuOpen]);
  /* ---------- RESET MENU POSITION ---------- */

  // useEffect(() => {
  //   if (!menuOpen) setMenuPos(null);
  // }, [menuOpen]);

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

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={() => {
          setIsAnyDragging(true);
          setMenuOpen(null);
          setMenuPos(null);
        }}
        onDragEnd={(event) => {
          setIsAnyDragging(false);
          handleDragEnd(event);
        }}
        onDragCancel={() => setIsAnyDragging(false)}
      >
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
              menuPos={menuPos}
              setMenuPos={setMenuPos}
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
              isAnyDragging={isAnyDragging}
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
  menuPos,
  setMenuPos,
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
  isAnyDragging,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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

  const saveNote = () => {
    const clean = sanitizeInput(editingNoteValue);
    updateHabitNote(habit.id, clean);
    setEditingNoteId(null);
  };

  return (
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
      disabled={
        isAnyDragging || editingId === habit.id || editingNoteId === habit.id
      }
      delay={300}
    >
      <div ref={setNodeRef} style={style} className="habit-list-row">
        <span className="drag-handle" {...attributes} {...listeners}>
          ⋮⋮
        </span>

        <span className="habit-number">{index + 1}</span>

        <div className="habit-main">
          {editingId === habit.id ? (
            <input
              className="rename-input"
              autoFocus
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={saveRename}
            />
          ) : (
            <span className="habit-name" onDoubleClick={startRename}>
              {habit.name}
            </span>
          )}

          {editingNoteId === habit.id ? (
            <textarea
              className="habit-note-edit"
              autoFocus
              value={editingNoteValue}
              onChange={(e) => setEditingNoteValue(e.target.value)}
              onBlur={saveNote}
            />
          ) : (
            habit.note && <div className="habit-note">{habit.note}</div>
          )}
        </div>

        {/* MENU */}
        <div className="habit-actions">
          <button
            className="menu-btn"
            data-menu-id={habit.id}
            onClick={(e) => {
              e.stopPropagation();

              if (menuOpen === habit.id) {
                setMenuOpen(null);
                return;
              }

              const rect = e.currentTarget.getBoundingClientRect();

              const menuWidth = 160;
              const padding = 8;

              const x = Math.min(
                rect.right,
                window.innerWidth - menuWidth - padding,
              );

              setMenuPos({
                x,
                y: rect.bottom,
              });

              setMenuOpen(habit.id);
            }}
          >
            ⋯
          </button>

          {menuOpen === habit.id &&
            menuPos &&
            createPortal(
              <div
                className="habit-menu"
                style={{
                  position: "fixed",
                  left: menuPos.x,
                  top: menuPos.y + 6,
                  zIndex: 9999,
                }}
                onClick={(e) => e.stopPropagation()}
              >
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
              </div>,
              document.body,
            )}
        </div>
      </div>
    </Tooltip>
  );
}
