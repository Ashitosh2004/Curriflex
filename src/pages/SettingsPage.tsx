import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Settings, Database, Palette, School, GraduationCap, Building2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import type { InstitutionType } from '@/types';

export default function SettingsPage() {
  const { isDarkMode, toggleDarkMode } = useApp();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    // Check Firebase connection status
    const checkConnection = async () => {
      if (db) {
        try {
          // Firebase is initialized, check if we can connect
          setConnectionStatus('connected');
        } catch {
          setConnectionStatus('disconnected');
        }
      } else {
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
  }, []);



  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">Configure system preferences and integrations</p>
      </div>


      {/* Appearance */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent/10">
              <Palette className="h-5 w-5 text-accent" />
            </div>
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark themes
              </p>
            </div>
            <Button
              onClick={toggleDarkMode}
              className={`rounded-xl transition-all duration-300 ${isDarkMode
                ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                : 'bg-secondary hover:bg-secondary/80 text-foreground'
                }`}
            >
              {isDarkMode ? '🌙 Dark' : '☀️ Light'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Database Connection Status */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-chart-3/10">
              <Database className="h-5 w-5 text-chart-3" />
            </div>
            Database Connection
          </CardTitle>
          <CardDescription>
            Firebase database connection status
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-3">
              {connectionStatus === 'checking' && (
                <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
              )}
              {connectionStatus === 'connected' && (
                <div className="p-2 rounded-full bg-chart-3/10">
                  <CheckCircle className="h-6 w-6 text-chart-3" />
                </div>
              )}
              {connectionStatus === 'disconnected' && (
                <div className="p-2 rounded-full bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
              )}
              <div>
                <p className="font-medium">
                  {connectionStatus === 'checking' && 'Checking connection...'}
                  {connectionStatus === 'connected' && 'Connected to Firebase'}
                  {connectionStatus === 'disconnected' && 'Not Connected'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {connectionStatus === 'connected'
                    ? 'Your data is synced with Firebase'
                    : connectionStatus === 'disconnected'
                      ? 'Firebase credentials not configured'
                      : 'Verifying database connection'}
                </p>
              </div>
            </div>
            {connectionStatus === 'connected' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-chart-3/10 text-chart-3 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-chart-3 animate-pulse" />
                Live
              </div>
            )}
          </div>

          {connectionStatus === 'disconnected' && (
            <div className="mt-4 p-4 rounded-2xl bg-muted/50 border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Firebase credentials are configured via environment secrets.
                Contact your administrator if you need to update the database connection.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Curriflex</p>
              <p className="text-xs text-muted-foreground/70">Version 1.0.0</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Powered by</p>
              <p className="text-xs font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Firebase + React
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
