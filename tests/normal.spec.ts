/**
 * 정상 시나리오: 시니어 등록 → 6점 금색 배지 카드가 추천 상단에 표시된다.
 *
 * 스코어링 규칙 (recalculate_matches_for_senior):
 *   region 일치 +3 / job_type 일치 +2 / career_years >= required_career +1 → 최대 6점
 *
 * 시니어: 서울 / 경비 / 5년
 * 공고:   서울 / 경비 / required_career 3년
 * → 3 + 2 + 1 = 6점 (금색 배지)
 */

import { test, expect } from '@playwright/test'
import { resetDb, insertJob, getOnlySenior } from './helpers/db'

test.beforeEach(async () => {
  await resetDb()
  await insertJob({
    title: '서울 아파트 경비원',
    region: '서울',
    job_type: '경비',
    required_career: 3,
  })
})

test('시니어 등록 후 6점 금색 배지 카드가 추천 상단에 표시된다', async ({ page }) => {
  await page.goto('/register')

  await page.fill('#name', '테스트시니어')
  await page.selectOption('#region', '서울')
  await page.selectOption('#desired_job', '경비')
  await page.fill('#career_years', '5')

  await page.click('button[type="submit"]')

  // 등록 성공 메시지 확인
  await expect(page.locator('text=등록이 완료되었습니다')).toBeVisible()

  // beforeEach에서 테이블을 비웠으므로 테이블에 정확히 1건 존재
  const senior = await getOnlySenior()

  // 추천 페이지로 이동
  await page.goto(`/recommendations?senior_id=${senior.id}`)

  // 6점 금색(amber) 배지가 가장 먼저 보여야 함
  const goldBadge = page.locator('.bg-amber-400').first()
  await expect(goldBadge).toBeVisible()
  await expect(goldBadge).toContainText('6점')
})
