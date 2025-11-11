import { Hero } from "@/components/hero"
import { NewsHighlights } from "@/components/news-highlights"

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem-8rem)] grid place-items-center px-6 py-10">
      <div className="mx-auto max-w-7xl w-full">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          <div className="w-full lg:w-1/2">
            <Hero />
          </div>
          <div className="w-full lg:w-1/2">
            <NewsHighlights />
          </div>
        </div>
      </div>
    </div>
  )
}
