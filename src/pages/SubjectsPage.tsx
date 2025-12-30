import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { DataFormDialog } from '@/components/DataFormDialog';
import { subjectService, departmentService } from '@/services/firebaseService';
import { toast } from '@/hooks/use-toast';
import type { Subject, Department } from '@/types';
import { BookOpen, Plus, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subjectData, deptData] = await Promise.all([
        subjectService.getAll(),
        departmentService.getAll(),
      ]);
      setSubjects(subjectData);
      setDepartments(deptData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subjects data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Name' },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <Badge variant={value === 'lab' ? 'secondary' : 'default'} className="border-2">
          {value.toUpperCase()}
        </Badge>
      ),
    },
    { key: 'weeklyHours', label: 'Hours/Week' },
    {
      key: 'department',
      label: 'Department',
      render: (value: string) => {
        const dept = departments.find(d => d.id === value);
        return dept?.name || value;
      },
    },
    {
      key: 'labRequired',
      label: 'Lab Required',
      render: (value: boolean) => (value ? 'Yes' : 'No'),
    },
  ];

  const formFields = [
    { name: 'code', label: 'Subject Code', type: 'text' as const, required: true, placeholder: 'e.g., CS101' },
    { name: 'name', label: 'Subject Name', type: 'text' as const, required: true, placeholder: 'e.g., Data Structures' },
    {
      name: 'type',
      label: 'Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'theory', label: 'Theory' },
        { value: 'lab', label: 'Lab' },
        { value: 'practical', label: 'Practical' },
      ],
    },
    { name: 'weeklyHours', label: 'Weekly Hours', type: 'number' as const, required: true, placeholder: '4' },
    {
      name: 'department',
      label: 'Department',
      type: 'select' as const,
      required: true,
      options: departments.map(d => ({ value: d.id, label: d.name })),
    },
    {
      name: 'labRequired',
      label: 'Lab Required',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
    { name: 'continuousSlots', label: 'Continuous Slots (for labs)', type: 'number' as const, placeholder: '2' },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSaving(true);
    const processedData = {
      ...data,
      labRequired: data.labRequired === 'true' || data.labRequired === true,
      continuousSlots: data.continuousSlots ? Number(data.continuousSlots) : undefined,
    };
    try {
      if (editingSubject) {
        await subjectService.update(editingSubject.id, processedData);
        toast({ title: 'Updated', description: 'Subject updated successfully' });
      } else {
        await subjectService.create(processedData as any);
        toast({ title: 'Created', description: 'Subject created successfully' });
      }
      await fetchData();
      setEditingSubject(null);
    } catch (error) {
      console.error('Error saving subject:', error);
      toast({
        title: 'Error',
        description: 'Failed to save subject',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await subjectService.delete(deletingId);
      toast({ title: 'Deleted', description: 'Subject deleted successfully' });
      await fetchData();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete subject',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects Management</h1>
          <p className="text-muted-foreground">Manage subjects, courses, and labs</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="border-2">
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subjects List
          </CardTitle>
          <CardDescription>
            {subjects.length} subjects registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={subjects}
            isLoading={isLoading}
            onEdit={(row) => {
              setEditingSubject(row);
              setIsDialogOpen(true);
            }}
            onDelete={(row) => setDeletingId(row.id)}
          />
        </CardContent>
      </Card>

      <DataFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingSubject(null);
        }}
        title={editingSubject ? 'Edit Subject' : 'Add Subject'}
        fields={formFields}
        initialData={editingSubject ? { ...editingSubject, labRequired: editingSubject.labRequired ? 'true' : 'false' } : {}}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="border-2 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Subject
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subject? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
