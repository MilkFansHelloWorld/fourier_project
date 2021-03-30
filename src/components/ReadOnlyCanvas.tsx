import React, { useCallback } from 'react';
import {useRef, useState, useEffect} from 'react';
import {CanvasPoint} from '../utils/Geometry';
import Fourier, {Complex} from '../utils/Fourier';
import AnimatedCanvas from './AnimatedCanvas';

/**
 * @field fourierCoefs: fourierCoefficients 
 * @field width: width of canvas in px
 * @field height: height of canvas in px.
 */
export type ReadOnlyCanvasProps = {
    fourierCoefs: Array<Complex>;
    width: number; 
    height: number;
};

const POINT_HISTORY_MAX_DISPLAY = 1000;

export default function ReadOnlyCanvas({fourierCoefs, width, height}: ReadOnlyCanvasProps) {
    let fourier = useRef(new Fourier(fourierCoefs, (fourierCoefs.length-1)/2, 1 / 5));
    const pointHistoryRef = useRef<CanvasPoint[]>(new Array<CanvasPoint>(POINT_HISTORY_MAX_DISPLAY));
    let draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, progress: number, frameLength: number) => {
        // Frame length is in milliseconds so let's do the conversion first.
        fourier.current.nextFrame(frameLength/1000);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let points = fourier.current.currentCanvasState();
        // Draw history
        let lastPoint = points[points.length - 1].getCanvasCoordinates(canvas.width, canvas.height);
        pointHistoryRef.current.shift();
        pointHistoryRef.current.push(lastPoint);
        ctx.strokeStyle = "white";
        for (let i = 1; i < pointHistoryRef.current.length; i++) {
            let lastPoint = pointHistoryRef.current[i-1];
            let currentPoint = pointHistoryRef.current[i];
            if (lastPoint && currentPoint) {
                ctx.moveTo(lastPoint.u, lastPoint.v);
                ctx.lineTo(currentPoint.u, currentPoint.v);    
            }
        }
        ctx.stroke()
        // Draw vectors
        for (let i = 1; i < points.length; i++) {
            ctx.beginPath();
            let sourcePoint = points[i - 1].getCanvasCoordinates(canvas.width, canvas.height);
            let destinationPoint = points[i].getCanvasCoordinates(canvas.width, canvas.height);
            ctx.strokeStyle = "white";
            ctx.moveTo(sourcePoint.u, sourcePoint.v);
            ctx.lineTo(destinationPoint.u, destinationPoint.v);
            ctx.stroke();
        }        
    }
    return (
        <div className="ReadOnlyCanvas">
            <AnimatedCanvas draw={draw} animate={true} backgroundDraw={(ctx, canvas) => {}} options={{width: `${width}px`, height: `${height}px`}}/>
        </div>
    );
}