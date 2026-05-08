'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

// ─── Types ───────────────────────────────────────────────────────────────────

type MatchSummary = { score: number; status: string }

type Senior = {
  id: string
  name: string
  region: string
  desired_job: string
  career_years: number
  matches: MatchSummary[]
}

type Job = {
  id: string
  title: string
  region: string
  job_type: string
  required_career: number
}

type DerivedStatus = 'unmatched' | 'pending' | 'assigned'

type JobFormErrors = Partial<Record<'title' | 'region' | 'job_type', string>>

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSeniorStatus(matches: MatchSummary[]): DerivedStatus {
  if (!matches || matches.length === 0 || matches.every((m) => m.score === 0))
    return 'unmatched'
  if (matches.some((m) => m.status === 'assigned' || m.status === 'done'))
    return 'assigned'
  return 'pending'
}

function getMaxScore(matches: MatchSummary[]): number {
  if (!matches || matches.length === 0) return 0
  return Math.max(...matches.map((m) => m.score))
}

function statusInfo(s: DerivedStatus): { label: string; cls: string } {
  if (s === 'assigned') return { label: '배정 완료', cls: 'bg-green-100 text-green-800' }
  if (s === 'pending') return { label: '매칭 대기', cls: 'bg-yellow-100 text-yellow-800' }
  return { label: '미매칭', cls: 'bg-gray-100 text-gray-600' }
}

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '기타'] as const
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'] as const

const SELECT_CLS = (err: boolean) =>
  `w-full h-12 text-lg border-2 rounded-lg px-3 bg-white focus:outline-none focus:border-blue-500 ${
    err ? 'border-red-400' : 'border-gray-300'
  }`

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  // Seniors
  const [seniors, setSeniors] = useState<Senior[]>([])
  const [loadingSeniors, setLoadingSeniors] = useState(true)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  // Jobs
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  // Add-job form
  const [jobTitle, setJobTitle] = useState('')
  const [jobRegion, setJobRegion] = useState('')
  const [jobType, setJobType] = useState('')
  const [jobCareer, setJobCareer] = useState('')
  const [jobFormErrors, setJobFormErrors] = useState<JobFormErrors>({})
  const [jobSuccess, setJobSuccess] = useState(false)
  const [jobAdding, setJobAdding] = useState(false)

  // ─── Fetch ─────────────────────────────────────────────────────────────────

  const fetchSeniors = useCallback(async () => {
    setLoadingSeniors(true)
    const { data } = await supabase
      .from('seniors')
      .select('*, matches(score, status)')
    setLoadingSeniors(false)
    if (data) setSeniors(data as Senior[])
  }, [])

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true)
    const { data } = await supabase.from('jobs').select('*')
    setLoadingJobs(false)
    if (data) setJobs(data)
  }, [])

  useEffect(() => {
    fetchSeniors()
    fetchJobs()
  }, [fetchSeniors, fetchJobs])

  // ─── Computed stats ────────────────────────────────────────────────────────

  const unmatchedCount = seniors.filter(
    (s) => getSeniorStatus(s.matches) === 'unmatched'
  ).length
  const pendingCount = seniors.filter(
    (s) => getSeniorStatus(s.matches) === 'pending'
  ).length
  const assignedCount = seniors.filter(
    (s) => getSeniorStatus(s.matches) === 'assigned'
  ).length

  // ─── Job handlers ──────────────────────────────────────────────────────────

  const validateJobForm = (): boolean => {
    const e: JobFormErrors = {}
    if (!jobTitle.trim()) e.title = '공고명을 입력해 주세요.'
    if (!jobRegion) e.region = '지역을 선택해 주세요.'
    if (!jobType) e.job_type = '직종을 선택해 주세요.'
    setJobFormErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setJobSuccess(false)
    if (!validateJobForm()) return

    setJobAdding(true)
    const { data: inserted, error } = await supabase
      .from('jobs')
      .insert({
        title: jobTitle.trim(),
        region: jobRegion,
        job_type: jobType,
        required_career: jobCareer ? parseInt(jobCareer, 10) : 0,
      })
      .select('id')
      .single()
    setJobAdding(false)

    if (error) {
      setJobFormErrors({ title: `저장 오류: ${error.message}` })
      return
    }

    if (inserted) {
      await supabase.rpc('recalculate_matches_for_job', { p_job_id: inserted.id })
    }

    setJobSuccess(true)
    setJobTitle('')
    setJobRegion('')
    setJobType('')
    setJobCareer('')
    setJobFormErrors({})
    await Promise.all([fetchJobs(), fetchSeniors()])
  }

  const handleAssign = async (seniorId: string) => {
    setTogglingIds((prev) => new Set([...prev, seniorId]))
    await supabase
      .from('matches')
      .update({ status: 'assigned' })
      .eq('senior_id', seniorId)
      .gt('score', 0)
    await fetchSeniors()
    setTogglingIds((prev) => { const s = new Set(prev); s.delete(seniorId); return s })
  }

  const handleCancelAssign = async (seniorId: string) => {
    setTogglingIds((prev) => new Set([...prev, seniorId]))
    await supabase
      .from('matches')
      .update({ status: 'pending' })
      .eq('senior_id', seniorId)
    await fetchSeniors()
    setTogglingIds((prev) => { const s = new Set(prev); s.delete(seniorId); return s })
  }

  const handleDeleteJob = async (id: string) => {
    setDeletingIds((prev) => new Set([...prev, id]))
    await supabase.from('jobs').delete().eq('id', id)
    setDeletingIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setJobs((prev) => prev.filter((j) => j.id !== id))
    fetchSeniors() // cascade 삭제된 matches 반영
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">담당자 대시보드</h1>
      <p className="text-xl text-gray-600 mb-8">매칭 현황을 한눈에 확인하고 관리합니다.</p>

      {/* ── 집계 카드 3개 ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            label: '미매칭',
            count: unmatchedCount,
            sub: '매칭 없거나 전부 0점',
            border: 'border-red-200 bg-red-50',
            text: 'text-red-700',
            Icon: AlertTriangle,
          },
          {
            label: '매칭 대기',
            count: pendingCount,
            sub: '매칭 있음 · pending',
            border: 'border-yellow-200 bg-yellow-50',
            text: 'text-yellow-700',
            Icon: Clock,
          },
          {
            label: '배정 완료',
            count: assignedCount,
            sub: 'assigned / done',
            border: 'border-green-200 bg-green-50',
            text: 'text-green-700',
            Icon: CheckCircle2,
          },
        ].map((c) => (
          <Card key={c.label} className={`border-2 ${c.border}`}>
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center gap-2 mb-1">
                <c.Icon className={`w-6 h-6 ${c.text}`} />
                <p className={`text-lg font-semibold ${c.text}`}>{c.label}</p>
              </div>
              <p className="text-5xl font-bold text-gray-900 mt-2">
                {loadingSeniors ? '…' : c.count}
              </p>
              <p className="text-base text-gray-500 mt-1">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── 시니어 목록 테이블 ────────────────────────────────────── */}
      <Card className="border-2 border-gray-200 shadow-md mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-gray-800">
            시니어 목록{' '}
            {!loadingSeniors && (
              <span className="text-gray-500 font-normal text-xl">
                ({seniors.length}명)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSeniors ? (
            <p className="text-gray-500 text-lg text-center py-8">불러오는 중...</p>
          ) : seniors.length === 0 ? (
            <p className="text-gray-500 text-lg text-center py-8">
              등록된 시니어가 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-lg">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">이름</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">지역</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">희망 직종</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">최고 점수</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">상태</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {seniors.map((s) => {
                    const status = getSeniorStatus(s.matches)
                    const { label, cls } = statusInfo(status)
                    const maxScore = getMaxScore(s.matches)
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4 font-semibold text-gray-900">
                          {s.name}
                        </td>
                        <td className="py-4 px-4 text-gray-700">{s.region}</td>
                        <td className="py-4 px-4 text-gray-700">{s.desired_job}</td>
                        <td className="py-4 px-4">
                          <span className="text-2xl font-bold text-gray-900">
                            {maxScore}
                          </span>
                          <span className="text-gray-500 text-base ml-1">점</span>
                        </td>
                        <td className="py-4 px-4">
                          {status === 'pending' ? (
                            <button
                              onClick={() => handleAssign(s.id)}
                              disabled={togglingIds.has(s.id)}
                              className="px-3 py-1 rounded-full text-base font-semibold bg-yellow-100 text-yellow-800 border-2 border-yellow-300 hover:bg-yellow-400 hover:text-white hover:border-yellow-400 hover:shadow-md hover:scale-105 transition-all duration-150 disabled:opacity-50"
                              title="클릭하면 배정 완료로 변경"
                            >
                              {togglingIds.has(s.id) ? '처리 중…' : '매칭 대기 →'}
                            </button>
                          ) : status === 'assigned' ? (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full text-base font-semibold bg-green-100 text-green-800">
                                배정 완료
                              </span>
                              <button
                                onClick={() => handleCancelAssign(s.id)}
                                disabled={togglingIds.has(s.id)}
                                className="px-2 py-1 rounded-lg text-sm font-semibold border-2 border-red-300 text-red-600 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-md hover:scale-105 transition-all duration-150 disabled:opacity-50"
                                title="클릭하면 매칭 대기로 되돌림"
                              >
                                {togglingIds.has(s.id) ? '…' : '매칭 취소'}
                              </button>
                            </div>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-base font-semibold ${cls}`}>
                              {label}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Link href={`/recommendations?senior_id=${s.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-base font-semibold border-2 border-blue-400 text-blue-700 bg-white hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md hover:scale-105 transition-all duration-150"
                            >
                              상세 보기
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <hr className="my-10 border-2 border-gray-200" />

      {/* ── 일자리 관리 ───────────────────────────────────────────── */}
      <h2 className="text-3xl font-bold mb-6 text-gray-900">일자리 관리</h2>

      {/* 일자리 추가 폼 */}
      <Card className="border-2 border-gray-200 shadow-md mb-8">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-gray-800">일자리 추가</CardTitle>
        </CardHeader>
        <CardContent>
          {jobSuccess && (
            <div className="mb-4 p-4 bg-green-50 border-2 border-green-500 rounded-xl text-green-800 text-lg font-semibold">
              ✓ 일자리가 등록되었습니다
            </div>
          )}
          <form onSubmit={handleAddJob} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-title" className="text-lg font-semibold text-gray-800">
                공고명 <span className="text-red-500">*</span>
              </Label>
              {jobFormErrors.title && (
                <div className="p-3 bg-red-50 border-2 border-red-400 rounded-lg text-red-700 text-base font-medium">
                  {jobFormErrors.title}
                </div>
              )}
              <Input
                id="job-title"
                type="text"
                placeholder="예: 아파트 경비원"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className={`h-12 text-lg border-2 rounded-lg px-4 ${
                  jobFormErrors.title ? 'border-red-400' : 'border-gray-300'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-region" className="text-lg font-semibold text-gray-800">
                  지역 <span className="text-red-500">*</span>
                </Label>
                {jobFormErrors.region && (
                  <div className="p-2 bg-red-50 border-2 border-red-400 rounded-lg text-red-700 text-sm font-medium">
                    {jobFormErrors.region}
                  </div>
                )}
                <select
                  id="job-region"
                  value={jobRegion}
                  onChange={(e) => setJobRegion(e.target.value)}
                  className={SELECT_CLS(!!jobFormErrors.region)}
                >
                  <option value="">선택</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-type" className="text-lg font-semibold text-gray-800">
                  직종 <span className="text-red-500">*</span>
                </Label>
                {jobFormErrors.job_type && (
                  <div className="p-2 bg-red-50 border-2 border-red-400 rounded-lg text-red-700 text-sm font-medium">
                    {jobFormErrors.job_type}
                  </div>
                )}
                <select
                  id="job-type"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className={SELECT_CLS(!!jobFormErrors.job_type)}
                >
                  <option value="">선택</option>
                  {JOB_TYPES.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-career" className="text-lg font-semibold text-gray-800">
                  요구 경력 (년)
                </Label>
                <Input
                  id="job-career"
                  type="number"
                  placeholder="0"
                  min={0}
                  value={jobCareer}
                  onChange={(e) => setJobCareer(e.target.value)}
                  className="h-12 text-lg border-2 border-gray-300 rounded-lg px-4"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={jobAdding}
              className="h-12 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              {jobAdding ? '추가 중...' : '+ 일자리 추가'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 일자리 목록 */}
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-gray-800">
            등록된 일자리{' '}
            {!loadingJobs && (
              <span className="text-gray-500 font-normal text-xl">({jobs.length}건)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingJobs ? (
            <p className="text-gray-500 text-lg text-center py-8">불러오는 중...</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-500 text-lg text-center py-8">
              등록된 일자리가 없습니다.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-lg">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">공고명</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">지역</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">직종</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-700">요구 경력</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-gray-900">{job.title}</td>
                      <td className="py-4 px-4 text-gray-700">{job.region}</td>
                      <td className="py-4 px-4 text-gray-700">{job.job_type}</td>
                      <td className="py-4 px-4 text-gray-700">{job.required_career}년</td>
                      <td className="py-4 px-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingIds.has(job.id)}
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-base font-semibold px-4 py-2"
                        >
                          {deletingIds.has(job.id) ? '삭제 중...' : '삭제'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
