Calendar React component

Files added:
- src/Calendar.jsx
- src/Calendar.module.css

What it does
- Renders a responsive grid of clickable date cards for all remaining dates in November (from today).
- Clicking a date opens a modal containing an envelope (✉️).
- Clicking the envelope reveals a placeholder "letter" message for that date.
- Uses React useState for modal and selected-date state.
- No external dependencies required besides React.

How to use
1. Install React and set up a basic React app (Create React App, Vite, or similar).
2. Copy `src/Calendar.jsx` and `src/Calendar.module.css` into your project under `src/`.
3. Import and render the component in your app, e.g.: 

```jsx
// App.jsx
import React from 'react';
import Calendar from './Calendar';

export default function App() {
  return (
    <div>
      <Calendar />
    </div>
  );
}
```

Notes
- The component auto-generates placeholder messages for each date. Replace the `messages` map in `Calendar.jsx` with real messages when ready.
- CSS uses CSS modules; if your build doesn't support CSS modules, you can convert the classes to a global stylesheet by removing the module import and using the class names directly.
- Keyboard accessibility: press Escape to close the modal; the envelope can be opened with Enter when focused.

If you want, I can also wire this into your existing index.html as a minimal demo using CDN React (no build), or create a small `package.json` + demo `index.html`/`main.jsx` so you can run it locally. Just tell me which you prefer.