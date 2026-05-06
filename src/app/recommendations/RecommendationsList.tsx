'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

type Senior = {
  id: string
  name: string
  region: string
  desired_job: string
  career_years: number
}

type MatchWithJob = {
  id: string
  score: number
  status: string
  jobs: {
    title: string
    region: string
    job_type: string
    required_career: number
  } | null
}

function scoreBadgeCls(score: number): string {
  if (score === 6) return 'bg-amber-400 text-amber-900'
  if (score >= 4) return 'bg-green-100 text-green-800'
  return 'bg-gray-100 text-gray-600'
}

function statusLabel(status: string): string {
  if (status === 'assigned') return '배정 완료'
  if (status === 'done') return '완료'
  return '매칭 대기'
}

export default function RecommendationsList() {
  const params = useSearchParams()
  const router = useRouter()
  const seniorId = params.get('senior_id')

  const [senior, setSenior] = useState<Senior | null>(null)
  const [matches, setMatches] = useState<MatchWithJob[]>([])
  const [seniors, setSeniors] = useState<Senior[]>([])
  const [loading, setLoading] = useState(false)

  // senior_id 없을 때: 시니어 목록 로드
  useEffect(() => {
    if (seniorId) return
    supabase.from('seniors').select('*').then(({ data }) => {
      if (data) setSeniors(data)
    })
  }, [seniorId])

  // senior_id 있을 때: 해당 시니어 매칭 로드
  useEffect(() => {
    if (!seniorId) return
    setLoading(true)
    Promise.all([
      supabase.from('seniors').select('*').eq('id', seniorId).single(),
      supabase
        .from('matches')
        .select('id, score, status, jobs(title, region, job_type, required_career)')
        .eq('senior_id', seniorId)
        .gt('score', 0)
        .order('score', { ascending: false }),
    ]).then(([{ data: s }, { data: m }]) => {
      setSenior(s)
      setMatches((m as unknown as MatchWithJob[]) || [])
      setLoading(false)
    })
  }, [seniorId])

  // 시니어 선택 화면
  if (!seniorId) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gray-900">추천 일자리 목록</h1>
        <p className="text-xl text-gray-600 mb-8">
          시니어를 선택하면 맞춤 일자리를 보여드립니다.
        </p>

        {seniors.length === 0 ? (
          <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl text-yellow-800 text-xl">
            등록된 시니어가 없습니다. 먼저 프로필을 등록해 주세요.
          </div>
        ) : (
          <div className="space-y-3">
            {seniors.map((s) => (
              <Card
                key={s.id}
                className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => router.push(`/recommendations?senior_id=${s.id}`)}
              >
                <CardContent className="flex items-center justify-between py-5 px-6">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{s.name}</p>
                    <p className="text-lg text-gray-600 mt-1">
                      {s.region} · {s.desired_job} · 경력 {s.career_years}년
                    </p>
                  </div>
                  <Button className="text-lg h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    추천 보기 →
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // 매칭 결과 화면
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.push('/recommendations')}
        className="mb-4 text-lg text-blue-600 hover:underline"
      >
        ← 다른 시니어 보기
      </button>

      <h1 className="text-4xl font-bold mb-2 text-gray-900">추천 일자리 목록</h1>
      {senior && (
        <p className="text-xl text-gray-600 mb-8">
          <span className="font-bold text-gray-900">{senior.name}</span>님 (
          {senior.region} · {senior.desired_job} · 경력 {senior.career_years}년)
        </p>
      )}

      {loading ? (
        <p className="text-xl text-gray-500 text-center py-12">불러오는 중...</p>
      ) : matches.length === 0 ? (
        <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-xl text-blue-800 text-xl font-semibold">
          현재 매칭되는 일자리가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((m, i) => (
            <Card
              key={m.id}
              className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-gray-900">
                    #{i + 1}&nbsp;{m.jobs?.title ?? '—'}
                  </CardTitle>
                  <span
                    className={`px-5 py-2 text-xl font-bold rounded-full ${scoreBadgeCls(m.score)}`}
                  >
                    {m.score}점
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-lg text-gray-700">
                  <div>
                    <span className="font-semibold text-gray-800">지역:</span>{' '}
                    {m.jobs?.region}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">직종:</span>{' '}
                    {m.jobs?.job_type}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">요구 경력:</span>{' '}
                    {m.jobs?.required_career}년
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">상태:</span>{' '}
                    <Badge
                      variant="outline"
                      className="text-base border-gray-300 text-gray-600"
                    >
                      {statusLabel(m.status)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
