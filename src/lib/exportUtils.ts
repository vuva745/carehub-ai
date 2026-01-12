// Utility functions for generating and downloading files
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";

// Helper to escape HTML
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// CSV Export - Enhanced with proper encoding
export function downloadCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header];
        // Escape quotes and wrap in quotes if contains comma, newline, or quotes
        const cellStr = String(cell ?? "").trim();
        if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n") || cellStr.includes("\r")) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(",")
    )
  ].join("\n");

  // Add BOM for Excel compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${filename}.csv`);
}

// PDF Export using jsPDF
export function downloadPDF(title: string, content: string[][], filename: string, data?: Record<string, any>[]) {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(107, 33, 168); // Purple color
    doc.text(title, 14, 20);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text("NeoCare® - Verified with 7D Proof", 14, 35);
    
    // Prepare table data
    let tableData: string[][] = [];
    let tableHeaders: string[] = [];
    
    if (data && data.length > 0) {
      // Use provided data array
      tableHeaders = Object.keys(data[0]);
      tableData = data.map(row => 
        tableHeaders.map(header => String(row[header] ?? ""))
      );
    } else if (content && content.length > 0) {
      // Use provided content array
      tableHeaders = content[0];
      tableData = content.slice(1);
    }
    
    // Add table if we have data
    if (tableData.length > 0) {
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [243, 232, 255], // Light purple
          textColor: [107, 33, 168], // Purple
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [250, 245, 255], // Very light purple
        },
        margin: { top: 40, right: 14, bottom: 20, left: 14 },
      });
    } else {
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text("No data available", 14, 50);
    }
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const pageHeight = doc.internal.pageSize.height;
      doc.text(
        `Page ${i} of ${pageCount} | NeoCare® - Verified with 7D Proof`,
        14,
        pageHeight - 10
      );
    }
    
    // Save PDF
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    // Fallback to HTML download
    downloadPDFFallback(title, content, filename);
  }
}

// Fallback PDF (HTML-based) for compatibility
function downloadPDFFallback(title: string, content: string[][], filename: string) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @media print {
      @page { margin: 1cm; }
      body { margin: 0; }
    }
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #6b21a8; border-bottom: 2px solid #6b21a8; padding-bottom: 10px; }
    .meta { color: #666; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f3e8ff; color: #6b21a8; }
    tr:nth-child(even) { background-color: #faf5ff; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="meta">
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>NeoCare® - Verified with 7D Proof</p>
  </div>
  ${content.length > 0 ? `
  <table>
    <thead>
      <tr>${content[0].map(h => `<th>${escapeHtml(String(h))}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${content.slice(1).map(row => `<tr>${row.map(cell => `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>`).join("")}
    </tbody>
  </table>
  ` : "<p>No data available</p>"}
  <div class="footer">
    <p>This document is generated by NeoCare® and verified with 7D Proof technology.</p>
    <p>All data is securely logged and protected according to regulations.</p>
  </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  triggerDownload(blob, `${filename}.html`);
}

// Word Document Export using docx
export async function downloadWord(title: string, content: string[][], filename: string, data?: Record<string, any>[]) {
  try {
    // Prepare table data
    let tableData: string[][] = [];
    let tableHeaders: string[] = [];
    
    if (data && data.length > 0) {
      tableHeaders = Object.keys(data[0]);
      tableData = data.map(row => 
        tableHeaders.map(header => String(row[header] ?? ""))
      );
    } else if (content && content.length > 0) {
      tableHeaders = content[0];
      tableData = content.slice(1);
    }
    
    // Create table rows
    const tableRows: TableRow[] = [];
    
    // Header row
    if (tableHeaders.length > 0) {
      tableRows.push(
        new TableRow({
          children: tableHeaders.map(header => 
            new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: String(header), bold: true })],
                alignment: AlignmentType.CENTER,
              })],
              shading: {
                fill: "F3E8FF", // Light purple
              },
            })
          ),
        })
      );
    }
    
    // Data rows
    tableData.forEach(row => {
      tableRows.push(
        new TableRow({
          children: row.map(cell => 
            new TableCell({
              children: [new Paragraph({
                text: String(cell),
              })],
            })
          ),
        })
      );
    });
    
    // Create document
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, bold: true, size: 32, color: "6B21A8" })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Generated: ${new Date().toLocaleString()}`, size: 20, color: "666666" }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "NeoCare® - Verified with 7D Proof", size: 20, color: "666666", italics: true }),
            ],
            spacing: { after: 300 },
          }),
          ...(tableRows.length > 0 ? [
            new Table({
              rows: tableRows,
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
            }),
          ] : [
            new Paragraph({
              children: [new TextRun({ text: "No data available", color: "999999" })],
            }),
          ]),
          new Paragraph({
            children: [
              new TextRun({ text: "\nThis document is generated by NeoCare® and verified with 7D Proof technology.", size: 18, color: "666666" }),
            ],
            spacing: { before: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "All data is securely logged and protected according to regulations.", size: 18, color: "666666" }),
            ],
          }),
        ],
      }],
    });
    
    // Generate and download
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
  } catch (error) {
    console.error("Word document generation error:", error);
    throw error;
  }
}

// JSON Export
export function downloadJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  triggerDownload(blob, `${filename}.json`);
}

// Generic download trigger
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Sample data generators for different tabs
export function generateVoiceSloganData() {
  return [
    { Time: "09:14", CareGoal: "Medication", Sponsor: "Kenya Life", Proof: "Verified", Location: "Home Care" },
    { Time: "08:42", CareGoal: "Fall Prevention", Sponsor: "Kenya Life", Proof: "Verified", Location: "Room 201" },
    { Time: "08:10", CareGoal: "Nutrition", Sponsor: "-", Proof: "Verified", Location: "Home Care" },
    { Time: "07:45", CareGoal: "Hygiene", Sponsor: "Kenya Life", Proof: "Verified", Location: "Room 105" },
    { Time: "07:30", CareGoal: "Medication", Sponsor: "-", Proof: "Verified", Location: "Home Care" },
  ];
}

export function generateNursePayoutData() {
  return [
    { Nurse: "Mia", Role: "Team Lead", VerifiedMoments: 17, HourlyRate: "€30", Hours: "-", Status: "Paid" },
    { Nurse: "Jeffrey", Role: "Nurse", VerifiedMoments: 20, HourlyRate: "€28", Hours: "30h", Status: "Pending" },
    { Nurse: "Emma", Role: "Nurse", VerifiedMoments: 15, HourlyRate: "€29", Hours: "20h", Status: "Queued" },
    { Nurse: "Liam", Role: "Nurse", VerifiedMoments: 18, HourlyRate: "€27", Hours: "21h", Status: "Paid" },
  ];
}

export function generateCareMomentsData() {
  return [
    { Date: "April 23, 2024", Time: "3:30 PM", Nurse: "Mia", Tasks: "Hygiene, Medication", Proof: "Verified" },
    { Date: "April 23, 2024", Time: "11:00 AM", Nurse: "Jeffrey", Tasks: "Hygiene, Medication", Proof: "Verified" },
    { Date: "April 23, 2024", Time: "10:20 AM", Nurse: "Emma", Tasks: "Hygiene, Medication", Proof: "Verified" },
    { Date: "April 22, 2024", Time: "4:00 PM", Nurse: "Liam", Tasks: "Hygiene, Medication", Proof: "Verified" },
  ];
}

export function generateCertificationData() {
  return [
    { Certification: "Medication Administration", Status: "Certified", Date: "04/21/2024", Expires: "04/21/2025" },
    { Certification: "Escalation Protocols", Status: "Certified", Date: "04/21/2024", Expires: "04/21/2025" },
    { Certification: "Safe Transfer Techniques", Status: "Expired", Date: "04/10/2023", Expires: "04/10/2024" },
    { Certification: "Fall Prevention", Status: "Pending", Date: "-", Expires: "-" },
  ];
}

export function generateESGData() {
  return [
    { Metric: "CO2 Emissions Avoided", Value: "40%", Category: "Environmental" },
    { Metric: "Waste Reduced", Value: "35%", Category: "Environmental" },
    { Metric: "Green Workspaces", Value: "25%", Category: "Environmental" },
    { Metric: "Communities Reached", Value: "58", Category: "Social" },
    { Metric: "Social Score", Value: "85", Category: "Governance" },
    { Metric: "Governance Score", Value: "83", Category: "Governance" },
  ];
}

export function generateLegalDisputeData() {
  return [
    { Client: "John de Vries", Date: "April 24, 2021", Status: "Open", Proof: "7D Verified" },
    { Client: "John de Vries", Date: "April 13, 2021", Status: "Resolved", Proof: "7D Verified" },
    { Client: "Maria Jansen", Date: "April 19, 2021", Status: "Under Review", Proof: "7D Verified" },
    { Client: "Maria Jansen", Date: "April 5, 2021", Status: "Under Review", Proof: "7D Verified" },
  ];
}

export function generateSkillEvidenceData() {
  return [
    { Skill: "Wound Care Level", Type: "Real Care Moment", Date: "12 Apr 2024, 14:45", Location: "St. John's Hospital", Assessor: "A. Peters", Status: "Verified" },
    { Skill: "Medication Safety", Type: "Approved Simulation", Date: "15 Mar 2024, 09:30", Location: "Medical Training Center", Assessor: "K. de Vries", Status: "Verified" },
    { Skill: "Injection Technique", Type: "Real Care Moment", Date: "08 Jan 2024, 10:15", Location: "St. John's Hospital", Assessor: "D. Bos", Status: "Verified" },
    { Skill: "Fall Risk Assessment", Type: "Approved Simulation", Date: "03 Jan 2023, 16:20", Location: "Medical Training Center", Assessor: "E. Visser", Status: "Locked" },
  ];
}

export function generateClientVoiceData() {
  return [
    { Date: "April 23, 2024", Survey: "Daily Wellbeing Check", Score: "8.6", Status: "Positive", Tone: "Normal", Trend: "Stable" },
    { Date: "April 22, 2024", Survey: "Pain Assessment", Score: "8.2", Status: "Positive", Tone: "Normal", Trend: "Stable" },
    { Date: "April 21, 2024", Survey: "Daily Wellbeing Check", Score: "7.8", Status: "Positive", Tone: "Normal", Trend: "Stable" },
    { Date: "April 20, 2024", Survey: "Daily Wellbeing Check", Score: "7.2", Status: "Positive", Tone: "Normal", Trend: "Stable" },
  ];
}

export function generateFamilyDashboardData() {
  return [
    { Date: "April 23, 2024", Update: "Mia wrote John enjoys the garden! Great to see!", Author: "Lauren", Type: "Family Update" },
    { Date: "April 23, 2024", Update: "Lovely picnic photos by pond!", Author: "Jeffrey", Type: "Care Note" },
    { Date: "April 23, 2024", Update: "John was in good spirits this morning and enjoyed his walk outside.", Author: "Mia", Type: "Care Note" },
    { Date: "April 22, 2024", Update: "Blood pressure has improved compared to last Monday.", Author: "Jeffrey", Type: "Care Note" },
  ];
}

export function generateAIControlData() {
  return [
    { Date: "April 18, 2024", Time: "4:30 PM", Type: "Escalated", Rule: "Fairness Check for Escrow Holds", Action: "Duplicate care moment detected. Manually reviewed.", Status: "Resolved" },
    { Date: "April 17, 2024", Time: "4:09 PM", Type: "Auto", Rule: "Cooldown Period After Duplicate Visits", Action: "Item dedication check flag to 1 care moment after cooldown.", Status: "Completed" },
    { Date: "April 17, 2024", Time: "4:00 PM", Type: "Escalated", Rule: "Escalate Compliance Alerts to Human", Action: "Behavioral alert, 'agitation' detected and escalated.", Status: "Resolved" },
    { Date: "April 16, 2024", Time: "4:09 PM", Type: "Auto", Rule: "Ensure AI Decisions are Explainable", Action: "Ensured even distribution of care moments among team.", Status: "Completed" },
  ];
}
