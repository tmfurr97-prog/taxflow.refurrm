import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  FileSignature, Video, MapPin, Calendar, Clock, CheckCircle,
  AlertCircle, DollarSign, Shield, Star, Phone, Mail,
  Building2, FileText, Scale, Home, Briefcase, Plus, X
} from 'lucide-react';

const RON_SERVICES = [
  { id: 'acknowledgment', name: 'Acknowledgment', price: 25, description: 'Standard notarial act for documents requiring a signature acknowledgment', icon: FileText },
  { id: 'jurat', name: 'Jurat / Oath', price: 25, description: 'For affidavits and sworn statements requiring an oath', icon: Scale },
  { id: 'power_of_attorney', name: 'Power of Attorney', price: 45, description: 'Legal authorization documents for financial or medical decisions', icon: Briefcase },
  { id: 'real_estate', name: 'Real Estate Documents', price: 75, description: 'Deeds, mortgages, and property transfer documents', icon: Home },
  { id: 'business_formation', name: 'Business Formation', price: 95, description: 'LLC operating agreements, articles of incorporation, and business docs', icon: Building2 },
  { id: 'affidavit', name: 'Affidavit', price: 35, description: 'Sworn written statements for legal proceedings', icon: FileSignature },
];

const GENERAL_SERVICES = [
  { id: 'general_ack', name: 'General Acknowledgment', price: 15, description: 'In-person notarization for standard documents' },
  { id: 'general_jurat', name: 'General Jurat', price: 15, description: 'In-person oath and sworn statement notarization' },
  { id: 'general_copy', name: 'Certified Copy', price: 10, description: 'Certified true copies of original documents' },
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function NotaryServices() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<typeof RON_SERVICES[0] | null>(null);
  const [sessionType, setSessionType] = useState<'RON' | 'general'>('general');
  const [form, setForm] = useState({
    signerName: '',
    signerEmail: '',
    documentName: '',
    scheduledAt: '',
    witnessRequired: false,
    notes: '',
  });

  const { data: sessions, refetch } = trpc.notary.list.useQuery();
  const bookMutation = trpc.notary.book.useMutation({
    onSuccess: (data) => {
      toast.success(`Session booked! Price: $${data.price}`);
      setBookingOpen(false);
      setForm({ signerName: '', signerEmail: '', documentName: '', scheduledAt: '', witnessRequired: false, notes: '' });
      setSelectedService(null);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });
  const cancelMutation = trpc.notary.cancel.useMutation({
    onSuccess: () => { toast.success('Session cancelled'); refetch(); },
  });

  const handleBook = () => {
    if (!selectedService || !form.signerName || !form.signerEmail || !form.scheduledAt) {
      toast.error('Please fill in all required fields');
      return;
    }
    bookMutation.mutate({
      sessionType,
      serviceType: selectedService.id,
      scheduledAt: form.scheduledAt,
      documentName: form.documentName,
      signerName: form.signerName,
      signerEmail: form.signerEmail,
      witnessRequired: form.witnessRequired,
      notes: form.notes,
    });
  };

  const upcomingSessions = sessions?.filter(s => s.status === 'scheduled' || s.status === 'in_progress') || [];
  const pastSessions = sessions?.filter(s => s.status === 'completed' || s.status === 'cancelled') || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Notary Services</h1>
            <p className="text-slate-400 mt-1">Mobile & In-Person Notary Services — Local Availability</p>
          </div>
          <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2">
                <Plus className="w-4 h-4" />
                Book Session
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Book Notary Session</DialogTitle>
              </DialogHeader>

              <Tabs value={sessionType} onValueChange={(v) => setSessionType(v as 'RON' | 'general')}>
                <TabsList className="bg-slate-800 border-slate-700 w-full">
                  <TabsTrigger value="RON" disabled className="flex-1 opacity-50 cursor-not-allowed">
                    <Video className="w-4 h-4 mr-2" />
                    Remote Online (RON) — Coming Soon
                  </TabsTrigger>
                  <TabsTrigger value="general" className="flex-1 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                    <MapPin className="w-4 h-4 mr-2" />
                    Mobile & In-Person
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="RON" className="mt-4">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                    <p className="text-yellow-400 font-medium text-sm">Remote Online Notarization (RON) is coming soon.</p>
                    <p className="text-slate-400 text-xs mt-1">Mobile and in-person notary services are available now — book below.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {RON_SERVICES.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedService?.id === service.id
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{service.name}</p>
                            <p className="text-slate-400 text-xs mt-1">{service.description}</p>
                          </div>
                          <span className="text-emerald-400 font-bold text-sm ml-2">${service.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="general" className="mt-4">
                  <p className="text-slate-400 text-sm mb-4">
                    Mobile and in-person notarization — available locally. We come to you or meet at a convenient location.
                  </p>
                  <div className="grid grid-cols-1 gap-3 mb-4">
                    {GENERAL_SERVICES.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service as any)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedService?.id === service.id
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{service.name}</p>
                            <p className="text-slate-400 text-xs">{service.description}</p>
                          </div>
                          <span className="text-emerald-400 font-bold">${service.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Booking Form */}
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Signer Name *</Label>
                    <Input
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                      placeholder="Full legal name"
                      value={form.signerName}
                      onChange={e => setForm(f => ({ ...f, signerName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Signer Email *</Label>
                    <Input
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                      type="email"
                      placeholder="email@example.com"
                      value={form.signerEmail}
                      onChange={e => setForm(f => ({ ...f, signerEmail: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Document Name</Label>
                    <Input
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                      placeholder="e.g., Deed of Trust"
                      value={form.documentName}
                      onChange={e => setForm(f => ({ ...f, documentName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Preferred Date & Time *</Label>
                    <Input
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Additional Notes</Label>
                  <Textarea
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                    placeholder="Any special requirements or instructions..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={3}
                  />
                </div>

                {selectedService && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-emerald-400">{selectedService.name}</p>
                        <p className="text-slate-400 text-sm">{sessionType === 'RON' ? 'Remote Online Notarization' : 'General Notary'}</p>
                      </div>
                      <p className="text-2xl font-bold text-emerald-400">${selectedService.price}</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBook}
                  disabled={bookMutation.isPending || !selectedService}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {bookMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{upcomingSessions.length}</p>
                <p className="text-slate-400 text-sm">Upcoming Sessions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{pastSessions.filter(s => s.status === 'completed').length}</p>
                <p className="text-slate-400 text-sm">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">Local</p>
                <p className="text-slate-400 text-sm">Mobile & In-Person</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Remote Online Notarization</CardTitle>
                  <CardDescription className="text-slate-400">Coming soon</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-400">
                {['Secure video call session', 'Identity verification included', 'Digital seal & signature', 'Legally valid in 40+ states', 'Documents delivered digitally', 'Available 7 days a week'].map(item => (
                  <li key={item} className="flex items-center gap-2 opacity-50">
                    <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm font-medium">Coming Soon — join the waitlist via consultation booking</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-white">General Notary Services</CardTitle>
                  <CardDescription className="text-slate-400">Mobile & in-person — available locally now</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-300">
                {['Mobile notary — we come to you', 'In-person appointments available', 'All standard notarial acts', 'Certified true copies', 'Apostille assistance', 'Same-day service available'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg">
                <p className="text-emerald-400 text-sm font-medium">Starting at $10 per notarial act</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions List */}
        <Tabs defaultValue="upcoming">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-slate-400">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-slate-400">
              Past Sessions ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            {upcomingSessions.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No upcoming sessions. Book your first notary session above.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map(session => (
                  <Card key={session.id} className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                            {session.sessionType === 'RON' ? <Video className="w-5 h-5 text-blue-400" /> : <MapPin className="w-5 h-5 text-emerald-400" />}
                          </div>
                          <div>
                            <p className="font-medium text-white">{session.documentName || session.serviceType}</p>
                            <p className="text-slate-400 text-sm">{session.signerName} • {session.signerEmail}</p>
                            {session.scheduledAt && (
                              <p className="text-slate-500 text-xs mt-1">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {new Date(session.scheduledAt).toLocaleString()}
                              </p>
                            )}
                            {session.meetingLink && (
                              <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                                className="text-blue-400 text-xs hover:underline mt-1 block">
                                Join Meeting →
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={STATUS_COLORS[session.status || 'scheduled']}>
                            {session.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelMutation.mutate({ id: session.id })}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {pastSessions.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-12 text-center">
                  <FileSignature className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No past sessions yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pastSessions.map(session => (
                  <Card key={session.id} className="bg-slate-900 border-slate-800 opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                            {session.sessionType === 'RON' ? <Video className="w-5 h-5 text-slate-500" /> : <MapPin className="w-5 h-5 text-slate-500" />}
                          </div>
                          <div>
                            <p className="font-medium text-white">{session.documentName || session.serviceType}</p>
                            <p className="text-slate-400 text-sm">{session.signerName}</p>
                            {session.scheduledAt && (
                              <p className="text-slate-500 text-xs mt-1">
                                {new Date(session.scheduledAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={STATUS_COLORS[session.status || 'completed']}>
                          {session.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
