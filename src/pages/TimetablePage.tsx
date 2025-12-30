import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { TimetableGrid } from '@/components/TimetableGrid';
import { generateTimeSlots, generateTimetable, detectConflicts } from '@/utils/timetableGenerator';
import {
  facultyService,
  subjectService,
  roomService,
  subjectAllocationService,
  timetableService,
} from '@/services/firebaseService';
import type { Faculty, Subject, Room, SubjectAllocation, TimetableEntry, TimeSlot, Timetable } from '@/types';
import { Calendar, Download, Loader2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const WORKING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const YEARS = [1, 2, 3, 4];

export default function TimetablePage() {
  const { departments, timeConfig, selectedDepartment, setSelectedDepartment, selectedYear, setSelectedYear } = useApp();

  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allocations, setAllocations] = useState<SubjectAllocation[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [savedTimetables, setSavedTimetables] = useState<Timetable[]>([]);

  // Generate time slots when config changes
  useEffect(() => {
    if (timeConfig) {
      const slots = generateTimeSlots(timeConfig);
      setTimeSlots(slots);
    } else {
      // Default time slots if no config
      setTimeSlots([
        { id: 'slot-1', startTime: '09:00', endTime: '09:50', type: 'lecture', slotNumber: 1 },
        { id: 'slot-2', startTime: '09:50', endTime: '10:40', type: 'lecture', slotNumber: 2 },
        { id: 'break-1', startTime: '10:40', endTime: '11:00', type: 'break', slotNumber: 3 },
        { id: 'slot-3', startTime: '11:00', endTime: '11:50', type: 'lecture', slotNumber: 4 },
        { id: 'slot-4', startTime: '11:50', endTime: '12:40', type: 'lecture', slotNumber: 5 },
        { id: 'lunch-1', startTime: '12:40', endTime: '13:30', type: 'lunch', slotNumber: 6 },
        { id: 'slot-5', startTime: '13:30', endTime: '14:20', type: 'lecture', slotNumber: 7 },
        { id: 'slot-6', startTime: '14:20', endTime: '15:10', type: 'lecture', slotNumber: 8 },
        { id: 'slot-7', startTime: '15:10', endTime: '16:00', type: 'lecture', slotNumber: 9 },
      ]);
    }
  }, [timeConfig]);

  // Fetch data when selection changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [facultyData, subjectData, roomData] = await Promise.all([
          facultyService.getAll(),
          subjectService.getAll(),
          roomService.getAll(),
        ]);
        setFaculty(facultyData);
        setSubjects(subjectData);
        setRooms(roomData);

        // Fetch allocations for selected department
        if (selectedDepartment) {
          const allocs = await subjectAllocationService.getByDepartment(selectedDepartment, selectedYear || undefined);
          setAllocations(allocs);

          // Fetch saved timetables
          const timetables = await timetableService.getByDepartment(selectedDepartment);
          setSavedTimetables(timetables);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch data from Firebase. Please check your configuration.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDepartment, selectedYear]);

  const handleGenerate = async () => {
    if (!selectedDepartment) {
      toast({
        title: 'Select Department',
        description: 'Please select a department to generate timetable',
        variant: 'destructive',
      });
      return;
    }

    if (allocations.length === 0) {
      toast({
        title: 'No Allocations',
        description: 'No subject allocations found. Please add subject allocations first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setConflicts([]);

    // Simulate processing time for animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const workingDaysToUse = timeConfig?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      console.log('Time Config:', timeConfig);
      console.log('Working Days:', workingDaysToUse);
      console.log('Allocations:', allocations.length);

      const result = generateTimetable({
        allocations,
        faculty,
        rooms,
        subjects,
        timeSlots,
        workingDays: workingDaysToUse,
        departmentId: selectedDepartment || undefined,
        year: selectedYear || undefined,
      });

      setEntries(result.entries);

      // Check for additional conflicts
      const detectedConflicts = detectConflicts(result.entries);
      setConflicts([...result.conflicts, ...detectedConflicts]);

      if (result.conflicts.length === 0 && detectedConflicts.length === 0) {
        toast({
          title: 'Success',
          description: 'Conflict-free timetable generated successfully!',
        });
      } else {
        toast({
          title: 'Generated with Warnings',
          description: `Timetable generated with ${result.conflicts.length + detectedConflicts.length} conflicts`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate timetable',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (entries.length === 0) {
      toast({
        title: 'No Timetable',
        description: 'Generate a timetable first before saving',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Clean entries to remove undefined fields and convert nested objects
      const cleanedEntries = entries.map(entry => ({
        id: entry.id,
        day: entry.day,
        timeSlotId: entry.timeSlotId,
        subjectId: entry.subjectId,
        facultyId: entry.facultyId,
        roomId: entry.roomId,
        departmentId: entry.departmentId,
        year: entry.year,
        isLocked: entry.isLocked || false,
      }));

      const timetableData: any = {
        name: `Timetable - ${new Date().toLocaleDateString()}`,
        entries: cleanedEntries,
        status: 'draft' as const,
        generatedAt: new Date(),
      };

      // Only add optional fields if they have values
      if (selectedDepartment) {
        timetableData.departmentId = selectedDepartment;
      }
      if (selectedYear) {
        timetableData.year = selectedYear;
      }

      await timetableService.create(timetableData);
      toast({
        title: 'Saved',
        description: 'Timetable saved successfully to Firebase',
      });

      // Refresh saved timetables
      if (selectedDepartment) {
        const timetables = await timetableService.getByDepartment(selectedDepartment);
        setSavedTimetables(timetables);
      }
    } catch (error) {
      console.error('Error saving timetable:', error);
      toast({
        title: 'Error',
        description: 'Failed to save timetable',
        variant: 'destructive',
      });
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(18);
    doc.text('Timetable', 14, 20);

    const tableData: string[][] = [];
    const headers = ['Time', ...WORKING_DAYS];

    for (const slot of timeSlots) {
      const row = [`${slot.startTime} - ${slot.endTime}`];

      for (const day of WORKING_DAYS) {
        if (slot.type === 'break') {
          row.push('SHORT BREAK');
        } else if (slot.type === 'lunch') {
          row.push('LUNCH');
        } else {
          const entry = entries.find(e => e.day === day && e.timeSlotId === slot.id);
          if (entry) {
            row.push(`${entry.subject?.code || entry.subject?.name}\n${entry.faculty?.name}\n${entry.room?.roomNumber}`);
          } else {
            row.push('-');
          }
        }
      }
      tableData.push(row);
    }

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [0, 0, 0] },
    });

    doc.save('timetable.pdf');
    toast({ title: 'Exported', description: 'Timetable exported to PDF' });
  };

  const exportToExcel = () => {
    const wsData: any[][] = [['Time', ...WORKING_DAYS]];

    for (const slot of timeSlots) {
      const row = [`${slot.startTime} - ${slot.endTime}`];

      for (const day of WORKING_DAYS) {
        if (slot.type === 'break') {
          row.push('SHORT BREAK');
        } else if (slot.type === 'lunch') {
          row.push('LUNCH');
        } else {
          const entry = entries.find(e => e.day === day && e.timeSlotId === slot.id);
          if (entry) {
            row.push(`${entry.subject?.code || entry.subject?.name} | ${entry.faculty?.name} | ${entry.room?.roomNumber}`);
          } else {
            row.push('-');
          }
        }
      }
      wsData.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
    XLSX.writeFile(wb, 'timetable.xlsx');
    toast({ title: 'Exported', description: 'Timetable exported to Excel' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable Generator</h1>
          <p className="text-muted-foreground">
            Generate conflict-free academic timetables automatically
          </p>
        </div>
      </div>

      {/* Selection Controls */}
      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Generate Timetable
          </CardTitle>
          <CardDescription>
            Select department and year to auto-fetch data and generate timetable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment || ''} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="border-2">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear?.toString() || ''} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger className="border-2">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || isLoading}
                className="flex-1 border-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="border-2 border-border bg-secondary p-3">
              <div className="text-2xl font-bold">{faculty.length}</div>
              <div className="text-sm text-muted-foreground">Faculty</div>
            </div>
            <div className="border-2 border-border bg-secondary p-3">
              <div className="text-2xl font-bold">{subjects.length}</div>
              <div className="text-sm text-muted-foreground">Subjects</div>
            </div>
            <div className="border-2 border-border bg-secondary p-3">
              <div className="text-2xl font-bold">{rooms.length}</div>
              <div className="text-sm text-muted-foreground">Rooms</div>
            </div>
            <div className="border-2 border-border bg-secondary p-3">
              <div className="text-2xl font-bold">{allocations.length}</div>
              <div className="text-sm text-muted-foreground">Allocations</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts */}
      {
        conflicts.length > 0 && (
          <Card className="border-2 border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Conflicts Detected ({conflicts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {conflicts.map((conflict, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    • {conflict.message}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      }

      {/* Timetable Grid */}
      {
        entries.length > 0 && (
          <Card className="border-2 border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Generated Timetable
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSave} className="border-2">
                    Save to Firebase
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToPDF} className="border-2">
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportToExcel} className="border-2">
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TimetableGrid
                entries={entries}
                timeSlots={timeSlots}
                workingDays={timeConfig?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']}
              />
            </CardContent>
          </Card>
        )
      }

      {/* Empty State */}
      {
        entries.length === 0 && !isLoading && (
          <Card className="border-2 border-dashed border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Timetable Generated</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mt-2">
                Select a department and year above and click Generate to create a conflict-free timetable
              </p>
            </CardContent>
          </Card>
        )
      }
    </div >
  );
}
