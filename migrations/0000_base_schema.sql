-- ============================================
-- 0000 — Base university schema
-- Apply this BEFORE 0001_region_localization.sql.
-- Idempotent: safe to re-run.
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS departments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  code        text NOT NULL UNIQUE,
  faculty     text NOT NULL,
  head_name   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text NOT NULL,
  full_name    text NOT NULL,
  role         text NOT NULL CHECK (role IN ('admin','student','lecturer')),
  student_id   uuid,
  lecturer_id  uuid,
  matric_no    text,
  staff_id     text,
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matric_no       text NOT NULL UNIQUE,
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  middle_name     text,
  email           text NOT NULL,
  phone           text,
  date_of_birth   date,
  gender          text,
  nationality     text,
  state_of_origin text,
  address         text,
  department_id   uuid REFERENCES departments(id),
  program         text NOT NULL,
  degree_type     text NOT NULL,
  admission_year  int  NOT NULL,
  expected_graduation int,
  status          text NOT NULL DEFAULT 'active',
  photo_url       text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lecturers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        text NOT NULL UNIQUE,
  first_name      text NOT NULL,
  last_name       text NOT NULL,
  title           text NOT NULL,
  email           text NOT NULL,
  phone           text,
  department_id   uuid REFERENCES departments(id),
  specialization  text,
  photo_url       text,
  status          text NOT NULL DEFAULT 'active',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text NOT NULL UNIQUE,
  title         text NOT NULL,
  credit_unit   numeric(4,1) NOT NULL,
  department_id uuid REFERENCES departments(id),
  level         int NOT NULL,
  semester      int NOT NULL,
  year          int NOT NULL,
  lecturer_id   uuid REFERENCES lecturers(id),
  description   text,
  is_elective   boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id     uuid NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  academic_year int NOT NULL,
  semester      int NOT NULL,
  status        text NOT NULL DEFAULT 'active',
  enrolled_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id, academic_year, semester)
);

CREATE TABLE IF NOT EXISTS results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id       uuid NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
  enrollment_id   uuid REFERENCES enrollments(id),
  ca_score        numeric(5,2) NOT NULL DEFAULT 0,
  exam_score      numeric(5,2) NOT NULL DEFAULT 0,
  total_score     numeric(5,2) GENERATED ALWAYS AS (LEAST(ca_score + exam_score, 100)) STORED,
  grade           text NOT NULL,
  grade_point     numeric(3,2) NOT NULL,
  status          text NOT NULL DEFAULT 'pending',
  submitted_by    text,
  approved_by     text,
  submitted_at    timestamptz,
  approved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

CREATE TABLE IF NOT EXISTS semester_gpas (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id               uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year            int NOT NULL,
  semester                 int NOT NULL,
  gpa                      numeric(3,2) NOT NULL,
  cgpa                     numeric(3,2) NOT NULL,
  total_credits            numeric(5,1) NOT NULL,
  total_cumulative_credits numeric(6,1) NOT NULL,
  created_at               timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, academic_year, semester)
);

CREATE TABLE IF NOT EXISTS documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  file_name     text NOT NULL,
  file_url      text NOT NULL,
  file_type     text,
  document_type text NOT NULL,
  verified      boolean NOT NULL DEFAULT false,
  uploaded_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action       text NOT NULL,
  entity_type  text,
  entity_id    text,
  performed_by text,
  details      jsonb,
  ip_address   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS — read-mostly defaults
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE results       ENABLE ROW LEVEL SECURITY;
ALTER TABLE semester_gpas ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments   ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read most tables
DO $$ BEGIN
  CREATE POLICY profiles_self_read       ON profiles      FOR SELECT TO authenticated USING (id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
  CREATE POLICY profiles_self_update     ON profiles      FOR UPDATE TO authenticated USING (id = auth.uid());
  CREATE POLICY students_read            ON students      FOR SELECT TO authenticated USING (true);
  CREATE POLICY lecturers_read           ON lecturers     FOR SELECT TO authenticated USING (true);
  CREATE POLICY courses_read             ON courses       FOR SELECT TO authenticated USING (true);
  CREATE POLICY departments_read         ON departments   FOR SELECT TO authenticated USING (true);
  CREATE POLICY enrollments_read         ON enrollments   FOR SELECT TO authenticated USING (true);
  CREATE POLICY results_read             ON results       FOR SELECT TO authenticated USING (true);
  CREATE POLICY gpas_read                ON semester_gpas FOR SELECT TO authenticated USING (true);
  CREATE POLICY docs_read                ON documents     FOR SELECT TO authenticated USING (true);
  CREATE POLICY audit_read_admin         ON audit_logs    FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admins/lecturers can write to results, students/courses
DO $$ BEGIN
  CREATE POLICY students_write_admin   ON students    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
  CREATE POLICY courses_write_admin    ON courses     FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));
  CREATE POLICY results_write_staff    ON results     FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','lecturer')));
  CREATE POLICY audit_insert_authed    ON audit_logs  FOR INSERT TO authenticated WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed a CS department so the app's first runs work
INSERT INTO departments (name, code, faculty, head_name)
VALUES ('Computer Science', 'CS', 'Engineering & Computing', 'Dr. James Okonkwo')
ON CONFLICT (code) DO NOTHING;
