'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Pencil, Trash2, Check, X } from 'lucide-react'

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '기타'] as const
const JOB_TYPES = ['경비', '청소', '조리', '돌봄', '기타'] as const

type Senior = {
  id: string
  name: string
  region: string
  desired_job: string
  career_years: number
}

const EDIT_SELECT_CLS =
  'w-full h-12 text-lg border-2 border-gray-300 rounded-lg px-3 bg-white focus:outline-none focus:border-blue-500'

export default function SeniorsPage() {
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">프로필 조회·수정</h1>
      <p className="text-xl text-gray-600 mb-8">등록된 시니어 프로필을 확인하고 수정하세요.</p>

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
    </div>
  )
}
