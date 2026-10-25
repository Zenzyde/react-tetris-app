import { useEffect, useRef } from 'react';

type Circle = {
	x: number;
	y: number;
	radius: number;
	color: {
		h: number;
		s: number;
		l: number;
	};
	maxRadius: number;
	opacity: number;
	fadeStartTime: number | null;
};

export default function AnimatedBackground({ className }: { className?: string }) {

	const canvasRef = useRef<HTMLCanvasElement>(null);
	
	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		const sourceCanvas = document.createElement("canvas");
		const sourceCtx = sourceCanvas.getContext("2d");
		const blurCanvas = document.createElement("canvas");
		const blurCtx = blurCanvas.getContext("2d");
		const SCALE = 0.25;
		const BLUR_RADIUS = 20; // Approximate radius in full-resolution pixels
		const BLUR_EVERY_N_FRAMES = 2;

		let animationFrameId: number;
		let frame: number = 0;
		let width = 0;
		let height = 0;

		let circles: Array<Circle> = [];
	
		function resize() {
			const dpr = window.devicePixelRatio || 1;
	
			width = window.innerWidth;
			height = window.innerHeight;
	
			// Main canvas at device resolution
			if (canvas) {
				canvas.width = Math.round(width * dpr);
				canvas.height = Math.round(height * dpr);
				canvas.style.width = `${width}px`;
				canvas.style.height = `${height}px`;
				ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

				// Source canvas at quarter resolution for blur
				sourceCanvas.width = Math.ceil(canvas.width * SCALE);
				sourceCanvas.height = Math.ceil(canvas.height * SCALE);
		
				// Blur buffer at reduced resolution
				blurCanvas.width = sourceCanvas.width;
				blurCanvas.height = sourceCanvas.height;

				circles = Array.from({ length: 50 }, () => ({
					x: Math.random() * (canvas?.width ?? 0),
					y: Math.random() * (canvas?.height ?? 0),
					radius: Math.random() * 5 + 2,
					color: {
						h: Math.random() * 360,
						s: Math.random() * 100,
						l: Math.random() * 100,
					},
					maxRadius: Math.random() * 80 + 4,
					opacity: 1,
					fadeStartTime: null,
				}));
			}
		}

		function drawCircles(time: number) {
			sourceCtx!.clearRect(0, 0, width, height);

			for (const circle of circles) {
				sourceCtx!.beginPath();
				sourceCtx!.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
				sourceCtx!.fillStyle = `hsla(${circle.color.h}, ${circle.color.s}%, ${circle.color.l}%, ${circle.opacity})`;
				sourceCtx!.fill();

				// Grow without changing position.
				if (circle.radius < circle.maxRadius) {
					circle.radius += Math.random() * 0.1;
				}

				if (circle.radius >= circle.maxRadius) {
					if (circle.fadeStartTime === null) {
						circle.fadeStartTime = time;
					}

					const fadeElapsed = time - (circle.fadeStartTime ?? 0);

					if (circle.opacity > 0) {
						circle.opacity = Math.max(1 - fadeElapsed / 1000, 0);
					}
					else { 
						circle.opacity = 1;
						circle.radius = Math.random() * 5 + 2;
						circle.x = Math.random() * (width ?? 0);
						circle.y = Math.random() * (height ?? 0);
						circle.fadeStartTime = null;
					}
				}
			}
		}

		function applyBlur() {
			blurCtx!.clearRect(
				0, 0, blurCanvas.width, blurCanvas.height
			);

			blurCtx!.filter = `blur(${BLUR_RADIUS}px)`;
			blurCtx!.drawImage(sourceCanvas, 0, 0);
			blurCtx!.filter = "none";
		}

		const render = (time: number) => {
			drawCircles(time);

			if (frame % BLUR_EVERY_N_FRAMES === 0) {
				applyBlur();
			}

			ctx?.clearRect(0, 0, width, height);
			ctx?.drawImage(blurCanvas, 0, 0, width, height);

			frame++;
			animationFrameId = requestAnimationFrame(render);
		};
		resize();
		window.addEventListener("resize", resize);
		render(0);

		return () => {
			cancelAnimationFrame(animationFrameId);
			window.removeEventListener("resize", resize);
		};
	}, []);

	return (
		<canvas ref={canvasRef} className={`absolute top-0 left-0 w-full h-full bg-slate-800 -z-10 ${className ?? ""}`}>
		</canvas>
	);
}