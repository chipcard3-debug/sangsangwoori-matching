import { Suspense } from 'react'
import RecommendationsList from './RecommendationsList'

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <p className="text-xl text-gray-500 text-center py-12">불러오는 중...</p>
      }
    >
      <RecommendationsList />
    </Suspense>
  )
}
