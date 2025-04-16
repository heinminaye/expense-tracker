import React from "react";
import { ExpenseItem } from "../types/expense";

interface PrintAllReceiptsProps {
  expenses: ExpenseItem[];
  dateRange: string;
  totalAmount: number;
  onClose: () => void;
}

const PrintAllReceipts: React.FC<PrintAllReceiptsProps> = ({ 
  expenses, 
  dateRange, 
  totalAmount, 
  onClose 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocker might be preventing the print window. Please allow popups for this site.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expenses Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 40px;
              color: #111827;
              background: #ffffff;
              line-height: 1.6;
            }
            .report-container {
              max-width: 960px;
              margin: 0 auto;
            }
            .report-header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 16px;
            }
            .report-header h1 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .report-header p {
              font-size: 16px;
              color: #6b7280;
            }
            .report-meta {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              color: #374151;
              margin-bottom: 24px;
            }
            .expenses-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 32px;
              font-size: 14px;
            }
            .expenses-table th, .expenses-table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            .expenses-table th {
              background: #3B82F6;
              color: white;
              font-weight: 600;
            }
            .expenses-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .id-badge {
              display: inline-block;
              padding: 4px 8px;
              background: #eff6ff;
              color: #3B82F6;
              border-radius: 8px;
              font-size: 13px;
              font-weight: 500;
            }
            .notes-cell {
              padding: 8px 12px;
              color: #4b5563;
              background-color: #f3f4f6;
              border-left: 4px solid #3B82F6;
              font-style: italic;
            }
            .breakdown-table {
              width: 100%;
              margin-top: 12px;
              font-size: 13px;
              border-collapse: collapse;
            }
            .breakdown-table th, .breakdown-table td {
              padding: 8px;
              border: 1px solid #e5e7eb;
              text-align: left;
            }
            .summary-card {
              background: #f9fafb;
              padding: 24px;
              border-radius: 12px;
            }
            .summary-card h3 {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 16px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
              gap: 16px;
            }
            .summary-item strong {
              font-size: 13px;
              color: #6b7280;
              display: block;
              margin-bottom: 4px;
            }
            .summary-item span {
              font-size: 16px;
              font-weight: 600;
              color: #111827;
            }
            .page-break {
              page-break-after: always;
              height: 24px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="report-header">
              <h1>Expenses Report</h1>
              <p>${dateRange || "All dates"}</p>
            </div>

            <div class="report-meta">
              <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
              <div><strong>Total:</strong> $${totalAmount.toFixed(2)} | Items: ${expenses.length}</div>
            </div>

            <table class="expenses-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style="text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${expenses.map((item, index) => `
                  <tr>
                    <td><span class="id-badge">${item.id}</span></td>
                    <td>${item.category}</td>
                    <td>${formatDate(item.date)}</td>
                    <td style="text-align:right;">$${item.expense.toFixed(2)}</td>
                  </tr>
                  ${item.detail ? `<tr><td colspan="4"><div class="notes-cell">${item.detail}</div></td></tr>` : ''}
                  ${item.breakdownItems ? `
                    <tr><td colspan="4">
                      <table class="breakdown-table">
                        <thead>
                          <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th><th>Notes</th></tr>
                        </thead>
                        <tbody>
                          ${item.breakdownItems.map(b => `
                            <tr>
                              <td>${b.name}</td>
                              <td>${b.quantity}</td>
                              <td>$${b.price.toFixed(2)}</td>
                              <td>$${(b.price * b.quantity).toFixed(2)}</td>
                              <td>${b.notes || '-'}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </td></tr>
                  ` : ''}
                  ${index < expenses.length - 1 ? '<tr class="page-break"></tr>' : ''}
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right; font-weight: 700;">Total:</td>
                  <td style="text-align: right; font-weight: 700;">$${totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div class="summary-card">
              <h3>Summary</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <strong>Total Expenses</strong>
                  <span>$${totalAmount.toFixed(2)}</span>
                </div>
                <div class="summary-item">
                  <strong>Items Count</strong>
                  <span>${expenses.length}</span>
                </div>
                <div class="summary-item">
                  <strong>Average</strong>
                  <span>$${(totalAmount / expenses.length).toFixed(2)}</span>
                </div>
                <div class="summary-item">
                  <strong>Highest</strong>
                  <span>$${Math.max(...expenses.map(i => i.expense)).toFixed(2)}</span>
                </div>
                <div class="summary-item">
                  <strong>Lowest</strong>
                  <span>$${Math.min(...expenses.map(i => i.expense)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  React.useEffect(() => {
    handlePrint();
    onClose();
  }, []);

  return null;
};

export default PrintAllReceipts;
