import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar } from "lucide-react";

export default function ReportCenter() {
  const reports = [
    { name: "Schedule C - Profit or Loss", year: 2024, status: "Ready" },
    { name: "Income Summary", year: 2024, status: "Ready" },
    { name: "Expense Report by Category", year: 2024, status: "Ready" },
    { name: "Quarterly Tax Summary Q1", year: 2024, status: "Ready" },
  ];

  const handleExport = (reportName: string, format: string) => {
    console.log(`Exporting ${reportName} as ${format}`);
    // Implementation would generate and download the report
  };

  return (
    <Card className="border-teal/20">
      <CardHeader>
        <CardTitle className="font-heading text-charcoal flex items-center gap-2">
          <FileText className="h-5 w-5 text-teal" />
          Report Center
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reports.map((report) => (
          <div key={report.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-teal/50 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-teal" />
              <div>
                <p className="font-medium text-charcoal">{report.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {report.year} • {report.status}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleExport(report.name, 'PDF')}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport(report.name, 'CSV')}>
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
