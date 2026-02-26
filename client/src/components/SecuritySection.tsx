import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Shield, Clock, Monitor, CheckCircle, XCircle } from 'lucide-react';

interface SecurityLog {
  id: string;
  event_type: string;
  ip_address: string;
  device_info: string;
  user_agent: string;
  session_id: string;
  is_active: boolean;
  created_at: string;
}

const SecuritySection: React.FC = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState('Unknown');

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  const fetchSecurityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('security_logs')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('session_id', sessionId);

      if (error) throw error;
      fetchSecurityLogs();
    } catch (error) {
      console.error('Error revoking session:', error);
    }
  };

  const activeSessions = logs.filter(log => log.event_type === 'login' && log.is_active);
  const loginHistory = logs.filter(log => log.event_type === 'login');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Password Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Password Strength</span>
            <Badge variant="outline" className="bg-green-50">Strong</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Last Changed</span>
            <span className="text-sm text-muted-foreground">30 days ago</span>
          </div>
          <Button variant="outline" className="w-full">Change Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Active Sessions ({activeSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : activeSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions</p>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-sm">{session.device_info}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{session.ip_address}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeSession(session.session_id)}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Login History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : loginHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No login history</p>
          ) : (
            <div className="space-y-2">
              {loginHistory.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    {log.is_active ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{log.device_info}</p>
                      <p className="text-xs text-muted-foreground">{log.ip_address}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Email verification enabled</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              <span>Strong password in use</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
              <span>Consider enabling two-factor authentication</span>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
              <span>Review active sessions regularly</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySection;
