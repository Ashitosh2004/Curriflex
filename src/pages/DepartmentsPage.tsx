import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { DataFormDialog } from '@/components/DataFormDialog';
import { departmentService } from '@/services/firebaseService';
import { toast } from '@/hooks/use-toast';
import type { Department } from '@/types';
import { Building2, Plus, AlertCircle } from 'lucide-react';
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

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const deptData = await departmentService.getAll();
      setDepartments(deptData);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch departments data',
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
    { key: 'headOfDepartment', label: 'HOD' },
  ];

  const formFields = [
    { name: 'code', label: 'Department Code', type: 'text' as const, required: true, placeholder: 'e.g., CSE' },
    { name: 'name', label: 'Department Name', type: 'text' as const, required: true, placeholder: 'e.g., Computer Science' },
    { name: 'headOfDepartment', label: 'Head of Department', type: 'text' as const, placeholder: 'HOD Name' },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSaving(true);
    try {
      // Check if code is unique (case-insensitive)
      const codeExists = departments.some(
        dept => dept.code.toLowerCase() === data.code.toLowerCase() && dept.id !== editingDept?.id
      );

      if (codeExists) {
        toast({
          title: 'Duplicate Code',
          description: `Department code "${data.code}" already exists. Please use a unique code.`,
          variant: 'destructive',
        });
        setIsSaving(false);
        return;
      }

      if (editingDept) {
        await departmentService.update(editingDept.id, data);
        toast({ title: 'Updated', description: 'Department updated successfully' });
      } else {
        await departmentService.create(data as any);
        toast({ title: 'Created', description: 'Department created successfully' });
      }
      await fetchData();
      setEditingDept(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        title: 'Error',
        description: 'Failed to save department',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await departmentService.delete(deletingId);
      toast({ title: 'Deleted', description: 'Department deleted successfully' });
      await fetchData();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete department',
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
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage academic departments</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="border-2">
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Departments List
          </CardTitle>
          <CardDescription>
            {departments.length} departments registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={departments}
            isLoading={isLoading}
            exportFileName="departments"
            onEdit={(row) => {
              setEditingDept(row);
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
          if (!open) setEditingDept(null);
        }}
        title={editingDept ? 'Edit Department' : 'Add Department'}
        fields={formFields}
        initialData={editingDept || {}}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="border-2 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Department
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this department? This will affect all related data.
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
