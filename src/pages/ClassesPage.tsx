import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { DataFormDialog } from '@/components/DataFormDialog';
import { classService } from '@/services/firebaseService';
import { toast } from '@/hooks/use-toast';
import type { ClassGroup } from '@/types';
import { Layers, Plus, AlertCircle } from 'lucide-react';
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

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const classData = await classService.getAll();
      setClasses(classData);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch classes data',
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
    { key: 'name', label: 'Class Name' },
    { key: 'grade', label: 'Grade' },
    { key: 'section', label: 'Section' },
    { key: 'studentCount', label: 'Students' },
  ];

  const formFields = [
    { name: 'name', label: 'Class Name', type: 'text' as const, required: true, placeholder: 'e.g., 10th A' },
    { name: 'grade', label: 'Grade', type: 'number' as const, required: true, placeholder: '10' },
    { name: 'section', label: 'Section', type: 'text' as const, required: true, placeholder: 'A' },
    { name: 'studentCount', label: 'Student Count', type: 'number' as const, placeholder: '40' },
    { name: 'classTeacherId', label: 'Class Teacher ID', type: 'text' as const, placeholder: 'Faculty ID' },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSaving(true);
    try {
      if (editingClass) {
        await classService.update(editingClass.id, data);
        toast({ title: 'Updated', description: 'Class updated successfully' });
      } else {
        await classService.create(data as any);
        toast({ title: 'Created', description: 'Class created successfully' });
      }
      await fetchData();
      setEditingClass(null);
    } catch (error) {
      console.error('Error saving class:', error);
      toast({
        title: 'Error',
        description: 'Failed to save class',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await classService.delete(deletingId);
      toast({ title: 'Deleted', description: 'Class deleted successfully' });
      await fetchData();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete class',
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
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Manage school classes and sections</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="border-2">
          <Plus className="mr-2 h-4 w-4" />
          Add Class
        </Button>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Classes List
          </CardTitle>
          <CardDescription>
            {classes.length} classes registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={classes}
            isLoading={isLoading}
            onEdit={(row) => {
              setEditingClass(row);
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
          if (!open) setEditingClass(null);
        }}
        title={editingClass ? 'Edit Class' : 'Add Class'}
        fields={formFields}
        initialData={editingClass || {}}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="border-2 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Class
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this class? This will affect all related data.
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
