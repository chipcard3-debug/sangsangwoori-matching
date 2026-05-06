'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

const REGIONS = ['서울', '경기', '인천', '기타'] as const
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
    const { error } = await supabase.from('seniors').insert({
      name: name.trim(),
      region,
      desired_job: desiredJob,
      career_years: careerYears ? parseInt(careerYears, 10) : 0,
    })
    setSubmitting(false)

    if (error) {
      setErrors({ name: `저장 오류: ${error.message}` })
      return
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
      <h1 className="text-4xl font-bold mb-2 text-gray-900">시니어 프로필 등록</h1>
      <p className="text-xl text-gray-600 mb-8">정보를 입력하시면 맞춤 일자리를 추천해 드립니다.</p>

      {success && (
        <div className="mb-6 p-5 bg-green-50 border-2 border-green-500 rounded-xl text-green-800 text-xl font-semibold">
          ✓ 등록이 완료되었습니다
        </div>
      )}

      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-gray-800">기본 정보 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xl font-semibold text-gray-800">
                이름 <span className="text-red-500">*</span>
              </Label>
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

            {/* 지역 */}
            <div className="space-y-2">
              <Label htmlFor="region" className="text-xl font-semibold text-gray-800">
                지역 <span className="text-red-500">*</span>
              </Label>
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

            {/* 희망 직종 */}
            <div className="space-y-2">
              <Label htmlFor="desired_job" className="text-xl font-semibold text-gray-800">
                희망 직종 <span className="text-red-500">*</span>
              </Label>
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

            {/* 경력 */}
            <div className="space-y-2">
              <Label htmlFor="career_years" className="text-xl font-semibold text-gray-800">
                경력 (년)
              </Label>
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
              {submitting ? '저장 중...' : '프로필 등록하기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
