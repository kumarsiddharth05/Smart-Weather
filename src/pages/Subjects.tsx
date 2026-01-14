import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  created_at: string;
}

export default function SubjectsPage() {
  const { isAdmin } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCredits, setFormCredits] = useState('3');

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredSubjects(
        subjects.filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredSubjects(subjects);
    }
  }, [subjects, searchQuery]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormCredits('3');
    setEditingSubject(null);
  };

  const handleOpenDialog = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormName(subject.name);
      setFormCode(subject.code);
      setFormDescription(subject.description || '');
      setFormCredits(subject.credits.toString());
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveSubject = async () => {
    if (!formName || !formCode) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update({
            name: formName,
            code: formCode.toUpperCase(),
            description: formDescription,
            credits: parseInt(formCredits),
          })
          .eq('id', editingSubject.id);
        
        if (error) throw error;
        toast.success('Subject updated successfully');
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert({
            name: formName,
            code: formCode.toUpperCase(),
            description: formDescription,
            credits: parseInt(formCredits),
          });
        
        if (error) throw error;
        toast.success('Subject created successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
      fetchSubjects();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      if (error.code === '23505') {
        toast.error('Subject code already exists');
      } else {
        toast.error('Failed to save subject');
      }
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);
      
      if (error) throw error;
      toast.success('Subject deleted successfully');
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Failed to delete subject');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Subjects</h1>
          <p className="text-muted-foreground mt-1">Manage academic subjects and courses</p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        )}
      </div>

      {/* Search */}
      <Card className="shadow-card mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects by name or code..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">All Subjects</CardTitle>
          <CardDescription>{subjects.length} subjects registered</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No subjects found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Credits</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {subject.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {subject.description || '-'}
                      </TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(subject)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSubject(subject.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
            <DialogDescription>
              {editingSubject ? 'Update subject information' : 'Create a new academic subject'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject Code *</Label>
                <Input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g., CS101"
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label>Credits</Label>
                <Input
                  type="number"
                  value={formCredits}
                  onChange={(e) => setFormCredits(e.target.value)}
                  min="1"
                  max="10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject Name *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Introduction to Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief description of the subject..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSubject}>
                {editingSubject ? 'Save Changes' : 'Create Subject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
