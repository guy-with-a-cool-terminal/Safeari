import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Sunset, Moon, CalendarDays, Sun, Info, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfile } from "@/contexts/ProfileContext";
import { getRecreationSchedule, updateRecreationSchedule } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type TimeRange = { start: number; end: number };
type DaySchedule = TimeRange[];
type WeekSchedule = Record<string, DaySchedule>;

interface RecreationScheduleProps {
  onScheduleChange?: (hasSchedule: boolean) => void;
}

const RecreationSchedule = ({ onScheduleChange }: RecreationScheduleProps) => {
  const { currentProfile } = useProfile();
  const { toast } = useToast();
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const fullDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const userTimezone = useMemo(() => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);

  const PRESETS = {
    "after-school": {
      name: "After School",
      icon: Sunset,
      description: "3-8pm weekdays, 9am-9pm weekends",
      schedule: (): WeekSchedule => {
        const schedule: WeekSchedule = {};
        days.forEach((day, dayIndex) => {
          if (dayIndex < 5) {
            schedule[day] = [{ start: 15, end: 20 }];
          } else {
            schedule[day] = [{ start: 9, end: 21 }];
          }
        });
        return schedule;
      }
    },
    "evenings": {
      name: "Evenings Only",
      icon: Moon,
      description: "6-9pm every day",
      schedule: (): WeekSchedule => {
        const schedule: WeekSchedule = {};
        days.forEach((day) => {
          schedule[day] = [{ start: 18, end: 21 }];
        });
        return schedule;
      }
    },
    "weekends": {
      name: "Weekends",
      icon: CalendarDays,
      description: "Saturday & Sunday only",
      schedule: (): WeekSchedule => {
        const schedule: WeekSchedule = {};
        days.forEach((day, dayIndex) => {
          if (dayIndex >= 5) {
            schedule[day] = [{ start: 9, end: 21 }];
          } else {
            schedule[day] = [];
          }
        });
        return schedule;
      }
    },
    "unrestricted": {
      name: "Always On",
      icon: Sun,
      description: "24/7 access",
      schedule: (): WeekSchedule => {
        const schedule: WeekSchedule = {};
        days.forEach((day) => {
          schedule[day] = [{ start: 0, end: 24 }];
        });
        return schedule;
      }
    },
  };

  const [schedule, setSchedule] = useState<WeekSchedule>(PRESETS["after-school"].schedule());
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESETS>("after-school");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentProfile) {
      loadSchedule();
    }
  }, [currentProfile]);

  const loadSchedule = async () => {
    if (!currentProfile) return;

    setIsLoading(true);
    try {
      const data = await getRecreationSchedule(currentProfile.id);

      if (data.times && Object.keys(data.times).length > 0) {
        const loadedSchedule: WeekSchedule = {};
        days.forEach(day => {
          const dayData = data.times[day];
          if (dayData) {
            const startHour = parseInt(dayData.start.split(':')[0]);
            const endHour = parseInt(dayData.end.split(':')[0]);
            loadedSchedule[day] = [{ start: startHour, end: endHour }];
          } else {
            loadedSchedule[day] = [];
          }
        });
        setSchedule(loadedSchedule);
        setSelectedPreset("custom" as any);
      }
    } catch (error: any) {
      console.error('Failed to load schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    const newSchedule = PRESETS[presetKey].schedule();
    setSchedule(newSchedule);
    setSelectedPreset(presetKey);
    saveSchedule(newSchedule);
    toast({
      title: "Preset Applied",
      description: `${PRESETS[presetKey].name} schedule set successfully`,
    });
  };

  const updateDayTime = (day: string, field: 'start' | 'end', value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    const newSchedule = { ...schedule };
    if (!newSchedule[day] || newSchedule[day].length === 0) {
      newSchedule[day] = [{ start: 9, end: 17 }];
    }

    newSchedule[day][0][field] = numValue;
    setSchedule(newSchedule);
    setSelectedPreset("custom" as any);
    saveSchedule(newSchedule);
  };

  const copyToWeekdays = (sourceDay: string) => {
    const sourceTimes = schedule[sourceDay]?.[0];
    if (!sourceTimes) return;

    const newSchedule = { ...schedule };
    days.forEach((day, idx) => {
      if (idx < 5) {
        newSchedule[day] = [{ ...sourceTimes }];
      }
    });
    setSchedule(newSchedule);
    setSelectedPreset("custom" as any);
    saveSchedule(newSchedule);
    toast({
      title: "Copied to Weekdays",
      description: "Applied to Monday-Friday",
    });
  };

  const copyToWeekends = (sourceDay: string) => {
    const sourceTimes = schedule[sourceDay]?.[0];
    if (!sourceTimes) return;

    const newSchedule = { ...schedule };
    days.forEach((day, idx) => {
      if (idx >= 5) {
        newSchedule[day] = [{ ...sourceTimes }];
      }
    });
    setSchedule(newSchedule);
    setSelectedPreset("custom" as any);
    saveSchedule(newSchedule);
    toast({
      title: "Copied to Weekends",
      description: "Applied to Saturday-Sunday",
    });
  };

  const copyToAllDays = (sourceDay: string) => {
    const sourceTimes = schedule[sourceDay]?.[0];
    if (!sourceTimes) return;

    const newSchedule = { ...schedule };
    days.forEach((day) => {
      newSchedule[day] = [{ ...sourceTimes }];
    });
    setSchedule(newSchedule);
    setSelectedPreset("custom" as any);
    saveSchedule(newSchedule);
    toast({
      title: "Copied to All Days",
      description: "Applied to entire week",
    });
  };

  const toggleDayOff = (day: string) => {
    const newSchedule = { ...schedule };
    const hasTime = newSchedule[day]?.[0]?.start !== newSchedule[day]?.[0]?.end;

    if (hasTime) {
      newSchedule[day] = [{ start: 0, end: 0 }];
    } else {
      newSchedule[day] = [{ start: 9, end: 17 }];
    }

    setSchedule(newSchedule);
    setSelectedPreset("custom" as any);
    saveSchedule(newSchedule);
  };

  const saveSchedule = async (scheduleToSave: WeekSchedule) => {
    if (!currentProfile) return;

    try {
      const times: Record<string, { start: string; end: string }> = {};

      days.forEach(day => {
        const ranges = scheduleToSave[day];
        if (ranges && ranges.length > 0 && ranges[0].start !== ranges[0].end) {
          times[day] = {
            start: `${ranges[0].start.toString().padStart(2, '0')}:00:00`,
            end: `${ranges[0].end.toString().padStart(2, '0')}:00:00`
          };
        }
      });

      await updateRecreationSchedule(currentProfile.id, {
        timezone: userTimezone,
        times
      });

      onScheduleChange?.(Object.keys(times).length > 0);
    } catch (error: any) {
      console.error('Failed to save schedule:', error);
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: error.message || "Could not save schedule"
      });
    }
  };

  const getDayStatus = (day: string) => {
    const ranges = schedule[day] || [];
    if (ranges.length === 0 || ranges[0].start === ranges[0].end) {
      return { status: "Blocked all day", color: "text-destructive", hours: 0 };
    }
    const range = ranges[0];
    if (range.start === 0 && range.end === 24) {
      return { status: "Allowed 24 hours", color: "text-green-600", hours: 24 };
    }
    const hours = range.end - range.start;
    return { status: `Allowed ${hours}h`, color: "text-primary", hours };
  };

  const getTimeBarStyle = (day: string) => {
    const ranges = schedule[day] || [];
    if (ranges.length === 0 || ranges[0].start === ranges[0].end) {
      return { left: '0%', width: '0%' };
    }
    const range = ranges[0];
    const left = (range.start / 24) * 100;
    const width = ((range.end - range.start) / 24) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  const startHours = Array.from({ length: 24 }, (_, i) => i);
  const endHours = Array.from({ length: 24 }, (_, i) => i + 1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Set when internet access is allowed. Then enable "Allow During Screen Time" on specific services/categories above to permit them only during these hours. <strong>Custom Lists bypass screen time entirely.</strong>
        </AlertDescription>
      </Alert>

      {/* Presets */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Quick Presets</Label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(PRESETS).map(([key, { name, icon: Icon, description }]) => (
            <button
              key={key}
              onClick={() => applyPreset(key as keyof typeof PRESETS)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedPreset === key
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border hover:border-primary/40 hover:bg-accent/50"
              }`}
            >
              <Icon className={`h-5 w-5 mb-2 ${selectedPreset === key ? "text-primary" : "text-muted-foreground"}`} />
              <div className="font-medium text-sm mb-1">{name}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Weekly Schedule</Label>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">{userTimezone}</span>
          </div>
        </div>

        <div className="space-y-2">
          {days.map((day, idx) => {
            const range = schedule[day]?.[0] || { start: 0, end: 0 };
            const { status, color, hours } = getDayStatus(day);
            const isWeekend = idx >= 5;
            const isOff = hours === 0;
            const timeBarStyle = getTimeBarStyle(day);

            return (
              <Card key={day} className={isWeekend ? "bg-accent/20" : ""}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <div className="font-semibold">{fullDays[idx]}</div>
                          <div className={`text-xs mt-0.5 ${color}`}>{status}</div>
                        </div>
                        {!isOff && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              if (idx < 5) {
                                copyToWeekdays(day);
                              } else {
                                copyToWeekends(day);
                              }
                            }}
                          >
                            <Copy className="h-3 w-3 mr-1.5" />
                            <span className="text-xs">Copy to {idx < 5 ? 'Weekdays' : 'Weekends'}</span>
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDayOff(day)}
                      >
                        {isOff ? "Enable Day" : "Block Day"}
                      </Button>
                    </div>

                    {/* Time Selectors */}
                    {!isOff && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Start Time</Label>
                            <Select
                              value={range.start.toString()}
                              onValueChange={(value) => updateDayTime(day, 'start', value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {startHours.map((hour) => (
                                  <SelectItem key={hour} value={hour.toString()}>
                                    {hour.toString().padStart(2, '0')}:00
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium">End Time</Label>
                            <Select
                              value={range.end.toString()}
                              onValueChange={(value) => updateDayTime(day, 'end', value)}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {endHours.map((hour) => (
                                  <SelectItem key={hour} value={hour.toString()}>
                                    {hour.toString().padStart(2, '0')}:00
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default RecreationSchedule;
