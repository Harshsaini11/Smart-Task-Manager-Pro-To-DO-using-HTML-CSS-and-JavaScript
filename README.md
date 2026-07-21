# Smart Task Manager Pro (TO-DO app) 

> A modern, responsive, and feature-packed Productivity Application built with pure **Vanilla JavaScript (ES6+)**, **HTML5**, and **CSS3**. Designed with a sleek Glassmorphism UI, theme customization, and native Web APIs to deliver an intuitive task management experience.

---

## Features Breakdown

###  Glassmorphism UI & Dashboard
- **Modern Design:** Translucent cards, subtle blurred borders, and dynamic animated floating background blobs.
- **Theme Switcher:** Seamless Dark & Light Mode toggle with state saved in `localStorage`.
- **Live Greeting & Clock:** Dynamic greeting engine based on real-time hour with date & time display.

### Core Task Management (CRUD & State)
- **Full CRUD Operations:** Create, Read, Update, and Delete tasks with instant UI reactivity.
- **Priority & Category Badging:** High 🔴, Medium 🟡, Low 🟢 priority tags combined with intuitive category badges (Study, Work, Personal, etc.).
- **Automatic Persistence:** Automatic state synchronization with `localStorage` so data remains intact across sessions.

### Reminders & Countdown Timers
- **Live Countdowns:** Dynamic time-remaining indicators (*"2h 18m left"* or *"Critical"* alerts).
- **Browser Notification API:** Native browser desktop notifications fired before task due dates.
- **Overdue Detection:** Real-time deadline tracking highlighting missed tasks in red.

### Filtering, Search & Drag-and-Drop
- **Instant Search:** Real-time query filtering across task titles, priorities, and categories.
- **Smart Tabs:** One-click filtering for `All`, `Pending`, `Completed`, `Today`, and `Overdue` tasks.
- **Native Drag & Drop API:** Smooth drag-and-drop task reordering with auto-saved order sequence.

### Analytics & Mini Calendar
- **Live Progress Bar:** Real-time completion percentage calculations.
- **Interactive Mini Calendar:** Month grid view highlighting scheduled tasks on specific dates with date-click filtering.

### Bonus Productivity Suite
- **Voice Input (Web Speech API):** Hands-free task creation using voice recognition.
- **Pomodoro Timer:** Built-in 25/5 focus interval timer with audio/notification cues.
- **Quick Notepad:** Built-in sticky scratchpad for fast thoughts and notes.
- **Confetti Celebration:** Festive Canvas Confetti effect on hitting 100% task completion.
- **Data Export & Print Support:** One-click CSV export and dedicated `@media print` layout for PDF creation.
- **Keyboard Shortcuts:** Fast shortcuts (`Ctrl + N` for new task, `Ctrl + F` for search, `Esc` to reset).

---

## Tech Stack & APIs Used

- **Frontend:** HTML5, CSS3 (CSS Variables, Flexbox, CSS Grid, Glassmorphism, `@media print`)
- **JavaScript Engine:** Vanilla JS (ES6+ ES Modules / Async Logic)
- **Web APIs:**
  - LocalStorage API
  - HTML5 Drag and Drop API
  - Web Notifications API
  - Web Speech API (SpeechRecognition)
  - Service Worker API (PWA Ready)
- **Libraries:**
  - [FontAwesome 6.4](https://fontawesome.com/) (Icons)
  - [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) (Celebration FX)

---

## Project Structure

```text
Smart-Task-Manager/
│── index.html          # Core HTML Markup
│── style.css           # Glassmorphism Design System & Theme Engine
│── script.js           # Multi-module State & Logic Engine
│── sw.js               # Service Worker for Offline PWA Support
└── README.md           # Documentation
How to Run LocallyClone the repository:Bashgit clone [https://github.com/your-username/smart-task-manager-pro.git](https://github.com/your-username/smart-task-manager-pro.git)
Navigate to project directory:Bashcd smart-task-manager-pro
Open the App:Simply open index.html in any web browser, or launch using VS Code Live Server.⌨️ Keyboard ShortcutsShortcutActionCtrl + NFocus Task Name InputCtrl + FFocus Search BarEscClear Search Query / Unfocus🤝 ContributingContributions, issues, and feature requests are welcome! Feel free to check the issues page.📝 LicenseDistributed under the MIT License.
---

## Quick Steps to Push to GitHub

Terminal ya Command Prompt kholein aur apne project folder mein ye commands run karein:

```bash
git init
git add .
git commit -m "Initial Commit: Smart Task Manager Pro Complete"
git branch -M main
git remote add origin https://github.com/harshsaini11/smart-task-manager-pro.git
git push -u origin main
