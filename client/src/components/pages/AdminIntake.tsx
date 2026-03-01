import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Search, ChevronRight, X, FileText, Users, DollarSign,
  Heart, MapPin, Phone, Calendar, User, ExternalLink,
  CheckCircle, Clock, AlertCircle, Loader2, StickyNote,
  RefreshCw, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type IntakeStatus = "draft" | "submitted" | "in_review" | "ready_to_sign" | "filed";

interface IntakeRow {
  id: number;
  taxYear: number;
  firstName?: string | null;
  middleInitial?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  ssnLast4?: string | null;
  streetAddress?: string | null;
  aptSuite?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  filingStatus?: string | null;
  spouseFirstName?: string | null;
  spouseLastName?: string | null;
  spouseDob?: string | null;
  spouseSsnLast4?: string | null;
  dependents?: any;
  incomeDocs?: any;
  deductions?: any;
  donations?: any;
  additionalNotes?: string | null;
  status?: IntakeStatus | null;
  paymentType?: string | null;
  preparerNotes?: string | null;
  createdAt: Date | string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<IntakeStatus, { label: string; color: string; icon: any }> = {
  draft:          { label: "Draft",           color: "bg-gray-100 text-gray-600 border-gray-200",      icon: Clock },
  submitted:      { label: "Submitted",       color: "bg-blue-100 text-blue-700 border-blue-200",      icon: CheckCircle },
  in_review:      { label: "In Review",       color: "bg-amber-100 text-amber-700 border-amber-200",   icon: AlertCircle },
  ready_to_sign:  { label: "Ready to Sign",   color: "bg-purple-100 text-purple-700 border-purple-200", icon: FileText },
  filed:          { label: "Filed",           color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle },
};

const FILING_STATUS_LABELS: Record<string, string> = {
  single: "Single",
  married_jointly: "MFJ",
  married_separately: "MFS",
  head_of_household: "HOH",
  qualifying_widow: "QSS",
};

const CURRENT_YEAR = new Date().getFullYear() - 1;

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminIntake() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [selected, setSelected] = useState<IntakeRow | null>(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { data: intakes = [], isLoading, refetch } = trpc.intake.adminList.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const updateStatus = trpc.intake.updateStatus.useMutation({
    onSuccess: () => { refetch(); },
  });
  const addNote = trpc.intake.addNote.useMutation({
    onSuccess: () => { refetch(); },
  });

  // Filter and search
  const filtered = useMemo(() => {
    return (intakes as IntakeRow[]).filter(row => {
      const name = `${row.firstName ?? ""} ${row.lastName ?? ""}`.toLowerCase();
      const email = (row.email ?? "").toLowerCase();
      const q = search.toLowerCase();
      if (q && !name.includes(q) && !email.includes(q)) return false;
      if (filterStatus !== "all" && row.status !== filterStatus) return false;
      if (filterYear !== "all" && row.taxYear !== parseInt(filterYear)) return false;
      if (filterPayment !== "all" && row.paymentType !== filterPayment) return false;
      return true;
    });
  }, [intakes, search, filterStatus, filterYear, filterPayment]);

  // Summary counts
  const counts = useMemo(() => {
    const all = intakes as IntakeRow[];
    return {
      total: all.length,
      submitted: all.filter(r => r.status === "submitted").length,
      inReview: all.filter(r => r.status === "in_review").length,
      filed: all.filter(r => r.status === "filed").length,
      paid: all.filter(r => r.paymentType === "basic_filing").length,
    };
  }, [intakes]);

  const handleStatusChange = async (id: number, status: IntakeStatus) => {
    setUpdatingStatus(true);
    try {
      await updateStatus.mutateAsync({ id, status });
      if (selected?.id === id) setSelected(s => s ? { ...s, status } : s);
      toast({ title: "Status updated" });
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selected) return;
    setSavingNote(true);
    try {
      await addNote.mutateAsync({ id: selected.id, note: noteText });
      setSelected(s => s ? { ...s, preparerNotes: noteText } : s);
      toast({ title: "Note saved" });
    } catch {
      toast({ title: "Failed to save note", variant: "destructive" });
    } finally {
      setSavingNote(false);
    }
  };

  const openDetail = (row: IntakeRow) => {
    setSelected(row);
    setNoteText(row.preparerNotes ?? "");
  };

  const formatDate = (d: Date | string) => {
    try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return "—"; }
  };

  const docCount = (row: IntakeRow) => {
    const docs = Array.isArray(row.incomeDocs) ? row.incomeDocs : [];
    return { total: docs.length, uploaded: docs.filter((d: any) => d.uploaded).length };
  };

  const depCount = (row: IntakeRow) => Array.isArray(row.dependents) ? row.dependents.length : 0;

  const StatusBadge = ({ status }: { status?: IntakeStatus | null }) => {
    const cfg = STATUS_CONFIG[status ?? "submitted"] ?? STATUS_CONFIG.submitted;
    const Icon = cfg.icon;
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", cfg.color)}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </span>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full bg-gray-50">
      {/* Main panel */}
      <div className={cn("flex flex-col flex-1 min-w-0 transition-all", selected ? "lg:mr-[480px]" : "")}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Intake Submissions</h1>
              <p className="text-sm text-gray-500">All client tax intake forms</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {[
              { label: "Total", value: counts.total, color: "text-gray-900" },
              { label: "Submitted", value: counts.submitted, color: "text-blue-700" },
              { label: "In Review", value: counts.inReview, color: "text-amber-700" },
              { label: "Filed", value: counts.filed, color: "text-emerald-700" },
              { label: "Paid ($199)", value: counts.paid, color: "text-purple-700" },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                className="pl-9 h-9 text-sm"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-28 h-9 text-sm">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="basic_filing">Paid ($199)</SelectItem>
                <SelectItem value="free_consult">Free Consult</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading intakes...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FileText className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No submissions found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Filing</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Docs</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(row => {
                  const docs = docCount(row);
                  const isSelected = selected?.id === row.id;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => openDetail(row)}
                      className={cn(
                        "cursor-pointer hover:bg-gray-50 transition-colors",
                        isSelected && "bg-emerald-50 hover:bg-emerald-50"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {row.firstName} {row.lastName}
                          {!row.firstName && !row.lastName && <span className="text-gray-400 italic">Anonymous</span>}
                        </div>
                        <div className="text-xs text-gray-500">{row.email ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{row.taxYear}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.filingStatus ? FILING_STATUS_LABELS[row.filingStatus] ?? row.filingStatus : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-medium", docs.uploaded === docs.total && docs.total > 0 ? "text-emerald-700" : "text-amber-600")}>
                          {docs.uploaded}/{docs.total} uploaded
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.paymentType === "basic_filing" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                            $199 Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            Free Consult
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(row.createdAt)}</td>
                      <td className="px-4 py-3">
                        <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform", isSelected && "rotate-90 text-emerald-600")} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed right-0 top-0 h-full w-full lg:w-[480px] bg-white border-l border-gray-200 shadow-xl z-30 flex flex-col overflow-hidden">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h2 className="font-bold text-gray-900 text-base">
                {selected.firstName} {selected.lastName}
                {!selected.firstName && !selected.lastName && <span className="text-gray-400 italic">Anonymous</span>}
              </h2>
              <p className="text-xs text-gray-500">{selected.taxYear} Tax Return · #{selected.id}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status update bar */}
          <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
            <span className="text-xs font-medium text-gray-600">Status:</span>
            <Select
              value={selected.status ?? "submitted"}
              onValueChange={v => handleStatusChange(selected.id, v as IntakeStatus)}
              disabled={updatingStatus}
            >
              <SelectTrigger className="h-8 text-xs w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
            <div className="ml-auto">
              {selected.paymentType === "basic_filing" ? (
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-full">$199 Paid</span>
              ) : (
                <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded-full">Free Consult</span>
              )}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

            {/* Contact */}
            <Section title="Contact Information" icon={User}>
              <Grid2>
                <Field label="Name">{selected.firstName} {selected.middleInitial ? selected.middleInitial + "." : ""} {selected.lastName}</Field>
                <Field label="Email">
                  {selected.email ? (
                    <a href={`mailto:${selected.email}`} className="text-emerald-600 hover:underline flex items-center gap-1">
                      {selected.email} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : "—"}
                </Field>
                <Field label="Phone">{selected.phone || "—"}</Field>
                <Field label="Date of Birth">{selected.dateOfBirth || "—"}</Field>
                <Field label="SSN Last 4">****{selected.ssnLast4 || "—"}</Field>
                <Field label="Address">
                  {[selected.streetAddress, selected.aptSuite, selected.city, selected.state, selected.zip].filter(Boolean).join(", ") || "—"}
                </Field>
              </Grid2>
            </Section>

            {/* Filing status */}
            <Section title="Filing Status" icon={Users}>
              <Grid2>
                <Field label="Status">{selected.filingStatus ? FILING_STATUS_LABELS[selected.filingStatus] ?? selected.filingStatus : "—"}</Field>
                {selected.spouseFirstName && (
                  <>
                    <Field label="Spouse Name">{selected.spouseFirstName} {selected.spouseLastName}</Field>
                    <Field label="Spouse DOB">{selected.spouseDob || "—"}</Field>
                    <Field label="Spouse SSN Last 4">****{selected.spouseSsnLast4 || "—"}</Field>
                  </>
                )}
              </Grid2>
            </Section>

            {/* Dependents */}
            {Array.isArray(selected.dependents) && selected.dependents.length > 0 && (
              <Section title={`Dependents (${selected.dependents.length})`} icon={Users}>
                <div className="space-y-2">
                  {selected.dependents.map((dep: any, i: number) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 grid grid-cols-2 gap-x-4 gap-y-1">
                      <span className="text-gray-500">Name</span><span>{dep.firstName} {dep.lastName}</span>
                      <span className="text-gray-500">DOB</span><span>{dep.dob || "—"}</span>
                      <span className="text-gray-500">SSN Last 4</span><span>****{dep.ssn4 || "—"}</span>
                      <span className="text-gray-500">Relationship</span><span>{dep.relationship || "—"}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Income documents */}
            <Section title="Income Documents" icon={FileText}>
              {Array.isArray(selected.incomeDocs) && selected.incomeDocs.length > 0 ? (
                <div className="space-y-1.5">
                  {selected.incomeDocs.map((doc: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {doc.uploaded
                          ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          : <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        }
                        <span className="text-xs text-gray-700 font-medium">{doc.type}</span>
                      </div>
                      {doc.fileUrl ? (
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                          onClick={e => e.stopPropagation()}>
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Not uploaded</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No documents selected</p>
              )}
            </Section>

            {/* Deductions */}
            {selected.deductions && Object.keys(selected.deductions).some(k => k.startsWith("has") && (selected.deductions as any)[k]) && (
              <Section title="Deductions" icon={DollarSign}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {[
                    { key: "hasMortgage", label: "Mortgage Interest", field: "mortgageInterest" },
                    { key: "hasPropertyTax", label: "Property Tax", field: "propertyTax" },
                    { key: "hasMedical", label: "Medical Expenses", field: "medicalExpenses" },
                    { key: "hasStudentLoan", label: "Student Loan Interest", field: "studentLoanInterest" },
                    { key: "hasEducator", label: "Educator Expenses", field: "educatorExpenses" },
                    { key: "hasRetirement", label: "Retirement Contributions", field: "retirementContributions" },
                    { key: "hasHomeOffice", label: "Home Office", field: null },
                  ].filter(d => (selected.deductions as any)?.[d.key]).map(d => (
                    <div key={d.key} className="contents">
                      <span className="text-gray-500">{d.label}</span>
                      <span className="text-gray-800 font-medium">
                        {d.field && (selected.deductions as any)?.[d.field]
                          ? `$${(selected.deductions as any)[d.field]}`
                          : d.key === "hasHomeOffice"
                            ? `${(selected.deductions as any).homeOfficeSqft || "?"} / ${(selected.deductions as any).totalHomeSqft || "?"} sqft`
                            : "Listed"
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Donations */}
            {Array.isArray(selected.donations) && selected.donations.length > 0 && (
              <Section title={`Donations (${selected.donations.length})`} icon={Heart}>
                <div className="space-y-1.5">
                  {selected.donations.map((don: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg text-xs">
                      <span className="text-gray-700 font-medium">{don.charity || "Unknown"}</span>
                      <span className="text-gray-600">{don.amount ? `$${don.amount}` : "—"} · {don.donationType === "cash" ? "Cash" : "Non-Cash"}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Client notes */}
            {selected.additionalNotes && (
              <Section title="Client Notes" icon={StickyNote}>
                <p className="text-xs text-gray-700 bg-amber-50 border border-amber-200 rounded-lg p-3 whitespace-pre-wrap">{selected.additionalNotes}</p>
              </Section>
            )}

            {/* Preparer notes */}
            <Section title="Preparer Notes" icon={StickyNote}>
              <Textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add internal notes visible only to you..."
                rows={4}
                className="text-xs resize-none"
              />
              <Button
                size="sm"
                onClick={handleSaveNote}
                disabled={savingNote}
                className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-xs"
              >
                {savingNote ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Saving...</> : "Save Note"}
              </Button>
            </Section>

          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-4 gap-y-2">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xs text-gray-800 font-medium mt-0.5">{children || "—"}</p>
    </div>
  );
}
