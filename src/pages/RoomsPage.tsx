import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/DataTable';
import { DataFormDialog } from '@/components/DataFormDialog';
import { roomService } from '@/services/firebaseService';
import { toast } from '@/hooks/use-toast';
import type { Room } from '@/types';
import { DoorOpen, Plus, AlertCircle } from 'lucide-react';
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

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const roomData = await roomService.getAll();
      setRooms(roomData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch rooms data',
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
    { key: 'roomNumber', label: 'Room Number' },
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
    { key: 'capacity', label: 'Capacity' },
    { key: 'building', label: 'Building' },
    { key: 'floor', label: 'Floor' },
  ];

  const formFields = [
    { name: 'roomNumber', label: 'Room Number', type: 'text' as const, required: true, placeholder: 'e.g., A101' },
    { name: 'name', label: 'Room Name', type: 'text' as const, required: true, placeholder: 'e.g., Computer Lab 1' },
    {
      name: 'type',
      label: 'Type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'classroom', label: 'Classroom' },
        { value: 'lab', label: 'Laboratory' },
        { value: 'auditorium', label: 'Auditorium' },
        { value: 'seminar', label: 'Seminar Hall' },
      ],
    },
    { name: 'capacity', label: 'Capacity', type: 'number' as const, required: true, placeholder: '60' },
    { name: 'building', label: 'Building', type: 'text' as const, placeholder: 'e.g., Main Building' },
    { name: 'floor', label: 'Floor', type: 'number' as const, placeholder: '1' },
  ];

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSaving(true);
    try {
      if (editingRoom) {
        await roomService.update(editingRoom.id, data);
        toast({ title: 'Updated', description: 'Room updated successfully' });
      } else {
        await roomService.create(data as any);
        toast({ title: 'Created', description: 'Room created successfully' });
      }
      await fetchData();
      setEditingRoom(null);
    } catch (error) {
      console.error('Error saving room:', error);
      toast({
        title: 'Error',
        description: 'Failed to save room',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await roomService.delete(deletingId);
      toast({ title: 'Deleted', description: 'Room deleted successfully' });
      await fetchData();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete room',
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
          <h1 className="text-3xl font-bold tracking-tight">Rooms & Labs</h1>
          <p className="text-muted-foreground">Manage classrooms, laboratories, and other facilities</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="border-2">
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            Rooms List
          </CardTitle>
          <CardDescription>
            {rooms.length} rooms registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rooms}
            isLoading={isLoading}
            onEdit={(row) => {
              setEditingRoom(row);
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
          if (!open) setEditingRoom(null);
        }}
        title={editingRoom ? 'Edit Room' : 'Add Room'}
        fields={formFields}
        initialData={editingRoom || {}}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="border-2 border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Room
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this room? This action cannot be undone.
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
