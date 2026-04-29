import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({
  content,
  children,
  disabled,
  delay = 200,
  anchorRef,
}) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const timeoutRef = useRef(null);
  const internalRef = useRef(null);

  // 👉 pilih anchor (external atau wrapper sendiri)
  const getAnchor = () => anchorRef?.current || internalRef.current;

  // 👉 hitung posisi
  const updatePosition = () => {
    const el = getAnchor();
    if (!el) return;

    const rect = el.getBoundingClientRect();

    setPos({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  // 👉 show tooltip
  const handleEnter = () => {
    if (disabled) return;

    updatePosition();

    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const handleLeave = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  // 👉 🔥 penting: follow scroll & resize
  useEffect(() => {
    if (!visible) return;

    const handleUpdate = () => {
      updatePosition();
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [visible]);

  return (
    <div
      ref={internalRef}
      className="tooltip-wrapper"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}

      {visible &&
        createPortal(
          <div
            className="tooltip-box"
            style={{
              position: "fixed",
              left: pos.x,
              top: pos.y - 8,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </div>
  );
}
