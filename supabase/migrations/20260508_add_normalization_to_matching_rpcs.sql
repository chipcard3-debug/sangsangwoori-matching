-- 지역·직종 정규화를 매칭 RPC에 추가
-- 원본 데이터(seniors.region, seniors.desired_job 등)는 수정하지 않고
-- 비교 시에만 표준 값으로 변환한다.

-- 지역 정규화 헬퍼
CREATE OR REPLACE FUNCTION normalize_region(r text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE r
    WHEN '서울특별시' THEN '서울'
    WHEN '경기도'     THEN '경기'
    WHEN '인천광역시' THEN '인천'
    ELSE r
  END;
$$;

-- 직종 정규화 헬퍼
CREATE OR REPLACE FUNCTION normalize_job_type(j text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE j
    WHEN '경비직' THEN '경비'
    WHEN '청소직' THEN '청소'
    WHEN '조리직' THEN '조리'
    WHEN '돌봄직' THEN '돌봄'
    ELSE j
  END;
$$;

-- 시니어 기준 재계산 (정규화 적용)
CREATE OR REPLACE FUNCTION recalculate_matches_for_senior(p_senior_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_region       text;
  v_desired_job  text;
  v_career_years integer;
BEGIN
  SELECT region, desired_job, career_years
    INTO v_region, v_desired_job, v_career_years
    FROM seniors WHERE id = p_senior_id;
  IF NOT FOUND THEN RETURN; END IF;

  v_region      := normalize_region(v_region);
  v_desired_job := normalize_job_type(v_desired_job);

  DELETE FROM matches WHERE senior_id = p_senior_id;

  INSERT INTO matches (senior_id, job_id, score)
  SELECT
    p_senior_id,
    j.id,
    (CASE WHEN v_region      = normalize_region(j.region)       THEN 3 ELSE 0 END)
  + (CASE WHEN v_desired_job = normalize_job_type(j.job_type)   THEN 2 ELSE 0 END)
  + (CASE WHEN v_career_years >= j.required_career              THEN 1 ELSE 0 END)
  FROM jobs j;
END;
$$;

-- 공고 기준 재계산 (정규화 적용)
CREATE OR REPLACE FUNCTION recalculate_matches_for_job(p_job_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_region          text;
  v_job_type        text;
  v_required_career integer;
BEGIN
  SELECT region, job_type, required_career
    INTO v_region, v_job_type, v_required_career
    FROM jobs WHERE id = p_job_id;
  IF NOT FOUND THEN RETURN; END IF;

  v_region   := normalize_region(v_region);
  v_job_type := normalize_job_type(v_job_type);

  DELETE FROM matches WHERE job_id = p_job_id;

  INSERT INTO matches (senior_id, job_id, score)
  SELECT
    s.id,
    p_job_id,
    (CASE WHEN normalize_region(s.region)        = v_region    THEN 3 ELSE 0 END)
  + (CASE WHEN normalize_job_type(s.desired_job) = v_job_type  THEN 2 ELSE 0 END)
  + (CASE WHEN s.career_years >= v_required_career             THEN 1 ELSE 0 END)
  FROM seniors s;
END;
$$;
