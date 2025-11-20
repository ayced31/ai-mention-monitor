/**
 * Base email template with responsive design and dark mode support
 */
export const emailBaseTemplate = (content: string, preheader?: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>AI Mention Tracker</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

    /* Base styles */
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px 20px;
      text-align: center;
    }

    .email-logo {
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      margin: 0;
      text-decoration: none;
    }

    .email-body {
      background-color: #ffffff;
      padding: 40px 30px;
    }

    .email-footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }

    h1 {
      color: #111827;
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 20px 0;
      line-height: 1.3;
    }

    h2 {
      color: #374151;
      font-size: 20px;
      font-weight: 600;
      margin: 30px 0 15px 0;
    }

    h3 {
      color: #4b5563;
      font-size: 16px;
      font-weight: 600;
      margin: 20px 0 10px 0;
    }

    p {
      color: #4b5563;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 15px 0;
    }

    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
    }

    .button:hover {
      opacity: 0.9;
    }

    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      margin: 5px 5px 5px 0;
    }

    .badge-success {
      background-color: #d1fae5;
      color: #065f46;
    }

    .badge-warning {
      background-color: #fef3c7;
      color: #92400e;
    }

    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .badge-danger {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .info-box {
      background-color: #f3f4f6;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }

    .success-box {
      background-color: #ecfdf5;
      border-left: 4px solid #10b981;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }

    .warning-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }

    .blockquote {
      border-left: 3px solid #e5e7eb;
      padding-left: 20px;
      margin: 20px 0;
      font-style: italic;
      color: #6b7280;
    }

    .divider {
      border: 0;
      border-top: 1px solid #e5e7eb;
      margin: 30px 0;
    }

    .stats-table {
      width: 100%;
      margin: 20px 0;
      border-collapse: collapse;
    }

    .stats-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .stats-label {
      font-weight: 600;
      color: #6b7280;
      width: 40%;
    }

    .stats-value {
      color: #111827;
      font-weight: 600;
    }

    .preheader {
      display: none;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }

    /* Responsive */
    @media screen and (max-width: 600px) {
      .email-body {
        padding: 30px 20px !important;
      }

      h1 {
        font-size: 24px !important;
      }

      .button {
        display: block !important;
        width: 100% !important;
        text-align: center !important;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div class="preheader">${preheader}</div>` : ''}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 20px 0;">
        <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <!-- Header -->
          <tr>
            <td class="email-header">
              <h1 class="email-logo">AI Mention Tracker</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-footer">
              <p style="margin: 0 0 10px 0;">
                You're receiving this email because you have alerts configured.
              </p>
              <p style="margin: 0 0 20px 0;">
                <a href="${process.env.FRONTEND_URL}/settings" style="color: #667eea; text-decoration: none;">Manage your alert preferences</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} AI Mention Tracker. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
