import React, { useRef, useState } from 'react';

const Canvas = ({ onDrawingComplete }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState(null);

    const startDrawing = (e) => {
        e.preventDefault();
        const { offsetX, offsetY } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const { offsetX, offsetY } = getCoordinates(e);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        ctx.closePath();
        setIsDrawing(false);
        if (onDrawingComplete) {
            const base64 = getBase64();
            onDrawingComplete(base64);
        }
    };

    const getBase64 = () => {
        const canvas = canvasRef.current;
        return canvas.toDataURL('image/png');
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        let offsetX, offsetY;

        if (e.touches) {
            const touch = e.touches[0];
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
        } else if (e.nativeEvent) {
            offsetX = e.nativeEvent.offsetX;
            offsetY = e.nativeEvent.offsetY;
        }

        return { offsetX, offsetY };
    };

    React.useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        setCtx(context);
    }, []);

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={315}
                height={250}
                style={{ border: '1px solid black' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <button onClick={clearCanvas}>Limpar canvas</button>
        </div>
    );
};

export default Canvas;
