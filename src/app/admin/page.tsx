'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

type Job = {
  id: string
  title: string
  region: string
  job_type: string
  required_career: number
}

const REGIONS = ['서울', '경기', '인천', '기타'] as const
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'] as const

const KANBAN_COLUMNS = [
  { id: 'unmatched', label: '미매칭', color: 'bg-red-50 border-red-200', badgeClass: 'bg-red-100 text-red-800' },
  { id: 'pending', label: '매칭 대기', color: 'bg-yellow-50 border-yellow-200', badgeClass: 'bg-yellow-100 text-yellow-800' },
  { id: 'assigned', label: '배정 완료', color: 'bg-green-50 border-green-200', badgeClass: 'bg-green-100 text-green-800' },
]

type JobFormErrors = Partial<Record<'title' | 'region' | 'job_type', string>>

const SELECT_CLS = (hasError: boolean) =>
  `w-full h-12 text-lg border-2 rounded-lg px-3 bg-white focus:outline-none focus:border-blue-500 ${
    hasError ? 'border-red-400' : 'border-gray-300'
  }`

export default function AdminPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const [jobTitle, setJobTitle] = useState('')
  const [jobRegion, setJobRegion] = useState('')
  const [jobType, setJobType] = useState('')
  const [jobCareer, setJobCareer] = useState('')
  const [jobFormErrors, setJobFormErrors] = useState<JobFormErrors>({})
  const [jobSuccess, setJobSuccess] = useState(false)
  const [jobAdding, setJobAdding] = useState(false)

  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true)
    const { data } = await supabase.from('jobs').select('*')
    setLoadingJobs(false)
    if (data) setJobs(data)
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

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
    const { error } = await supabase.from('jobs').insert({
      title: jobTitle.trim(),
      region: jobRegion,
      job_type: jobType,
      required_career: jobCareer ? parseInt(jobCareer, 10) : 0,
    })
    setJobAdding(false)

    if (error) {
      setJobFormErrors({ title: `저장 오류: ${error.message}` })
      return
    }

    setJobSuccess(true)
    setJobTitle('')
    setJobRegion('')
    setJobType('')
    setJobCareer('')
    setJobFormErrors({})
    fetchJobs()
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
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">담당자 대시보드</h1>
      <p className="text-xl text-gray-600 mb-8">매칭 현황을 한눈에 확인하고 관리합니다.</p>

      {/* 칸반 (매칭 로직 연동 전 플레이스홀더) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {KANBAN_COLUMNS.map((col) => (
          <div key={col.id} className={`rounded-xl border-2 p-4 ${col.color}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">{col.label}</h2>
              <Badge className={`text-lg px-3 py-1 font-bold rounded-full border-0 ${col.badgeClass}`}>
                0건
              </Badge>
            </div>
            <p className="text-gray-500 text-sm mt-1">매칭 로직 연동 후 표시</p>
          </div>
        ))}
      </div>

      {/* 통계 요약 */}
      <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <h3 className="text-xl font-bold text-blue-800 mb-3">통계 요약</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-4xl font-bold text-gray-800">—</p>
            <p className="text-lg text-gray-600 mt-1">전체 시니어</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-gray-800">
              {loadingJobs ? '…' : jobs.length}
            </p>
            <p className="text-lg text-gray-600 mt-1">등록 일자리</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-gray-800">—</p>
            <p className="text-lg text-gray-600 mt-1">완료 매칭</p>
          </div>
        </div>
      </div>

      <hr className="my-10 border-2 border-gray-200" />

      {/* 일자리 관리 */}
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
            {/* 공고명 */}
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
              {/* 지역 */}
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
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* 직종 */}
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
                  {JOB_TYPES.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>

              {/* 요구 경력 */}
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
            <p className="text-gray-500 text-lg text-center py-8">등록된 일자리가 없습니다.</p>
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
                    <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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
