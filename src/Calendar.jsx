import React, { useMemo, useState, useEffect } from "react";
import styles from "./Calendar.module.css";

// Calendar component: shows remaining dates in November starting from today.
// Clicking a date opens a modal with an envelope; clicking the envelope reveals the letter.
export default function Calendar() {
  // Fixed range: November 12 - November 30, 2025
  const year = 2025;
  const novemberMonth = 10; // November (0-based index)
  const startDay = 12;

  // Generate days 12..30 for November 2025
  const days = useMemo(() => {
    const list = [];
    for (let d = startDay; d <= 30; d++) {
      list.push(new Date(year, novemberMonth, d));
    }
    return list;
  }, []);

  // Messages map: Nov 12 uses the original homepage message; others are placeholders
  const messages = useMemo(() => {
    const map = {};

    // Original homepage message (concatenated paragraphs)
    map[12] = `Picture a quiet garden just after dawn, when the world is peaceful and each flower slowly opens to meet the sunlight.

That’s how these last few weeks with you have felt—calm, full of promise, and touched by gentle wonder.

Every time I get to hear your voice or see your smile, it feels like finding a new blossom, something delicate and beautiful I want to protect and cherish.

It’s been just a short while since our story began, yet I already look forward to each new moment with you.

In so little time you’ve brought a warm, gentle happiness into my life—a sense of excitement about tomorrow and an appreciation for the little joys in every day.

I wonder if you see how much light you bring, not only to my days, but to the way I see the world. You make everything seem brighter just by being you.

On your birthday, I hope you feel surrounded by love—the quiet love that comes from someone who truly admires and cares for you.

I wish you a year filled with new adventures that make you laugh out loud and gentle surprises that remind you how wonderful life can be.

May you find peace in unexpected places, and may your biggest dreams start to take shape before your eyes.

As you step into this new chapter, know that I’m grateful for every page we’ve shared and excited to see where our story leads next.

No matter what this year brings, I hope we can walk through it together, making memories and creating happiness in our own special way.

Happy birthday, Adesuwa. I’m lucky to know you, and I wish you nothing but the sweetest things ahead.

With all my love,
Robert`;

    // Placeholders for other dates
    for (let d = startDay; d <= 30; d++) {
      if (!map[d]) map[d] = `This is your November ${d} letter!`;
    }

    return map;
  }, []);

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
