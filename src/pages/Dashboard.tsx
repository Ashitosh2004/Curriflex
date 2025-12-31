import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  DoorOpen,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle,
} from 'lucide-react';

export default function Dashboard() {
  const { departments } = useApp();

  const stats = [
    {
      title: 'Departments',
      value: departments.length,
      icon: Building2,
      href: '/departments',
      color: 'bg-chart-1/10 border-chart-1/30',
    },

    {
      title: 'Quick Actions',
      value: 'Generate',
      icon: Calendar,
      href: '/timetable',
      color: 'bg-chart-3/10 border-chart-3/30',
    },
    {
      title: 'Configure',
      value: 'Time',
      icon: Clock,
      href: '/time-config',
      color: 'bg-chart-4/10 border-chart-4/30',
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'Smart Auto-Generation',
      description: 'Automatically generates conflict-free timetables using intelligent algorithms',
    },
    {
      icon: CheckCircle,
      title: 'Conflict Detection',
      description: 'Real-time detection and prevention of scheduling conflicts',
    },
    {
      icon: Users,
      title: 'Faculty Management',
      description: 'Manage faculty workloads and availability preferences',
    },
    {
      icon: DoorOpen,
      title: 'Room Optimization',
      description: 'Optimal allocation of classrooms and laboratories',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/5 to-background p-8 border border-border/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            Curriflex
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Intelligent Timetable Management System for Colleges and Universities
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button asChild size="lg" className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/25">
              <Link to="/timetable">
                Generate Timetable
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl border-2 hover:bg-secondary/50">
              <Link to="/settings">
                Configure Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Link key={stat.title} to={stat.href}>
            <Card className={`glass-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 ${stat.color}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="p-2 rounded-xl bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Access */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-card overflow-hidden">
          <CardHeader className="border-b border-border/50">
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Manage your academic data</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 pt-4">
            <Link
              to="/faculty"
              className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:bg-secondary/50 hover:translate-x-1 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-chart-1/10 group-hover:bg-chart-1/20 transition-colors">
                  <Users className="h-5 w-5 text-chart-1" />
                </div>
                <span className="font-medium">Faculty Management</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link
              to="/subjects"
              className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:bg-secondary/50 hover:translate-x-1 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-chart-2/10 group-hover:bg-chart-2/20 transition-colors">
                  <BookOpen className="h-5 w-5 text-chart-2" />
                </div>
                <span className="font-medium">Subjects & Courses</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link
              to="/rooms"
              className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:bg-secondary/50 hover:translate-x-1 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-chart-3/10 group-hover:bg-chart-3/20 transition-colors">
                  <DoorOpen className="h-5 w-5 text-chart-3" />
                </div>
                <span className="font-medium">Rooms & Labs</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link
              to="/students"
              className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:bg-secondary/50 hover:translate-x-1 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-chart-4/10 group-hover:bg-chart-4/20 transition-colors">
                  <GraduationCap className="h-5 w-5 text-chart-4" />
                </div>
                <span className="font-medium">Students</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden">
          <CardHeader className="border-b border-border/50">
            <CardTitle>System Features</CardTitle>
            <CardDescription>What makes Curriflex powerful</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
            {features.map((feature, index) => (
              <div key={feature.title} className="flex gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${index === 0 ? 'from-chart-1/20 to-chart-1/5' :
                  index === 1 ? 'from-chart-2/20 to-chart-2/5' :
                    index === 2 ? 'from-chart-3/20 to-chart-3/5' :
                      'from-chart-4/20 to-chart-4/5'
                  }`}>
                  <feature.icon className={`h-5 w-5 ${index === 0 ? 'text-chart-1' :
                    index === 1 ? 'text-chart-2' :
                      index === 2 ? 'text-chart-3' :
                        'text-chart-4'
                    }`} />
                </div>
                <div>
                  <h4 className="font-medium">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="border-b border-border/50">
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to generate your first timetable</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: 1, title: 'Add Departments', desc: 'Create departments for your institution', color: 'chart-1' },
              { step: 2, title: 'Add Faculty & Subjects', desc: 'Register faculty and their subjects', color: 'chart-2' },
              { step: 3, title: 'Configure Time', desc: 'Set working hours and breaks', color: 'chart-3' },
              { step: 4, title: 'Generate Timetable', desc: 'Auto-generate conflict-free schedules', color: 'chart-4' },
            ].map((item) => (
              <div key={item.step} className="p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors">
                <div className={`mb-2 text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>{item.step}</div>
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
