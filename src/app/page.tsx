import Link from 'next/link'
import { UserPlus, ListChecks, LayoutDashboard, ChevronRight, MapPin, Briefcase, Star } from 'lucide-react'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">

      {/* ── Hero ── */}
      <div className="text-center py-16">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-base font-semibold mb-6 border border-blue-100">
          시니어 일자리 매칭 플랫폼
        </span>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-5">
          딱 맞는 일자리를<br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            상상우리가 연결합니다
          </span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
          지역·직종·경력을 입력하면 맞춤 일자리를 자동으로 추천해 드립니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-blue-200"
          >
            지금 신청하기 <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="/recommendations"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xl font-bold text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-150 shadow-sm"
          >
            추천 목록 보기
          </Link>
        </div>
      </div>

      {/* ── 특징 카드 3개 ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          {
            icon: MapPin,
            color: 'from-blue-500 to-blue-600',
            shadow: 'shadow-blue-200',
            title: '지역 맞춤',
            desc: '서울·경기·인천·5대 광역시 등 원하는 지역의 일자리만 추천합니다.',
          },
          {
            icon: Briefcase,
            color: 'from-indigo-500 to-purple-600',
            shadow: 'shadow-indigo-200',
            title: '직종 매칭',
            desc: '경비·청소·조리·돌봄 등 희망 직종에 딱 맞는 공고를 연결합니다.',
          },
          {
            icon: Star,
            color: 'from-amber-400 to-orange-500',
            shadow: 'shadow-amber-200',
            title: '자동 점수화',
            desc: '지역·직종·경력을 종합해 최고 6점 기준으로 최적 일자리를 추천합니다.',
          },
        ].map((c) => (
          <div
            key={c.title}
            className="bg-white rounded-2xl border border-gray-100 shadow-md p-7 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} shadow-md ${c.shadow} flex items-center justify-center`}>
              <c.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{c.title}</h3>
              <p className="text-base text-gray-500 leading-relaxed">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 빠른 이동 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">바로가기</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                href: '/register',
                icon: UserPlus,
                label: '프로필 등록',
                desc: '일자리 신청서 작성',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                border: 'hover:border-blue-300',
              },
              {
                href: '/recommendations',
                icon: ListChecks,
                label: '추천 목록',
                desc: '내게 맞는 일자리 확인',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                border: 'hover:border-indigo-300',
              },
              {
                href: '/admin',
                icon: LayoutDashboard,
                label: '관리자',
                desc: '매칭 현황 대시보드',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                border: 'hover:border-purple-300',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 p-5 rounded-xl border-2 border-gray-100 ${item.border} hover:shadow-md transition-all duration-150 group`}
              >
                <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className={`text-base font-bold ${item.color}`}>{item.label}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
