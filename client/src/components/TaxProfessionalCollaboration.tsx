import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Shield, Trash2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CollaborationActivity } from './collaboration/CollaborationActivity';
import { SharedDocuments } from './collaboration/SharedDocuments';
import { InformationRequests } from './collaboration/InformationRequests';
import { CategorizationApprovals } from './collaboration/CategorizationApprovals';

export function TaxProfessionalCollaboration() {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string>('');
  const { toast } = useToast();

  const activities = [
    { id: '1', type: 'comment' as const, user: 'Sarah Johnson, CPA', message: 'Reviewed Q3 expenses - looking good!', timestamp: new Date('2024-11-05T10:30:00'), status: undefined },
    { id: '2', type: 'request' as const, user: 'Sarah Johnson, CPA', message: 'Requested mileage logs for July-September', timestamp: new Date('2024-11-04T14:20:00'), status: 'pending' },
    { id: '3', type: 'approval' as const, user: 'You', message: 'Approved categorization change for Amazon purchase', timestamp: new Date('2024-11-03T09:15:00'), status: 'approved' },
  ];

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('tax_professional_access').select('*').eq('user_id', user.id);
      setProfessionals(data || []);
    } catch (error) {}
  };

  const grantAccess = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('tax_professional_access').insert({
        user_id: user.id,
        professional_email: formData.get('email'),
        professional_name: formData.get('name'),
        access_level: formData.get('access_level'),
        status: 'active',
      });
      toast({ title: 'Access granted successfully' });
      setShowAddDialog(false);
      loadProfessionals();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#2E2E2E]">Tax Professional Collaboration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Securely share documents and collaborate with your CPA or tax preparer
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#50E3E3] hover:bg-[#50E3E3]/90 text-[#2E2E2E]">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Professional
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Tax Professional</DialogTitle>
            </DialogHeader>
            <form onSubmit={grantAccess} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input name="name" required placeholder="John Smith, CPA" />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" required />
              </div>
              <div>
                <Label>Access Level</Label>
                <Select name="access_level" defaultValue="view">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">View & Comment</SelectItem>
                    <SelectItem value="full">Full Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Send Invitation</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {professionals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Collaborators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {professionals.map((prof) => (
              <div key={prof.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-[#50E3E3]" />
                  <div>
                    <p className="font-medium">{prof.professional_name}</p>
                    <p className="text-sm text-muted-foreground">{prof.professional_email}</p>
                  </div>
                </div>
                <Badge>{prof.access_level}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="mt-6">
          <CollaborationActivity activities={activities} />
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <SharedDocuments onComment={(id) => { setSelectedDoc(id); setShowCommentDialog(true); }} />
        </TabsContent>
        <TabsContent value="requests" className="mt-6">
          <InformationRequests onRespond={(id) => toast({ title: 'Upload dialog would open here' })} />
        </TabsContent>
        <TabsContent value="approvals" className="mt-6">
          <CategorizationApprovals />
        </TabsContent>
      </Tabs>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea placeholder="Type your comment or question..." rows={4} />
            <Button className="w-full" onClick={() => { toast({ title: 'Comment added' }); setShowCommentDialog(false); }}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
