import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Mail, FileText, Receipt, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export function EmailScanningInfo() {
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle>Email Receipt Scanning</CardTitle>
            <CardDescription>Automatically find receipts and bills in your inbox</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-white border-blue-200">
          <Mail className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            Connect your Gmail account below to automatically scan for receipts, invoices, and tax documents. 
            Our AI will extract transaction details and categorize them for you.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Auto-Detection</p>
              <p className="text-xs text-gray-600">Finds receipts from Amazon, Uber, and more</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Smart Extraction</p>
              <p className="text-xs text-gray-600">Pulls amounts, dates, and vendors</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border">
            <Receipt className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Tax Ready</p>
              <p className="text-xs text-gray-600">Categorizes for deductions</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
