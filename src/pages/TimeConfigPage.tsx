import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { timeConfigService } from '@/services/firebaseService';
import { toast } from '@/hooks/use-toast';
import type { TimeConfig } from '@/types';
import { Clock, Save, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimeConfigPage() {
  const { refreshData } = useApp();
  const [config, setConfig] = useState<Partial<TimeConfig>>({
    institutionType: 'college',
    lectureDuration: 50,
    labDuration: 100,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '09:00',
    endTime: '17:00',
    shortBreak: { startTime: '10:40', duration: 15 },
    lunchBreak: { startTime: '12:30', duration: 45 },
  });
  const [existingConfigId, setExistingConfigId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const configs = await timeConfigService.getByInstitutionType('college');
        if (configs.length > 0) {
          setConfig(configs[0]);
          setExistingConfigId(configs[0].id);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (existingConfigId) {
        await timeConfigService.update(existingConfigId, config);
        toast({ title: 'Updated', description: 'Time configuration updated successfully' });
      } else {
        const id = await timeConfigService.create(config as any);
        setExistingConfigId(id);
        toast({ title: 'Created', description: 'Time configuration created successfully' });
      }
      await refreshData();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save time configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDayToggle = (day: string) => {
    setConfig((prev) => ({
      ...prev,
      workingDays: prev.workingDays?.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...(prev.workingDays || []), day],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Configuration</h1>
          <p className="text-muted-foreground">Configure lecture durations, breaks, and working hours</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="border-2">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Duration Settings */}
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Duration Settings
            </CardTitle>
            <CardDescription>
              Configure lecture and lab durations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Lecture Duration (minutes)</Label>
              <Input
                type="number"
                value={config.lectureDuration || 50}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, lectureDuration: Number(e.target.value) }))
                }
                className="border-2"
              />
            </div>
            <div className="space-y-2">
              <Label>Lab/Practical Duration (minutes)</Label>
              <Input
                type="number"
                value={config.labDuration || 100}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, labDuration: Number(e.target.value) }))
                }
                className="border-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>
              Set daily start and end times
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={config.startTime || '09:00'}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={config.endTime || '17:00'}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                  className="border-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Break Settings */}
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle>Short Break</CardTitle>
            <CardDescription>
              Configure short break timing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={config.shortBreak?.startTime || '10:40'}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      shortBreak: { ...prev.shortBreak!, startTime: e.target.value },
                    }))
                  }
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={config.shortBreak?.duration || 15}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      shortBreak: { ...prev.shortBreak!, duration: Number(e.target.value) },
                    }))
                  }
                  className="border-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lunch Break */}
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle>Lunch Break</CardTitle>
            <CardDescription>
              Configure lunch break timing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={config.lunchBreak?.startTime || '12:30'}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      lunchBreak: { ...prev.lunchBreak!, startTime: e.target.value },
                    }))
                  }
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={config.lunchBreak?.duration || 45}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      lunchBreak: { ...prev.lunchBreak!, duration: Number(e.target.value) },
                    }))
                  }
                  className="border-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Days */}
        <Card className="border-2 border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Working Days</CardTitle>
            <CardDescription>
              Select the days for scheduling classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="flex items-center space-x-2 border-2 border-border p-3 cursor-pointer hover:bg-secondary transition-colors"
                  onClick={() => handleDayToggle(day)}
                >
                  <Checkbox
                    checked={config.workingDays?.includes(day)}
                    onCheckedChange={() => handleDayToggle(day)}
                    className="border-2"
                  />
                  <Label className="cursor-pointer">{day}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
