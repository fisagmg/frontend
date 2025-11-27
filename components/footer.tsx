import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground/70">
            <div className="flex items-center gap-2">
              <span className="font-medium">Contact:</span>
              <a href="mailto:contact@cvelabhub.io" className="hover:text-foreground transition-colors">
                contact@cvelabhub.io
              </a>
            </div>
            <span className="hidden sm:inline">|</span>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              이용약관
            </Link>
            <span className="hidden sm:inline">|</span>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              개인정보처리방침
            </Link>
          </div>
          <p className="text-xs text-muted-foreground/50">© CVE LabHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
