import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Check, 
  X, 
  Eye, 
  Download,
  Calendar,
  DollarSign,
  Building,
  User,
  Hash
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DocumentReviewProps {
  documents: any[];
  onApprove: (doc: any) => void;
  onReject: (doc: any) => void;
  onClose: () => void;
}

export const DocumentReview: React.FC<DocumentReviewProps> = ({
  documents,
  onApprove,
  onReject,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [editedFields, setEditedFields] = useState<any>({});
  const { toast } = useToast();
  
  const currentDoc = documents[currentIndex];
  
  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'tax.us.w2': 'W-2 Form',
      'tax.us.1099': '1099 Form',
      'receipt': 'Receipt',
      'invoice': 'Invoice',
      'general': 'General Document'
    };
    return types[type] || 'Unknown Document';
  };
  
  const getDocumentIcon = (type: string) => {
    if (type?.includes('w2')) return <Building className="h-5 w-5" />;
    if (type?.includes('1099')) return <DollarSign className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };
  
  const handleApprove = () => {
    const approvedDoc = {
      ...currentDoc,
      fields: { ...currentDoc.fields, ...editedFields },
      approvedAt: new Date().toISOString()
    };
    
    onApprove(approvedDoc);
    
    if (currentIndex < documents.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setEditedFields({});
    } else {
      toast({
        title: "Review Complete",
        description: `Reviewed all ${documents.length} documents`,
      });
      onClose();
    }
  };
  
  const handleReject = () => {
    onReject(currentDoc);
    
    if (currentIndex < documents.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setEditedFields({});
    } else {
      onClose();
    }
  };
  
  const handleFieldEdit = (field: string, value: string) => {
    setEditedFields((prev: any) => ({ ...prev, [field]: value }));
  };
  
  if (!currentDoc) return null;
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Review Imported Documents</span>
            <Badge variant="outline">
              {currentIndex + 1} of {documents.length}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Document Info Card */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getDocumentIcon(currentDoc.documentType)}
                <div>
                  <h3 className="font-semibold">{currentDoc.filename}</h3>
                  <p className="text-sm text-gray-500">
                    {getDocumentTypeLabel(currentDoc.documentType)}
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                Auto-detected
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>From: {new Date(currentDoc.emailDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span className="truncate">{currentDoc.emailFrom}</span>
              </div>
            </div>
          </Card>
          
          {/* Extracted Data */}
          <Tabs defaultValue="extracted" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
              <TabsTrigger value="original">Original Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="extracted" className="space-y-4">
              {currentDoc.documentType === 'tax.us.w2' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Employer Name</Label>
                    <Input
                      value={editedFields.employerName || currentDoc.fields?.employerName || ''}
                      onChange={(e) => handleFieldEdit('employerName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Employer EIN</Label>
                    <Input
                      value={editedFields.employerEIN || currentDoc.fields?.employerEIN || ''}
                      onChange={(e) => handleFieldEdit('employerEIN', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Wages (Box 1)</Label>
                    <Input
                      type="number"
                      value={editedFields.wages || currentDoc.fields?.wages || ''}
                      onChange={(e) => handleFieldEdit('wages', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Federal Tax Withheld (Box 2)</Label>
                    <Input
                      type="number"
                      value={editedFields.federalTax || currentDoc.fields?.federalTax || ''}
                      onChange={(e) => handleFieldEdit('federalTax', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Social Security Wages (Box 3)</Label>
                    <Input
                      type="number"
                      value={editedFields.ssWages || currentDoc.fields?.ssWages || ''}
                      onChange={(e) => handleFieldEdit('ssWages', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Social Security Tax (Box 4)</Label>
                    <Input
                      type="number"
                      value={editedFields.ssTax || currentDoc.fields?.ssTax || ''}
                      onChange={(e) => handleFieldEdit('ssTax', e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              {currentDoc.documentType === 'tax.us.1099' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Payer Name</Label>
                    <Input
                      value={editedFields.payerName || currentDoc.fields?.payerName || ''}
                      onChange={(e) => handleFieldEdit('payerName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Payer TIN</Label>
                    <Input
                      value={editedFields.payerTIN || currentDoc.fields?.payerTIN || ''}
                      onChange={(e) => handleFieldEdit('payerTIN', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Nonemployee Compensation</Label>
                    <Input
                      type="number"
                      value={editedFields.compensation || currentDoc.fields?.compensation || ''}
                      onChange={(e) => handleFieldEdit('compensation', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Federal Tax Withheld</Label>
                    <Input
                      type="number"
                      value={editedFields.federalTax || currentDoc.fields?.federalTax || ''}
                      onChange={(e) => handleFieldEdit('federalTax', e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              {(currentDoc.documentType === 'general' || currentDoc.documentType === 'receipt') && (
                <div className="space-y-4">
                  <div>
                    <Label>Document Type</Label>
                    <Input
                      value={editedFields.type || 'Receipt'}
                      onChange={(e) => handleFieldEdit('type', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={editedFields.amount || ''}
                      onChange={(e) => handleFieldEdit('amount', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      placeholder="Enter description"
                      value={editedFields.description || ''}
                      onChange={(e) => handleFieldEdit('description', e.target.value)}
                    />
                  </div>
                  {currentDoc.keyValuePairs && Object.entries(currentDoc.keyValuePairs).map(([key, value]) => (
                    <div key={key}>
                      <Label>{key}</Label>
                      <Input
                        value={editedFields[key] || value}
                        onChange={(e) => handleFieldEdit(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="original">
              <Card className="p-4 bg-gray-50">
                <pre className="text-sm whitespace-pre-wrap">
                  {currentDoc.text || 'No text extracted'}
                </pre>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReject}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve & Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};