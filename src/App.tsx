import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import './App.css';

interface Position {
  x: number;
  y: number;
}

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isLocked, setIsLocked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [contrast, setContrast] = useState(100);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const controlsTimeoutRef = useRef<number | null>(null);

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (!showUrlInput) setShowControls(false);
    }, 4000);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setContrast(100);
        setIsGrayscale(false);
        resetControlsTimer();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlImport = () => {
    if (imageUrl.trim()) {
      setImage(imageUrl.trim());
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setContrast(100);
      setIsGrayscale(false);
      setShowUrlInput(false);
      resetControlsTimer();
    }
  };

  const handleZoom = (delta: number) => {
    if (isLocked) return;
    setScale((prev) => {
      const next = prev + delta;
      return Math.max(0.01, parseFloat(next.toFixed(2)));
    });
    resetControlsTimer();
  };

  const handleContrast = (delta: number) => {
    setContrast(prev => Math.max(0, prev + delta));
    resetControlsTimer();
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    resetControlsTimer();
  };

  const toggleGrayscale = () => {
    setIsGrayscale(!isGrayscale);
    resetControlsTimer();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    resetControlsTimer();
    if (isLocked || !image) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    resetControlsTimer();
    if (!isDragging || isLocked) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="app-container" onMouseMove={resetControlsTimer} onTouchStart={resetControlsTimer}>
      {!image && (
        <div className="upload-screen">
          <h1>Trace Draw</h1>
          <p>Upload or paste a link to start tracing</p>
          
          <div className="upload-options">
            <label className="upload-button main">
              Choose Image
              <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
            </label>
            
            <div className="url-input-container">
              <input 
                type="text" 
                placeholder="https://image-url.com/photo.jpg" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="url-input"
              />
              <button className="upload-button secondary" onClick={handleUrlImport}>
                Import URL
              </button>
            </div>
          </div>
        </div>
      )}

      {image && (
        <>
          <div 
            className={`image-canvas ${isLocked ? 'locked' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <img
              src={image}
              alt="Trace target"
              draggable="false"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                filter: `contrast(${contrast}%) ${isGrayscale ? 'grayscale(100%)' : ''}`,
                pointerEvents: isLocked ? 'none' : 'auto'
              }}
            />
          </div>

          <div className={`controls bottom-left ${showControls ? 'visible' : 'hidden'}`}>
            <div className="control-section">
              <span className="label">Zoom</span>
              <div className="btn-group">
                <button onClick={() => handleZoom(0.05)}>+</button>
                <span className="value">{(scale * 100).toFixed(0)}%</span>
                <button onClick={() => handleZoom(-0.05)}>-</button>
              </div>
            </div>

            <div className="control-section">
              <span className="label">Contrast</span>
              <div className="btn-group">
                <button onClick={() => handleContrast(10)}>+</button>
                <span className="value">{contrast}%</span>
                <button onClick={() => handleContrast(-10)}>-</button>
              </div>
            </div>

            <div className="control-section row">
              <button 
                className={`toggle-btn ${isGrayscale ? 'active' : ''}`} 
                onClick={toggleGrayscale}
              >
                B/W
              </button>
              <button 
                className={`lock-button ${isLocked ? 'is-locked' : ''}`} 
                onClick={toggleLock}
              >
                {isLocked ? 'Unlock' : 'Lock'}
              </button>
            </div>

            <div className="mini-upload-group">
              <label className="mini-upload">
                Upload
                <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
              </label>
              <button className="mini-upload" onClick={() => {
                const url = prompt('Enter image URL:');
                if (url) {
                  setImage(url);
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }
              }}>
                URL
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
