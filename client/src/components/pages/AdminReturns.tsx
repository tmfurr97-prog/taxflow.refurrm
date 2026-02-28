import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  FileText, Eye, Download, User, Clock, CheckCircle2, Send,
  FileCheck, Star, ChevronDown, ChevronRight, Loader2, Shield,
  AlertCircle, RefreshCw, FileIcon, ImageIcon
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'submitted',     label: 'Submitted',       color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'docs_received', label: 'Docs Received',   color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'in_review',     label: 'In Review',       color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'ready_to_sign', label: 'Ready to Sign',   color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'filed',         label: 'Filed',           color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'draft',         label: 'Draft',           color: 'bg-slate-500/20 text-gray-500 border-slate-500/30' },
];

function getStatusStyle(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status)?.color ?? 'bg-slate-500/20 text-gray-500 border-slate-500/30';
}
function getStatusLabel(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status)?.label ?? status;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === 'application/pdf') return <FileText className="w-4 h-4 text-red-400" />;
  if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-blue-400" />;
  return <FileIcon className="w-4 h-4 text-gray-500" />;
}

type ReturnRow = {
  id: number;
  userId: number;
  taxYear: number;
  status: string;
  isNewClient: boolean;
  clientNotes: string | null;
  checklistCompletePct: number | null;
  createdAt: number;
  updatedAt: number;
};

function ReturnDetailPanel({ returnId, onClose }: { returnId: number; onClose: () => void }) {
  const { data, isLoading } = trpc.remoteReturns.adminGetById.useQuery({ returnId });
  const updateMutation = trpc.remoteReturns.updateStatus.useMutation({
    onSuccess: () => toast.success('Status updated'),
    onError: (e: { message: string }) => toast.error(e.message),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
    </div>
  );
  if (!data) return null;

  const docs = (data as any).documents ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 font-semibold text-lg">Return #{data.id} — Tax Year {data.taxYear}</h3>
          <p className="text-gray-500 text-sm">User ID: {data.userId} · {data.isNewClient ? 'New Client' : 'Returning Client'}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-gray-900">✕ Close</Button>
      </div>

      {/* Status Update */}
      <Card className="bg-gray-100 border-gray-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <p className="text-gray-500 text-xs mb-1">Current Status</p>
              <Badge className={`${getStatusStyle(data.status ?? '')} border`}>{getStatusLabel(data.status ?? '')}</Badge>
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-gray-500 text-xs mb-1">Update Status</p>
              <Select
                value={data.status ?? undefined}
                onValueChange={(val) => updateMutation.mutate({ returnId: data.id, status: val as "submitted" | "docs_received" | "in_review" | "ready_to_sign" | "filed" | "draft" | "rejected" })}
              >
                <SelectTrigger className="bg-gray-200 border-gray-300 text-gray-900 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-100 border-gray-200">
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-gray-900 hover:bg-gray-200">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Checklist</p>
              <div className="flex items-center gap-2">
                <Progress value={data.checklistCompletePct ?? 0} className="h-2 w-24" />
                <span className="text-gray-900 text-sm">{data.checklistCompletePct ?? 0}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Notes */}
      {data.clientNotes && (
        <Card className="bg-gray-100 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" /> Client Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{data.clientNotes}</p>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      <Card className="bg-gray-100 border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-gray-900 text-sm flex items-center gap-2">
            <Download className="w-4 h-4 text-gray-500" /> Uploaded Documents ({docs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {docs.map((doc: any) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-200 rounded-lg">
                  <FileTypeIcon mimeType={doc.mimeType} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{doc.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {doc.checklistCategory && <span className="mr-2 capitalize">{doc.checklistCategory.replace(/_/g, ' ')}</span>}
                      {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 border-gray-300 text-gray-600 hover:bg-slate-600 bg-transparent">
                      <Eye className="w-3 h-3" /> View
                    </Button>
                  </a>
                  <a href={doc.fileUrl} download={doc.fileName}>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 border-gray-300 text-gray-600 hover:bg-slate-600 bg-transparent">
                      <Download className="w-3 h-3" /> Download
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timestamps */}
      <div className="text-xs text-gray-600 flex gap-4">
        <span>Created: {new Date(data.createdAt).toLocaleString()}</span>
        <span>Updated: {new Date(data.updatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function AdminReturns() {
  const { data: user } = trpc.auth.me.useQuery();
  const [selectedReturn, setSelectedReturn] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: returns, isLoading, refetch } = trpc.remoteReturns.adminList.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  // Not admin
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="bg-white border-gray-200 max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-gray-900 text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-500 text-sm">This page is restricted to admin users only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredReturns = (returns as ReturnRow[] | undefined)?.filter(r =>
    statusFilter === 'all' || r.status === statusFilter
  ) ?? [];

  const statusCounts = (returns as ReturnRow[] | undefined)?.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h1 className="text-2xl font-bold text-gray-900">Admin — Returns Dashboard</h1>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border text-xs">Admin Only</Badge>
              </div>
              <p className="text-gray-500 text-sm">Manage all client tax return submissions</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-gray-200 text-gray-600 hover:bg-gray-100 bg-transparent gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(statusFilter === opt.value ? 'all' : opt.value)}
                className={`p-3 rounded-lg border transition-all text-left ${
                  statusFilter === opt.value
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-gray-200 bg-white hover:border-gray-200'
                }`}
              >
                <p className="text-2xl font-bold text-gray-900">{statusCounts[opt.value] ?? 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">{opt.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {selectedReturn ? (
          <ReturnDetailPanel returnId={selectedReturn} onClose={() => setSelectedReturn(null)} />
        ) : (
          <>
            {/* Filter Bar */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-gray-500 text-sm">Filter by status:</span>
              <Button
                size="sm"
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                className={statusFilter === 'all' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-100 bg-transparent'}
              >
                All ({returns?.length ?? 0})
              </Button>
              {STATUS_OPTIONS.filter(o => (statusCounts[o.value] ?? 0) > 0).map(opt => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={statusFilter === opt.value ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(opt.value)}
                  className={statusFilter === opt.value ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-100 bg-transparent'}
                >
                  {opt.label} ({statusCounts[opt.value]})
                </Button>
              ))}
            </div>

            {/* Returns Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : filteredReturns.length === 0 ? (
              <Card className="bg-white border-gray-200">
                <CardContent className="py-16 text-center">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No returns found{statusFilter !== 'all' ? ` with status "${getStatusLabel(statusFilter)}"` : ''}.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredReturns.map((ret) => (
                  <Card
                    key={ret.id}
                    className="bg-white border-gray-200 hover:border-gray-200 transition-colors cursor-pointer"
                    onClick={() => setSelectedReturn(ret.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Return ID + Year */}
                        <div className="min-w-[80px]">
                          <p className="text-gray-900 font-semibold">#{ret.id}</p>
                          <p className="text-gray-500 text-xs">TY {ret.taxYear}</p>
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                          <User className="w-4 h-4 text-gray-500 shrink-0" />
                          <div>
                            <p className="text-gray-600 text-sm">User #{ret.userId}</p>
                            <p className="text-gray-600 text-xs">{ret.isNewClient ? 'New client' : 'Returning client'}</p>
                          </div>
                        </div>

                        {/* Status */}
                        <Badge className={`${getStatusStyle(ret.status)} border`}>
                          {getStatusLabel(ret.status)}
                        </Badge>

                        {/* Progress */}
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Progress value={ret.checklistCompletePct ?? 0} className="h-1.5 w-20" />
                          <span className="text-gray-500 text-xs">{ret.checklistCompletePct ?? 0}%</span>
                        </div>

                        {/* Notes indicator */}
                        {ret.clientNotes && (
                          <div className="flex items-center gap-1 text-amber-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="text-xs">Has notes</span>
                          </div>
                        )}

                        {/* Date */}
                        <div className="text-right ml-auto">
                          <p className="text-gray-500 text-xs">{new Date(ret.createdAt).toLocaleDateString()}</p>
                          <p className="text-gray-600 text-xs">{new Date(ret.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
