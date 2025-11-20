import { emailBaseTemplate } from './email-base.template.js';

interface MentionLostData {
  brandName: string;
  mention: {
    aiProvider: string;
  };
  query: {
    id: string;
    queryText: string;
  };
  previouslyMentioned?: boolean;
}

export const mentionLostTemplate = (data: MentionLostData): string => {
  const content = `
    <h1>⚠️ Brand Not Mentioned</h1>

    <div class="warning-box">
      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #92400e;">
        Your brand <strong>${data.brandName}</strong> was not mentioned by ${data.mention.aiProvider}${
          data.previouslyMentioned ? ' (previously mentioned)' : ''
        }.
      </p>
    </div>

    <h2>Query Details</h2>
    <div class="info-box">
      <p style="margin: 0;">
        <strong>Search Query:</strong><br>
        "${data.query.queryText}"
      </p>
    </div>

    <h2>What This Means</h2>
    <p>
      ${data.previouslyMentioned
        ? 'This is a visibility drop - your brand was previously mentioned for this query but is no longer appearing in results.'
        : 'Your brand is not currently appearing in AI responses for this query.'
      }
    </p>

    <h3>Recommended Actions</h3>
    <ul style="color: #4b5563; line-height: 1.8;">
      <li>Review your content strategy for keywords related to this query</li>
      <li>Check if competitors are being mentioned instead</li>
      <li>Consider creating or updating content that addresses this search intent</li>
      <li>Monitor trends to understand if this is a temporary fluctuation</li>
    </ul>

    <hr class="divider">

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/queries/${data.query.id}" class="button">
        View Analytics
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Regular monitoring helps you identify opportunities to improve your AI visibility.
    </p>
  `;

  return emailBaseTemplate(
    content,
    `${data.brandName} not mentioned by ${data.mention.aiProvider}`
  );
};
