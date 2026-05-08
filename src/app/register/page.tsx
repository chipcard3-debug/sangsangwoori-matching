'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Pencil, Trash2, Check, X } from 'lucide-react'

const REGIONS = ['서울', '경기', '인천', '기타'] as const
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'] as const

type FormErrors = Partial<Record<'name' | 'region' | 'desired_job', string>>
type Senior = {
  id: string
  name: string
  region: string
  desired_job: string
  career_years: number
}

const SELECT_CLS = (hasError: boolean) =>
  `w-full h-14 text-xl border-2 rounded-lg px-4 bg-white focus:outline-none focus:border-blue-500 ${
    hasError ? 'border-red-400' : 'border-gray-300'
  }`

const EDIT_SELECT_CLS =
  'w-full h-12 text-lg border-2 border-gray-300 rounded-lg px-3 bg-white focus:outline-none focus:border-blue-500'

export default function RegisterPage() {
  // ── 탭 ────────────────────────────────────────────────
  const [tab, setTab] = useState<'form' | 'list'>('list')

  // ── 등록 폼 ───────────────────────────────────────────
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

  // ── 프로필 목록 ───────────────────────────────────────
  const [seniors, setSeniors] = useState<Senior[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editRegion, setEditRegion] = useState('')
  const [editJob, setEditJob] = useState('')
  const [editCareer, setEditCareer] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const fetchSeniors = useCallback(async () => {
    setLoadingList(true)
    const { data } = await supabase.from('seniors').select('*').order('name')
    setLoadingList(false)
    if (data) setSeniors(data as Senior[])
  }, [])

  useEffect(() => { fetchSeniors() }, [fetchSeniors])

  const switchTab = (t: 'form' | 'list') => {
    setTab(t)
    setSuccess(false)
    if (t === 'list') fetchSeniors()
  }

  const startEdit = (s: Senior) => {
    setEditingId(s.id)
    setEditName(s.name)
    setEditRegion(s.region)
    setEditJob(s.desired_job)
    setEditCareer(String(s.career_years))
    setConfirmDeleteId(null)
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return
    setSaving(true)
    await supabase
      .from('seniors')
      .update({
        name: editName.trim(),
        region: editRegion,
        desired_job: editJob,
        career_years: parseInt(editCareer, 10) || 0,
      })
      .eq('id', id)
    await supabase.rpc('recalculate_matches_for_senior', { p_senior_id: id })
    setSaving(false)
    setEditingId(null)
    fetchSeniors()
  }

  const deleteSenior = async (id: string) => {
    await supabase.from('seniors').delete().eq('id', id)
    setSeniors((prev) => prev.filter((s) => s.id !== id))
    setConfirmDeleteId(null)
  }

  // ── 렌더 ──────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">시니어 일자리 신청하기</h1>
      <p className="text-xl text-gray-600 mb-6">정보를 입력하시면 맞춤 일자리를 연결해 드립니다.</p>

      {/* 탭 버튼 */}
      <div className="flex gap-3 mb-8">
        <Button
          type="button"
          onClick={() => switchTab('form')}
          className={`h-12 px-6 text-lg font-semibold rounded-xl ${
            tab === 'form'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          신청하기
        </Button>
        <Button
          type="button"
          onClick={() => switchTab('list')}
          className={`h-12 px-6 text-lg font-semibold rounded-xl ${
            tab === 'list'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          프로필 조회·수정
        </Button>
      </div>

      {/* ── 신청 폼 ─────────────────────────────────────── */}
      {tab === 'form' && (
        <>
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

                {/* 이름 */}
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

                {/* 지역 */}
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

                {/* 희망 직종 */}
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

                {/* 경력 */}
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
        </>
      )}

      {/* ── 프로필 조회·수정·삭제 ──────────────────────── */}
      {tab === 'list' && (
        <div className="space-y-4">
          {loadingList ? (
            <p className="text-xl text-gray-500 text-center py-12">불러오는 중...</p>
          ) : seniors.length === 0 ? (
            <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-xl text-yellow-800 text-xl">
              등록된 프로필이 없습니다.
            </div>
          ) : (
            seniors.map((s) =>
              editingId === s.id ? (
                /* 수정 폼 */
                <Card key={s.id} className="border-2 border-blue-300 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl text-blue-700">프로필 수정</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-lg font-semibold text-gray-700">이름</Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-12 text-lg border-2 border-gray-300 rounded-lg px-4"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-lg font-semibold text-gray-700">지역</Label>
                        <select
                          value={editRegion}
                          onChange={(e) => setEditRegion(e.target.value)}
                          className={EDIT_SELECT_CLS}
                        >
                          <option value="">선택</option>
                          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-lg font-semibold text-gray-700">희망 직종</Label>
                        <select
                          value={editJob}
                          onChange={(e) => setEditJob(e.target.value)}
                          className={EDIT_SELECT_CLS}
                        >
                          <option value="">선택</option>
                          {JOB_TYPES.map((j) => <option key={j} value={j}>{j}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-lg font-semibold text-gray-700">경력 (년)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={editCareer}
                        onChange={(e) => setEditCareer(e.target.value)}
                        className="h-12 text-lg border-2 border-gray-300 rounded-lg px-4"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        onClick={() => saveEdit(s.id)}
                        disabled={saving}
                        className="h-12 px-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                      >
                        <Check className="w-5 h-5 mr-1" />
                        {saving ? '저장 중...' : '저장'}
                      </Button>
                      <Button
                        type="button"
                        onClick={cancelEdit}
                        className="h-12 px-6 text-lg font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
                      >
                        <X className="w-5 h-5 mr-1" />
                        취소
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* 조회 카드 */
                <Card key={s.id} className="border-2 border-gray-200 shadow-sm">
                  <CardContent className="py-5 px-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{s.name}</p>
                        <p className="text-lg text-gray-600 mt-1">
                          {s.region} · {s.desired_job} · 경력 {s.career_years}년
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          type="button"
                          onClick={() => { setConfirmDeleteId(null); startEdit(s) }}
                          className="h-11 px-4 text-base font-semibold border-2 border-blue-300 text-blue-700 bg-white hover:bg-blue-50 rounded-xl"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          수정
                        </Button>
                        {confirmDeleteId === s.id ? (
                          <Button
                            type="button"
                            onClick={() => deleteSenior(s.id)}
                            className="h-11 px-4 text-base font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            삭제 확인
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => { setEditingId(null); setConfirmDeleteId(s.id) }}
                            className="h-11 px-4 text-base font-semibold border-2 border-red-300 text-red-600 bg-white hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            삭제
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )
          )}
        </div>
      )}
    </div>
  )
}
