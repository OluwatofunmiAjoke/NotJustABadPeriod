interface ReportData {
  user: {
    name: string;
    id: number;
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
  symptomLogs: Array<{
    date: string;
    painLevel?: number;
    fatigueLevel?: number;
    energyLevel?: number;
    mood?: string;
    additionalSymptoms?: string[];
    medications?: Array<{name: string, dosage: string, time: string}>;
    notes?: string;
  }>;
  medicalTimeline: Array<{
    title: string;
    description?: string;
    type: string;
    date: string;
    doctorName?: string;
    location?: string;
  }>;
  upcomingAppointments: Array<{
    title: string;
    date: string;
    doctorName?: string;
    location?: string;
  }>;
}

export async function generateMedicalReport(data: ReportData): Promise<void> {
  // For MVP, we'll create a simple HTML-based report that can be printed
  // In production, this could use jsPDF or similar libraries
  
  const reportHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Medical Report - ${data.user.name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #65007D;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #65007D;
          margin: 0;
        }
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .section h2 {
          color: #65007D;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .symptom-log {
          background: #f9f9f9;
          padding: 15px;
          margin-bottom: 10px;
          border-left: 4px solid #65007D;
        }
        .timeline-entry {
          background: #f5f5f5;
          padding: 10px;
          margin-bottom: 8px;
          border-radius: 5px;
        }
        .date {
          font-weight: bold;
          color: #65007D;
        }
        .metrics {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .metric {
          background: white;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid #ddd;
          min-width: 120px;
        }
        .symptoms-list {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 5px;
        }
        .symptom-tag {
          background: #E8D5F2;
          color: #65007D;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Medical Report</h1>
        <p><strong>Patient:</strong> ${data.user.name}</p>
        <p><strong>Report Period:</strong> ${data.period.startDate.toLocaleDateString()} - ${data.period.endDate.toLocaleDateString()}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="section">
        <h2>Summary</h2>
        <p>This report contains symptom tracking data, medical timeline entries, and upcoming appointments for the specified period.</p>
      </div>

      <div class="section">
        <h2>Recent Symptom Logs</h2>
        ${data.symptomLogs.length > 0 ? data.symptomLogs.map(log => `
          <div class="symptom-log">
            <div class="date">${new Date(log.date).toLocaleDateString()}</div>
            <div class="metrics">
              ${log.painLevel !== null ? `<div class="metric"><strong>Pain:</strong> ${log.painLevel}/10</div>` : ''}
              ${log.fatigueLevel !== null ? `<div class="metric"><strong>Fatigue:</strong> ${log.fatigueLevel}/10</div>` : ''}
              ${log.energyLevel !== null ? `<div class="metric"><strong>Energy:</strong> ${log.energyLevel}/5</div>` : ''}
              ${log.mood ? `<div class="metric"><strong>Mood:</strong> ${log.mood}</div>` : ''}
            </div>
            ${log.additionalSymptoms && log.additionalSymptoms.length > 0 ? `
              <div class="symptoms-list">
                <strong>Symptoms:</strong>
                ${log.additionalSymptoms.map(symptom => `<span class="symptom-tag">${symptom}</span>`).join('')}
              </div>
            ` : ''}
            ${log.medications && log.medications.length > 0 ? `
              <div><strong>Medications:</strong> ${log.medications.map(med => `${med.name} ${med.dosage} at ${med.time}`).join(', ')}</div>
            ` : ''}
            ${log.notes ? `<div><strong>Notes:</strong> ${log.notes}</div>` : ''}
          </div>
        `).join('') : '<p>No symptom logs available for this period.</p>'}
      </div>

      <div class="section">
        <h2>Medical Timeline</h2>
        ${data.medicalTimeline.length > 0 ? data.medicalTimeline.map(entry => `
          <div class="timeline-entry">
            <div class="date">${new Date(entry.date).toLocaleDateString()}</div>
            <div><strong>${entry.title}</strong> (${entry.type})</div>
            ${entry.description ? `<div>${entry.description}</div>` : ''}
            ${entry.doctorName ? `<div><strong>Provider:</strong> Dr. ${entry.doctorName}</div>` : ''}
            ${entry.location ? `<div><strong>Location:</strong> ${entry.location}</div>` : ''}
          </div>
        `).join('') : '<p>No timeline entries available.</p>'}
      </div>

      <div class="section">
        <h2>Upcoming Appointments</h2>
        ${data.upcomingAppointments.length > 0 ? data.upcomingAppointments.map(apt => `
          <div class="timeline-entry">
            <div class="date">${new Date(apt.date).toLocaleDateString()} at ${new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div><strong>${apt.title}</strong></div>
            ${apt.doctorName ? `<div><strong>Provider:</strong> Dr. ${apt.doctorName}</div>` : ''}
            ${apt.location ? `<div><strong>Location:</strong> ${apt.location}</div>` : ''}
          </div>
        `).join('') : '<p>No upcoming appointments scheduled.</p>'}
      </div>

      <div class="section no-print">
        <button onclick="window.print()" style="background: #65007D; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
          Print Report
        </button>
      </div>
    </body>
    </html>
  `;

  // Open the report in a new window for printing/saving
  const reportWindow = window.open('', '_blank');
  if (reportWindow) {
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  } else {
    // Fallback: create a blob and download
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medical-report-${data.user.name}-${data.period.startDate.toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export async function generateInsightsPDF(insights: any): Promise<void> {
  // Similar function for generating insights reports
  // This would be implemented similarly to the medical report
  console.log("Generating insights PDF", insights);
}
