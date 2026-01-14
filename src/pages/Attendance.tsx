import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ClipboardCheck, Check, X, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  subject_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  student?: { full_name: string; email: string };
  subject?: { name: string; code: string };
}

interface Student {
  id: string;
  full_name: string;
  email: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'present':
      return <Badge className="bg-success text-success-foreground"><Check className="h-3 w-3 mr-1" />Present</Badge>;
    case 'absent':
      return <Badge className="bg-destructive text-destructive-foreground"><X className="h-3 w-3 mr-1" />Absent</Badge>;
    case 'late':
      return <Badge className="bg-warning text-warning-foreground"><Clock className="h-3 w-3 mr-1" />Late</Badge>;
    case 'excused':
      return <Badge className="bg-info text-info-foreground"><AlertCircle className="h-3 w-3 mr-1" />Excused</Badge>;
    default:
      return null;
  }
};

export default function AttendancePage() {
  const { profile, isAdmin, isFaculty, isStudent } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedDate) {
      if (isStudent) {
        fetchStudentAttendance();
      } else {
        fetchStudentsAndAttendance();
      }
    }
  }, [selectedSubject, selectedDate]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase.from('subjects').select('*').order('name');
      if (error) throw error;
      setSubjects(data || []);
      if (data && data.length > 0) {
        setSelectedSubject(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchStudentAttendance = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`*, subject:subjects(name, code)`)
        .eq('student_id', profile.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setAttendance((data || []) as unknown as AttendanceRecord[]);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')
        .order('full_name');
      
      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // Fetch attendance for the selected date and subject
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('subject_id', selectedSubject)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'));
      
      if (attendanceError) throw attendanceError;

      // Create status map
      const statusMap: Record<string, string> = {};
      attendanceData?.forEach((record) => {
        statusMap[record.student_id] = record.status;
      });
      setAttendanceStatus(statusMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Check if attendance already exists
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('student_id', studentId)
        .eq('subject_id', selectedSubject)
        .eq('date', dateStr)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('attendance')
          .update({ status, marked_by: profile?.id })
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('attendance')
          .insert({
            student_id: studentId,
            subject_id: selectedSubject,
            date: dateStr,
            status,
            marked_by: profile?.id,
          });
        
        if (error) throw error;
      }

      setAttendanceStatus((prev) => ({ ...prev, [studentId]: status }));
      toast.success('Attendance marked');
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  if (isStudent) {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display">My Attendance</h1>
          <p className="text-muted-foreground mt-1">View your attendance records</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Attendance History</CardTitle>
            <CardDescription>Your attendance across all subjects</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No attendance records found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.subject?.name}</p>
                          <p className="text-sm text-muted-foreground">{record.subject?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">Mark and manage student attendance</p>
      </div>

      {/* Filters */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Mark Attendance</CardTitle>
          <CardDescription>
            {subjects.find((s) => s.id === selectedSubject)?.name} - {format(selectedDate, 'MMMM dd, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No students found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Current Status</TableHead>
                  <TableHead className="text-right">Mark Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {attendanceStatus[student.id] ? (
                        getStatusBadge(attendanceStatus[student.id])
                      ) : (
                        <Badge variant="outline">Not Marked</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant={attendanceStatus[student.id] === 'present' ? 'default' : 'outline'}
                          onClick={() => handleMarkAttendance(student.id, 'present')}
                          className={cn(attendanceStatus[student.id] === 'present' && 'bg-success hover:bg-success/90')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendanceStatus[student.id] === 'absent' ? 'default' : 'outline'}
                          onClick={() => handleMarkAttendance(student.id, 'absent')}
                          className={cn(attendanceStatus[student.id] === 'absent' && 'bg-destructive hover:bg-destructive/90')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={attendanceStatus[student.id] === 'late' ? 'default' : 'outline'}
                          onClick={() => handleMarkAttendance(student.id, 'late')}
                          className={cn(attendanceStatus[student.id] === 'late' && 'bg-warning hover:bg-warning/90')}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
