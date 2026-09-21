# 🌌 VoidTube

> **Minimalist, Distraction-Free YouTube Alternative Client** powered by decentralized **Invidious APIs** with an ultra-clean **OLED Dark Mode (#0a0a0c)** aesthetic.

![VoidTube Banner](https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop)

---

## ✨ Features

- 🖤 **Dark Cinematic Void Aesthetics**: Crafted for deep OLED displays (`#0a0a0c` base background, `#141419` elevated cards, neon purple `#8b5cf6` and crimson `#f43f5e` accents).
- 🚫 **100% Distraction-Free**:
  - No YouTube Shorts algorithmic traps
  - No toxic comments sections
  - No banner ads, trackers, or annoying popups
- 🎬 **Dual-Engine Video Player**:
  - **Direct HTML5 Stream Player**: Plays direct `formatStreams` (720p/360p MP4) with custom controls (Scrubber timeline, hover time tooltip, 10s skip/rewind, volume slider, theater mode, fullscreen).
  - **Distraction-Free Privacy Embed Fallback**: Seamless fallback if an instance experiences CORS or companion limits.
- ⚡ **Decentralized Invidious Network (Auto-Failover)**:
  - Built-in multi-instance pool (`flokinet.to`, `f5.si`, `inv.tux.pizza`, `invidious.nerdvpn.de`, `yewtu.be`, `drgns.space`).
  - Automatically switches to a healthy server if an instance times out or returns an error.
  - In-app Instance Selector Modal with real-time latency ping testing.
- 🔍 **Fast YouTube Search**:
  - Instant query search via `/api/v1/search?q={query}&type=video`.
  - Keyboard shortcut: press `/` anywhere to focus search.
  - Shimmering OLED dark skeleton loaders.
- 📌 **Offline-First Watch Later & Bookmarks**:
  - Save videos to your personal playlist with one click.
  - Stored purely in your browser's `localStorage` — no accounts, passwords, or tracking.
  - Slide-out quick drawer with instant playback and management.

---

## 🛠️ Tech Stack

- **Framework**: [React 18+](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom OLED Theme Tokens)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Source**: Public Invidious Instances Network

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm or pnpm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/AhmedMonged0/VoidTube.git

# Navigate to project folder
cd VoidTube

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open your browser and visit:
`http://localhost:5173/`

### Building for Production

```bash
npm run build
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `/` | Focus search bar |
| `Space` / `K` | Play / Pause video |
| `←` / `→` | Seek backwards / forwards 5 seconds |
| `M` | Mute / Unmute audio |
| `T` | Toggle Theater Mode |
| `F` | Toggle Fullscreen |

---

## 🛡️ Privacy & Philosophy

VoidTube does not collect telemetry, track browsing habits, or serve sponsored content. All bookmarks and settings remain strictly on your local machine.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
