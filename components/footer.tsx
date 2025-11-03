import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
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
          <p className="text-sm text-muted-foreground">© CVE LabHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
