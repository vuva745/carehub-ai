import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { downloadCSV, downloadPDF, downloadWord } from "@/lib/exportUtils";

interface ExportOption {
  label: string;
  format: string;
}

interface ExportButtonProps {
  label?: string;
  options?: ExportOption[];
  variant?: "default" | "outline" | "secondary";
  data?: Record<string, any>[];
  pdfTitle?: string;
  filename?: string;
}

const defaultOptions = [
  { label: "Export as PDF", format: "pdf" },
  { label: "Export as Word", format: "word" },
  { label: "Export as CSV", format: "csv" },
];

export function ExportButton({ 
  label = "Export", 
  options = defaultOptions,
  variant = "default",
  data = [],
  pdfTitle = "NeoCare Report",
  filename = "neocare-export"
}: ExportButtonProps) {
  const handleExport = async (format: string) => {
    try {
      if (format === "csv" || format.includes("csv")) {
        if (data.length === 0) {
          // Use sample data if none provided
          const sampleData = [
            { Item: "Sample Data 1", Value: "100", Status: "Active" },
            { Item: "Sample Data 2", Value: "200", Status: "Pending" },
            { Item: "Sample Data 3", Value: "150", Status: "Active" },
          ];
          downloadCSV(sampleData, filename);
        } else {
          downloadCSV(data, filename);
        }
        toast({
          title: "Export Complete",
          description: `CSV file "${filename}.csv" has been downloaded.`,
        });
      } else if (format === "pdf" || format.includes("pdf")) {
        const headers = data.length > 0 ? Object.keys(data[0]) : ["Item", "Value", "Status"];
        const rows = data.length > 0 
          ? data.map(row => Object.values(row).map(v => String(v ?? "")))
          : [
              ["Sample Data 1", "100", "Active"],
              ["Sample Data 2", "200", "Pending"],
              ["Sample Data 3", "150", "Active"],
            ];
        
        downloadPDF(pdfTitle, [headers, ...rows], filename, data.length > 0 ? data : undefined);
        toast({
          title: "Export Complete",
          description: `PDF file "${filename}.pdf" has been downloaded.`,
        });
      } else if (format === "word" || format.includes("word") || format.includes("docx")) {
        const headers = data.length > 0 ? Object.keys(data[0]) : ["Item", "Value", "Status"];
        const rows = data.length > 0 
          ? data.map(row => Object.values(row).map(v => String(v ?? "")))
          : [
              ["Sample Data 1", "100", "Active"],
              ["Sample Data 2", "200", "Pending"],
              ["Sample Data 3", "150", "Active"],
            ];
        
        await downloadWord(pdfTitle, [headers, ...rows], filename, data.length > 0 ? data : undefined);
        toast({
          title: "Export Complete",
          description: `Word document "${filename}.docx" has been downloaded.`,
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (options.length === 1) {
    return (
      <Button variant={variant} onClick={() => handleExport(options[0].format)} className="gap-2">
        <Download className="w-4 h-4" />
        {label}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className="gap-2">
          <Download className="w-4 h-4" />
          {label}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem key={option.format} onClick={() => handleExport(option.format)}>
            <Download className="w-4 h-4 mr-2" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
