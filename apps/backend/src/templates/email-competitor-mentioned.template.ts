import { emailBaseTemplate } from './email-base.template.js';

interface CompetitorMentionedData {
  brandName: string;
  mention: {
    aiProvider: string;
    competitors?: Record<string, any>;
  };
  query: {
    id: string;
    queryText: string;
  };
}

export const competitorMentionedTemplate = (data: CompetitorMentionedData): string => {
  const competitors = Object.keys(data.mention.competitors || {});
  const competitorCount = competitors.length;

  const content = `
    <h1>👀 Competitor Activity Detected</h1>

    <div class="info-box">
      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1e40af;">
        ${competitorCount} competitor${competitorCount > 1 ? 's were' : ' was'} mentioned by ${data.mention.aiProvider}.
      </p>
    </div>

    <h2>Query Details</h2>
    <div class="info-box">
      <p style="margin: 0;">
        <strong>Search Query:</strong><br>
        "${data.query.queryText}"
      </p>
    </div>

    <h2>Competitors Mentioned</h2>
    <table class="stats-table">
      ${competitors.map((competitor, index) => {
        const competitorData = data.mention.competitors?.[competitor];
        return `
          <tr>
            <td class="stats-label">${index + 1}. ${competitor}</td>
            <td class="stats-value">
              ${competitorData?.position ? `Position #${competitorData.position}` : 'Mentioned'}
            </td>
          </tr>
        `;
      }).join('')}
    </table>

    <h2>Why This Matters</h2>
    <p>
      Understanding competitor visibility helps you:
    </p>
    <ul style="color: #4b5563; line-height: 1.8;">
      <li>Identify gaps in your content strategy</li>
      <li>Learn from competitor positioning</li>
      <li>Discover opportunities to differentiate your brand</li>
      <li>Track competitive landscape changes over time</li>
    </ul>

    <h3>Recommended Actions</h3>
    <ul style="color: #4b5563; line-height: 1.8;">
      <li>Analyze why competitors are being mentioned for this query</li>
      <li>Review competitor content and messaging strategies</li>
      <li>Identify your unique value propositions</li>
      <li>Update your content to better address user intent</li>
    </ul>

    <hr class="divider">

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/queries/${data.query.id}" class="button">
        View Competitive Analysis
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Stay ahead of the competition by monitoring their AI visibility alongside yours.
    </p>
  `;

  return emailBaseTemplate(
    content,
    `${competitorCount} competitor${competitorCount > 1 ? 's' : ''} mentioned for: ${data.query.queryText}`
  );
};
