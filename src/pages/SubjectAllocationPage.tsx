import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { DataFormDialog } from '@/components/DataFormDialog';
import {
    subjectAllocationService,
    facultyService,
    subjectService,
    departmentService,
    classService
} from '@/services/firebaseService';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import type { SubjectAllocation, Faculty, Subject, Department, ClassGroup } from '@/types';
import { BookUser, Plus, AlertCircle } from 'lucide-react';
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

export default function SubjectAllocationPage() {
    const { institutionType } = useApp();
    const [allocations, setAllocations] = useState<SubjectAllocation[]>([]);
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [classes, setClasses] = useState<ClassGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAllocation, setEditingAllocation] = useState<SubjectAllocation | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [allocData, facData, subjData, deptData, classData] = await Promise.all([
                subjectAllocationService.getAll(),
                facultyService.getAll(),
                subjectService.getAll(),
                departmentService.getAll(),
                classService.getAll(),
            ]);
            setAllocations(allocData);
            setFaculty(facData);
            setSubjects(subjData);
            setDepartments(deptData);
            setClasses(classData);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch allocation data',
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
        {
            key: 'subjectId',
            label: 'Subject',
            render: (value: string) => {
                const subject = subjects.find(s => s.id === value);
                return subject ? `${subject.code} - ${subject.name}` : value;
            }
        },
        {
            key: 'facultyId',
            label: 'Faculty',
            render: (value: string) => {
                const fac = faculty.find(f => f.id === value);
                return fac?.name || value;
            }
        },
        ...(institutionType === 'school' ? [{
            key: 'classId',
            label: 'Class',
            render: (value: string) => {
                const cls = classes.find(c => c.id === value);
                return cls?.name || value;
            }
        }] : [
            {
                key: 'departmentId',
                label: 'Department',
                render: (value: string) => {
                    const dept = departments.find(d => d.id === value);
                    return dept?.name || value;
                }
            },
            {
                key: 'year',
                label: 'Year',
                render: (value: number) => value ? `Year ${value}` : '-'
            },
            {
                key: 'semester',
                label: 'Semester',
                render: (value: number) => value ? `Sem ${value}` : '-'
            }
        ]),
    ];

    const formFields = [
        {
            name: 'subjectId',
            label: 'Subject',
            type: 'select' as const,
            required: true,
            options: subjects.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` })),
        },
        {
            name: 'facultyId',
            label: 'Faculty',
            type: 'select' as const,
            required: true,
            options: faculty.map(f => ({ value: f.id, label: f.name })),
        },
        ...(institutionType === 'school' ? [{
            name: 'classId',
            label: 'Class',
            type: 'select' as const,
            required: true,
            options: classes.map(c => ({ value: c.id, label: c.name })),
        }] : [
            {
                name: 'departmentId',
                label: 'Department',
                type: 'select' as const,
                required: true,
                options: departments.map(d => ({ value: d.id, label: d.name })),
            },
            {
                name: 'year',
                label: 'Year',
                type: 'number' as const,
                required: true,
                placeholder: '1-4'
            },
            {
                name: 'semester',
                label: 'Semester',
                type: 'number' as const,
                placeholder: '1-8 (optional)'
            }
        ]),
    ];

    const handleSubmit = async (data: Record<string, any>) => {
        setIsSaving(true);
        try {
            if (editingAllocation) {
                await subjectAllocationService.update(editingAllocation.id, data);
                toast({ title: 'Updated', description: 'Allocation updated successfully' });
            } else {
                await subjectAllocationService.create(data as any);
                toast({ title: 'Created', description: 'Allocation created successfully' });
            }
            await fetchData();
            setEditingAllocation(null);
        } catch (error) {
            console.error('Error saving allocation:', error);
            toast({
                title: 'Error',
                description: 'Failed to save allocation',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await subjectAllocationService.delete(deletingId);
            toast({ title: 'Deleted', description: 'Allocation deleted successfully' });
            await fetchData();
        } catch (error) {
            console.error('Error deleting allocation:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete allocation',
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
                    <h1 className="text-3xl font-bold tracking-tight">Subject Allocation</h1>
                    <p className="text-muted-foreground">Assign subjects to faculty members</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="border-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Allocation
                </Button>
            </div>

            <Card className="border-2 border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookUser className="h-5 w-5" />
                        Subject Allocations
                    </CardTitle>
                    <CardDescription>
                        {allocations.length} allocations configured
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={allocations}
                        isLoading={isLoading}
                        onEdit={(row) => {
                            setEditingAllocation(row);
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
                    if (!open) setEditingAllocation(null);
                }}
                title={editingAllocation ? 'Edit Allocation' : 'Add Allocation'}
                fields={formFields}
                initialData={editingAllocation || {}}
                onSubmit={handleSubmit}
                isLoading={isSaving}
            />

            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent className="border-2 border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Delete Allocation
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this allocation? This action cannot be undone.
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
