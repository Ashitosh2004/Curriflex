import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { DataFormDialog } from '@/components/DataFormDialog';
import { studentService, departmentService, classService } from '@/services/firebaseService';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import type { Student, Department, ClassGroup } from '@/types';
import { GraduationCap, Plus, AlertCircle, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function StudentsPage() {
  const { institutionType } = useApp();
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentData, deptData, classData] = await Promise.all([
        studentService.getAll(),
        departmentService.getAll(),
        classService.getAll(),
      ]);
      setStudents(studentData);
      setDepartments(deptData);
      setClasses(classData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch students data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = institutionType === 'school'
    ? [
      { key: 'studentId', label: 'Student ID' },
      { key: 'name', label: 'Name' },
      {
        key: 'class',
        label: 'Class',
        render: (value: string) => {
          const cls = classes.find(c => c.id === value);
          return cls?.name || value;
        }
      },
      { key: 'section', label: 'Section' },
    ]
    : [
      { key: 'studentId', label: 'PRN/ID' },
      { key: 'name', label: 'Name' },
      {
        key: 'department',
        label: 'Department',
        render: (value: string) => {
          const dept = departments.find(d => d.id === value);
          return dept?.name || value;
        }
      },
      { key: 'year', label: 'Year' },
      { key: 'section', label: 'Section' },
    ];

  const formFields = institutionType === 'school'
    ? [
      { name: 'studentId', label: 'Student ID', type: 'text' as const, required: true, placeholder: 'e.g., STU001' },
      { name: 'name', label: 'Name', type: 'text' as const, required: true, placeholder: 'Full name' },
      {
        name: 'class',
        label: 'Class',
        type: 'select' as const,
        required: true,
        options: classes.map(c => ({ value: c.id, label: c.name })),
      },
      { name: 'section', label: 'Section', type: 'text' as const, placeholder: 'A' },
    ]
    : [
      { name: 'studentId', label: 'PRN / University ID', type: 'text' as const, required: true, placeholder: 'e.g., PRN2024001' },
      { name: 'name', label: 'Name', type: 'text' as const, required: true, placeholder: 'Full name' },
      {
        name: 'department',
        label: 'Department',
        type: 'select' as const,
        required: true,
        options: departments.map(d => ({ value: d.id, label: d.name })),
      },
      {
        name: 'year',
        label: 'Year',
        type: 'select' as const,
        required: true,
        options: [
          { value: '1', label: 'Year 1' },
          { value: '2', label: 'Year 2' },
          { value: '3', label: 'Year 3' },
          { value: '4', label: 'Year 4' },
        ],
      },
      { name: 'section', label: 'Section', type: 'text' as const, placeholder: 'A' },
    ];

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSaving(true);
    const processedData = {
      ...data,
      year: data.year ? Number(data.year) : undefined,
    };
    try {
      if (editingStudent) {
        await studentService.update(editingStudent.id, processedData);
        toast({ title: 'Updated', description: 'Student updated successfully' });
      } else {
        await studentService.create(processedData as any);
        toast({ title: 'Created', description: 'Student created successfully' });
      }
      await fetchData();
      setEditingStudent(null);
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: 'Error',
        description: 'Failed to save student',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await studentService.delete(deletingId);
      toast({ title: 'Deleted', description: 'Student deleted successfully' });
      await fetchData();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Filter students by department
  const filteredStudents = institutionType !== 'school' && selectedDepartment !== 'all'
    ? students.filter(s => s.department === selectedDepartment)
    : students;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage student records</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="border-2">
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Department Filter for Colleges/Universities */}
      {institutionType !== 'school' && departments.length > 0 && (
        <Card className="border-2 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Filter by Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedDepartment !== 'all' && (
                <div className="text-sm text-muted-foreground">
                  Showing {filteredStudents.length} of {students.length} students
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Students List
          </CardTitle>
          <CardDescription>
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} {selectedDepartment !== 'all' && institutionType !== 'school' ? 'in selected department' : 'registered'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredStudents}
            isLoading={isLoading}
            onEdit={(row) => {
              setEditingStudent(row);
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
          if (!open) setEditingStudent(null);
        }}
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        fields={formFields}
        initialData={editingStudent ? { ...editingStudent, year: editingStudent.year?.toString() } : {}}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="border-2 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Student
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this student record?
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
