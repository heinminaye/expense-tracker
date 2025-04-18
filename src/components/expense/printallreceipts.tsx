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
  onClose,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate category breakdown
  const categoryBreakdown = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.expense;
    return acc;
  }, {} as Record<string, number>);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert(
        "Popup blocker might be preventing the print window. Please allow popups for this site."
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expenses Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
            
            body {
              font-family: 'Roboto', sans-serif;
              margin: 0;
              padding: 0;
              color: #333333;
              background: #ffffff;
              line-height: 1.6;
              font-size: 15px;
            }

            .report-container {
              max-width: 900px;
              margin: 0 auto;
              padding: 30px 20px;
            }

            .report-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #3a5f8d;
              padding-bottom: 15px;
            }

            .report-title {
              font-size: 28px;
              font-weight: 700;
              margin: 0;
              color: #3a5f8d;
              letter-spacing: 0.5px;
            }

            .report-subtitle {
              font-size: 16px;
              color: #555555;
              margin-top: 8px;
              font-weight: 500;
            }

            .meta-container {
              margin-bottom: 25px;
            }

            .meta-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
            }

            .meta-card {
              flex: 1 1 200px;
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              padding: 15px;
              border-radius: 6px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }

            .meta-label {
              font-size: 14px;
              color: #555555;
              font-weight: 600;
            }

            .meta-value {
              font-size: 16px;
              font-weight: 700;
              margin-top: 5px;
              color: #333333;
            }

            .category-section {
              margin: 25px 0;
              background: #f8f9fa;
              border: 1px solid #dee2e6;
              border-radius: 6px;
              padding: 15px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }

            .category-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #dee2e6;
            }

            .category-title {
              font-size: 18px;
              font-weight: 700;
              color: #3a5f8d;
              margin: 0;
            }

            .total-summary {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .total-label {
              font-size: 16px;
              font-weight: 600;
              color: #555555;
            }

            .total-amount {
              font-size: 18px;
              font-weight: 700;
              color: #3a5f8d;
            }

            .category-list {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }

            .category-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 5px;
              border-bottom: 1px solid #e9ecef;
            }
            .category-row:last-child {
              border-bottom: 0;
            }

            .category-info {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .category-name {
              font-weight: 600;
              color: #333333;
              min-width: 150px;
            }

            .category-percentage {
              font-size: 14px;
              color: #6c757d;
              background: #e9ecef;
              padding: 2px 8px;
              border-radius: 10px;
            }

            .category-amount {
              font-weight: 700;
              color: #3a5f8d;
            }

            .expenses-table {
              width: 100%;
              border-collapse: collapse;
              margin: 25px 0;
              font-size: 15px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            }

            .expenses-table th {
              background-color: #3a5f8d;
              color: #ffffff;
              font-weight: 600;
              text-align: left;
              padding: 12px 15px;
              font-size: 16px;
            }
            .expenses-table th:last-child {
              text-align: right;
            }

            .expenses-table td {
              padding: 12px 15px;
              border: 1px solid #dee2e6;
              vertical-align: top;
            }

            .expenses-table td:last-child {
              text-align: right;
            }

            .expenses-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }

            .expenses-table tr:hover {
              background-color: #e9ecef;
            }

            .id-badge {
              display: inline-block;
              background: #e9ecef;
              color: #3a5f8d;
              padding: 3px 8px;
              border-radius: 4px;
              font-weight: 600;
              font-size: 14px;
            }

            .notes-cell {
              background: #e9ecef;
              padding: 12px 15px;
              border-left: 4px solid #3a5f8d;
              font-size: 15px;
              color: #333333;
              margin: 5px 0;
              text-align: left;
              font-style: italic;
            }

            .breakdown-container {
              margin: 10px 0 0 20px;
              border: 1px solid #ced4da;
              border-radius: 6px;
              overflow: hidden;
            }

            .breakdown-title {
              background: #ebebeb;
              padding: 8px 12px;
              font-weight: 600;
              color: #333333;
              font-size: 14px;
              text-align: left;
            }

            .breakdown-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
            }

            .breakdown-table th {
              background: #355575;
              padding: 8px 12px;
              text-align: right;
            }
            .breakdown-table th:nth-child(2) {
              text-align: left;
            }

            .breakdown-table td {
              border: 1px solid #dee2e6;
              padding: 8px 12px;
              background: #ffffff;
              text-align: right;
            }

            .breakdown-table td:nth-child(2) {
              text-align: left;
            }

            .breakdown-table tr:nth-child(even) td {
              background: #f8f9fa;
            }

            .total-row {
              font-weight: 700;
              background: #e9ecef !important;
            }

            .footer {
              text-align: center;
              font-size: 14px;
              color: #6c757d;
              margin-top: 40px;
              padding-top: 15px;
              border-top: 2px solid #dee2e6;
            }

            @page {
              size: A4;
              margin: 15mm;
            }

            @media print {
              body {
                padding: 0 !important;
                font-size: 14px !important;
              }

              .report-container {
                padding: 0 !important;
              }

              .category-section,
              .expenses-table,
              .meta-container {
                page-break-inside: avoid;
              }

              .category-row {
                page-break-inside: avoid;
              }
              
              .breakdown-container {
                page-break-inside: avoid;
              }
              
              .expenses-table tr {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="report-header">
              <h1 class="report-title">Expense Report</h1>
              <p class="report-subtitle">Detailed breakdown of all expenses</p>
            </div>

            <div class="meta-container">
              <div class="meta-grid">
                <div class="meta-card">
                  <div class="meta-label">Report Period</div>
                  <div class="meta-value">${dateRange || "All dates"}</div>
                </div>
                <div class="meta-card">
                  <div class="meta-label">Generated On</div>
                  <div class="meta-value">${new Date().toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}</div>
                </div>
                <div class="meta-card">
                  <div class="meta-label">Total Amount</div>
                  <div class="meta-value">${totalAmount.toLocaleString()}</div>
                </div>
                <div class="meta-card">
                  <div class="meta-label">Items Count</div>
                  <div class="meta-value">${expenses.length.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div class="category-section">
              <div class="category-header">
                <h3 class="category-title">Expense Categories</h3>
                <div class="total-summary">
                  <span class="total-label">Grand Total:</span>
                  <span class="total-amount">${totalAmount.toLocaleString()}</span>
                </div>
              </div>
              
              <div class="category-list">
                ${Object.entries(categoryBreakdown)
                  .map(
                    ([category, amount]) => `
                    <div class="category-row">
                      <div class="category-info">
                        <span class="category-name">${category}</span>
                        <span class="category-percentage">${(
                          (amount / totalAmount) *
                          100
                        ).toFixed(1)}%</span>
                      </div>
                      <div class="category-amount">
                        ${amount.toLocaleString()}
                      </div>
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </div>

            <table class="expenses-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${expenses
                  .map(
                    (item, index) => `
                    <tr>
                      <td><span class="id-badge">${item.id}</span></td>
                      <td>${item.category}</td>
                      <td>${formatDate(item.date)}</td>
                      <td>${item.expense.toLocaleString()}</td>
                    </tr>
                    ${
                      item.detail
                        ? `
                          <tr class="note">
                            <td colspan="4">
                              <div class="notes-cell">
                                <strong>Notes:</strong> ${item.detail}
                              </div>
                            </td>
                          </tr>
                        `
                        : ""
                    }
                    ${
                      item.breakdownItems && item.breakdownItems.length > 0
                        ? `
                          <tr>
                            <td colspan="4">
                              <div class="breakdown-container">
                                <div class="breakdown-title">Item Breakdown</div>
                                <table class="breakdown-table">
                                  <thead>
                                    <tr>
                                      <th>No</th>
                                      <th>Item Name</th>
                                      <th>Quantity</th>
                                      <th>Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${item.breakdownItems
                                      .map(
                                        (b, idx) => `
                                        <tr>
                                          <td>${idx + 1}</td>
                                          <td>${b.name}</td>
                                          <td>${b.quantity}</td>
                                          <td>${b.price.toLocaleString()}</td>
                                        </tr>
                                      `
                                      )
                                      .join("")}
                                    <tr class="total-row">
                                      <td colspan="3" style="text-align: right;">Subtotal:</td>
                                      <td style="text-align: right;">${item.expense.toLocaleString()}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        `
                        : ""
                    }
                  `
                  )
                  .join("")}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right; padding-right: 20px;">Total Amount:</td>
                  <td>${totalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <p>Report generated • Powered by Expense Tracker</p>
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
