-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'faculty', 'student');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'student',
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  credits INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subject_assignments table (faculty to subject mapping)
CREATE TABLE public.subject_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subject_id, faculty_id)
);

-- Create student_enrollments table (student to subject mapping)
CREATE TABLE public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(subject_id, student_id)
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id, date)
);

-- Create marks table
CREATE TABLE public.marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('quiz', 'midterm', 'final', 'assignment', 'project', 'practical')),
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) NOT NULL DEFAULT 100,
  remarks TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notices table
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'academic', 'event', 'urgent', 'subject')),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('academic', 'cultural', 'sports', 'seminar', 'holiday', 'exam', 'other')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create helper function to get current user's role (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Create helper function to check if faculty is assigned to a subject
CREATE OR REPLACE FUNCTION public.is_faculty_assigned(p_subject_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subject_assignments
    WHERE subject_id = p_subject_id AND faculty_id = auth.uid()
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Faculty can view student profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'faculty' AND role = 'student');

CREATE POLICY "Admin can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "Admin can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Users can update their own profile (except role)"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admin can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.get_my_role() = 'admin');

-- Subjects policies
CREATE POLICY "Everyone can view subjects"
  ON public.subjects FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage subjects"
  ON public.subjects FOR ALL
  USING (public.get_my_role() = 'admin');

-- Subject assignments policies
CREATE POLICY "Admin and faculty can view assignments"
  ON public.subject_assignments FOR SELECT
  USING (public.get_my_role() IN ('admin', 'faculty'));

CREATE POLICY "Admin can manage subject assignments"
  ON public.subject_assignments FOR ALL
  USING (public.get_my_role() = 'admin');

-- Student enrollments policies
CREATE POLICY "Admin and faculty can view enrollments"
  ON public.student_enrollments FOR SELECT
  USING (public.get_my_role() IN ('admin', 'faculty'));

CREATE POLICY "Students can view their own enrollments"
  ON public.student_enrollments FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admin can manage enrollments"
  ON public.student_enrollments FOR ALL
  USING (public.get_my_role() = 'admin');

-- Attendance policies
CREATE POLICY "Admin can view all attendance"
  ON public.attendance FOR SELECT
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Faculty can view attendance for assigned subjects"
  ON public.attendance FOR SELECT
  USING (public.is_faculty_assigned(subject_id));

CREATE POLICY "Students can view their own attendance"
  ON public.attendance FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admin can manage attendance"
  ON public.attendance FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Faculty can insert attendance for assigned subjects"
  ON public.attendance FOR INSERT
  WITH CHECK (public.is_faculty_assigned(subject_id));

CREATE POLICY "Faculty can update attendance for assigned subjects"
  ON public.attendance FOR UPDATE
  USING (public.is_faculty_assigned(subject_id));

-- Marks policies
CREATE POLICY "Admin can view all marks"
  ON public.marks FOR SELECT
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Faculty can view marks for assigned subjects"
  ON public.marks FOR SELECT
  USING (public.is_faculty_assigned(subject_id));

CREATE POLICY "Students can view their own marks"
  ON public.marks FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admin can manage marks"
  ON public.marks FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Faculty can insert marks for assigned subjects"
  ON public.marks FOR INSERT
  WITH CHECK (public.is_faculty_assigned(subject_id));

CREATE POLICY "Faculty can update marks for assigned subjects"
  ON public.marks FOR UPDATE
  USING (public.is_faculty_assigned(subject_id));

-- Notices policies
CREATE POLICY "Everyone can view notices"
  ON public.notices FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin and faculty can create notices"
  ON public.notices FOR INSERT
  WITH CHECK (public.get_my_role() IN ('admin', 'faculty'));

CREATE POLICY "Admin and faculty can update their notices"
  ON public.notices FOR UPDATE
  USING (author_id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "Admin can delete any notice"
  ON public.notices FOR DELETE
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Authors can delete their notices"
  ON public.notices FOR DELETE
  USING (author_id = auth.uid());

-- Events policies
CREATE POLICY "Everyone can view events"
  ON public.events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage events"
  ON public.events FOR ALL
  USING (public.get_my_role() = 'admin');

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'student')
  );
  RETURN NEW;
END;
$$;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create update triggers for all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marks_updated_at BEFORE UPDATE ON public.marks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();