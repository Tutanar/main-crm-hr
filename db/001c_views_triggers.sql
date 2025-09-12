BEGIN;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_people_updated_at ON public.people;
CREATE TRIGGER trg_people_updated_at
BEFORE UPDATE ON public.people
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Views
CREATE OR REPLACE VIEW public.employees AS
SELECT
  p.id,
  p.name,
  CASE WHEN p.phone IS NOT NULL THEN '***-'::text || RIGHT(p.phone::text, 4) ELSE 'Не указан'::text END AS phone,
  p.iban,
  p.registration_date,
  s.code AS status_code,
  s.name AS status_name,
  et.code AS employee_type_code,
  et.name AS employee_type_name,
  p.comment,
  p.last_comment_date,
  seg.code AS segment_code,
  seg.name AS segment_name,
  t.code AS team_code,
  t.name AS team_name,
  l.code AS language_code,
  l.name AS language_name,
  src.code AS source_code,
  src.name AS source_name,
  p.created_at,
  p.updated_at
FROM public.people p
JOIN public.employee_types et ON p.employee_type_id = et.id
LEFT JOIN public.statuses s ON p.status_id = s.id
LEFT JOIN public.segments seg ON p.segment_id = seg.id
LEFT JOIN public.teams t ON p.team_id = t.id
LEFT JOIN public.languages l ON p.language_id = l.id
LEFT JOIN public.sources src ON p.source_id = src.id
WHERE et.code = 'EMPLOYEE';

CREATE OR REPLACE VIEW public.candidates AS
SELECT
  p.id,
  p.name,
  CASE WHEN p.phone IS NOT NULL THEN '***-'::text || RIGHT(p.phone::text, 4) ELSE 'Не указан'::text END AS phone,
  p.registration_date,
  s.code AS status_code,
  s.name AS status_name,
  et.code AS employee_type_code,
  et.name AS employee_type_name,
  p.comment,
  p.last_comment_date,
  seg.code AS segment_code,
  seg.name AS segment_name,
  t.code AS team_code,
  t.name AS team_name,
  l.code AS language_code,
  l.name AS language_name,
  src.code AS source_code,
  src.name AS source_name,
  ce.poly_result,
  ce.background_check_result,
  ce.date_of_start,
  ce.planned_call,
  ce.on_contract,
  ce.conditions,
  p.created_at,
  p.updated_at
FROM public.people p
JOIN public.employee_types et ON p.employee_type_id = et.id
LEFT JOIN public.statuses s ON p.status_id = s.id
LEFT JOIN public.segments seg ON p.segment_id = seg.id
LEFT JOIN public.teams t ON p.team_id = t.id
LEFT JOIN public.languages l ON p.language_id = l.id
LEFT JOIN public.sources src ON p.source_id = src.id
LEFT JOIN public.candidates_extra ce ON ce.person_id = p.id
WHERE et.code = 'CANDIDATE';

COMMIT;

