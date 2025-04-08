import React, { useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, Download, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Badge } from "@/components/ui/badge";

interface ReportOptions {
  startDate: Date;
  endDate: Date;
  includeGST: boolean;
  includeTDS: boolean;
  includeIncomeTax: boolean;
  includeROC: boolean;
  entityType?: string;
}

export const ComplianceReporting = () => {
  const { clients, getClientComplianceStatus } = useClientContext();
  const { tasks } = useTaskContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<ReportOptions>({
    startDate: startOfMonth(subMonths(new Date(), 1)),
    endDate: endOfMonth(new Date()),
    includeGST: true,
    includeTDS: true,
    includeIncomeTax: true,
    includeROC: true,
    entityType: undefined
  });

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const reportDate = format(new Date(), 'dd/MM/yyyy');
      
      // Add report header
      doc.setFontSize(20);
      doc.text('Compliance Status Report', 15, 20);
      doc.setFontSize(12);
      doc.text(`Report Period: ${format(options.startDate, 'dd/MM/yyyy')} - ${format(options.endDate, 'dd/MM/yyyy')}`, 15, 30);
      doc.text(`Generated on: ${reportDate}`, 15, 37);

      // Filter clients based on entity type
      const filteredClients = clients.filter(client => 
        !options.entityType || client.entityType === options.entityType
      );

      // Summarize compliance status
      const complianceSummary = {
        total: filteredClients.length,
        gstCompliant: filteredClients.filter(c => c.isGSTRegistered && c.gstin).length,
        tdsCompliant: filteredClients.filter(c => c.tan).length,
        panCompliant: filteredClients.filter(c => c.pan).length,
        cinCompliant: filteredClients.filter(c => 
          c.entityType === 'Company' ? c.cin : true
        ).length,
      };

      // Add summary section
      doc.setFontSize(14);
      doc.text('Compliance Summary', 15, 50);
      doc.setFontSize(12);
      
      const summaryData = [
        ['Total Clients', complianceSummary.total.toString()],
        ['GST Registered & Compliant', complianceSummary.gstCompliant.toString()],
        ['TDS Compliant', complianceSummary.tdsCompliant.toString()],
        ['PAN Available', complianceSummary.panCompliant.toString()],
        ['CIN Available (Companies)', complianceSummary.cinCompliant.toString()],
      ];

      autoTable(doc, {
        startY: 55,
        head: [['Metric', 'Count']],
        body: summaryData,
        theme: 'grid',
      });

      // Add client-wise compliance details
      if (options.includeGST || options.includeTDS || options.includeIncomeTax || options.includeROC) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Client-wise Compliance Details', 15, 20);

        const clientData = filteredClients.map(client => {
          const status = getClientComplianceStatus(client.id);
          return [
            client.name,
            client.entityType,
            client.isGSTRegistered ? (client.gstin ? 'Compliant' : 'Non-compliant') : 'N/A',
            client.tan ? 'Available' : 'Missing',
            status.missingDocuments.join(', ') || 'None',
            status.isCompliant ? 'Compliant' : 'Non-compliant'
          ];
        });

        autoTable(doc, {
          startY: 30,
          head: [['Client Name', 'Entity Type', 'GST Status', 'TDS Status', 'Missing Documents', 'Overall Status']],
          body: clientData,
          theme: 'striped',
          styles: { fontSize: 10 },
        });
      }

      // Add filing status for the period
      if (options.includeGST || options.includeTDS) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Filing Status', 15, 20);

        const filingData = filteredClients.flatMap(client => {
          const periodTasks = tasks.filter(task => 
            task.clientId === client.id &&
            task.dueDate &&
            task.dueDate >= options.startDate &&
            task.dueDate <= options.endDate &&
            ((options.includeGST && task.tags.includes('GST')) ||
             (options.includeTDS && task.tags.includes('TDS')) ||
             (options.includeIncomeTax && task.tags.includes('Income Tax')) ||
             (options.includeROC && task.tags.includes('ROC')))
          );

          return periodTasks.map(task => [
            client.name,
            task.title,
            format(new Date(task.dueDate!), 'dd/MM/yyyy'),
            task.status === 'inProgress' ? 'In Progress' : 
              task.status === 'done' ? 'Completed' : 'Pending',
            task.completedDate ? format(new Date(task.completedDate), 'dd/MM/yyyy') : '-'
          ]);
        });

        autoTable(doc, {
          startY: 30,
          head: [['Client Name', 'Filing Type', 'Due Date', 'Status', 'Completion Date']],
          body: filingData,
          theme: 'striped',
          styles: { fontSize: 10 },
        });
      }

      // Save the PDF
      doc.save(`compliance-report-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Report Generator</CardTitle>
          <CardDescription>
            Generate detailed compliance reports for your clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Report Period</Label>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !options.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {options.startDate ? format(options.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={options.startDate}
                      onSelect={(date) => setOptions(prev => ({ ...prev, startDate: date || prev.startDate }))}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !options.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {options.endDate ? format(options.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={options.endDate}
                      onSelect={(date) => setOptions(prev => ({ ...prev, endDate: date || prev.endDate }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Filter by Entity Type</Label>
              <Select
                value={options.entityType}
                onValueChange={(value) => setOptions(prev => ({ ...prev, entityType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Entity Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Proprietorship">Proprietorship</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                  <SelectItem value="LLP">LLP</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Trust">Trust</SelectItem>
                  <SelectItem value="HUF">HUF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Include Compliance Types</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="gst"
                  checked={options.includeGST}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeGST: checked === true }))
                  }
                />
                <label htmlFor="gst">GST Compliance</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tds"
                  checked={options.includeTDS}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeTDS: checked === true }))
                  }
                />
                <label htmlFor="tds">TDS Compliance</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="incomeTax"
                  checked={options.includeIncomeTax}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeIncomeTax: checked === true }))
                  }
                />
                <label htmlFor="incomeTax">Income Tax</label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="roc"
                  checked={options.includeROC}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeROC: checked === true }))
                  }
                />
                <label htmlFor="roc">ROC Filings</label>
              </div>
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={generateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">GST Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {Math.round((clients.filter(c => c.isGSTRegistered && c.gstin).length / 
                           clients.filter(c => c.isGSTRegistered).length) * 100)}%
              </div>
              <Badge variant="outline">
                {clients.filter(c => c.isGSTRegistered && c.gstin).length} / {clients.filter(c => c.isGSTRegistered).length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">TDS Registration Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {Math.round((clients.filter(c => c.tan).length / clients.length) * 100)}%
              </div>
              <Badge variant="outline">
                {clients.filter(c => c.tan).length} / {clients.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {Math.round((clients.filter(c => {
                  const status = getClientComplianceStatus(c.id);
                  return status.isCompliant;
                }).length / clients.length) * 100)}%
              </div>
              <Badge variant="outline">
                {clients.filter(c => {
                  const status = getClientComplianceStatus(c.id);
                  return status.isCompliant;
                }).length} / {clients.length}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
