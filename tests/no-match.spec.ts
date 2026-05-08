/**
 * 엣지 시나리오: 조건이 전혀 맞지 않는 공고만 있을 때 "추천 없음" 안내 박스 표시.
 *
 * 스코어링:  region(3) + job_type(2) + career(1)
 *
 * 시니어:  서울 / 경비 / 3년
 * 공고:    기타 / 기타 / required_career 10년
 *   → region 불일치(0) + job_type 불일치(0) + career 미충족(3 < 10 → 0) = 0점
 *
 * [주의] spec 원문의 "기타 / 기타 / 0" 은 career +1이 붙어 score=1이 되므로
 *        매칭 카드가 표시된다. score=0 을 보장하려면 required_career > 3 이어야 한다.
 */

import { test, expect } from '@playwright/test'
import { resetDb, insertJob, getOnlySenior } from './helpers/db'

test.beforeEach(async () => {
  await resetDb()
  // score = 0 이 되도록 required_career를 시니어 career_years(3)보다 크게 설정
  await insertJob({
    title: '기타 공고',
    region: '기타',
    job_type: '기타',
    required_career: 10,
  })
})

test('조건이 전혀 맞지 않으면 추천 없음 안내 박스가 표시된다', async ({ page }) => {
  await page.goto('/register')

  await page.fill('#name', '테스트시니어')
  await page.selectOption('#region', '서울')
  await page.selectOption('#desired_job', '경비')
  await page.fill('#career_years', '3')

  await page.click('button[type="submit"]')

  await expect(page.locator('text=등록이 완료되었습니다')).toBeVisible()

  const senior = await getOnlySenior()

  await page.goto(`/recommendations?senior_id=${senior.id}`)

  await expect(page.locator('text=현재 매칭되는 일자리가 없습니다')).toBeVisible()
})
