import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function MarksPage() {
  const { profile, isStudent } = useAuth();
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarks();
  }, [profile]);

  const fetchMarks = async () => {
    if (!profile) return;
    try {
      let query = supabase.from('marks').select(`*, subject:subjects(name, code)`);
      if (isStudent) {
        query = query.eq('student_id', profile.id);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setMarks(data || []);
    } catch (error) {
      console.error('Error fetching marks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">{isStudent ? 'My Marks' : 'Marks Management'}</h1>
        <p className="text-muted-foreground mt-1">{isStudent ? 'View your academic performance' : 'View and manage student marks'}</p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Marks Records</CardTitle>
          <CardDescription>{marks.length} records found</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : marks.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No marks records found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Exam Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marks.map((mark) => (
                  <TableRow key={mark.id}>
                    <TableCell>{mark.subject?.name || 'Unknown'}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{mark.exam_type}</Badge></TableCell>
                    <TableCell>{mark.score} / {mark.max_score}</TableCell>
                    <TableCell>{((mark.score / mark.max_score) * 100).toFixed(1)}%</TableCell>
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
