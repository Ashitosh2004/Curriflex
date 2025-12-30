import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { DataFormDialog } from '@/components/DataFormDialog';
import { facultyService, departmentService, subjectAllocationService } from '@/services/firebaseService';
import { toast } from '@/hooks/use-toast';
import type { Faculty, Department, SubjectAllocation } from '@/types';
import { Users, Plus, AlertCircle } from 'lucide-react';
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

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allocations, setAllocations] = useState<SubjectAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [facultyData, deptData, allocData] = await Promise.all([
        facultyService.getAll(),
        departmentService.getAll(),
        subjectAllocationService.getAll(),
      ]);
      setFaculty(facultyData);
      setDepartments(deptData);
      setAllocations(allocData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch faculty data',
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
    { key: 'facultyId', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'department',
      label: 'Department',
      render: (value: string) => {
        const dept = departments.find(d => d.id === value);
        return dept?.name || value;
      }
    },
    { key: 'maxHoursPerWeek', label: 'Max Hours/Week' },
    {
      key: 'id',
      label: 'Allocated Subjects',
      render: (_value: any, row: Faculty) => {
        const count = allocations.filter(a => a.facultyId === row.id).length;
        return count;
      },
    },
  ];

  const formFields = [
    { name: 'facultyId', label: 'Faculty ID', type: 'text' as const, required: true, placeholder: 'e.g., FAC001' },
    { name: 'name', label: 'Name', type: 'text' as const, required: true, placeholder: 'Full name' },
    { name: 'email', label: 'Email', type: 'email' as const, required: true, placeholder: 'Email address' },
    { name: 'phone', label: 'Phone', type: 'text' as const, placeholder: 'Phone number' },
    {
      name: 'department',
      label: 'Department',
      type: 'select' as const,
      required: true,
      options: departments.map(d => ({ value: d.id, label: d.name })),
    },
    { name: 'maxHoursPerWeek', label: 'Max Hours/Week', type: 'number' as const, required: true, placeholder: '20' },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSaving(true);
    try {
      if (editingFaculty) {
        await facultyService.update(editingFaculty.id, data);
        toast({ title: 'Updated', description: 'Faculty updated successfully' });
      } else {
        await facultyService.create({ ...data, subjects: [] } as any);
        toast({ title: 'Created', description: 'Faculty created successfully' });
      }
      await fetchData();
      setEditingFaculty(null);
    } catch (error) {
      console.error('Error saving faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to save faculty',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await facultyService.delete(deletingId);
      toast({ title: 'Deleted', description: 'Faculty deleted successfully' });
      await fetchData();
    } catch (error) {
      console.error('Error deleting faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete faculty',
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
          <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
          <p className="text-muted-foreground">Manage faculty members and their allocations</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="border-2">
          <Plus className="mr-2 h-4 w-4" />
          Add Faculty
        </Button>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Faculty List
          </CardTitle>
          <CardDescription>
            {faculty.length} faculty members registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={faculty}
            isLoading={isLoading}
            onEdit={(row) => {
              setEditingFaculty(row);
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
          if (!open) setEditingFaculty(null);
        }}
        title={editingFaculty ? 'Edit Faculty' : 'Add Faculty'}
        fields={formFields}
        initialData={editingFaculty || {}}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="border-2 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Faculty
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this faculty member? This action cannot be undone.
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
