export function LoadingPokeball() {
  return (
    <div className="relative">
      {/* Outer glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-md opacity-30 animate-pulse"></div>

      {/* Main sphere container with spinning animation */}
      <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full shadow-lg animate-spin">
        {/* Inner sphere highlight */}
        <div className="absolute top-1 left-1 w-4 h-4 bg-white/40 rounded-full blur-sm"></div>

        {/* Pokéball center line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/60 transform -translate-y-0.5"></div>

        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-inner">
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Wireframe overlay */}
        <div className="absolute inset-0 rounded-full border border-white/20"></div>

        {/* Animated pulse ring */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-300/50 animate-ping"></div>
      </div>
    </div>
  )
}
