import { Hero } from "@/components/hero"
import { NewsHighlights } from "@/components/news-highlights"
import { Features } from "@/components/features"

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-[#0b1120] text-white">
      
      {/* Hero Section */}
      <div className="relative w-full">
          {/* Background Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-[100%] blur-[120px] pointer-events-none" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
             <Hero />
          </div>
      </div>

      {/* Features Section */}
      <div className="relative w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Features />
        </div>
      </div>
      
      {/* News Section */}
      <div className="relative w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
           <NewsHighlights />
        </div>
      </div>

    </div>
  )
}
