
gsap.registerPlugin(TextPlugin, ScrollTrigger);

const envelope = document.getElementById("envelope");
const flap = document.getElementById("envelope-flap");
const letter = document.getElementById("letter");
const letterLines = gsap.utils.toArray(".letter__line");
const hero = document.getElementById("hero");
const seal = document.querySelector(".envelope__seal");
const hint = document.querySelector(".hero__hint");
const pen = document.getElementById("letter-pen");
const penSparkle = document.getElementById("letter-pen-sparkle");
// Toggle pen/visual writing cue. Set to false to remove the pen if it can't be synced.
const SHOW_PEN = false;

let isOpened = false;
let isAnimating = false;
let writingTimeline = null;
let floatTween = null;
// Toggle the subtle paper float animation. Set to false to keep the paper static.
const ENABLE_PAPER_FLOAT = false;
const defaultHintText = hint ? hint.textContent : "";

function resetLetterContent() {
  letter.scrollTop = 0;
  letterLines.forEach((line) => {
    const textSpan = line.querySelector(".letter__text");
    const sparkle = line.querySelector(".letter__sparkle");
    gsap.set(line, { opacity: 0 });
    if (textSpan) {
      textSpan.textContent = "";
    } else {
      line.textContent = "";
    }
    if (sparkle) {
      gsap.set(sparkle, { autoAlpha: 0 });
    }
  });
}

function setupInitialStates() {
  gsap.set(flap, { rotationX: 0, transformOrigin: "50% 0%" });
  gsap.set(letter, {
    rotationX: -95,
    yPercent: 65,
    opacity: 0,
    transformOrigin: "50% 100%",
    pointerEvents: "none",
  });
  resetLetterContent();
  gsap.set([pen, penSparkle], { autoAlpha: 0, x: 0, y: 0 });

  if (floatTween) {
    floatTween.pause(0);
  } else {
    if (ENABLE_PAPER_FLOAT) {
      floatTween = gsap.to(letter, {
        yPercent: -6,
        rotationX: 3,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        paused: true,
      });
    } else {
      // safe no-op object so calls to play/pause won't throw
      floatTween = { play: function () {}, pause: function () {} };
    }
  }
}

function addIdleHoverMotion() {
  const bounds = { width: envelope.offsetWidth, height: envelope.offsetHeight };

  hero.addEventListener("pointermove", (event) => {
    if (isOpened || isAnimating) return;
    const rect = envelope.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + bounds.width / 2);
    const offsetY = event.clientY - (rect.top + bounds.height / 2);

    gsap.to(envelope, {
      rotationY: gsap.utils.clamp(-12, 12, (offsetX / bounds.width) * 40),
      rotationX: gsap.utils.clamp(-10, 10, (-offsetY / bounds.height) * 30),
      transformPerspective: 1200,
      duration: 0.6,
      ease: "power3.out",
    });
  });

  hero.addEventListener("pointerleave", () => {
    if (isOpened || isAnimating) return;
    gsap.to(envelope, {
      rotationX: 0,
      rotationY: 0,
      duration: 1,
      ease: "elastic.out(1, 0.4)",
    });
  });
}

function startWritingSequence() {
  if (writingTimeline) {
    writingTimeline.kill();
  }

  floatTween.pause(0);

  const envelopeRect = envelope.getBoundingClientRect();

  writingTimeline = gsap.timeline({
    defaults: { ease: "none" },
    onComplete: () => {
      floatTween.play();
      if (SHOW_PEN) gsap.to([pen, penSparkle], { autoAlpha: 0, duration: 0.4, ease: "power1.out" });
    },
  });

  // Character timing controls: change to letter-by-letter reveal.
  // CHAR_SECONDS controls seconds per character (smaller = faster). Adjust as needed.
  const CHAR_SECONDS = 0.04; // ~40ms per character
  const LINE_PAUSE = 0.12; // short pause after each line

  letterLines.forEach((line, index) => {
    const text = line.dataset.text || "";
    const textTarget = line.querySelector(".letter__text") || line;
    const sparkle = line.querySelector(".letter__sparkle");
  // compute character count (including spaces) for letter-by-letter timing
  const charCount = Math.max((text || "").length, 1);
  // duration scales with characters
  const duration = gsap.utils.clamp(0.6, 24, charCount * CHAR_SECONDS);

    // slightly bigger initial gap so the envelope reveal finishes before writing begins
    writingTimeline.add(() => {
      const lineRect = line.getBoundingClientRect();
      const startX = lineRect.left - envelopeRect.left + 12;
      const baseline = lineRect.top - envelopeRect.top + lineRect.height * 0.62;

      gsap.set(line, { opacity: 1 });
      if (textTarget) textTarget.textContent = "";
      if (SHOW_PEN) {
        gsap.set(pen, { x: startX, y: baseline, rotate: -14, autoAlpha: 1 });
        gsap.set(penSparkle, { x: startX, y: baseline, autoAlpha: 1, scale: 0.6 });
      }
      if (sparkle) {
        gsap.set(sparkle, { autoAlpha: 0, scale: 0.7 });
      }
      if (letter.scrollTo) {
        const targetScroll = Math.max(line.offsetTop - letter.clientHeight * 0.3, 0);
        letter.scrollTo({ top: targetScroll, behavior: "smooth" });
      } else {
        letter.scrollTop = Math.max(line.offsetTop - letter.clientHeight * 0.3, 0);
      }
  }, index === 0 ? ">0.5" : ">0.35");

    // Animate text letter-by-letter (TextPlugin with no delimiter or empty string)
    writingTimeline.to(
      textTarget,
      {
        text: {
          value: text,
          delimiter: "",
        },
        duration,
        ease: "none",
      },
      "<"
    );

    // Optionally move pen and sparkle across the line in sync with words
    if (SHOW_PEN) {
      writingTimeline.to(
        pen,
        {
          x: () => {
            const lineRect = line.getBoundingClientRect();
            return lineRect.left - envelopeRect.left + Math.max(lineRect.width * 0.96, 48);
          },
          y: () => {
            const lineRect = line.getBoundingClientRect();
            return lineRect.top - envelopeRect.top + lineRect.height * 0.62;
          },
          duration,
          ease: "none",
        },
        "<"
      );

      writingTimeline.to(
        penSparkle,
        {
          x: () => {
            const lineRect = line.getBoundingClientRect();
            return lineRect.left - envelopeRect.left + Math.max(lineRect.width * 0.96, 48);
          },
          y: () => {
            const lineRect = line.getBoundingClientRect();
            return lineRect.top - envelopeRect.top + lineRect.height * 0.62;
          },
          scale: 1.05,
          duration,
          ease: "sine.out",
        },
        "<"
      );

      writingTimeline.to(
        penSparkle,
        {
          autoAlpha: 0.25,
          duration: Math.max(0.4, duration * 0.5),
          ease: "sine.inOut",
          yoyo: true,
          repeat: 1,
        },
        "<"
      );
    }

    if (sparkle) {
      writingTimeline.fromTo(
        sparkle,
        { autoAlpha: 0, scale: 0.6 },
        { autoAlpha: 1, scale: 1.2, duration: Math.min(0.9, duration * 0.55), ease: "sine.out" },
        "<+0.12"
      );
      writingTimeline.to(sparkle, { autoAlpha: 0, scale: 0.8, duration: 0.3, ease: "power1.inOut" }, "<+0.2");
    }

  // small pause after each line so the reader can follow along
  writingTimeline.to({}, { duration: LINE_PAUSE });
  });

  return writingTimeline;
}

function openEnvelope() {
  if (isAnimating || isOpened) return;
  isAnimating = true;
  // restore writing when the envelope opens (don't kill existing timeline here)

  envelope.classList.add("envelope--opened");
  envelope.style.cursor = "default";
  envelope.style.pointerEvents = "none";
  envelope.setAttribute("aria-pressed", "true");

  if (seal) {
    seal.textContent = "Close";
  }

  if (hint) {
    gsap.to(hint, { opacity: 0, y: -12, duration: 0.5, ease: "power2.out" });
  }

  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    onComplete: () => {
      isAnimating = false;
      isOpened = true;
      envelope.style.cursor = "pointer";
      envelope.style.pointerEvents = "auto";
    },
  });

  tl.to(envelope, { scale: 1.05, duration: 0.6 }, 0)
    .to(".sparkles span", { opacity: 1, duration: 0.6, stagger: 0.08 }, 0)
    .to(flap, { rotationX: -160, duration: 1.1, ease: "power3.inOut" }, 0.15)
    .to(
      letter,
      {
        opacity: 1,
        rotationX: 0,
        yPercent: -8,
        duration: 1.35,
        ease: "power3.out",
      },
      0.5
    )
    .set(letter, { pointerEvents: "auto" }, "<");

  tl.add(() => {
    // start writing now that the letter is revealed
    writingTimeline = startWritingSequence();
  }, ">-0.05");
}

function closeEnvelope() {
  if (isAnimating || !isOpened) return;
  isAnimating = true;

  envelope.classList.remove("envelope--opened");
  envelope.style.pointerEvents = "none";
  envelope.setAttribute("aria-pressed", "false");

  // Ensure any prior writing timeline is cleared before starting a fresh one after close
  if (writingTimeline) {
    writingTimeline.kill();
    writingTimeline = null;
  }

  floatTween.pause(0);
  gsap.to([pen, penSparkle], { autoAlpha: 0, duration: 0.2 });

  const tl = gsap.timeline({
    defaults: { ease: "power2.in" },
    onComplete: () => {
      resetLetterContent();
      isAnimating = false;
      isOpened = false;
      envelope.style.cursor = "pointer";
      envelope.style.pointerEvents = "auto";
      letter.style.pointerEvents = "none";
      if (seal) {
        seal.textContent = "Tap Me";
      }
      if (hint) {
        hint.textContent = defaultHintText;
        // fade the hint back in when the envelope is fully closed
        gsap.to(hint, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
      }
      // writing will start when the envelope is opened
    },
  });

  tl.to(letter, { rotationX: -95, yPercent: 65, opacity: 0, duration: 1.1, ease: "power3.in" }, 0)
    .to(flap, { rotationX: 0, duration: 1, ease: "power3.inOut" }, 0.2)
    .to(envelope, { scale: 1, duration: 0.6 }, "<")
    .to(".sparkles span", { opacity: 0.4, duration: 0.6 }, "<");
}

function toggleEnvelope() {
  if (isAnimating) return;
  if (isOpened) {
    closeEnvelope();
  } else {
    openEnvelope();
  }
}

function initScrollStory() {
  const story = document.getElementById("story");
  const paragraphs = gsap.utils.toArray(".story__content p");

  gsap.from(story, {
    scrollTrigger: {
      trigger: story,
      start: "top 70%",
      toggleActions: "play none none reverse",
    },
    y: 120,
    opacity: 0,
    duration: 1.4,
    ease: "power3.out",
  });

  paragraphs.forEach((paragraph, index) => {
    gsap.from(paragraph, {
      scrollTrigger: {
        trigger: paragraph,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
      y: 80,
      opacity: 0,
      duration: 1 + index * 0.1,
      ease: "power3.out",
    });
  });
}

function initSparkleDrift() {
  gsap.utils.toArray(".sparkles span").forEach((sparkle, index) => {
    gsap.to(sparkle, {
      yoyo: true,
      repeat: -1,
      duration: 3 + index * 0.5,
      x: gsap.utils.random(-20, 20),
      y: gsap.utils.random(-30, 30),
      ease: "sine.inOut",
    });
  });
}

setupInitialStates();
addIdleHoverMotion();
initScrollStory();
initSparkleDrift();

envelope.addEventListener("pointerup", (event) => {
  if (event.target.closest(".letter") && isOpened) {
    return;
  }
  toggleEnvelope();
});

if (seal) {
  seal.addEventListener("pointerup", (event) => {
    event.stopPropagation();
    toggleEnvelope();
  });
}

letter.addEventListener("pointerdown", (event) => event.stopPropagation());
letter.addEventListener("pointerup", (event) => event.stopPropagation());

document.addEventListener("keydown", (event) => {
  const isActionKey = event.code === "Enter" || event.code === "Space";
  const isEscape = event.code === "Escape";
  const activeElement = document.activeElement;

  if (isActionKey && (activeElement === envelope || activeElement === seal)) {
    event.preventDefault();
    toggleEnvelope();
  }

  if (isEscape && isOpened) {
    event.preventDefault();
    closeEnvelope();
  }
});

