/**
 * 실패 시나리오: 이름 비움 → 빨간 에러 박스 표시 / DB에 저장되지 않음.
 *
 * 이름 필드는 클라이언트 사이드 validate() 에서 검사하므로,
 * Supabase insert 호출 자체가 일어나지 않아야 한다.
 */

import { test, expect } from '@playwright/test'
import { resetDb, insertJob, countSeniors } from './helpers/db'

test.beforeEach(async () => {
  await resetDb()
  await insertJob({
    title: '서울 아파트 경비원',
    region: '서울',
    job_type: '경비',
    required_career: 3,
  })
})

test('이름 없이 제출하면 빨간 에러 박스가 뜨고 DB에 저장되지 않는다', async ({ page }) => {
  await page.goto('/register')

  // 이름 비움, 나머지는 정상 입력
  await page.selectOption('#region', '서울')
  await page.selectOption('#desired_job', '경비')
  await page.fill('#career_years', '3')

  await page.click('button[type="submit"]')

  // 이름 필드 위 빨간 안내 박스 확인
  await expect(page.locator('text=이름을 입력해 주세요')).toBeVisible()

  // 성공 메시지가 표시되지 않아야 함
  await expect(page.locator('text=등록이 완료되었습니다')).not.toBeVisible()

  // DB에 새 레코드가 없어야 함
  const count = await countSeniors()
  expect(count).toBe(0)
})
