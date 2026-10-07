export function CosmicLoader() {
  return (
    <div className="fixed inset-0 bg-space-deep z-[999] flex items-center justify-center">
      <div className="relative w-32 h-32">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-cosmic-purple/30 animate-orbit-slow" />
        
        {/* Middle ring */}
        <div
          className="absolute inset-4 rounded-full border-2 border-cosmic-pink/40 animate-orbit-slow"
          style={{ animationDirection: "reverse", animationDuration: "3s" }}
        />
        
        {/* Inner core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmic-pink to-cosmic-purple shadow-[0_0_30px_rgba(236,72,153,0.8)] animate-pulse" />
        </div>

        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-orbit-slow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cosmic-pink shadow-[0_0_10px_rgba(236,72,153,1)]" />
        </div>
        <div
          className="absolute inset-4 animate-orbit-slow"
          style={{ animationDirection: "reverse", animationDuration: "3s" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cosmic-purple shadow-[0_0_8px_rgba(109,40,217,1)]" />
        </div>
      </div>
    </div>
  );
}