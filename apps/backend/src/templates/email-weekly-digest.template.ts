import { emailBaseTemplate } from './email-base.template.js';

interface WeeklyDigestData {
  user: {
    name: string;
  };
  dateRange: {
    from: string;
    to: string;
  };
  summary: {
    totalMentions: number;
    mentionChange: number;
    topProvider: string;
    totalChecks: number;
  };
  brands: Array<{
    id: string;
    name: string;
    mentionCount: number;
    mentionRate: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  topQueries: Array<{
    id: string;
    queryText: string;
    mentions: number;
    mentionRate: number;
  }>;
  competitorActivity?: {
    totalCompetitorMentions: number;
    topCompetitors: string[];
  };
}

export const weeklyDigestTemplate = (data: WeeklyDigestData): string => {
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const content = `
    <h1>📊 Your Weekly AI Visibility Report</h1>

    <p style="font-size: 18px; color: #374151;">
      Hi ${data.user.name}, here's your brand visibility summary for
      <strong>${formatDate(data.dateRange.from)}</strong> - <strong>${formatDate(data.dateRange.to)}</strong>.
    </p>

    <hr class="divider">

    <h2>Summary</h2>
    <table class="stats-table">
      <tr>
        <td class="stats-label">Total Mentions</td>
        <td class="stats-value">
          ${data.summary.totalMentions}
          ${data.summary.mentionChange !== 0 ? `
            <span class="badge ${data.summary.mentionChange > 0 ? 'badge-success' : 'badge-warning'}">
              ${data.summary.mentionChange > 0 ? '+' : ''}${data.summary.mentionChange}%
            </span>
          ` : ''}
        </td>
      </tr>
      <tr>
        <td class="stats-label">Total Checks</td>
        <td class="stats-value">${data.summary.totalChecks}</td>
      </tr>
      <tr>
        <td class="stats-label">Top Performing Provider</td>
        <td class="stats-value">
          <span class="badge badge-info">${data.summary.topProvider}</span>
        </td>
      </tr>
      ${data.summary.totalMentions > 0 ? `
      <tr>
        <td class="stats-label">Overall Mention Rate</td>
        <td class="stats-value">
          ${((data.summary.totalMentions / data.summary.totalChecks) * 100).toFixed(1)}%
        </td>
      </tr>
      ` : ''}
    </table>

    <h2>Brand Performance</h2>
    ${data.brands.length > 0 ? `
      <table class="stats-table">
        ${data.brands.map(brand => `
          <tr>
            <td class="stats-label">
              ${brand.name}
              ${brand.trend === 'up' ? '📈' : brand.trend === 'down' ? '📉' : '➡️'}
            </td>
            <td class="stats-value">
              ${brand.mentionCount} mentions
              <span class="badge badge-info">${brand.mentionRate.toFixed(1)}%</span>
            </td>
          </tr>
        `).join('')}
      </table>
    ` : `
      <p style="color: #6b7280;">No brand mentions this week.</p>
    `}

    <h2>Top Performing Queries</h2>
    ${data.topQueries.length > 0 ? `
      <table class="stats-table">
        ${data.topQueries.map((query, index) => `
          <tr>
            <td class="stats-label">
              ${index + 1}. ${query.queryText.length > 60 ? query.queryText.substring(0, 60) + '...' : query.queryText}
            </td>
            <td class="stats-value">
              ${query.mentions}
              <span class="badge badge-success">${query.mentionRate.toFixed(1)}%</span>
            </td>
          </tr>
        `).join('')}
      </table>
    ` : `
      <p style="color: #6b7280;">No successful queries this week.</p>
    `}

    ${data.competitorActivity ? `
      <h2>Competitor Activity</h2>
      <div class="info-box">
        <p style="margin: 0 0 10px 0;">
          <strong>${data.competitorActivity.totalCompetitorMentions}</strong> competitor mentions detected this week.
        </p>
        ${data.competitorActivity.topCompetitors.length > 0 ? `
          <p style="margin: 0;">
            <strong>Most Active:</strong>
            ${data.competitorActivity.topCompetitors.slice(0, 3).map(comp =>
              `<span class="badge badge-warning">${comp}</span>`
            ).join(' ')}
          </p>
        ` : ''}
      </div>
    ` : ''}

    <hr class="divider">

    <h2>Insights & Recommendations</h2>
    ${data.summary.totalMentions > 0 ? `
      <p>✅ Your brands are gaining visibility across AI platforms. Keep up the great work!</p>
    ` : `
      <p>⚠️ Low mention activity this week. Consider reviewing and optimizing your content strategy.</p>
    `}

    ${data.summary.mentionChange > 10 ? `
      <p>🎉 Excellent growth! Your mention rate increased by ${data.summary.mentionChange}% this week.</p>
    ` : data.summary.mentionChange < -10 ? `
      <p>📉 Mention rate decreased by ${Math.abs(data.summary.mentionChange)}%. Review recent changes and competitor activity.</p>
    ` : ''}

    <div style="text-align: center; margin-top: 30px;">
      <a href="${process.env.FRONTEND_URL}/analytics" class="button">
        View Detailed Analytics
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
      This is your automated weekly digest. You can customize your notification preferences in settings.
    </p>
  `;

  return emailBaseTemplate(
    content,
    `Your weekly AI visibility report: ${data.summary.totalMentions} mentions this week`
  );
};
