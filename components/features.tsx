import { Laptop, BookOpen, Globe, Target, Shield, Zap } from "lucide-react"

const features = [
  {
    icon: Laptop,
    title: "Learn by doing",
    description: "실습을 통해 직접 실행하며 배우는 효과적인 학습 방법",
  },
  {
    icon: BookOpen,
    title: "Guided learning",
    description: "체계적인 커리큘럼과 단계별 학습 경로로 전문성 강화",
  },
  {
    icon: Globe,
    title: "Real-world training",
    description: "실제 환경과 동일한 시나리오로 실전 감각 향상",
  },
  {
    icon: Target,
    title: "Engaging lessons",
    description: "실무 중심의 인터랙티브 학습으로 높은 교육 효과 달성",
  },
  {
    icon: Shield,
    title: "Online on-demand",
    description: "언제 어디서나 원하는 시간에 학습 가능한 온라인 플랫폼",
  },
  {
    icon: Zap,
    title: "Cost-effective",
    description: "효율적인 비용으로 조직 전체의 보안 교육 제공",
  },
]

export function Features() {
  return (
    <section className="py-8 w-full">
      <div className="text-center mb-6 space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Real-world offensive & defensive cyber security training
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          {/* 실전 기반 실습 랩과 체계적인 학습 경로를 제공합니다. <br/> */}
          최신 위협 동향을 반영한 시나리오로 보안팀의 실무 역량을 극대화합니다.
        </p>
      </div>
    </section>
  )
}

