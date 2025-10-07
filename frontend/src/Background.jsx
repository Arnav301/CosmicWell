// StarBackground.jsx

export default function Background({ children }) {
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* White stars */}
      <div className="absolute inset-0 animate-moveStarsSlow">
        {/* ADD h-[200%] and absolute top-0 */}
        <div className="absolute top-0 w-full h-[200%] bg-[radial-gradient(white,transparent_2px)] [background-size:120px_120px] opacity-60"></div>
      </div>

      {/* Yellow stars */}
      <div className="absolute inset-0 animate-moveStarsMedium">
        {/* ADD h-[200%] and absolute top-0 */}
        <div className="absolute top-0 w-full h-[200%] bg-[radial-gradient(#FFD700,transparent_2px)] [background-size:160px_160px] opacity-70"></div>
      </div>

      {/* Purple stars */}
      <div className="absolute inset-0 animate-moveStarsFast">
        {/* ADD h-[200%] and absolute top-0 */}
        <div className="absolute top-0 w-full h-[200%] bg-[radial-gradient(#a855f7,transparent_2px)] [background-size:200px_200px] opacity-50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}