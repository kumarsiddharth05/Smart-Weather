import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BookOpen, ClipboardCheck, Calendar, Bell } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    { icon: Users, title: 'User Management', desc: 'Manage students, faculty & admins' },
    { icon: BookOpen, title: 'Subject Management', desc: 'Create and assign subjects' },
    { icon: ClipboardCheck, title: 'Attendance Tracking', desc: 'Mark and monitor attendance' },
    { icon: Calendar, title: 'Event Calendar', desc: 'Campus events and activities' },
    { icon: Bell, title: 'Notices', desc: 'Important announcements' },
  ];

  return (
    <div className="min-h-screen gradient-primary text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <header className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-7 w-7" />
            </div>
            <span className="font-display text-xl font-semibold">SmartCampus</span>
          </div>
          <Button onClick={() => navigate('/auth')} variant="secondary">
            Login
          </Button>
        </header>

        <main className="container mx-auto px-6 py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              Smart Academic & Campus Management
            </h1>
            <p className="text-xl text-white/80 mb-8">
              A centralized, role-based system for managing attendance, marks, notices, events, and users in educational institutions.
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="bg-white text-primary hover:bg-white/90">
              Get Started
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-colors">
                <feature.icon className="h-10 w-10 mb-4" />
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
