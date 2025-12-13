# LingoFlow

A high-performance, local-first Flashcard application for mastering vocabulary. Built with React, Vite, and IndexedDB.

## 🚀 Features

- **Spaced Repetition System (SRS)**: Optimize learning efficiency with the SuperMemo-2 algorithm.
- **Rich Dictionary**: Searchable vocabulary list with examples, mnemonics, and grammar details.
- **Interactive Review**: 3D flip cards with touch support and keyboard shortcuts.
- **Gamification**:
  - 🧩 **Memory Match**: Find pairs of words.
  - 💧 **Raindrop Race**: Test your typing speed and recall.
- **Local-First**: All data is stored in your browser (IndexedDB) for privacy and offline access.
- **Responsive Design**: Beautiful interface powered by Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **State**: Zustand (w/ Persistence)
- **Database**: IndexedDB (via `idb-keyval`)
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest + React Testing Library

## 🏃 Run Globally

To run this project locally:

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the development server**:
    ```bash
    npm run dev
    ```

3.  **Run tests**:
    ```bash
    npm test
    ```

4.  **Build for production**:
    ```bash
    npm run build
    ```

## 📦 Deployment

This repository is configured to automatically deploy to **GitHub Pages** via GitHub Actions.
Any push to the `main` branch will trigger a build and deployment.

## 📄 License

MIT
