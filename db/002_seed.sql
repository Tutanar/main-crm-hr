BEGIN;

-- Employee types
INSERT INTO public.employee_types (code, name) VALUES
  ('EMPLOYEE', 'Employee'),
  ('CANDIDATE', 'Candidate')
ON CONFLICT (code) DO NOTHING;

-- Segments
INSERT INTO public.segments (code, name) VALUES
  ('RET', 'RET'),
  ('CONV', 'CONV'),
  ('ADMIN', 'ADMIN'),
  ('IT', 'IT')
ON CONFLICT (code) DO NOTHING;

-- Teams
INSERT INTO public.teams (code, name) VALUES
  ('CY', 'CY'),
  ('LOCAL', 'LOCAL')
ON CONFLICT (code) DO NOTHING;

-- Languages
INSERT INTO public.languages (code, name) VALUES
  ('FRA', 'French'),
  ('SPA', 'Spanish'),
  ('ENG', 'English'),
  ('NONE', 'None')
ON CONFLICT (code) DO NOTHING;

-- Sources
INSERT INTO public.sources (code, name) VALUES
  ('HR', 'HR'),
  ('NON-HR', 'Non-HR')
ON CONFLICT (code) DO NOTHING;

-- Statuses (examples)
INSERT INTO public.statuses (employee_type_id, code, name)
SELECT et.id, s.code, s.name
FROM (
  VALUES
    ('EMPLOYEE','ACTIVE','Active'),
    ('EMPLOYEE','INACTIVE','Inactive'),
    ('EMPLOYEE','TERMINATED','Terminated'),
    ('CANDIDATE','NEW','New'),
    ('CANDIDATE','REVIEWING','Reviewing'),
    ('CANDIDATE','APPROVED','Approved'),
    ('CANDIDATE','REJECTED','Rejected'),
    ('CANDIDATE','HIRED','Hired')
) AS s(type_code, code, name)
JOIN public.employee_types et ON et.code = s.type_code
ON CONFLICT DO NOTHING;

COMMIT;

