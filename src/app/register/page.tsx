'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '기타'] as const
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'] as const

type FormErrors = Partial<Record<'name' | 'region' | 'desired_job', string>>

const SELECT_CLS = (hasError: boolean) =>
  `w-full h-14 text-xl border-2 rounded-lg px-4 bg-white focus:outline-none focus:border-blue-500 ${
    hasError ? 'border-red-400' : 'border-gray-300'
  }`

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [desiredJob, setDesiredJob] = useState('')
  const [careerYears, setCareerYears] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const validate = (): boolean => {
    const e: FormErrors = {}
    if (!name.trim()) e.name = '이름을 입력해 주세요.'
    if (!region) e.region = '지역을 선택해 주세요.'
    if (!desiredJob) e.desired_job = '희망 직종을 선택해 주세요.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess(false)
    if (!validate()) return

    setSubmitting(true)
    const { data: inserted, error } = await supabase
      .from('seniors')
      .insert({
        name: name.trim(),
        region,
        desired_job: desiredJob,
        career_years: careerYears ? parseInt(careerYears, 10) : 0,
      })
      .select('id')
      .single()
    setSubmitting(false)

    if (error) {
      setErrors({ name: `저장 오류: ${error.message}` })
      return
    }

    if (inserted) {
      await supabase.rpc('recalculate_matches_for_senior', { p_senior_id: inserted.id })
    }

    setSuccess(true)
    setName('')
    setRegion('')
    setDesiredJob('')
    setCareerYears('')
    setErrors({})
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">시니어 일자리 신청하기</h1>
      <p className="text-xl text-gray-600 mb-8">정보를 입력하시면 맞춤 일자리를 연결해 드립니다.</p>

      {success && (
        <div className="mb-6 p-5 bg-green-50 border-2 border-green-500 rounded-xl text-green-800 text-xl font-semibold">
          ✓ 등록이 완료되었습니다. 담당자가 곧 연락드립니다
        </div>
      )}

      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-gray-800">기본 정보 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xl font-semibold text-gray-800">
                이름 <span className="text-red-500">*</span>
              </Label>
              <p className="text-lg text-gray-500">성함을 알려주세요.</p>
              {errors.name && (
                <div className="p-3 bg-red-50 border-2 border-red-400 rounded-lg text-red-700 text-lg font-medium">
                  {errors.name}
                </div>
              )}
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`h-14 text-xl border-2 rounded-lg px-4 ${
                  errors.name ? 'border-red-400' : 'border-gray-300'
                }`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region" className="text-xl font-semibold text-gray-800">
                지역 <span className="text-red-500">*</span>
              </Label>
              <p className="text-lg text-gray-500">어디에서 일하고 싶으세요?</p>
              {errors.region && (
                <div className="p-3 bg-red-50 border-2 border-red-400 rounded-lg text-red-700 text-lg font-medium">
                  {errors.region}
                </div>
              )}
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={SELECT_CLS(!!errors.region)}
              >
                <option value="">선택해 주세요</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desired_job" className="text-xl font-semibold text-gray-800">
                희망 직종 <span className="text-red-500">*</span>
              </Label>
              <p className="text-lg text-gray-500">어떤 일을 하시겠어요?</p>
              {errors.desired_job && (
                <div className="p-3 bg-red-50 border-2 border-red-400 rounded-lg text-red-700 text-lg font-medium">
                  {errors.desired_job}
                </div>
              )}
              <select
                id="desired_job"
                value={desiredJob}
                onChange={(e) => setDesiredJob(e.target.value)}
                className={SELECT_CLS(!!errors.desired_job)}
              >
                <option value="">선택해 주세요</option>
                {JOB_TYPES.map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="career_years" className="text-xl font-semibold text-gray-800">
                경력 (년)
              </Label>
              <p className="text-lg text-gray-500">일하신 경력이 몇 년인가요? (없으면 0)</p>
              <Input
                id="career_years"
                type="number"
                placeholder="10"
                min={0}
                value={careerYears}
                onChange={(e) => setCareerYears(e.target.value)}
                className="h-14 text-xl border-2 border-gray-300 rounded-lg px-4"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full h-16 text-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              {submitting ? '저장 중...' : '등록하기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
