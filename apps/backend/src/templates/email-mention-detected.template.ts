import { emailBaseTemplate } from './email-base.template.js';

interface MentionDetectedData {
  brandName: string;
  mention: {
    aiProvider: string;
    position?: number;
    context?: string;
    sentiment?: string;
  };
  query: {
    id: string;
    queryText: string;
  };
}

export const mentionDetectedTemplate = (data: MentionDetectedData): string => {
  const content = `
    <h1>🎉 Your Brand Was Mentioned!</h1>

    <div class="success-box">
      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #065f46;">
        Great news! Your brand <strong>${data.brandName}</strong> was mentioned by ${data.mention.aiProvider}.
      </p>
    </div>

    <h2>Query Details</h2>
    <div class="info-box">
      <p style="margin: 0;">
        <strong>Search Query:</strong><br>
        "${data.query.queryText}"
      </p>
    </div>

    <h2>Mention Information</h2>
    <table class="stats-table">
      <tr>
        <td class="stats-label">AI Provider</td>
        <td class="stats-value">
          <span class="badge badge-info">${data.mention.aiProvider}</span>
        </td>
      </tr>
      ${data.mention.position ? `
      <tr>
        <td class="stats-label">Position in Results</td>
        <td class="stats-value">#${data.mention.position}</td>
      </tr>
      ` : ''}
      ${data.mention.sentiment ? `
      <tr>
        <td class="stats-label">Sentiment</td>
        <td class="stats-value">
          <span class="badge ${
            data.mention.sentiment === 'POSITIVE' ? 'badge-success' :
            data.mention.sentiment === 'NEGATIVE' ? 'badge-danger' :
            'badge-warning'
          }">
            ${data.mention.sentiment}
          </span>
        </td>
      </tr>
      ` : ''}
    </table>

    ${data.mention.context ? `
      <h3>Context</h3>
      <div class="blockquote">
        ${data.mention.context}
      </div>
    ` : ''}

    <hr class="divider">

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/queries/${data.query.id}" class="button">
        View Full Details
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Keep tracking your brand visibility across AI platforms to maintain and improve your presence.
    </p>
  `;

  return emailBaseTemplate(
    content,
    `${data.brandName} was mentioned by ${data.mention.aiProvider}!`
  );
};
