import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  User, Users, FileText, DollarSign, Heart, CheckCircle,
  CreditCard, ChevronRight, ChevronLeft, Plus, Trash2,
  Upload, AlertCircle, Loader2, Phone, MapPin, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Dependent {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  ssn4: string;
  relationship: string;
}

interface IncomeDoc {
  type: string;
  label: string;
  uploaded: boolean;
  fileUrl?: string;
  fileName?: string;
}

interface Donation {
  id: string;
  charity: string;
  amount: string;
  donationType: "cash" | "non-cash";
  receiptUrl?: string;
}

interface Deductions {
  mortgageInterest: string;
  propertyTax: string;
  medicalExpenses: string;
  studentLoanInterest: string;
  educatorExpenses: string;
  retirementContributions: string;
  retirementType: string;
  homeOfficeSqft: string;
  totalHomeSqft: string;
  hasMortgage: boolean;
  hasPropertyTax: boolean;
  hasMedical: boolean;
  hasStudentLoan: boolean;
  hasEducator: boolean;
  hasRetirement: boolean;
  hasHomeOffice: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const INCOME_DOC_TYPES = [
  { type: "W-2", label: "W-2 (Wages from employer)" },
  { type: "1099-NEC", label: "1099-NEC (Freelance / contractor income)" },
  { type: "1099-K", label: "1099-K (Payment platform: PayPal, Venmo, Cash App, etc.)" },
  { type: "1099-MISC", label: "1099-MISC (Miscellaneous income)" },
  { type: "1099-INT", label: "1099-INT (Bank interest)" },
  { type: "1099-DIV", label: "1099-DIV (Dividends)" },
  { type: "1099-R", label: "1099-R (Retirement / pension distributions)" },
  { type: "SSA-1099", label: "SSA-1099 (Social Security benefits)" },
  { type: "1099-G", label: "1099-G (Unemployment / state refund)" },
  { type: "K-1", label: "Schedule K-1 (Partnership / S-Corp / trust income)" },
  { type: "Schedule-C", label: "Schedule C (Self-employment / business income)" },
  { type: "1099-B", label: "1099-B (Stock / investment sales)" },
  { type: "Crypto-1099", label: "Crypto tax statement (1099-DA, 8949, or exchange CSV)" },
  { type: "Other", label: "Other income document" },
];

const FILING_STATUSES = [
  { value: "single", label: "Single" },
  { value: "married_jointly", label: "Married Filing Jointly" },
  { value: "married_separately", label: "Married Filing Separately" },
  { value: "head_of_household", label: "Head of Household" },
  { value: "qualifying_widow", label: "Qualifying Surviving Spouse" },
];

const RELATIONSHIPS = ["Son", "Daughter", "Stepchild", "Foster Child", "Sibling", "Parent", "Grandchild", "Niece/Nephew", "Other"];

const STEPS = [
  { id: 1, label: "Contact Info", icon: User },
  { id: 2, label: "Filing Status", icon: Users },
  { id: 3, label: "Dependents", icon: Users },
  { id: 4, label: "Income Docs", icon: FileText },
  { id: 5, label: "Deductions", icon: DollarSign },
  { id: 6, label: "Donations", icon: Heart },
  { id: 7, label: "Review & Pay", icon: CheckCircle },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function TaxIntake() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiReview, setAiReview] = useState<{ missing: string[]; warnings: string[]; ready: boolean; summary: string } | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);

  // Form state
  const currentYear = new Date().getFullYear() - 1; // filing for prior year
  const [contact, setContact] = useState({
    firstName: "", middleInitial: "", lastName: "",
    email: "", phone: "", dateOfBirth: "", ssnLast4: "",
    streetAddress: "", aptSuite: "", city: "", state: "", zip: "",
  });
  const [filingStatus, setFilingStatus] = useState("");
  const [spouse, setSpouse] = useState({ firstName: "", lastName: "", dob: "", ssn4: "" });
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [incomeDocs, setIncomeDocs] = useState<IncomeDoc[]>([]);
  const [deductions, setDeductions] = useState<Deductions>({
    mortgageInterest: "", propertyTax: "", medicalExpenses: "", studentLoanInterest: "",
    educatorExpenses: "", retirementContributions: "", retirementType: "Traditional IRA",
    homeOfficeSqft: "", totalHomeSqft: "",
    hasMortgage: false, hasPropertyTax: false, hasMedical: false,
    hasStudentLoan: false, hasEducator: false, hasRetirement: false, hasHomeOffice: false,
  });
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notes, setNotes] = useState("");

  const createIntake = trpc.intake.create.useMutation();
  const runAiReview = trpc.intake.aiReview.useMutation();
  const createCheckout = trpc.billing.createAlacarteCheckout.useMutation();

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const addDependent = () => {
    setDependents(d => [...d, { id: crypto.randomUUID(), firstName: "", lastName: "", dob: "", ssn4: "", relationship: "Son" }]);
  };
  const removeDependent = (id: string) => setDependents(d => d.filter(x => x.id !== id));
  const updateDependent = (id: string, field: keyof Dependent, value: string) => {
    setDependents(d => d.map(x => x.id === id ? { ...x, [field]: value } : x));
  };

  const toggleDocType = (type: string) => {
    setSelectedDocTypes(prev => {
      if (prev.includes(type)) {
        setIncomeDocs(docs => docs.filter(d => d.type !== type));
        return prev.filter(t => t !== type);
      }
      const docMeta = INCOME_DOC_TYPES.find(d => d.type === type)!;
      setIncomeDocs(docs => [...docs, { type, label: docMeta.label, uploaded: false }]);
      return [...prev, type];
    });
  };

  const addDonation = () => {
    setDonations(d => [...d, { id: crypto.randomUUID(), charity: "", amount: "", donationType: "cash" }]);
  };
  const removeDonation = (id: string) => setDonations(d => d.filter(x => x.id !== id));
  const updateDonation = (id: string, field: keyof Donation, value: string) => {
    setDonations(d => d.map(x => x.id === id ? { ...x, [field]: value } : x));
  };

  const handleDocUpload = async (docType: string, file: File) => {
    setUploadingDocType(docType);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", docType);
      const res = await fetch("/api/upload/intake-doc", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url, fileName } = await res.json();
      setIncomeDocs(docs => docs.map(d => d.type === docType ? { ...d, uploaded: true, fileUrl: url, fileName } : d));
      toast({ title: "Uploaded", description: `${docType} uploaded successfully.` });
    } catch {
      toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleAiReview = async () => {
    setReviewLoading(true);
    try {
      const result = await runAiReview.mutateAsync({
        filingStatus,
        hasDependents: dependents.length > 0,
        hasSpouse: filingStatus === "married_jointly" || filingStatus === "married_separately",
        selfEmployed: selectedDocTypes.includes("1099-NEC") || selectedDocTypes.includes("Schedule-C"),
        incomeDocs: incomeDocs.map(d => ({ type: d.type, uploaded: d.uploaded })),
        deductions: {
          hasMortgage: deductions.hasMortgage,
          hasPropertyTax: deductions.hasPropertyTax,
          hasMedical: deductions.hasMedical,
          hasStudentLoan: deductions.hasStudentLoan,
          hasEducator: deductions.hasEducator,
          hasRetirement: deductions.hasRetirement,
          hasHomeOffice: deductions.hasHomeOffice,
        },
        donations: donations.map(d => ({ charity: d.charity, amount: d.amount })),
      });
      setAiReview(result);
    } catch {
      setAiReview({ missing: [], warnings: [], ready: true, summary: "Your intake looks complete. We will review everything when we receive your submission." });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmit = async (paymentType: "free_consult" | "basic_filing") => {
    setSubmitting(true);
    try {
      await createIntake.mutateAsync({
        taxYear: currentYear,
        ...contact,
        filingStatus: filingStatus as any,
        spouseFirstName: spouse.firstName,
        spouseLastName: spouse.lastName,
        spouseDob: spouse.dob,
        spouseSsnLast4: spouse.ssn4,
        dependents,
        incomeDocs,
        deductions,
        donations,
        additionalNotes: notes,
        paymentType,
      });

      if (paymentType === "basic_filing") {
        const checkout = await createCheckout.mutateAsync({
          itemKey: "remoteReturn",
          origin: window.location.origin,
          metadata: { intake_email: contact.email, intake_name: `${contact.firstName} ${contact.lastName}` },
        });
        if (checkout.url) {
          toast({ title: "Redirecting to payment...", description: "Opening Stripe checkout." });
          window.open(checkout.url, "_blank");
        }
      }

      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const canAdvance = () => {
    if (step === 1) return contact.firstName && contact.lastName && contact.email;
    if (step === 2) return !!filingStatus;
    return true;
  };

  // ─── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center shadow-xl">
          <CardContent className="pt-12 pb-10 px-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Intake Submitted</h1>
            <p className="text-gray-600 mb-6">
              Your {currentYear} tax intake has been received. You will hear from your preparer within 1 to 2 business days at <strong>{contact.email}</strong>.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left text-sm text-gray-700 space-y-1 mb-6">
              <p><strong>Name:</strong> {contact.firstName} {contact.lastName}</p>
              <p><strong>Tax Year:</strong> {currentYear}</p>
              <p><strong>Filing Status:</strong> {FILING_STATUSES.find(f => f.value === filingStatus)?.label}</p>
              <p><strong>Documents Selected:</strong> {selectedDocTypes.length}</p>
            </div>
            <p className="text-xs text-gray-500">Questions? Email <a href="mailto:tax@refurrm.com" className="text-emerald-600 underline">tax@refurrm.com</a></p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Wizard ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="TaxFlow" className="w-8 h-8" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">TaxFlow Filing</h1>
              <p className="text-xs text-gray-500">{currentYear} Tax Return Intake</p>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
            Step {step} of {STEPS.length}
          </Badge>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-emerald-500 transition-all duration-300"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step nav */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => done && setStep(s.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    active && "bg-emerald-600 text-white shadow",
                    done && "bg-emerald-100 text-emerald-700 cursor-pointer hover:bg-emerald-200",
                    !active && !done && "bg-gray-100 text-gray-400 cursor-default"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">

        {/* STEP 1: Contact Info */}
        {step === 1 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><User className="w-5 h-5 text-emerald-600" /> Your Contact Information</CardTitle>
              <CardDescription>This is how your preparer will reach you. No account required.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <Label>First Name *</Label>
                  <Input value={contact.firstName} onChange={e => setContact(c => ({ ...c, firstName: e.target.value }))} placeholder="Teresa" />
                </div>
                <div className="col-span-1">
                  <Label>M.I.</Label>
                  <Input value={contact.middleInitial} onChange={e => setContact(c => ({ ...c, middleInitial: e.target.value }))} placeholder="M" maxLength={2} />
                </div>
                <div className="col-span-1">
                  <Label>Last Name *</Label>
                  <Input value={contact.lastName} onChange={e => setContact(c => ({ ...c, lastName: e.target.value }))} placeholder="Furr" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Email Address *</Label>
                  <Input type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} placeholder="you@example.com" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input className="pl-9" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} placeholder="(555) 000-0000" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input className="pl-9" type="date" value={contact.dateOfBirth} onChange={e => setContact(c => ({ ...c, dateOfBirth: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Last 4 of SSN</Label>
                  <Input value={contact.ssnLast4} onChange={e => setContact(c => ({ ...c, ssnLast4: e.target.value.replace(/\D/g, "").slice(0, 4) }))} placeholder="XXXX" maxLength={4} />
                </div>
              </div>
              <div>
                <Label>Street Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <Input className="pl-9" value={contact.streetAddress} onChange={e => setContact(c => ({ ...c, streetAddress: e.target.value }))} placeholder="123 Main St" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label>Apt / Suite</Label>
                  <Input value={contact.aptSuite} onChange={e => setContact(c => ({ ...c, aptSuite: e.target.value }))} placeholder="Apt 2B" />
                </div>
                <div className="col-span-1">
                  <Label>City</Label>
                  <Input value={contact.city} onChange={e => setContact(c => ({ ...c, city: e.target.value }))} placeholder="Spring" />
                </div>
                <div>
                  <Label>State</Label>
                  <Select value={contact.state} onValueChange={v => setContact(c => ({ ...c, state: v }))}>
                    <SelectTrigger><SelectValue placeholder="TX" /></SelectTrigger>
                    <SelectContent>{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ZIP</Label>
                  <Input value={contact.zip} onChange={e => setContact(c => ({ ...c, zip: e.target.value }))} placeholder="77373" maxLength={10} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Filing Status */}
        {step === 2 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Users className="w-5 h-5 text-emerald-600" /> Filing Status</CardTitle>
              <CardDescription>Select the status that applies to your situation for {currentYear}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {FILING_STATUSES.map(fs => (
                  <button
                    key={fs.value}
                    onClick={() => setFilingStatus(fs.value)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
                      filingStatus === fs.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                        : "border-gray-200 bg-white hover:border-emerald-200 text-gray-700"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0", filingStatus === fs.value ? "border-emerald-500 bg-emerald-500" : "border-gray-300")} />
                    <span className="font-medium">{fs.label}</span>
                  </button>
                ))}
              </div>

              {(filingStatus === "married_jointly" || filingStatus === "married_separately") && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-4">
                  <p className="text-sm font-semibold text-blue-800">Spouse Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Spouse First Name</Label>
                      <Input value={spouse.firstName} onChange={e => setSpouse(s => ({ ...s, firstName: e.target.value }))} placeholder="First" />
                    </div>
                    <div>
                      <Label>Spouse Last Name</Label>
                      <Input value={spouse.lastName} onChange={e => setSpouse(s => ({ ...s, lastName: e.target.value }))} placeholder="Last" />
                    </div>
                    <div>
                      <Label>Spouse Date of Birth</Label>
                      <Input type="date" value={spouse.dob} onChange={e => setSpouse(s => ({ ...s, dob: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Spouse SSN Last 4</Label>
                      <Input value={spouse.ssn4} onChange={e => setSpouse(s => ({ ...s, ssn4: e.target.value.replace(/\D/g, "").slice(0, 4) }))} placeholder="XXXX" maxLength={4} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Dependents */}
        {step === 3 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Users className="w-5 h-5 text-emerald-600" /> Dependents</CardTitle>
              <CardDescription>Add anyone you are claiming as a dependent on your {currentYear} return.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dependents.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No dependents added. Click below to add one, or skip this step.</p>
                </div>
              )}
              {dependents.map((dep, i) => (
                <div key={dep.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Dependent {i + 1}</span>
                    <button onClick={() => removeDependent(dep.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>First Name</Label>
                      <Input value={dep.firstName} onChange={e => updateDependent(dep.id, "firstName", e.target.value)} placeholder="First" />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input value={dep.lastName} onChange={e => updateDependent(dep.id, "lastName", e.target.value)} placeholder="Last" />
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <Input type="date" value={dep.dob} onChange={e => updateDependent(dep.id, "dob", e.target.value)} />
                    </div>
                    <div>
                      <Label>SSN Last 4</Label>
                      <Input value={dep.ssn4} onChange={e => updateDependent(dep.id, "ssn4", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="XXXX" maxLength={4} />
                    </div>
                    <div className="col-span-2">
                      <Label>Relationship</Label>
                      <Select value={dep.relationship} onValueChange={v => updateDependent(dep.id, "relationship", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addDependent} className="w-full border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                <Plus className="w-4 h-4 mr-2" /> Add Dependent
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Income Documents */}
        {step === 4 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><FileText className="w-5 h-5 text-emerald-600" /> Income Documents</CardTitle>
              <CardDescription>Select every document type that applies to you, then upload each one.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">Which of these did you receive in {currentYear}?</p>
                {INCOME_DOC_TYPES.map(doc => (
                  <label key={doc.type} className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    selectedDocTypes.includes(doc.type) ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-white hover:border-gray-300"
                  )}>
                    <Checkbox
                      checked={selectedDocTypes.includes(doc.type)}
                      onCheckedChange={() => toggleDocType(doc.type)}
                    />
                    <span className="text-sm text-gray-800">{doc.label}</span>
                  </label>
                ))}
              </div>

              {incomeDocs.length > 0 && (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Upload your documents</p>
                  {incomeDocs.map(doc => (
                    <div key={doc.type} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {doc.uploaded
                          ? <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          : <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        }
                        <div>
                          <p className="text-sm font-medium text-gray-800">{doc.type}</p>
                          {doc.fileName && <p className="text-xs text-gray-500">{doc.fileName}</p>}
                        </div>
                      </div>
                      <div>
                        {doc.uploaded ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Uploaded</Badge>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.webp"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleDocUpload(doc.type, file);
                              }}
                            />
                            <Button size="sm" variant="outline" className="text-xs" disabled={uploadingDocType === doc.type} asChild>
                              <span>
                                {uploadingDocType === doc.type ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
                                Upload
                              </span>
                            </Button>
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedDocTypes.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">Select at least one document type above. You can also upload later and note it in the additional notes on the final step.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* STEP 5: Deductions */}
        {step === 5 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><DollarSign className="w-5 h-5 text-emerald-600" /> Deductions</CardTitle>
              <CardDescription>Check everything that applies. Your preparer will verify amounts and determine the best strategy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "hasMortgage", label: "Mortgage Interest", field: "mortgageInterest", placeholder: "Annual amount (e.g. 8400)" },
                { key: "hasPropertyTax", label: "Property Taxes", field: "propertyTax", placeholder: "Annual amount" },
                { key: "hasMedical", label: "Medical & Dental Expenses", field: "medicalExpenses", placeholder: "Out-of-pocket total" },
                { key: "hasStudentLoan", label: "Student Loan Interest", field: "studentLoanInterest", placeholder: "Interest paid" },
                { key: "hasEducator", label: "Educator Expenses", field: "educatorExpenses", placeholder: "Up to $300" },
              ].map(item => (
                <div key={item.key} className={cn("p-4 rounded-xl border transition-all", (deductions as any)[item.key] ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white")}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={(deductions as any)[item.key]}
                      onCheckedChange={v => setDeductions(d => ({ ...d, [item.key]: !!v }))}
                    />
                    <span className="font-medium text-gray-800">{item.label}</span>
                  </label>
                  {(deductions as any)[item.key] && (
                    <div className="mt-3 ml-7">
                      <Label className="text-xs text-gray-600">Approximate Amount ($)</Label>
                      <Input
                        type="number"
                        value={(deductions as any)[item.field]}
                        onChange={e => setDeductions(d => ({ ...d, [item.field]: e.target.value }))}
                        placeholder={item.placeholder}
                        className="mt-1 max-w-xs"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Retirement */}
              <div className={cn("p-4 rounded-xl border transition-all", deductions.hasRetirement ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white")}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={deductions.hasRetirement} onCheckedChange={v => setDeductions(d => ({ ...d, hasRetirement: !!v }))} />
                  <span className="font-medium text-gray-800">Retirement Contributions (IRA, 401k, SEP-IRA, etc.)</span>
                </label>
                {deductions.hasRetirement && (
                  <div className="mt-3 ml-7 grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">Account Type</Label>
                      <Select value={deductions.retirementType} onValueChange={v => setDeductions(d => ({ ...d, retirementType: v }))}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Traditional IRA", "Roth IRA", "SEP-IRA", "SIMPLE IRA", "401(k)", "Solo 401(k)", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Amount Contributed ($)</Label>
                      <Input type="number" value={deductions.retirementContributions} onChange={e => setDeductions(d => ({ ...d, retirementContributions: e.target.value }))} placeholder="e.g. 6000" className="mt-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Home Office */}
              <div className={cn("p-4 rounded-xl border transition-all", deductions.hasHomeOffice ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white")}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={deductions.hasHomeOffice} onCheckedChange={v => setDeductions(d => ({ ...d, hasHomeOffice: !!v }))} />
                  <span className="font-medium text-gray-800">Home Office Deduction</span>
                </label>
                {deductions.hasHomeOffice && (
                  <div className="mt-3 ml-7 grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-600">Office Sq Ft</Label>
                      <Input type="number" value={deductions.homeOfficeSqft} onChange={e => setDeductions(d => ({ ...d, homeOfficeSqft: e.target.value }))} placeholder="e.g. 150" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600">Total Home Sq Ft</Label>
                      <Input type="number" value={deductions.totalHomeSqft} onChange={e => setDeductions(d => ({ ...d, totalHomeSqft: e.target.value }))} placeholder="e.g. 1800" className="mt-1" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 6: Donations */}
        {step === 6 && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Heart className="w-5 h-5 text-emerald-600" /> Charitable Donations</CardTitle>
              <CardDescription>Add any cash or non-cash donations made in {currentYear}. Upload receipts if you have them.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {donations.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No donations added. Skip this step if you have none to claim.</p>
                </div>
              )}
              {donations.map((don, i) => (
                <div key={don.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Donation {i + 1}</span>
                    <button onClick={() => removeDonation(don.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label>Organization Name</Label>
                      <Input value={don.charity} onChange={e => updateDonation(don.id, "charity", e.target.value)} placeholder="e.g. American Red Cross" />
                    </div>
                    <div>
                      <Label>Amount ($)</Label>
                      <Input type="number" value={don.amount} onChange={e => updateDonation(don.id, "amount", e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={don.donationType} onValueChange={v => updateDonation(don.id, "donationType", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash / Check / Card</SelectItem>
                          <SelectItem value="non-cash">Non-Cash (goods, clothing, etc.)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addDonation} className="w-full border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                <Plus className="w-4 h-4 mr-2" /> Add Donation
              </Button>

              <div className="mt-4">
                <Label>Additional Notes for Your Preparer</Label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Anything else your preparer should know: side income, life changes, prior year issues, etc."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 7: Review & Pay */}
        {step === 7 && (
          <div className="space-y-4">
            {/* AI Review */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><CheckCircle className="w-5 h-5 text-emerald-600" /> AI Completeness Check</CardTitle>
                <CardDescription>Let our AI review your intake before submitting to catch anything missing.</CardDescription>
              </CardHeader>
              <CardContent>
                {!aiReview && (
                  <Button onClick={handleAiReview} disabled={reviewLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    {reviewLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reviewing...</> : "Run AI Review"}
                  </Button>
                )}
                {aiReview && (
                  <div className="space-y-3">
                    <div className={cn("p-4 rounded-xl", aiReview.ready ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200")}>
                      <p className="text-sm font-medium text-gray-800">{aiReview.summary}</p>
                    </div>
                    {aiReview.missing.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">Missing / Required</p>
                        {aiReview.missing.map((m, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {aiReview.warnings.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Recommended</p>
                        {aiReview.warnings.map((w, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-amber-700">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setAiReview(null)} className="text-xs">Re-run Review</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Intake Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-gray-700">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-gray-500">Name</span><span className="font-medium">{contact.firstName} {contact.lastName}</span>
                  <span className="text-gray-500">Email</span><span>{contact.email}</span>
                  <span className="text-gray-500">Tax Year</span><span>{currentYear}</span>
                  <span className="text-gray-500">Filing Status</span><span>{FILING_STATUSES.find(f => f.value === filingStatus)?.label || "Not set"}</span>
                  <span className="text-gray-500">Dependents</span><span>{dependents.length}</span>
                  <span className="text-gray-500">Income Documents</span><span>{selectedDocTypes.length} selected, {incomeDocs.filter(d => d.uploaded).length} uploaded</span>
                  <span className="text-gray-500">Deductions</span><span>{Object.entries(deductions).filter(([k, v]) => k.startsWith("has") && v).length} selected</span>
                  <span className="text-gray-500">Donations</span><span>{donations.length} entries</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment options */}
            <Card className="shadow-sm border-2 border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><CreditCard className="w-5 h-5 text-emerald-600" /> Choose How to Proceed</CardTitle>
                <CardDescription>No payment is required until your return is complete. Additional form fees (if any) will be disclosed before filing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSubmit("free_consult")}
                    disabled={submitting}
                    className="p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 text-left transition-all group"
                  >
                    <div className="text-2xl font-bold text-gray-900 mb-1">Free</div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Consultation</div>
                    <p className="text-xs text-gray-500">Submit your intake and a preparer will contact you within 1 to 2 business days to review your situation and provide a quote.</p>
                  </button>
                  <button
                    onClick={() => handleSubmit("basic_filing")}
                    disabled={submitting}
                    className="p-5 rounded-xl border-2 border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-left transition-all relative"
                  >
                    <Badge className="absolute top-3 right-3 bg-emerald-600 text-white text-xs">Most Popular</Badge>
                    <div className="text-2xl font-bold text-emerald-700 mb-1">$199</div>
                    <div className="text-sm font-semibold text-gray-700 mb-2">Basic Human Filing</div>
                    <p className="text-xs text-gray-500">Federal + state return prepared and e-filed by a licensed preparer. Additional form fees disclosed before filing.</p>
                  </button>
                </div>
                {submitting && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting your intake...
                  </div>
                )}
                <p className="text-xs text-center text-gray-400 pt-2">
                  By submitting, you agree to our <a href="/terms" className="underline">Terms of Service</a> and <a href="/privacy" className="underline">Privacy Policy</a>.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {step < STEPS.length && (
            <Button
              onClick={() => setStep(s => Math.min(STEPS.length, s + 1))}
              disabled={!canAdvance()}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
