import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PLACEHOLDER_ITEMS = [
  { rank: 1, score: 95 },
  { rank: 2, score: 87 },
  { rank: 3, score: 76 },
];

export default function RecommendationsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">추천 일자리 목록</h1>
      <p className="text-xl text-gray-600 mb-8">매칭 점수 높은 순서로 표시됩니다.</p>

      <div className="space-y-4">
        {PLACEHOLDER_ITEMS.map((item) => (
          <Card
            key={item.rank}
            className="border-2 border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-gray-800">
                  #{item.rank} 일자리 제목 (준비 중)
                </CardTitle>
                <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800 font-bold rounded-full border-0">
                  점수 {item.score}점
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-lg text-gray-600">
                <div>
                  <span className="font-semibold text-gray-800">지역:</span>{" "}
                  <span className="text-gray-500">— 준비 중 —</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">직종:</span>{" "}
                  <span className="text-gray-500">— 준비 중 —</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">요구 경력:</span>{" "}
                  <span className="text-gray-500">— 준비 중 —</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">매칭 상태:</span>{" "}
                  <Badge variant="outline" className="text-base border-gray-400 text-gray-600">
                    미배정
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-center text-gray-400 text-base mt-8">
        ※ 실제 데이터 연동 및 매칭 로직은 다음 단계에서 구현됩니다.
      </p>
    </div>
  );
}
