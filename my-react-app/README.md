# Student Portfolio — Practical 2

React portfolio application for **ITE2001: Advanced Web Development Frameworks**, extended from Practical 1 with multi-page routing and state management.

## Routes

| Path | Component | Description |
| --- | --- | --- |
| `/` | `Home` | Portfolio landing page with header, about, and skills |
| `/projects` | `Projects` | Featured project cards |
| `/contact` | `Contact` | Contact details with a controlled message form |
| `*` | `NotFound` | Custom 404 page for undefined routes |

## Features (Practical 2)

- **React Router v6** — `BrowserRouter` in `main.jsx`, routes defined in `App.jsx`
- **Navigation bar** — `NavBar` uses `NavLink` for SPA navigation without page reloads
- **State management (`useState`)**
  - Dark/light theme toggle in `App.jsx` (applies `dark-mode` class to the root shell)
  - Controlled message input on the Contact page
  - Help tooltip visibility toggle on the Contact page
- **Live character count** — displayed below the Contact form textarea
- **404 route** — catch-all route renders `NotFound.jsx`

## Getting Started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Project Structure

```
src/
├── App.jsx              # Routes and theme state
├── main.jsx             # BrowserRouter setup
└── components/
    ├── NavBar.jsx       # Navigation links and theme toggle
    ├── Home.jsx         # Home route
    ├── Projects.jsx     # Projects route
    ├── Contact.jsx      # Contact route with controlled form
    └── NotFound.jsx     # 404 route
```

## Student Details

- **Name:** Krish Patel
- **Enrollment No.:** 24IT068
- **College:** CSPIT, CHARUSAT
