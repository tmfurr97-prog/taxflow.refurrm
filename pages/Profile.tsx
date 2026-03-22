import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Loader2, User, FileText, Settings, Shield, Gift, CreditCard, MapPin } from 'lucide-react';
import SecuritySection from '@/components/SecuritySection';
import { ReferralSystem } from '@/components/ReferralSystem';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import { stateTaxData } from '@/data/stateTaxData';

export default function Profile() {
  const { user, updateProfile, signOut } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [filingStatus, setFilingStatus] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [state, setState] = useState('');
  const [ein, setEin] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || user.user_metadata?.full_name || '');
        setFilingStatus(profile.filing_status || '');
        setBusinessName(profile.business_name || '');
        setBusinessType(profile.business_type || '');
        setState(profile.state || '');
        setEin(profile.ein || '');
        setAddress(profile.address || '');
        setPhone(profile.phone || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  useEffect(() => {
    const session = searchParams.get('session');
    if (session === 'success') {
      toast({ 
        title: 'Subscription Active!', 
        description: 'Your subscription has been activated successfully.',
      });
      setSearchParams({});
    } else if (session === 'canceled') {
      toast({ 
        title: 'Checkout Canceled', 
        description: 'Your subscription checkout was canceled.',
        variant: 'destructive'
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          filing_status: filingStatus,
          business_name: businessName,
          business_type: businessType,
          state,
          ein,
          address,
          phone
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Profile updated successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };


  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out', description: 'You have been signed out successfully.' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account and tax information</p>
        </div>

        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal"><User className="mr-2 h-4 w-4" />Personal</TabsTrigger>
            <TabsTrigger value="tax"><FileText className="mr-2 h-4 w-4" />Tax Info</TabsTrigger>
            <TabsTrigger value="subscription"><CreditCard className="mr-2 h-4 w-4" />Subscription</TabsTrigger>
            <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger>
            <TabsTrigger value="referrals"><Gift className="mr-2 h-4 w-4" />Referrals</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" />Settings</TabsTrigger>
          </TabsList>




          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle>Tax Information</CardTitle>
                <CardDescription>Manage your tax filing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="filingStatus">Filing Status</Label>
                  <Select value={filingStatus} onValueChange={setFilingStatus}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married_joint">Married Filing Jointly</SelectItem>
                      <SelectItem value="married_separate">Married Filing Separately</SelectItem>
                      <SelectItem value="head_of_household">Head of Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    State
                  </Label>

                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger><SelectValue placeholder="Select your state" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(stateTaxData).map(([code, info]) => (
                        <SelectItem key={code} value={code}>
                          {info.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Required for state tax form generation
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger><SelectValue placeholder="Select business type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="s_corp">S Corporation</SelectItem>
                      <SelectItem value="c_corp">C Corporation</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name (Optional)</Label>
                  <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ein">EIN (Optional)</Label>
                  <Input id="ein" value={ein} onChange={(e) => setEin(e.target.value)} placeholder="XX-XXXXXXX" />
                </div>

                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySection />
          </TabsContent>


          <TabsContent value="referrals">
            <ReferralSystem />
          </TabsContent>


          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Terms of Service</h3>
                  <p className="text-sm text-blue-700 mb-4">Review our terms and conditions</p>
                  <Button variant="outline" onClick={() => window.open('/terms', '_blank')}>View Terms</Button>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2">Sign Out</h3>
                  <p className="text-sm text-red-700 mb-4">Sign out of your account on this device</p>
                  <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
