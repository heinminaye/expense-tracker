import React from "react";
import { ExpenseItem } from "../types/expense";

interface SinglePrintReceiptProps {
  expense: ExpenseItem;
  onClose: () => void;
}

const SinglePrintReceipt: React.FC<SinglePrintReceiptProps> = ({ expense, onClose }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
          <title>Expense Receipt #${expense.id}</title>
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
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 32px;
              font-size: 14px;
            }
            .details-table th, .details-table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            .details-table th {
              background: #3B82F6;
              color: white;
              font-weight: 600;
            }
            .details-table tr:nth-child(even) {
              background-color: #f9fafb;
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
              margin-top: 40px;
            }
            .summary-card h3 {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 16px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
            }
            .summary-item {
              font-size: 16px;
              font-weight: 600;
              color: #111827;
            }
            .summary-item strong {
              font-size: 13px;
              color: #6b7280;
              display: block;
              margin-bottom: 4px;
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
              <h1>Expense Receipt</h1>
              <p>ID: #${expense.id}</p>
            </div>

            <div class="report-meta">
              <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
              <div><strong>Category:</strong> ${expense.category}</div>
              <div><strong>Date:</strong> ${formatDate(expense.date)}</div>
            </div>

            <table class="details-table">
              <thead>
                <tr>
                  <th>Total Amount</th>
                  <th style="text-align:right;">$${expense.expense.toFixed(2)}</th>
                </tr>
              </thead>
            </table>

            ${expense.detail ? `
              <div class="notes-cell">${expense.detail}</div>
            ` : ''}

            ${expense.breakdownItems ? `
              <table class="breakdown-table">
                <thead>
                  <tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  ${expense.breakdownItems.map(b => `
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
            ` : ''}

            <div class="summary-card">
              <h3>Summary</h3>
              <div class="summary-item">
                <strong>Total Expense</strong>
                <span>$${expense.expense.toFixed(2)}</span>
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

export default SinglePrintReceipt;
