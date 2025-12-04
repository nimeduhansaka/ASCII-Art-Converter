import React, { useState, useRef, useEffect, useCallback } from 'react';
import './index.css';
import MatrixBackground from './components/MatrixBackground';
import Preloader from './components/Preloader';
import Header from './components/Header';
import Controls from './components/Controls';
import ImagePreview from './components/ImagePreview';
import AsciiDisplay from './components/AsciiDisplay';
import WarningModal from './components/WarningModal';
import FooterSection from './components/FooterSection';
import BuyMeCoffeeWidget from './components/BuyMeCoffeeWidget';

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
        }, 2000); // Show preloader for 4 seconds
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

    const convertToAsciiFromImage = useCallback((img) => {
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
    }, [useRealColors]);


    // Re-process image if color mode changes
    useEffect(() => {
        if (originalImageRef.current && !isCameraOn) {
            convertToAsciiFromImage(originalImageRef.current);
        }
    }, [convertToAsciiFromImage, isCameraOn]);

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
        <div className="bg-black min-h-screen w-full flex flex-col items-center justify-center text-neutral-200">
            <MatrixBackground showPreloader={showPreloader} />
            <WarningModal
                showWarning={showWarning}
                setShowWarning={setShowWarning}
                setUseRealColors={setUseRealColors}
            />

            <div className="w-full max-w-6xl mx-auto mt-2 relative z-10 p-4 sm:p-6">
                <Header showPreloader={showPreloader} />

                <main>
                    <div className={`${!showPreloader ? 'animate-popup delay-2' : 'opacity-0 hidden'}`}>
                        <Controls
                            fileInputRef={fileInputRef}
                            handleImageChange={handleImageChange}
                            handleUploadClick={handleUploadClick}
                            isLoading={isLoading}
                            isCameraOn={isCameraOn}
                            startCamera={startCamera}
                            stopCamera={stopCamera}
                            useRealColors={useRealColors}
                            handleColorModeToggle={handleColorModeToggle}
                            error={error}
                            showPreloader={showPreloader}
                        />
                    </div>

                    <Preloader isLoading={isLoading || showPreloader} />

                    <div className={`mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start ${!showPreloader ? 'animate-popup delay-3' : 'opacity-0'}`}>
                        <ImagePreview
                            isCameraOn={isCameraOn}
                            imageSrc={imageSrc}
                            videoRef={videoRef}
                        />

                        <AsciiDisplay
                            asciiArt={asciiArt}
                            imageSrc={imageSrc}
                            isCameraOn={isCameraOn}
                            handleDownload={handleDownload}
                            useRealColors={useRealColors}
                        />
                    </div>
                </main>
            </div>
            <canvas ref={canvasRef} className="hidden"></canvas>

            <BuyMeCoffeeWidget/>
            <FooterSection/>
        </div>
    );
};

export default App;
