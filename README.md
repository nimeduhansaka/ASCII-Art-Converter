# ASCII-Art-Converter

A lightweight, modern web app that converts images (upload) or live webcam feed into ASCII art.  
Supports color or monochrome output, downloadable ASCII results, and real-time conversion from your webcam.

---

## 🔧 Features
- ✅ Upload an image (JPG, PNG, etc.) and convert it to ASCII art  
- 🎥 Real-time ASCII conversion using your webcam (via getUserMedia)  
- 🌈 Color **or** monochrome output modes  
- ⬇️ Download converted ASCII as:
  - `.txt` (plain text)  
  - `.html` (with colors preserved)  
  - `.png` snapshot image of the ASCII rendering  
- ⚙️ Adjustable parameters: character set, density/scale, contrast, invert, line height  
- 🖥️ Client-side only — no server backend required (aside from hosting)  
- ♿ Responsive UI and accessible keyboard controls

---

## 📺 Demo / Live
> https://nimeduhansaka.github.io/ASCII-Art-Converter/  
Visit this link to try the live version of the project.

---

## 🧰 Tech Stack
- Frontend: React + Vite (with Tailwind CSS)  
- Canvas API for image processing and rendering ASCII characters  
- getUserMedia API for webcam streaming  
- Optional: Web Workers for heavy image → ASCII conversion off the main thread  
- Export logic for HTML/PNG formats via browser APIs

---

## 🧠 How It Works (Overview)
1. The input (image upload or video frame) is drawn to a hidden `<canvas>` component, then sampled pixel-by-pixel.  
2. For each sampled pixel, its luminance (and color if enabled) is mapped to a character in the chosen character set.  
3. The resulting characters are rendered in a `<pre>` block (or canvas) to preserve spacing and layout.  
4. When “Download” is requested:
   - `.txt` export outputs the plain ASCII characters  
   - `.html` export wraps characters in `<span style="color:…">` so colored ASCII is preserved  
   - `.png` export draws the ASCII rendering into a new canvas and converts it via `canvas.toDataURL()` for download

---

## 🚀 Getting Started (Local Development)
```bash
# 1. Clone the repository
git clone https://github.com/nimeduhansaka/ASCII-Art-Converter.git
cd ASCII-Art-Converter

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
# Open http://localhost:5173 (or the URL printed in your terminal)
