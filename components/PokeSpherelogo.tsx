export function PokeSpherelogo() {
  return (
    <div className="flex items-center gap-3 group">
      <div className="relative">
        {/* Outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

        {/* Main sphere container */}
        <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
          {/* Inner sphere highlight */}
          <div className="absolute top-1 left-1 w-3 h-3 bg-white/40 rounded-full blur-sm"></div>

          {/* Pokéball center line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/60 transform -translate-y-0.5"></div>

          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-inner">
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-gray-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Wireframe overlay */}
          <div className="absolute inset-0 rounded-full border border-white/20"></div>

          {/* Animated pulse ring */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-300/50 animate-ping"></div>
        </div>
      </div>

      {/* Site name with enhanced typography */}
      <div className="flex flex-col justify-center ml-1">
        <div className="flex items-baseline mt-1">
          <span className="font-black text-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-indigo-500 transition-all duration-300">
            Poké
          </span>
          <span className="font-black text-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent group-hover:from-purple-500 group-hover:via-indigo-500 group-hover:to-blue-500 transition-all duration-300">
            Sphere
          </span>
        </div>
      </div>
    </div>
  )
}
