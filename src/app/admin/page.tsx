import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLUMNS = [
  {
    id: "unmatched",
    label: "미매칭",
    color: "bg-red-50 border-red-200",
    badgeClass: "bg-red-100 text-red-800",
    count: 0,
  },
  {
    id: "pending",
    label: "매칭 대기",
    color: "bg-yellow-50 border-yellow-200",
    badgeClass: "bg-yellow-100 text-yellow-800",
    count: 0,
  },
  {
    id: "assigned",
    label: "배정 완료",
    color: "bg-green-50 border-green-200",
    badgeClass: "bg-green-100 text-green-800",
    count: 0,
  },
];

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">담당자 대시보드</h1>
      <p className="text-xl text-gray-600 mb-8">매칭 현황을 한눈에 확인하고 관리합니다.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex flex-col gap-4">
            <div className={`rounded-xl border-2 p-4 ${col.color}`}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-2xl font-bold text-gray-800">{col.label}</h2>
                <Badge className={`text-lg px-3 py-1 font-bold rounded-full border-0 ${col.badgeClass}`}>
                  {col.count}건
                </Badge>
              </div>
              <p className="text-gray-500 text-base">준비 중인 항목</p>
            </div>

            <div className="flex flex-col gap-3 min-h-[240px]">
              <Card className="border-2 border-dashed border-gray-300 bg-white opacity-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-gray-400">항목 예시</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-base">시니어 이름 / 일자리 제목</p>
                  <p className="text-gray-400 text-sm mt-1">매칭 점수: — 점</p>
                </CardContent>
              </Card>

              <p className="text-center text-gray-400 text-sm mt-auto">
                데이터 연동 후 표시됩니다
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <h3 className="text-xl font-bold text-blue-800 mb-2">통계 요약</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-4xl font-bold text-gray-800">—</p>
            <p className="text-lg text-gray-600 mt-1">전체 시니어</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-gray-800">—</p>
            <p className="text-lg text-gray-600 mt-1">등록 일자리</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-gray-800">—</p>
            <p className="text-lg text-gray-600 mt-1">완료 매칭</p>
          </div>
        </div>
      </div>

      <p className="text-center text-gray-400 text-base mt-8">
        ※ 실제 데이터 연동은 다음 단계에서 구현됩니다.
      </p>
    </div>
  );
}
