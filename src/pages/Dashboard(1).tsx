import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, ClipboardCheck, Calendar, Bell, TrendingUp, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const attendanceData = [
  { name: 'Mon', present: 85, absent: 15 },
  { name: 'Tue', present: 90, absent: 10 },
  { name: 'Wed', present: 78, absent: 22 },
  { name: 'Thu', present: 92, absent: 8 },
  { name: 'Fri', present: 88, absent: 12 },
];

const marksDistribution = [
  { name: 'A (90-100)', value: 25, color: 'hsl(160, 84%, 39%)' },
  { name: 'B (80-89)', value: 35, color: 'hsl(199, 89%, 48%)' },
  { name: 'C (70-79)', value: 25, color: 'hsl(38, 92%, 50%)' },
  { name: 'D (60-69)', value: 10, color: 'hsl(0, 84%, 60%)' },
  { name: 'F (<60)', value: 5, color: 'hsl(0, 0%, 60%)' },
];

const monthlyTrend = [
  { month: 'Jan', attendance: 85, marks: 78 },
  { month: 'Feb', attendance: 88, marks: 80 },
  { month: 'Mar', attendance: 82, marks: 75 },
  { month: 'Apr', attendance: 90, marks: 82 },
  { month: 'May', attendance: 87, marks: 85 },
  { month: 'Jun', attendance: 91, marks: 88 },
];

const recentNotices = [
  { id: 1, title: 'Mid-term Examination Schedule', category: 'academic', date: '2 hours ago' },
  { id: 2, title: 'Campus Holiday Notice', category: 'general', date: '1 day ago' },
  { id: 3, title: 'New Lab Equipment Installation', category: 'event', date: '2 days ago' },
];

const upcomingEvents = [
  { id: 1, title: 'Annual Sports Day', date: 'Mar 15, 2024', type: 'sports' },
  { id: 2, title: 'Guest Lecture: AI in Education', date: 'Mar 18, 2024', type: 'seminar' },
  { id: 3, title: 'Final Exams Begin', date: 'Apr 01, 2024', type: 'exam' },
];

function AdminDashboard() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value="1,234"
          icon={<GraduationCap className="h-6 w-6" />}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Faculty"
          value="85"
          icon={<Users className="h-6 w-6" />}
          variant="info"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Active Subjects"
          value="48"
          icon={<BookOpen className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Today's Attendance"
          value="89%"
          icon={<ClipboardCheck className="h-6 w-6" />}
          variant="warning"
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Weekly Attendance Overview</CardTitle>
            <CardDescription>Present vs Absent students this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="present" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Marks Distribution</CardTitle>
            <CardDescription>Overall grade distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marksDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {marksDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Monthly Trends</CardTitle>
            <CardDescription>Attendance and marks performance over months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="hsl(160, 84%, 39%)" strokeWidth={2} name="Attendance %" />
                <Line type="monotone" dataKey="marks" stroke="hsl(199, 89%, 48%)" strokeWidth={2} name="Avg Marks %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-warning" />
                Recent Notices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentNotices.map((notice) => (
                <div key={notice.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notice.title}</p>
                    <p className="text-xs text-muted-foreground">{notice.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-info" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function FacultyDashboard() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="My Subjects"
          value="5"
          icon={<BookOpen className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Total Students"
          value="180"
          icon={<GraduationCap className="h-6 w-6" />}
          variant="info"
        />
        <StatCard
          title="Today's Classes"
          value="3"
          icon={<Calendar className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Pending Marks"
          value="12"
          icon={<ClipboardCheck className="h-6 w-6" />}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Subject-wise Attendance</CardTitle>
            <CardDescription>Average attendance in your subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="present" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Class Performance</CardTitle>
            <CardDescription>Marks distribution across your classes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marksDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {marksDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StudentDashboard() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Enrolled Subjects"
          value="6"
          icon={<BookOpen className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Overall Attendance"
          value="87%"
          icon={<ClipboardCheck className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Average Marks"
          value="78%"
          icon={<TrendingUp className="h-6 w-6" />}
          variant="info"
        />
        <StatCard
          title="Upcoming Exams"
          value="3"
          icon={<Calendar className="h-6 w-6" />}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Subject-wise Attendance</CardTitle>
            <CardDescription>Your attendance in each subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="present" fill="hsl(160, 84%, 39%)" radius={[0, 4, 4, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Performance Trend</CardTitle>
            <CardDescription>Your marks trend over months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="marks" stroke="hsl(199, 89%, 48%)" strokeWidth={2} name="Marks %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              Recent Notices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNotices.map((notice) => (
              <div key={notice.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{notice.title}</p>
                  <p className="text-xs text-muted-foreground">{notice.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-info" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { profile, isAdmin, isFaculty, isStudent } = useAuth();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">
          Welcome back, {profile?.full_name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening in your {isAdmin ? 'institution' : isFaculty ? 'classes' : 'academic journey'} today.
        </p>
      </div>

      {isAdmin && <AdminDashboard />}
      {isFaculty && <FacultyDashboard />}
      {isStudent && <StudentDashboard />}
    </DashboardLayout>
  );
}
