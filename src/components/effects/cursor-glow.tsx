"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    let rafId: number;
    const animate = () => {
      // Smooth follow (easing)
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.15;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.15;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${posRef.current.x - 250}px, ${posRef.current.y - 250}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 w-[500px] h-[500px] z-[1] will-change-transform hidden md:block"
      style={{
        background: `radial-gradient(circle, 
          rgba(236, 72, 153, 0.15) 0%, 
          rgba(109, 40, 217, 0.1) 30%, 
          transparent 60%)`,
        filter: "blur(40px)",
      }}
    />
  );
}