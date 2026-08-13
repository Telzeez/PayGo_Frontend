import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/logo.png';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero image.webp"
          alt="Solar energy panels"
          fill
          priority
          className="object-cover object-top opacity-40 mix-blend-overlay"
          sizes="100vw"
        />
        {/* Gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-transparent z-10" />
      </div>

      <div className="relative z-20 flex flex-col items-center max-w-xl mx-auto w-full">
        <div className="flex items-center justify-center mb-8">
          <Image src={logo} alt="SolarPayMe Logo" className="w-16 h-16 object-contain rounded-2xl shadow-lg" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
          PayGo
        </h1>
        <p className="text-lg sm:text-xl text-zinc-300 mb-12 font-medium">
          The premium prepaid solar-energy metering platform. Manage your energy instantly, from anywhere.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link 
            href="/login" 
            className="w-full bg-white text-zinc-900 font-bold py-4 rounded-2xl shadow-lg hover:bg-zinc-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Sign In
          </Link>
          <Link 
            href="/login?mode=signup" 
            className="w-full bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold py-4 rounded-2xl shadow-lg hover:bg-white/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
