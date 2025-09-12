BEGIN;

-- 6 employees
INSERT INTO public.people (name, phone, iban, registration_date, status_id, employee_type_id, comment, last_comment_date, segment_id, team_id, language_id, source_id)
SELECT 'Alice Johnson', '+447700900001', 'GB29NWBK60161331926819', now() - interval '30 days',
       (SELECT s.id FROM public.statuses s JOIN public.employee_types et ON et.id=s.employee_type_id WHERE et.code='EMPLOYEE' AND s.code='ACTIVE'),
       (SELECT id FROM public.employee_types WHERE code='EMPLOYEE'),
       'Top performer', now() - interval '5 days',
       (SELECT id FROM public.segments WHERE code='RET'),
       (SELECT id FROM public.teams WHERE code='CY'),
       (SELECT id FROM public.languages WHERE code='ENG'),
       (SELECT id FROM public.sources WHERE code='HR')
WHERE NOT EXISTS (SELECT 1 FROM public.people WHERE name='Alice Johnson');

INSERT INTO public.people (name, phone, iban, registration_date, status_id, employee_type_id, comment, last_comment_date, segment_id, team_id, language_id, source_id)
SELECT 'Benoit Dupont', '+337700900002', 'FR1420041010050500013M02606', now() - interval '25 days',
       (SELECT s.id FROM public.statuses s JOIN public.employee_types et ON et.id=s.employee_type_id WHERE et.code='EMPLOYEE' AND s.code='ACTIVE'),
       (SELECT id FROM public.employee_types WHERE code='EMPLOYEE'),
       'Fluent French', now() - interval '3 days',
       (SELECT id FROM public.segments WHERE code='CONV'),
       (SELECT id FROM public.teams WHERE code='LOCAL'),
       (SELECT id FROM public.languages WHERE code='FRA'),
       (SELECT id FROM public.sources WHERE code='HR')
WHERE NOT EXISTS (SELECT 1 FROM public.people WHERE name='Benoit Dupont');

INSERT INTO public.people (name, phone, iban, registration_date, status_id, employee_type_id, comment, last_comment_date, segment_id, team_id, language_id, source_id)
SELECT 'Carlos Mendez', '+349100900003', 'ES9121000418450200051332', now() - interval '20 days',
       (SELECT s.id FROM public.statuses s JOIN public.employee_types et ON et.id=s.employee_type_id WHERE et.code='EMPLOYEE' AND s.code='INACTIVE'),
       (SELECT id FROM public.employee_types WHERE code='EMPLOYEE'),
       'Seasonal worker', now() - interval '10 days',
       (SELECT id FROM public.segments WHERE code='RET'),
       (SELECT id FROM public.teams WHERE code='CY'),
       (SELECT id FROM public.languages WHERE code='SPA'),
       (SELECT id FROM public.sources WHERE code='NON-HR')
WHERE NOT EXISTS (SELECT 1 FROM public.people WHERE name='Carlos Mendez');

INSERT INTO public.people (name, phone, iban, registration_date, status_id, employee_type_id, comment, last_comment_date, segment_id, team_id, language_id, source_id)
SELECT 'Daria Ivanova', '+799900900004', 'RU02000000000000000000', now() - interval '15 days',
       (SELECT s.id FROM public.statuses s JOIN public.employee_types et ON et.id=s.employee_type_id WHERE et.code='EMPLOYEE' AND s.code='ACTIVE'),
       (SELECT id FROM public.employee_types WHERE code='EMPLOYEE'),
       'Admin team', now() - interval '7 days',
       (SELECT id FROM public.segments WHERE code='ADMIN'),
       (SELECT id FROM public.teams WHERE code='LOCAL'),
       (SELECT id FROM public.languages WHERE code='ENG'),
       (SELECT id FROM public.sources WHERE code='HR')
WHERE NOT EXISTS (SELECT 1 FROM public.people WHERE name='Daria Ivanova');

INSERT INTO public.people (name, phone, iban, registration_date, status_id, employee_type_id, comment, last_comment_date, segment_id, team_id, language_id, source_id)
SELECT 'Ethan Smith', '+120290090005', 'GB12BARC20040141426819', now() - interval '12 days',
       (SELECT s.id FROM public.statuses s JOIN public.employee_types et ON et.id=s.employee_type_id WHERE et.code='EMPLOYEE' AND s.code='TERMINATED'),
       (SELECT id FROM public.employee_types WHERE code='EMPLOYEE'),
       'Left company', now() - interval '11 days',
       (SELECT id FROM public.segments WHERE code='IT'),
       (SELECT id FROM public.teams WHERE code='CY'),
       (SELECT id FROM public.languages WHERE code='ENG'),
       (SELECT id FROM public.sources WHERE code='NON-HR')
WHERE NOT EXISTS (SELECT 1 FROM public.people WHERE name='Ethan Smith');

INSERT INTO public.people (name, phone, iban, registration_date, status_id, employee_type_id, comment, last_comment_date, segment_id, team_id, language_id, source_id)
SELECT 'Fatima Khalil', '+971500900006', 'AE070331234567890123456', now() - interval '10 days',
       (SELECT s.id FROM public.statuses s JOIN public.employee_types et ON et.id=s.employee_type_id WHERE et.code='EMPLOYEE' AND s.code='ACTIVE'),
       (SELECT id FROM public.employee_types WHERE code='EMPLOYEE'),
       'Remote', now() - interval '1 days',
       (SELECT id FROM public.segments WHERE code='CONV'),
       (SELECT id FROM public.teams WHERE code='LOCAL'),
       (SELECT id FROM public.languages WHERE code='ENG'),
       (SELECT id FROM public.sources WHERE code='HR')
WHERE NOT EXISTS (SELECT 1 FROM public.people WHERE name='Fatima Khalil');

-- 4 candidates
INSERT INTO public.people (name, phone, registration_date, status_id, employee_type_id, comment, segment_id, team_id, language_id, source_id)
SELECT 'George Lee', '+120290090007', now() - interval '8 days',
       (SELECT s.id FROM public.statuses s JOIN public.employee_types et ON et.id=s.employee_type_id WHERE et.code='CANDIDATE' AND s.code='NEW'),
       (SELECT id FROM public.employee_types WHERE code='CANDIDATE'),
       'Referred',
       (SELECT id FROM public.segments WHERE code='RET'),
       (SELECT id FROM public.teams WHERE code='CY'),
       (SELECT id FROM public.languages WHERE code='ENG'),
       (SELECT id FROM public.sources WHERE code='HR')
WHERE NOT EXISTS (SELECT 1 FROM public.people WHERE name='George Lee');

INSERT INTO public.people (name, phone, registration_date, status_id, employee_type_id, comment, segment_id, team_id, language_id, source_id)
SELECT 'Hiro Tanaka', '+813900900008', now() - interval '6 days',
       (SELECT s.id FROM public.statuses s JOIN public.employee_types et ON et.id=s.employee_type_id WHERE et.code='CANDIDATE' AND s.code='REVIEWING'),
       (SELECT id FROM public.employee_types WHERE code='CANDIDATE'),
       'Needs translation',
       (SELECT id FROM public.segments WHERE code='IT'),
       (SELECT id FROM public.teams WHERE code='LOCAL'),
       (SELECT id FROM public.languages WHERE code='ENG'),
       (SELECT id FROM public.sources WHERE code='NON-HR')
WHERE NOT EXISTS (SELECT 1 FROM public.people WHERE name='Hiro Tanaka');

INSERT INTO public.people (name, phone, registration_date, status_id, employee_type_id, comment, segment_id, team_id, language_id, source_id)
SELECT 'Isabella Rossi', '+390290090009', now() - interval '4 days',
       (SELECT s.id FROM public.statuses s JOIN public.employee_types et ON et.id=s.employee_type_id WHERE et.code='CANDIDATE' AND s.code='APPROVED'),
       (SELECT id FROM public.employee_types WHERE code='CANDIDATE'),
       'Strong background',
       (SELECT id FROM public.segments WHERE code='ADMIN'),
       (SELECT id FROM public.teams WHERE code='CY'),
       (SELECT id FROM public.languages WHERE code='ENG'),
       (SELECT id FROM public.sources WHERE code='HR')
WHERE NOT EXISTS (SELECT 1 FROM public.people WHERE name='Isabella Rossi');

INSERT INTO public.people (name, phone, registration_date, status_id, employee_type_id, comment, segment_id, team_id, language_id, source_id)
SELECT 'Jakub Novak', '+420700900010', now() - interval '2 days',
       (SELECT s.id FROM public.statuses s JOIN public.employee_types et ON et.id=s.employee_type_id WHERE et.code='CANDIDATE' AND s.code='REJECTED'),
       (SELECT id FROM public.employee_types WHERE code='CANDIDATE'),
       'Mismatch skillset',
       (SELECT id FROM public.segments WHERE code='CONV'),
       (SELECT id FROM public.teams WHERE code='LOCAL'),
       (SELECT id FROM public.languages WHERE code='ENG'),
       (SELECT id FROM public.sources WHERE code='NON-HR')
WHERE NOT EXISTS (SELECT 1 FROM public.people WHERE name='Jakub Novak');

-- Optional: candidate extras
INSERT INTO public.candidates_extra (person_id, poly_result, background_check_result, date_of_start, planned_call, on_contract, conditions)
SELECT p.id, 'WAITING', 'WAITING', current_date + 14, now() + interval '3 days', false, 'Entry level'
FROM public.people p
JOIN public.employee_types et ON et.id = p.employee_type_id AND et.code='CANDIDATE'
WHERE p.name IN ('George Lee','Hiro Tanaka','Isabella Rossi','Jakub Novak')
ON CONFLICT (person_id) DO NOTHING;

COMMIT;

