BEGIN;

-- Core table
CREATE TABLE IF NOT EXISTS public.people (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  iban TEXT,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status_id INTEGER REFERENCES public.statuses(id) ON DELETE SET NULL,
  employee_type_id INTEGER NOT NULL REFERENCES public.employee_types(id) ON DELETE RESTRICT,
  comment TEXT,
  last_comment_date TIMESTAMPTZ,
  segment_id INTEGER REFERENCES public.segments(id) ON DELETE SET NULL,
  team_id INTEGER REFERENCES public.teams(id) ON DELETE SET NULL,
  language_id INTEGER REFERENCES public.languages(id) ON DELETE SET NULL,
  source_id INTEGER REFERENCES public.sources(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Candidate-only data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'check_result') THEN
    CREATE TYPE public.check_result AS ENUM ('PASSED', 'DIDNT_PASS', 'WAITING');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.candidates_extra (
  person_id BIGINT PRIMARY KEY REFERENCES public.people(id) ON DELETE CASCADE,
  poly_result public.check_result,
  background_check_result public.check_result,
  date_of_start DATE,
  planned_call TIMESTAMPTZ,
  on_contract BOOLEAN,
  conditions TEXT
);

CREATE TABLE IF NOT EXISTS public.candidate_documents (
  id BIGSERIAL PRIMARY KEY,
  person_id BIGINT NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;

