import React, { useState, useRef, useEffect } from 'react';
import './index.css';

// Main App Component
const App = () => {
    // State to hold the uploaded image URL, camera status, and the generated ASCII art
    const [imageSrc, setImageSrc] = useState(null);
    const [asciiArt, setAsciiArt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [error, setError] = useState('');
    const [useRealColors, setUseRealColors] = useState(false); // State for color mode
    const [showWarning, setShowWarning] = useState(false); // State for performance warning modal
    const [showPreloader, setShowPreloader] = useState(true); // State for the preloader

    // Refs for file input, canvas, video, and the render loop interval
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const videoRef = useRef(null);
    const intervalId = useRef(null);
    const originalImageRef = useRef(null); // Ref to store the original Image object

    // ASCII characters from darkest to lightest. You can customize this.
    const ASCII_CHARS = "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
    const MAX_CAMERA_WIDTH = 160; // Reduced for better performance
    const MAX_CAMERA_HEIGHT = 120; // Reduced for better performance
    const CAMERA_FRAME_RATE = 100; // ~10 FPS for a smoother experience


    // Effect to hide the preloader after a delay
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowPreloader(false);
        }, 4000); // Show preloader for 4 seconds
        return () => clearTimeout(timer);
    }, []);


    // Function to trigger the hidden file input
    const handleUploadClick = () => {
        if (isCameraOn) stopCamera();
        fileInputRef.current.click();
    };

    // Function to handle the image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setError('No file selected.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file (PNG, JPG, etc.).');
            setImageSrc(null);
            setAsciiArt('');
            return;
        }

        originalImageRef.current = null; // Clear previous image ref
        setError('');
        setIsLoading(true);
        setAsciiArt('');

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                originalImageRef.current = img; // Store the loaded image object
                setImageSrc(img.src);
                convertToAsciiFromImage(img);
                setIsLoading(false);
            };
            img.onerror = () => {
                setError('Failed to load the image. The file might be corrupted.');
                setIsLoading(false);
            };
            img.src = event.target.result;
        };
        reader.onerror = () => {
            setError('Failed to read the file.');
            setIsLoading(false);
        }
        reader.readAsDataURL(file);
    };

    // --- CAMERA FUNCTIONALITY ---

    const startCamera = async () => {
        if (isCameraOn || !videoRef.current) return;

        originalImageRef.current = null; // Clear image ref
        const video = videoRef.current;

        const onPlay = () => {
            setIsCameraOn(true);
            setImageSrc(null);
            setError('');
            intervalId.current = setInterval(asciiRenderLoop, CAMERA_FRAME_RATE);
            video.removeEventListener('play', onPlay);
        };

        video.addEventListener('play', onPlay);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            video.srcObject = stream;
            await video.play();
        } catch (err) {
            console.error("Camera or Playback Error:", err);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError("Camera access denied. Please allow camera permissions in your browser settings.");
            } else {
                setError("Could not start camera. It might be in use by another app or disconnected.");
            }
            video.removeEventListener('play', onPlay);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (intervalId.current) {
            clearInterval(intervalId.current);
        }
        setIsCameraOn(false);
        setAsciiArt('');
    };

    // --- DOWNLOAD FUNCTIONALITY ---
    const handleDownload = () => {
        if (!asciiArt || !imageSrc) {
            setError("Download is only available for uploaded images.");
            return;
        }

        const downloadCanvas = document.createElement('canvas');
        const ctx = downloadCanvas.getContext('2d');
        const fontSize = 8;
        const fontFamily = 'monospace';
        const lineHeight = 7;
        const backgroundColor = '#000000';

        let lines, maxWidth;
        if (useRealColors) {
            lines = asciiArt.split('<br>');
            maxWidth = Math.max(...lines.map(line => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = line;
                return tempDiv.textContent.length;
            }));
        } else {
            lines = asciiArt.split('\n');
            maxWidth = Math.max(...lines.map(line => line.length));
        }

        const canvasWidth = Math.floor(maxWidth * (fontSize / 1.8));
        const canvasHeight = Math.floor(lines.length * lineHeight);
        downloadCanvas.width = canvasWidth;
        downloadCanvas.height = canvasHeight;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textBaseline = 'top';

        if (useRealColors) {
            lines.forEach((line, index) => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = line;
                let currentX = 0;
                Array.from(tempDiv.childNodes).forEach(node => {
                    const text = node.textContent;
                    ctx.fillStyle = (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') ? node.style.color : '#FFFFFF';
                    ctx.fillText(text, currentX, index * lineHeight);
                    currentX += ctx.measureText(text).width;
                });
            });
        } else {
            ctx.fillStyle = '#FFFFFF';
            lines.forEach((line, index) => {
                ctx.fillText(line, 0, index * lineHeight);
            });
        }

        const dataUrl = downloadCanvas.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        link.download = 'ascii-art.jpg';
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Cleanup effect to ensure camera is stopped when component unmounts
    useEffect(() => {
        return () => stopCamera();
    }, []);

    // --- ASCII CONVERSION LOGIC ---

    const generateAsciiString = (context, width, height, withColor) => {
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;
        let asciiString = '';

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            const charIndex = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
            const asciiChar = ASCII_CHARS[charIndex];

            if (withColor) {
                asciiString += `<span style="color:rgb(${r},${g},${b})">${asciiChar}</span>`;
            } else {
                asciiString += asciiChar;
            }

            if (((i / 4) + 1) % width === 0) {
                asciiString += withColor ? '<br>' : '\n';
            }
        }
        return asciiString;
    };

    const convertToAsciiFromImage = (img) => {
        if (!img) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!img.width || !img.height) {
            setError('Could not process image with invalid dimensions.');
            setIsLoading(false);
            return;
        }

        const newWidth = img.width;
        const newHeight = img.height;

        if (newWidth <= 0 || newHeight <= 0) {
            setError('Resulting image dimensions are too small to process.');
            setIsLoading(false);
            return;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        setAsciiArt(generateAsciiString(ctx, newWidth, newHeight, useRealColors));
    };

    // Re-process image if color mode changes
    useEffect(() => {
        if (originalImageRef.current && !isCameraOn) {
            convertToAsciiFromImage(originalImageRef.current);
        }
    }, [useRealColors, isCameraOn]);

    const asciiRenderLoop = () => {
        if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!video.videoWidth || !video.videoHeight) return;

        let newWidth = MAX_CAMERA_WIDTH;
        let newHeight = (video.videoHeight / video.videoWidth) * newWidth;
        if (newHeight > MAX_CAMERA_HEIGHT) {
            newHeight = MAX_CAMERA_HEIGHT;
            newWidth = (video.videoWidth / video.videoHeight) * newHeight;
        }
        newWidth = Math.floor(newWidth);
        newHeight = Math.floor(newHeight);

        if (newWidth <= 0 || newHeight <= 0) return;

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(video, 0, 0, newWidth, newHeight);

        setAsciiArt(generateAsciiString(ctx, newWidth, newHeight, useRealColors));
    };

    const handleColorModeToggle = () => {
        if (useRealColors) {
            setUseRealColors(false);
        } else {
            setShowWarning(true);
        }
    };

    // --- RENDER ---
    return (
        <div
            className="bg-slate-900 min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 text-slate-200 ">


            <style>{`
            // For title font
            @import url('https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap');
            .font-urbanist {
                font-family: "Urbanist", sans-serif;
            }
            
            // For paragraph font
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
            .font-dmSans {
                font-family: "DM Sans", sans-serif;
                }
                
            @import url('https://fonts.googleapis.com/css2?family=Bitcount+Prop+Single+Ink:wght@100..900&display=swap');
            .bitcount-prop-single-ink {
                font-family: "Bitcount Prop Single Ink", system-ui;
                }
                
                
                .matrix-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #0f172a;
                    display: flex;
                    z-index: 100;
                    opacity: 1;
                    transition: opacity 2s ease-out;
                }
                .matrix-container.hidden {
                    opacity: 0;
                    pointer-events: none;
                }
                .matrix-pattern {
                    position: relative;
                    width: 1000px;
                    height: 100%;
                    flex-shrink: 0;
                }
                .matrix-column {
                    position: absolute;
                    top: -100%;
                    width: 20px;
                    height: 100%;
                    font-size: 16px;
                    line-height: 18px;
                    font-weight: bold;
                    animation: fall linear infinite;
                    white-space: nowrap;
                }
                .matrix-column::before {
                    content: "\`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
                    position: absolute;
                    top: 0;
                    left: 0;
                    background: linear-gradient( to bottom, #ffffff 0%, #ffffff 5%, #00ff41 10%, #00ff41 20%, #00dd33 30%, #00bb22 40%, #009911 50%, #007700 60%, #005500 70%, #003300 80%, rgba(0, 255, 65, 0.5) 90%, transparent 100% );
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    writing-mode: vertical-lr;
                    letter-spacing: 1px;
                    text-rendering: optimizeLegibility;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                .matrix-column:nth-child(1) { left: 0px; animation-delay: -2.5s; animation-duration: 3s; }
                .matrix-column:nth-child(2) { left: 25px; animation-delay: -3.2s; animation-duration: 4s; }
                .matrix-column:nth-child(3) { left: 50px; animation-delay: -1.8s; animation-duration: 2.5s; }
                .matrix-column:nth-child(4) { left: 75px; animation-delay: -2.9s; animation-duration: 3.5s; }
                .matrix-column:nth-child(5) { left: 100px; animation-delay: -1.5s; animation-duration: 3s; }
                .matrix-column:nth-child(6) { left: 125px; animation-delay: -3.8s; animation-duration: 4.5s; }
                .matrix-column:nth-child(7) { left: 150px; animation-delay: -2.1s; animation-duration: 2.8s; }
                .matrix-column:nth-child(8) { left: 175px; animation-delay: -2.7s; animation-duration: 3.2s; }
                .matrix-column:nth-child(9) { left: 200px; animation-delay: -3.4s; animation-duration: 3.8s; }
                .matrix-column:nth-child(10) { left: 225px; animation-delay: -1.9s; animation-duration: 2.7s; }
                .matrix-column:nth-child(11) { left: 250px; animation-delay: -3.6s; animation-duration: 4.2s; }
                .matrix-column:nth-child(12) { left: 275px; animation-delay: -2.3s; animation-duration: 3.1s; }
                .matrix-column:nth-child(13) { left: 300px; animation-delay: -3.1s; animation-duration: 3.6s; }
                .matrix-column:nth-child(14) { left: 325px; animation-delay: -2.6s; animation-duration: 2.9s; }
                .matrix-column:nth-child(15) { left: 350px; animation-delay: -3.7s; animation-duration: 4.1s; }
                .matrix-column:nth-child(16) { left: 375px; animation-delay: -2.8s; animation-duration: 3.3s; }
                .matrix-column:nth-child(17) { left: 400px; animation-delay: -3.3s; animation-duration: 3.7s; }
                .matrix-column:nth-child(18) { left: 425px; animation-delay: -2.2s; animation-duration: 2.6s; }
                .matrix-column:nth-child(19) { left: 450px; animation-delay: -3.9s; animation-duration: 4.3s; }
                .matrix-column:nth-child(20) { left: 475px; animation-delay: -2.4s; animation-duration: 3.4s; }
                .matrix-column:nth-child(21) { left: 500px; animation-delay: -1.7s; animation-duration: 2.4s; }
                .matrix-column:nth-child(22) { left: 525px; animation-delay: -3.5s; animation-duration: 3.9s; }
                .matrix-column:nth-child(23) { left: 550px; animation-delay: -2s; animation-duration: 3s; }
                .matrix-column:nth-child(24) { left: 575px; animation-delay: -4s; animation-duration: 4.4s; }
                .matrix-column:nth-child(25) { left: 600px; animation-delay: -1.6s; animation-duration: 2.3s; }
                .matrix-column:nth-child(26) { left: 625px; animation-delay: -3s; animation-duration: 3.5s; }
                .matrix-column:nth-child(27) { left: 650px; animation-delay: -3.8s; animation-duration: 4s; }
                .matrix-column:nth-child(28) { left: 675px; animation-delay: -2.5s; animation-duration: 2.8s; }
                .matrix-column:nth-child(29) { left: 700px; animation-delay: -3.2s; animation-duration: 3.6s; }
                .matrix-column:nth-child(30) { left: 725px; animation-delay: -2.7s; animation-duration: 3.2s; }
                .matrix-column:nth-child(31) { left: 750px; animation-delay: -1.8s; animation-duration: 2.7s; }
                .matrix-column:nth-child(32) { left: 775px; animation-delay: -3.6s; animation-duration: 4.1s; }
                .matrix-column:nth-child(33) { left: 800px; animation-delay: -2.1s; animation-duration: 3.1s; }
                .matrix-column:nth-child(34) { left: 825px; animation-delay: -3.4s; animation-duration: 3.7s; }
                .matrix-column:nth-child(35) { left: 850px; animation-delay: -2.8s; animation-duration: 2.9s; }
                .matrix-column:nth-child(36) { left: 875px; animation-delay: -3.7s; animation-duration: 4.2s; }
                .matrix-column:nth-child(37) { left: 900px; animation-delay: -2.3s; animation-duration: 3.3s; }
                .matrix-column:nth-child(38) { left: 925px; animation-delay: -1.9s; animation-duration: 2.5s; }
                .matrix-column:nth-child(39) { left: 950px; animation-delay: -3.5s; animation-duration: 3.8s; }
                .matrix-column:nth-child(40) { left: 975px; animation-delay: -2.6s; animation-duration: 3.4s; }
                .matrix-column:nth-child(odd)::before { content: "\`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"; }
                .matrix-column:nth-child(even)::before { content: "\`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"; }
                .matrix-column:nth-child(3n)::before { content: "\`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"; }
                .matrix-column:nth-child(4n)::before { content: "\`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"; }
                .matrix-column:nth-child(5n)::before { content: "\`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"; }
                @keyframes fall { 0% { transform: translateY(-10%); opacity: 1; } 100% { transform: translateY(200%); opacity: 0; } }
                
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-popup { animation: fadeInUp 0.5s ease-out forwards; }
                .delay-1 { animation-delay: 0.2s; }
                .delay-2 { animation-delay: 0.4s; }
                .delay-3 { animation-delay: 0.6s; }
                
                @media (max-width: 768px) { .matrix-column { font-size: 14px; line-height: 16px; width: 18px; } }
                @media (max-width: 480px) { .matrix-column { font-size: 12px; line-height: 14px; width: 15px; } }
            `}</style>

            <div className={`matrix-container ${!showPreloader ? 'hidden' : ''}`}>
                <div className="matrix-pattern">
                    {Array.from({length: 40}).map((_, i) => <div className="matrix-column" key={i}></div>)}
                </div>
                <div className="matrix-pattern">
                    {Array.from({length: 40}).map((_, i) => <div className="matrix-column" key={i}></div>)}
                </div>
                <div className="matrix-pattern">
                    {Array.from({length: 40}).map((_, i) => <div className="matrix-column" key={i}></div>)}
                </div>
                <div className="matrix-pattern">
                    {Array.from({length: 40}).map((_, i) => <div className="matrix-column" key={i}></div>)}
                </div>
                <div className="matrix-pattern">
                    {Array.from({length: 40}).map((_, i) => <div className="matrix-column" key={i}></div>)}
                </div>
            </div>


            {showWarning && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div
                        className="bg-slate-800 rounded-lg p-8 max-w-sm text-center shadow-2xl border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4 font-dmSans">Performance Warning</h3>
                        <p className="text-slate-300 mb-6 font-dmSans">
                            "Real Colors" mode can be slow and cause lag, especially with the live camera. Do you want
                            to proceed?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowWarning(false)}
                                className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors font-dmSans"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setUseRealColors(true);
                                    setShowWarning(false);
                                }}
                                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors font-dmSans"
                            >
                                Proceed
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-6xl mx-auto">
                <header className={`text-center mb-8 ${!showPreloader ? 'animate-popup delay-1' : 'opacity-0'}`}>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-urbanist"> ASCII Art
                        Converter</h1>
                    <p className="text-slate-400 mt-2 text-lg font-bold bitcount-prop-single-ink">Upload an image or use your camera for a real-time
                        conversion.</p>
                </header>

                <main>
                    <div
                        className={`bg-slate-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-sm text-center ${!showPreloader ? 'animate-popup delay-2' : 'opacity-0'}`}>
                        <div className="flex justify-center items-center gap-4">
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange}
                                   className="hidden"/>

                            <button onClick={handleUploadClick} disabled={isLoading}
                                    className="relative inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white  font-semibold font-dmSans rounded-xl shadow-md hover:bg-indigo-400 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 disabled:bg-slate-500 disabled:cursor-not-allowed">
                                {isLoading ? 'Processing...' : 'Upload Image'}
                            </button>

                            {!isCameraOn ? (
                                <button onClick={startCamera}
                                        className="relative inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-dmSans font-semibold rounded-xl shadow-md hover:bg-teal-400 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75">Use
                                    Camera</button>
                            ) : (
                                <button onClick={stopCamera}
                                        className="relative inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-dmSans font-semibold rounded-xl shadow-md hover:bg-red-400 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75">Stop
                                    Camera</button>
                            )}
                        </div>
                        <div className="flex items-center justify-center mt-4 gap-3 font-dmSans">
                            <span
                                className={`text-sm font-medium transition-colors ${!useRealColors ? 'text-white' : 'text-slate-400'}`}>Simple</span>

                            <button
                                onClick={handleColorModeToggle}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${useRealColors ? 'bg-indigo-600' : 'bg-slate-600'}`}
                                role="switch"
                                aria-checked={useRealColors}
                            >
                                <span aria-hidden="true"
                                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${useRealColors ? 'translate-x-5' : 'translate-x-0'}`}/>
                            </button>

                            <span
                                className={`text-sm font-medium transition-colors ${useRealColors ? 'text-white' : 'text-slate-400'}`}>Real Colors (Slow)</span>
                        </div>
                        {error && <p className="text-red-400 mt-4">{error}</p>}
                    </div>

                    {isLoading && (
                        <div className="flex justify-center items-center m-4 font-dmSans">
                            {/*//     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>*/}
                            {/*//     <p className="mt-4 text-slate-300">Converting your image...</p>*/}

                            <div class="loader-wrapper">
                                <span class="loader-letter">C</span>
                                <span class="loader-letter">o</span>
                                <span class="loader-letter">n</span>
                                <span class="loader-letter">v</span>
                                <span class="loader-letter">e</span>
                                <span class="loader-letter">r</span>
                                <span class="loader-letter">t</span>
                                <span class="loader-letter">i</span>
                                <span class="loader-letter">n</span>
                                <span class="loader-letter">g</span>

                                <div class="loader"></div>
                            </div>

                        </div>

                    )}

                    <div className={`mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start  ${!showPreloader ? 'animate-popup delay-3' : 'opacity-0'}`}>
                        <div className="transition-opacity duration-500">
                            <h2 className="text-2xl font-semibold mb-4 text-center text-white font-urbanist">{isCameraOn ? 'Camera Feed' : 'Original Image'}</h2>
                            <div
                                className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 min-h-[300px] flex items-center justify-center">
                                {!imageSrc && !isCameraOn && (
                                    <div className="text-center text-slate-500 font-dmSans">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"
                                             fill="currentColor" className="bi bi-image mx-auto mb-4"
                                             viewBox="0 0 16 16">
                                            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                            <path
                                                d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                                        </svg>
                                        <p className="font-dmSans">Your image or camera feed will appear here</p>
                                    </div>
                                )}
                                {imageSrc && !isCameraOn && (<img src={imageSrc} alt="Uploaded preview"
                                                                  className="max-w-full max-h-96 h-auto rounded-lg shadow-lg"/>)}
                                <video ref={videoRef} playsInline autoPlay muted
                                       className={`max-w-full max-h-96 h-auto rounded-lg shadow-lg ${isCameraOn ? 'block' : 'hidden'}`}></video>
                            </div>
                        </div>

                        <div className="transition-opacity duration-500">
                            <div className="flex items-center justify-center mb-4 gap-4">
                                <h2 className="text-2xl font-semibold text-white font-urbanist">ASCII Art</h2>
                                {asciiArt && imageSrc && !isCameraOn && (<button onClick={handleDownload}
                                                                                 className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-500 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75">Download
                                    .jpg</button>)}
                            </div>
                            <div className="bg-black p-4 rounded-xl border border-slate-700 overflow-auto max-h-96">
                                {useRealColors ? (
                                    <pre className="font-mono text-center whitespace-pre leading-none"
                                         dangerouslySetInnerHTML={{__html: asciiArt}} style={{fontSize: '1px'}}/>
                                ) : (
                                    <pre className="font-mono text-center whitespace-pre text-white" style={{
                                        fontSize: isCameraOn ? '6px' : '2px',
                                        lineHeight: isCameraOn ? '5px' : '2px'
                                    }}>{asciiArt || ' '}</pre>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
};

export default App;

