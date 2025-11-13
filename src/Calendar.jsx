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

  // We'll load per-day pages (day12.html...day30.html) on demand when opening the envelope.
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // Date object
  const [letterRevealed, setLetterRevealed] = useState(false);
  const [letterHtml, setLetterHtml] = useState("");
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [messagesMap, setMessagesMap] = useState(null);

  async function fetchLetterForDay(day) {
    // If we already have a central messages.json loaded, use it first
    if (messagesMap && messagesMap[day]) {
      setLetterHtml(messagesMap[day]);
      setLetterRevealed(true);
      return;
    }
    const url = `./day${day}.html`;
    setLoadingLetter(true);
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const content = doc.getElementById('letter-content');
      setLetterHtml(content ? content.innerHTML : text);
      setLetterRevealed(true);
    } catch (err) {
      setLetterHtml(`<p>Sorry, could not load the letter for Nov ${day}.</p>`);
      setLetterRevealed(true);
    } finally {
      setLoadingLetter(false);
    }
  }

  // Load messages.json once (optional central source)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('./messages.json', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setMessagesMap(json);
      } catch (e) {
        // ignore — we'll fall back to dayXX.html files
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // Reset letter reveal whenever modal or selected date changes
    setLetterRevealed(false);
    setLetterHtml("");
    setLoadingLetter(false);
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
    setLetterHtml("");
    setLoadingLetter(false);
  }

  function handleEnvelopeClick() {
    if (!selectedDate) return;
    const day = selectedDate.getDate();
    fetchLetterForDay(day);
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
                    <div className={styles.envelopeHint}>{loadingLetter ? 'Loading...' : 'Open and read your letter'}</div>
                  </div>
                </div>
              ) : (
                <div className={styles.letterBox}>
                  <div className={styles.letterText} dangerouslySetInnerHTML={{ __html: letterHtml || '<p>No letter found.</p>' }} />
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
