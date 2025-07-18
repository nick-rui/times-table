# Times Table Practice App

A fast, modern web app for practicing multiplication tables up to 20×20. Built with React, TypeScript, and Vite. You can specify the range of numbers to practice, and the app will test you indefinitely with instant feedback and stats.

## Project Structure

```
/ (project root)
├── LICENSE
├── README.md                # ← You are here (global project README)
├── times-table/             # Main app source code
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── constants.json   # All configurable literals and UI strings
│   │   ├── main.tsx
│   │   └── ...
│   └── ...
└── ...
```

## Features
- Practice multiplication for any range up to 20×20
- Set your own min/max for both multiplicands
- Instant feedback and running stats (correct, incorrect, average time)
- Clean, centered, fast UI (keyboard-focused)
- All literals and UI strings in `src/constants.json` for easy editing
- No backend required

## Getting Started

1. **Install dependencies:**
   ```sh
   cd times-table
   npm install
   ```
2. **Start the development server:**
   ```sh
   npm run dev
   ```
   Then open the local URL shown in your terminal (usually http://localhost:5173).

3. **Build for production:**
   ```sh
   npm run build
   ```

## Configuration
- All configurable values (min/max, feedback, app title, etc.) are in `times-table/src/constants.json`.
- You can edit this file to change the app’s behavior or UI strings.

## Scripts
- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run preview` — Preview the production build
- `npm run lint` — Run ESLint

## License
See [LICENSE](LICENSE).

---

This project is a monorepo-style structure with the main app in the `times-table/` subdirectory. If you want to move the app to the root, move all files from `times-table/` up and update paths in scripts and imports accordingly.
