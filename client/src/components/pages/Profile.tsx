import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Loader2, User, FileText, CreditCard, Gift } from 'lucide-react';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import PromoCodeRedemption from '@/components/PromoCodeRedemption';

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' },
];

const FILING_STATUSES = [
  { value: 'single', label: 'Single' },
  { value: 'married_filing_jointly', label: 'Married Filing Jointly' },
  { value: 'married_filing_separately', label: 'Married Filing Separately' },
  { value: 'head_of_household', label: 'Head of Household' },
  { value: 'qualifying_widow', label: 'Qualifying Widow(er)' },
];

const BUSINESS_TYPES = [
  { value: 'sole_proprietor', label: 'Sole Proprietor' },
  { value: 'llc_single', label: 'LLC (Single Member)' },
  { value: 'llc_multi', label: 'LLC (Multi Member)' },
  { value: 's_corp', label: 'S Corporation' },
  { value: 'c_corp', label: 'C Corporation' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'nonprofit', label: 'Nonprofit' },
];

export default function Profile() {
  const utils = trpc.useUtils();
  const { data: user, isLoading } = trpc.profile.get.useQuery();

  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [ssnLast4, setSsnLast4] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [aptSuite, setAptSuite] = useState('');
  const [city, setCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [zip, setZip] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [ein, setEin] = useState('');
  const [filingStatus, setFilingStatus] = useState('');
  const [taxState, setTaxState] = useState('');
  const [selfEmployed, setSelfEmployed] = useState(false);
  const [homeOwner, setHomeOwner] = useState(false);
  const [dependents, setDependents] = useState(0);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setMiddleInitial(user.middleInitial || '');
      setLastName(user.lastName || '');
      setDateOfBirth(user.dateOfBirth || '');
      setPhone(user.phone || '');
      setSsnLast4(user.ssnLast4 || '');
      setStreetAddress(user.streetAddress || '');
      setAptSuite(user.aptSuite || '');
      setCity(user.city || '');
      setAddrState(user.state || '');
      setZip(user.zip || '');
      setBusinessName(user.businessName || '');
      setBusinessType(user.businessType || '');
      setEin(user.ein || '');
      setFilingStatus(user.filingStatus || '');
      setTaxState(user.state || '');
      setSelfEmployed(user.selfEmployed || false);
      setHomeOwner(user.homeOwner || false);
      setDependents(user.dependents || 0);
    }
  }, [user]);

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      utils.profile.get.invalidate();
      toast({ title: 'Profile saved', description: 'Your information has been updated.' });
    },
    onError: (err) => {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    },
  });

  const handleSavePersonal = () => {
    updateMutation.mutate({ firstName, middleInitial, lastName, dateOfBirth, phone, ssnLast4 });
  };

  const handleSaveAddress = () => {
    updateMutation.mutate({ streetAddress, aptSuite, city, state: addrState, zip });
  };

  const handleSaveBusiness = () => {
    updateMutation.mutate({ businessName, businessType, ein });
  };

  const handleSaveTaxProfile = () => {
    updateMutation.mutate({ filingStatus, state: taxState, selfEmployed, homeOwner, dependents });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Keep your information accurate — it is used to prepare your tax returns.
        </p>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="mb-6 flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Info
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Tax Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Subscription
          </TabsTrigger>
          <TabsTrigger value="promo" className="flex items-center gap-2">
            <Gift className="h-4 w-4" /> Promo Code
          </TabsTrigger>
        </TabsList>

        {/* ── Personal Info ── */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Legal Name</CardTitle>
              <CardDescription>Enter your name exactly as it appears on your Social Security card.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-5 space-y-1">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Teresa" />
                </div>
                <div className="col-span-4 md:col-span-2 space-y-1">
                  <Label htmlFor="middleInitial">M.I.</Label>
                  <Input id="middleInitial" value={middleInitial} onChange={e => setMiddleInitial(e.target.value.slice(0, 4))} placeholder="M" maxLength={4} />
                </div>
                <div className="col-span-8 md:col-span-5 space-y-1">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Furr" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 555-5555" />
                </div>
              </div>
              <div className="space-y-1 max-w-xs">
                <Label htmlFor="ssnLast4">SSN / ITIN — Last 4 Digits</Label>
                <Input
                  id="ssnLast4"
                  value={ssnLast4}
                  onChange={e => setSsnLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  maxLength={4}
                  inputMode="numeric"
                />
                <p className="text-xs text-muted-foreground">Used for return identification only. Full SSN is collected securely during tax prep.</p>
              </div>
              <Button onClick={handleSavePersonal} disabled={updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Personal Info
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Home Address</CardTitle>
              <CardDescription>Your current mailing address as it should appear on your tax return.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-8 space-y-1">
                  <Label htmlFor="streetAddress">Street Address</Label>
                  <Input id="streetAddress" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} placeholder="123 Main Street" />
                </div>
                <div className="col-span-12 md:col-span-4 space-y-1">
                  <Label htmlFor="aptSuite">Apt / Suite / Unit</Label>
                  <Input id="aptSuite" value={aptSuite} onChange={e => setAptSuite(e.target.value)} placeholder="Apt 4B" />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-5 space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="Springfield" />
                </div>
                <div className="col-span-6 md:col-span-4 space-y-1">
                  <Label htmlFor="addrState">State</Label>
                  <Select value={addrState} onValueChange={setAddrState}>
                    <SelectTrigger id="addrState"><SelectValue placeholder="State" /></SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(s => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-6 md:col-span-3 space-y-1">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" value={zip} onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="62701" inputMode="numeric" />
                </div>
              </div>
              <Button onClick={handleSaveAddress} disabled={updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Address
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Business Information</CardTitle>
              <CardDescription>Complete if you are self-employed or own a business.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="businessName">Business / DBA Name</Label>
                  <Input id="businessName" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="ReFurrm LLC" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger id="businessType"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1 max-w-xs">
                <Label htmlFor="ein">Employer Identification Number (EIN)</Label>
                <Input id="ein" value={ein} onChange={e => setEin(e.target.value)} placeholder="12-3456789" />
              </div>
              <Button onClick={handleSaveBusiness} disabled={updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Business Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tax Profile ── */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tax Filing Profile</CardTitle>
              <CardDescription>Used to personalize your tax estimates and TaxGPT responses.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="filingStatus">Filing Status</Label>
                  <Select value={filingStatus} onValueChange={setFilingStatus}>
                    <SelectTrigger id="filingStatus"><SelectValue placeholder="Select filing status" /></SelectTrigger>
                    <SelectContent>
                      {FILING_STATUSES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="taxState">State of Residence (for taxes)</Label>
                  <Select value={taxState} onValueChange={setTaxState}>
                    <SelectTrigger id="taxState"><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {US_STATES.map(s => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1 max-w-xs">
                <Label htmlFor="dependents">Number of Dependents</Label>
                <Input
                  id="dependents"
                  type="number"
                  min={0}
                  max={20}
                  value={dependents}
                  onChange={e => setDependents(parseInt(e.target.value) || 0)}
                />
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Tax Situation</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selfEmployed}
                    onChange={e => setSelfEmployed(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-emerald-500"
                  />
                  <span className="text-sm text-foreground">I am self-employed or have freelance / gig income</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={homeOwner}
                    onChange={e => setHomeOwner(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-emerald-500"
                  />
                  <span className="text-sm text-foreground">I own my home (mortgage interest deduction may apply)</span>
                </label>
              </div>
              <Button onClick={handleSaveTaxProfile} disabled={updateMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Tax Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Subscription ── */}
        <TabsContent value="subscription">
          <SubscriptionManagement />
        </TabsContent>

        {/* ── Promo Code ── */}
        <TabsContent value="promo">
          <PromoCodeRedemption />
        </TabsContent>
      </Tabs>
    </div>
  );
}
