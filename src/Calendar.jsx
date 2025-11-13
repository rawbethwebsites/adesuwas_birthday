import React, { useMemo, useState, useEffect } from "react";
import styles from "./Calendar.module.css";

// Calendar component: shows remaining dates in November starting from today.
// Clicking a date opens a modal with an envelope; clicking the envelope reveals the letter.
export default function Calendar() {
  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const novemberMonth = 10; // zero-based month index (0=Jan), 10 = November

  // Determine start day: if we're already in November, start from today; otherwise start from 1
  const startDay = useMemo(() => {
    return today.getMonth() === novemberMonth ? today.getDate() : 1;
  }, [today]);

  // Generate days from startDay up to Nov 30
  const days = useMemo(() => {
    const list = [];
    for (let d = startDay; d <= 30; d++) {
      list.push(new Date(year, novemberMonth, d));
    }
    return list;
  }, [startDay, year]);

  // Placeholder messages for each date (index by day number)
  const messages = useMemo(() => {
    const map = {};
    days.forEach((dt) => {
      const day = dt.getDate();
      map[day] = `This is your day ${day} letter!\n\n(Placeholder message — replace with a real message for ${day}.)`;
    });
    return map;
  }, [days]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // Date object
  const [letterRevealed, setLetterRevealed] = useState(false);

  useEffect(() => {
    // Reset letter reveal whenever modal or selected date changes
    setLetterRevealed(false);
  }, [selectedDate, modalOpen]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setModalOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openForDate(dateObj) {
    setSelectedDate(dateObj);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedDate(null);
    setLetterRevealed(false);
  }

  function handleEnvelopeClick() {
    setLetterRevealed(true);
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>November</h1>
        <p className={styles.sub}>Tap a date to open its letter</p>
      </header>

      <div className={styles.grid}>
        {days.map((dt) => {
          const day = dt.getDate();
          const isToday =
            dt.toDateString() === new Date().toDateString();
          return (
            <button
              key={day}
              className={`${styles.card} ${isToday ? styles.today : ""}`}
              onClick={() => openForDate(dt)}
              aria-label={`Open letter for November ${day}`}
            >
              <div className={styles.cardInner}>
                <div className={styles.day}>{day}</div>
                <div className={styles.label}>Nov</div>
              </div>
            </button>
          );
        })}
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <button className={styles.closeBtn} onClick={closeModal} aria-label="Close">
              ×
            </button>

            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>
                {selectedDate ? `November ${selectedDate.getDate()}` : "Letter"}
              </h2>

              {!letterRevealed ? (
                <div className={styles.envelopeWrap}>
                  <div
                    className={styles.envelope}
                    role="button"
                    tabIndex={0}
                    onClick={handleEnvelopeClick}
                    onKeyDown={(e) => e.key === "Enter" && handleEnvelopeClick()}
                    aria-label="Open and read your letter"
                  >
                    <span className={styles.envelopeEmoji} aria-hidden>
                      ✉️
                    </span>
                    <div className={styles.envelopeHint}>Open and read your letter</div>
                  </div>
                </div>
              ) : (
                <div className={styles.letterBox}>
                  <pre className={styles.letterText}>
                    {selectedDate ? messages[selectedDate.getDate()] : "No letter found."}
                  </pre>
                  <div className={styles.letterActions}>
                    <button className={styles.closePrimary} onClick={closeModal}>
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
