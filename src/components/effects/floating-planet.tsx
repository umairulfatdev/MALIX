"use client";

export function FloatingPlanet() {
  return (
    <div className="absolute top-24 right-12 md:top-32 md:right-24 pointer-events-none z-[2]">
      <div className="relative w-32 h-32 md:w-48 md:h-48 animate-float-planet">
        {/* Planet body */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, 
              rgba(236, 72, 153, 0.9) 0%, 
              rgba(139, 92, 246, 0.8) 30%, 
              rgba(109, 40, 217, 0.9) 60%, 
              rgba(10, 14, 39, 0.95) 100%)`,
            boxShadow: `
              inset -20px -20px 60px rgba(0,0,0,0.5),
              inset 20px 20px 40px rgba(236, 72, 153, 0.4),
              0 0 80px rgba(236, 72, 153, 0.5),
              0 0 120px rgba(109, 40, 217, 0.3)
            `,
          }}
        />

        {/* Surface texture dots */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute top-[20%] left-[30%] w-2 h-2 rounded-full bg-cosmic-purple/40" />
          <div className="absolute top-[50%] left-[60%] w-3 h-3 rounded-full bg-cosmic-purple/30" />
          <div className="absolute top-[70%] left-[25%] w-1.5 h-1.5 rounded-full bg-cosmic-purple/50" />
          <div className="absolute top-[35%] left-[70%] w-2 h-2 rounded-full bg-cosmic-pink/30" />
        </div>

        {/* Atmosphere glow */}
        <div
          className="absolute -inset-4 rounded-full animate-pulse-slow"
          style={{
            background: `radial-gradient(circle, 
              rgba(236, 72, 153, 0.3) 0%, 
              transparent 60%)`,
            filter: "blur(20px)",
          }}
        />

        {/* Ring around planet */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] h-[40%] rounded-full border-2 border-cosmic-pink/40 animate-orbit-ring"
          style={{
            transform: "translate(-50%, -50%) rotateX(70deg)",
            boxShadow: "0 0 20px rgba(236, 72, 153, 0.3)",
          }}
        />
      </div>
    </div>
  );
}