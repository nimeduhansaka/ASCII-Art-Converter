# ASCII-Art

A lightweight, modern web app that converts images (upload) or live webcam feed into ASCII art.  
Supports color or monochrome output, downloadable ASCII results, and real-time conversion from your webcam.

---

## Features
- ✅ Upload an image and convert it to ASCII art  
- 🎥 Real-time ASCII conversion using your webcam (getUserMedia)  
- 🎨 Color or monochrome output modes  
- ⬇️ Download converted ASCII as `.txt`, `.html` (preserves colors), or as an image snapshot (PNG)  
- ⚙️ Adjustable parameters: character set, density/scale, contrast, invert, line height  
- 💾 Client-side only — no server required (optional server for hosting only)  
- ♿ Accessible keyboard controls and a responsive UI

---

## Demo / Live
> `https://nimeduhansaka.github.io/Ascii-Art-Converter/`

---

## Tech stack 
- Frontend: React + Vite with Tailwind 
- Canvas API for image processing and text rendering  
- getUserMedia for webcam stream  
- Optional: Web Workers for heavy image -> ASCII conversion off the main thread  
- Optional: CSS for color rendering in HTML export

---

## How it works (brief)
1. Image or video frame is drawn to a hidden `<canvas>` and sampled pixel-by-pixel.  
2. Each sample's luminance (and color if enabled) maps to a character in the chosen character set.  
3. Rendered text appears in a preformatted block `<pre>` or on an HTML canvas to preserve spacing.  
4. Download options serialize the text (and color data for HTML) or export a canvas snapshot.

---

## Usage

### Local development (recommended)
```bash
# Clone
git clone https://github.com/<yourusername>/ASCII-Art.git
cd ASCII-Art

# Install
npm install

# Dev server
npm run dev
# Open http://localhost:5173 (or the printed Vite URL)
