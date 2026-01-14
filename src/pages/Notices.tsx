import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Pin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase.from('notices').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'academic': return 'bg-info text-info-foreground';
      case 'event': return 'bg-success text-success-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Notices</h1>
        <p className="text-muted-foreground mt-1">Stay updated with announcements</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : notices.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No notices yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id} className="shadow-card">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {notice.is_pinned && <Pin className="h-4 w-4 text-warning" />}
                    <CardTitle className="text-lg font-display">{notice.title}</CardTitle>
                  </div>
                  <Badge className={getCategoryColor(notice.category)}>{notice.category}</Badge>
                </div>
                <CardDescription>{format(new Date(notice.created_at), 'PPP')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{notice.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
