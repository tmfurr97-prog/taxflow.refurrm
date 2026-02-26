import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, Loader2, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface EmailIntegrationProps {
  onDocumentsFound: (documents: any[]) => void;
}

export const EmailIntegration: React.FC<EmailIntegrationProps> = ({ onDocumentsFound }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'gmail' | 'outlook' | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<{gmail?: string, outlook?: string}>({});
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  const handleGmailConnect = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('gmail-oauth', {
        body: { action: 'getAuthUrl' }
      });

      if (error) throw error;
      
      // Open OAuth window
      const authWindow = window.open(data.authUrl, 'gmail-auth', 'width=500,height=600');
      
      // Listen for callback
      window.addEventListener('message', async (event) => {
        if (event.data.type === 'gmail-auth-success') {
          const { code } = event.data;
          
          // Exchange code for tokens
          const { data: tokenData, error: tokenError } = await supabase.functions.invoke('gmail-oauth', {
            body: { action: 'exchangeCode', code }
          });
          
          if (tokenError) throw tokenError;
          
          // Store connection info
          localStorage.setItem('gmail_token', tokenData.accessToken);
          localStorage.setItem('gmail_refresh', tokenData.refreshToken);
          localStorage.setItem('gmail_email', tokenData.email);
          
          setConnectedAccounts(prev => ({ ...prev, gmail: tokenData.email }));
          
          toast({
            title: "Gmail Connected",
            description: `Successfully connected ${tokenData.email}`,
          });
          
          authWindow?.close();
        }
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect Gmail account",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOutlookConnect = () => {
    toast({
      title: "Coming Soon",
      description: "Outlook integration will be available soon",
    });
  };

  const handleScanEmails = async () => {
    if (!selectedProvider || !dateRange.start || !dateRange.end) return;
    
    setIsScanning(true);
    setShowDateDialog(false);
    
    try {
      const accessToken = localStorage.getItem(`${selectedProvider}_token`);
      
      if (!accessToken) {
        throw new Error("No access token found. Please reconnect your account.");
      }
      
      // Scan emails
      const { data: emailData, error: scanError } = await supabase.functions.invoke('scan-emails', {
        body: {
          provider: selectedProvider,
          accessToken,
          startDate: dateRange.start,
          endDate: dateRange.end
        }
      });
      
      if (scanError) throw scanError;
      
      const emails = emailData.emails || [];
      
      if (emails.length === 0) {
        toast({
          title: "No Documents Found",
          description: "No tax documents found in the selected date range",
        });
        return;
      }
      
      toast({
        title: "Documents Found",
        description: `Found ${emails.length} emails with potential tax documents`,
      });
      
      // Process each email's attachments
      const processedDocs = [];
      for (const email of emails) {
        for (const attachment of email.attachments) {
          try {
            const { data: ocrData, error: ocrError } = await supabase.functions.invoke('process-document-ocr', {
              body: {
                provider: selectedProvider,
                accessToken,
                messageId: email.id,
                attachmentId: attachment.id,
                filename: attachment.filename
              }
            });
            
            if (!ocrError && ocrData) {
              processedDocs.push({
                ...ocrData,
                emailSubject: email.subject,
                emailFrom: email.from,
                emailDate: email.date,
                attachmentSize: attachment.size
              });
            }
          } catch (err) {
            console.error(`Failed to process ${attachment.filename}:`, err);
          }
        }
      }
      
      if (processedDocs.length > 0) {
        onDocumentsFound(processedDocs);
        toast({
          title: "Processing Complete",
          description: `Successfully processed ${processedDocs.length} documents`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to scan emails",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const openScanDialog = (provider: 'gmail' | 'outlook') => {
    setSelectedProvider(provider);
    setShowDateDialog(true);
  };

  return (
    <>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Email Integration</h3>
        <p className="text-sm text-gray-600 mb-6">
          Connect your email to automatically import tax documents
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Gmail</p>
                {connectedAccounts.gmail ? (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Connected: {connectedAccounts.gmail}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Not connected</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {connectedAccounts.gmail ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openScanDialog('gmail')}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Scan Emails'
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGmailConnect}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Connect'
                  )}
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Outlook</p>
                {connectedAccounts.outlook ? (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Connected: {connectedAccounts.outlook}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Not connected</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOutlookConnect}
              disabled={isConnecting}
            >
              Connect
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
            <DialogDescription>
              Choose the date range to scan for tax documents
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleScanEmails} disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Start Scan
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};