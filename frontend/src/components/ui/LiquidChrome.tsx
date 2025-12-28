"use client";

import React, { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

interface LiquidChromeProps extends React.HTMLAttributes<HTMLDivElement> {
    baseColor?: [number, number, number];
    speed?: number;
    amplitude?: number;
    frequencyX?: number;
    frequencyY?: number;
    interactive?: boolean;
}

export const LiquidChrome: React.FC<LiquidChromeProps> = ({
    baseColor = [0.1, 0.1, 0.1],
    speed = 0.2,
    amplitude = 0.5,
    frequencyX = 3,
    frequencyY = 2,
    interactive = true,
    ...props
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const renderer = new Renderer({ antialias: false, powerPreference: 'low-power' });
        const gl = renderer.gl;
        gl.clearColor(1, 1, 1, 1);

        const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

        // Optimized shader - no anti-aliasing, fewer iterations
        const fragmentShader = `
      precision mediump float;
      uniform float uTime;
      uniform vec3 uResolution;
      uniform vec3 uBaseColor;
      uniform float uAmplitude;
      uniform float uFrequencyX;
      uniform float uFrequencyY;
      varying vec2 vUv;

      void main() {
          vec2 fragCoord = vUv * uResolution.xy;
          vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

          // Reduced iterations from 10 to 5 for performance
          for (float i = 1.0; i < 5.0; i++){
              uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime);
              uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime);
          }

          vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
          gl_FragColor = vec4(color, 1.0);
      }
    `;

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: {
                    value: new Float32Array([gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height])
                },
                uBaseColor: { value: new Float32Array(baseColor) },
                uAmplitude: { value: amplitude },
                uFrequencyX: { value: frequencyX },
                uFrequencyY: { value: frequencyY }
            }
        });
        const mesh = new Mesh(gl, { geometry, program });

        function resize() {
            // Render at 50% resolution for performance
            const scale = 0.5;
            renderer.setSize(container.offsetWidth * scale, container.offsetHeight * scale);
            gl.canvas.style.width = '100%';
            gl.canvas.style.height = '100%';
            const resUniform = program.uniforms.uResolution.value as Float32Array;
            resUniform[0] = gl.canvas.width;
            resUniform[1] = gl.canvas.height;
            resUniform[2] = gl.canvas.width / gl.canvas.height;
        }
        window.addEventListener('resize', resize);
        resize();

        let animationId: number;
        function update(t: number) {
            animationId = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001 * speed;
            renderer.render({ scene: mesh });
        }
        animationId = requestAnimationFrame(update);

        container.appendChild(gl.canvas);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            if (gl.canvas.parentElement) {
                gl.canvas.parentElement.removeChild(gl.canvas);
            }
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, [baseColor, speed, amplitude, frequencyX, frequencyY, interactive]);

    return <div ref={containerRef} className="w-full h-full" {...props} />;
};

export default LiquidChrome;
