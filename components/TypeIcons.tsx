const TypeIcons: { [key: string]: React.ReactNode } = {
  normal: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-gray-400">
      <path d="M481 256C481 380.264 380.264 481 256 481C131.736 481 31 380.264 31 256C31 131.736 131.736 31 256 31C380.264 31 481 131.736 481 256Z" />
    </svg>
  ),
  fire: (
    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fire-type.jpg-0pAKYvW6LwrLcpVgrGZPJXCwbpPtbj.jpeg" alt="Fire type" className="w-4 h-4 rounded-full" />
  ),
  water: (
    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/water-typw.jpg-oxKJSTUp52lIp3k2MmOVAIGkjlk4xG.jpeg" alt="Water type" className="w-4 h-4 rounded-full" />
  ),
  electric: (
    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Electric-Type-HaykDZA7CdTFHEaaI1FcpH2cvuqaiN.png" alt="Electric type" className="w-4 h-4 rounded-full" />
  ),
  grass: (
    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/grass-type.png-M64pv8B8oqbGylZtlLsUUbV2c5o8S0.jpeg" alt="Grass type" className="w-4 h-4 rounded-full" />
  ),
  fighting: (
    <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fightting-type-ISe72RD3zYYdWZheHAvAPToBYRgOSt.png" alt="Fighting type" className="w-4 h-4 rounded-full" />
  ),
  ice: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-blue-200">
      <path d="M384 32H128L0 224l128 192h256l128-192L384 32zM256 384c-70.7 0-128-57.3-128-128s57.3-128 128-128 128 57.3 128 128-57.3 128-128 128z" />
    </svg>
  ),
  poison: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-purple-500">
      <path d="M256 16C149.9 16 64 101.9 64 208c0 93.8 67.3 171.5 156.1 188.1l-51.4 51.4C145.5 470.7 176 512 220.7 512h70.6c44.7 0 75.2-41.3 52.1-64.5l-51.4-51.4C380.7 379.5 448 301.8 448 208 448 101.9 362.1 16 256 16zM160 208c0-53 43-96 96-96s96 43 96 96-43 96-96 96-96-43-96-96z" />
    </svg>
  ),
  ground: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-yellow-600">
      <path d="M512 256L256 512 0 256 256 0z" />
    </svg>
  ),
  flying: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-indigo-400">
      <path d="M256 0C149.3 0 56.2 56.2 0 144c80.3-32.1 169.2-16 232.9 47.7C296.6 255.4 312.7 344.3 280.6 424.6c87.8-56.2 144-153.3 144-260C424.6 73.7 350.9 0 256 0z" />
    </svg>
  ),
  psychic: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-pink-500">
      <path d="M256 0C155.1 0 76.4 78.7 76.4 179.6c0 69.7 64.5 133.1 168.2 199.4L256 512l11.4-133c103.6-66.3 168.2-129.7 168.2-199.4C435.6 78.7 356.9 0 256 0z" />
    </svg>
  ),
  bug: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-green-700">
      <path d="M128 96c-8.8 0-16 7.2-16 16v64h16c8.8 0 16-7.2 16-16V112h16v64c0 8.8 7.2 16 16 16h16v32H160c-8.8 0-16 7.2-16 16v16H64c-8.8 0-16 7.2-16 16v64h448v-64c0-8.8-7.2-16-16-16h-80v-16c0-8.8-7.2-16-16-16h-48v-32h48c8.8 0 16-7.2 16-16v-64h16v64c0 8.8 7.2 16 16 16h16V112c0-8.8-7.2-16-16-16H128z" />
    </svg>
  ),
  rock: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-yellow-700">
      <path d="M256 16L128 128l64 112-112 48L16 480h480L352 192l64-64L256 16z" />
    </svg>
  ),
  ghost: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-purple-700">
      <path d="M256 0C153.6 0 64 90.6 64 192c0 84.8 52.6 157.2 128 184v112h-48l48 32 48-32h128l48 32 48-32h-48V376c75.4-26.8 128-99.2 128-184C448 90.6 358.4 0 256 0z" />
    </svg>
  ),
  dragon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-indigo-700">
      <path d="M256 32l96 96-32 32 64 96-160 96L256 352 192 288l-64 64-64-128 128-64L256 32z" />
    </svg>
  ),
  dark: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-black">
      <path d="M283.2 0c15.6 0 31.1 1.5 46.3 4.6-57.7 37.2-94.2 101.8-94.2 175.4 0 117.6 95.6 213.2 213.2 213.2 38.8 0 75.3-10.5 106.9-28.9C511.1 420.9 492 429 471.3 429 359.7 429 271.2 340.5 271.2 228.9 271.2 144.6 321.2 73.5 390.4 36.9 365.8 14.8 324.6 0 283.2 0z" />
    </svg>
  ),
  steel: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-gray-500">
      <path d="M256 32C150.1 32 64 118.1 64 224s86.1 192 192 192 192-86.1 192-192S361.9 32 256 32zm0 288c-53 0-96-43-96-96s43-96 96-96 96 43 96 96-43 96-96 96z" />
    </svg>
  ),
  fairy: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-4 h-4 fill-pink-300">
      <path d="M256 0c141.4 0 256 114.6 256 256s-114.6 256-256 256S0 397.4 0 256 114.6 0 256 0zM96 256h96v32H96v-32zm224-32v64h64v-64h-64z" />
    </svg>
  ),
};

export default TypeIcons;

