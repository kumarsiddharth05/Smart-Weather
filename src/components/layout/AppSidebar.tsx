import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  FileText,
  Bell,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: ('admin' | 'faculty' | 'student')[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'faculty', 'student'] },
  { title: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { title: 'Subjects', href: '/subjects', icon: BookOpen, roles: ['admin', 'faculty', 'student'] },
  { title: 'Attendance', href: '/attendance', icon: ClipboardCheck, roles: ['admin', 'faculty', 'student'] },
  { title: 'Marks', href: '/marks', icon: FileText, roles: ['admin', 'faculty', 'student'] },
  { title: 'Notices', href: '/notices', icon: Bell, roles: ['admin', 'faculty', 'student'] },
  { title: 'Events', href: '/events', icon: Calendar, roles: ['admin', 'faculty', 'student'] },
  { title: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'faculty'] },
  { title: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'faculty', 'student'] },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter(
    (item) => profile && item.roles.includes(profile.role)
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-admin text-admin-foreground';
      case 'faculty': return 'bg-faculty text-faculty-foreground';
      case 'student': return 'bg-student text-student-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-accent rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-sidebar-primary">SmartCampus</h1>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-sidebar-accent rounded-xl flex items-center justify-center mx-auto">
            <GraduationCap className="h-6 w-6 text-sidebar-primary" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
            collapsed && 'absolute -right-4 top-5 bg-sidebar-background rounded-full shadow-lg z-50'
          )}
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-sidebar-ring')} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User section */}
      <div className="p-4">
        <div
          className={cn(
            'flex items-center gap-3 mb-3',
            collapsed ? 'justify-center' : ''
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-primary font-medium">
              {profile?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{profile?.full_name}</p>
              <span
                className={cn(
                  'inline-block px-2 py-0.5 text-xs rounded-full capitalize mt-1',
                  getRoleColor(profile?.role || '')
                )}
              >
                {profile?.role}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            'w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
