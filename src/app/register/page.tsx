import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-gray-900">시니어 프로필 등록</h1>
      <p className="text-xl text-gray-600 mb-8">정보를 입력하시면 맞춤 일자리를 추천해 드립니다.</p>

      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-gray-800">기본 정보 입력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xl font-semibold text-gray-800">
              이름
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              className="h-14 text-xl border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region" className="text-xl font-semibold text-gray-800">
              거주 지역
            </Label>
            <Input
              id="region"
              type="text"
              placeholder="서울 강남구"
              className="h-14 text-xl border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desired_job" className="text-xl font-semibold text-gray-800">
              희망 직종
            </Label>
            <Input
              id="desired_job"
              type="text"
              placeholder="경비원, 청소원, 요양보호사 등"
              className="h-14 text-xl border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="career_years" className="text-xl font-semibold text-gray-800">
              경력 (년)
            </Label>
            <Input
              id="career_years"
              type="number"
              placeholder="10"
              min={0}
              className="h-14 text-xl border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4"
              disabled
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-16 text-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl mt-4"
            disabled
          >
            프로필 등록하기
          </Button>

          <p className="text-center text-gray-500 text-base">
            ※ 기능은 다음 단계에서 구현됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
