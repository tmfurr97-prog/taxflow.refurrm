import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ReminderPreferences {
  email: boolean;
  sms: boolean;
  threshold_amount: number;
  reminder_frequency: 'daily' | 'weekly' | 'biweekly';
}

export default function ReminderSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    email: true,
    sms: false,
    threshold_amount: 25,
    reminder_frequency: 'daily'
  });

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('reminder_preferences')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.reminder_preferences) {
        setPreferences(data.reminder_preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };


  const savePreferences = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ reminder_preferences: preferences })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Your reminder preferences have been updated.',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const testReminder = async () => {
    try {
      const { error } = await supabase.functions.invoke('check-missing-receipts', {
        body: { test_mode: true, user_id: user?.id }
      });

      if (error) throw error;

      toast({
        title: 'Test Reminder Sent',
        description: 'Check your email/SMS for the test reminder.',
      });
    } catch (error) {
      console.error('Error sending test reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test reminder.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Receipt Reminder Settings
        </CardTitle>
        <CardDescription>
          Configure how you want to be reminded about missing receipts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Channels</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="email-reminders">Email Reminders</Label>
            </div>
            <Switch
              id="email-reminders"
              checked={preferences.email}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, email: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="sms-reminders">SMS Reminders</Label>
            </div>
            <Switch
              id="sms-reminders"
              checked={preferences.sms}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, sms: checked }))
              }
            />
          </div>
        </div>

        {/* Threshold Amount */}
        <div className="space-y-2">
          <Label htmlFor="threshold" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Minimum Transaction Amount
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <Input
              id="threshold"
              type="number"
              min="0"
              step="5"
              value={preferences.threshold_amount}
              onChange={(e) => 
                setPreferences(prev => ({ 
                  ...prev, 
                  threshold_amount: parseFloat(e.target.value) || 0 
                }))
              }
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">
              Only remind for transactions above this amount
            </span>
          </div>
        </div>

        {/* Reminder Frequency */}
        <div className="space-y-2">
          <Label htmlFor="frequency" className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Reminder Frequency
          </Label>
          <Select
            value={preferences.reminder_frequency}
            onValueChange={(value: 'daily' | 'weekly' | 'biweekly') => 
              setPreferences(prev => ({ ...prev, reminder_frequency: value }))
            }
          >
            <SelectTrigger id="frequency" className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="biweekly">Bi-weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={savePreferences} 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button 
            variant="outline" 
            onClick={testReminder}
            disabled={!preferences.email && !preferences.sms}
          >
            Send Test Reminder
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> We'll automatically check for bank transactions 
            without matching receipts and send you reminders based on your preferences. 
            You can upload receipts directly from the reminder email or SMS.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}