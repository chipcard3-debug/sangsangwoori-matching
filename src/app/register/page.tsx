'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MapPin, Briefcase, Clock, User, CheckCircle2, ChevronRight } from 'lucide-react'

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '기타'] as const
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'] as const

type FormErrors = Partial<Record<'name' | 'region' | 'desired_job', string>>

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

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">등록 완료!</h2>
            <p className="text-lg text-gray-500">담당자가 곧 연락드립니다.</p>
          </div>
          <button
            onClick={() => setSuccess(false)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-md"
          >
            추가 등록하기 <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">

      {/* ── 헤더 ── */}
      <div className="mb-10 text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-base font-semibold mb-4 border border-blue-100">
          일자리 신청
        </span>
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-3">
          맞춤 일자리를<br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            지금 바로 신청하세요
          </span>
        </h1>
        <p className="text-lg text-gray-500">
          정보를 입력하시면 딱 맞는 일자리를 연결해 드립니다.
        </p>
      </div>

      {/* ── 폼 카드 ── */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* 카드 상단 그라디언트 바 */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <form onSubmit={handleSubmit} className="p-8 space-y-7">

          {/* 이름 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
              <User className="w-4 h-4 text-blue-500" />
              이름 <span className="text-red-500">*</span>
            </label>
            {errors.name && (
              <p className="text-sm text-red-500 font-medium">{errors.name}</p>
            )}
            <input
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full h-13 text-xl px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] ${
                errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>

          {/* 지역 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
              <MapPin className="w-4 h-4 text-blue-500" />
              지역 <span className="text-red-500">*</span>
            </label>
            {errors.region && (
              <p className="text-sm text-red-500 font-medium">{errors.region}</p>
            )}
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={`w-full h-13 text-xl px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] appearance-none cursor-pointer ${
                errors.region ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            >
              <option value="">어디에서 일하고 싶으세요?</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* 희망 직종 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
              <Briefcase className="w-4 h-4 text-blue-500" />
              희망 직종 <span className="text-red-500">*</span>
            </label>
            {errors.desired_job && (
              <p className="text-sm text-red-500 font-medium">{errors.desired_job}</p>
            )}
            <div className="grid grid-cols-5 gap-2">
              {JOB_TYPES.map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => setDesiredJob(j)}
                  className={`py-3 rounded-xl text-base font-semibold border-2 transition-all duration-150 ${
                    desiredJob === j
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 scale-105'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {j}
                </button>
              ))}
            </div>
          </div>

          {/* 경력 */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
              <Clock className="w-4 h-4 text-blue-500" />
              경력 (년)
              <span className="text-gray-400 font-normal text-sm">— 없으면 0</span>
            </label>
            <input
              type="number"
              placeholder="0"
              min={0}
              value={careerYears}
              onChange={(e) => setCareerYears(e.target.value)}
              className="w-full h-13 text-xl px-4 py-3 rounded-xl border-2 border-gray-200 outline-none transition-all duration-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              '저장 중...'
            ) : (
              <>
                등록하기 <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

        </form>
      </div>

      {/* 하단 안내 */}
      <p className="text-center text-gray-400 text-base mt-6">
        등록 후 담당자가 직접 연락드립니다.
      </p>
    </div>
  )
}
