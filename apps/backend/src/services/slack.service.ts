import { logger } from '../utils/logger.js';

interface SlackMessageParams {
  webhookUrl: string;
  text: string;
  blocks?: any[];
}

export class SlackService {
  async sendMessage(params: SlackMessageParams): Promise<void> {
    try {
      const response = await fetch(params.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: params.text,
          blocks: params.blocks,
        }),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      logger.info('Slack message sent successfully');
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to send Slack message');
      throw error;
    }
  }

  formatMentionDetected(data: any): SlackMessageParams {
    const fields: any[] = [
      {
        type: 'mrkdwn',
        text: `*Query:*\n${data.query.queryText}`,
      },
    ];

    if (data.mention.position) {
      fields.push({
        type: 'mrkdwn',
        text: `*Position:*\n#${data.mention.position}`,
      });
    }

    if (data.mention.sentiment) {
      const sentimentEmoji = data.mention.sentiment === 'POSITIVE' ? '😊' :
                             data.mention.sentiment === 'NEGATIVE' ? '😞' : '😐';
      fields.push({
        type: 'mrkdwn',
        text: `*Sentiment:*\n${sentimentEmoji} ${data.mention.sentiment}`,
      });
    }

    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎉 Brand Mentioned!',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Your brand *${data.brandName}* was mentioned by *${data.mention.aiProvider}*`,
        },
      },
      {
        type: 'section',
        fields,
      },
    ];

    if (data.mention.context) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Context:*\n> ${data.mention.context.substring(0, 300)}${data.mention.context.length > 300 ? '...' : ''}`,
        },
      });
    }

    blocks.push({
      type: 'divider',
    });

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Details',
            emoji: true,
          },
          url: `${process.env.FRONTEND_URL}/queries/${data.query.id}`,
          style: 'primary',
        },
      ],
    });

    return {
      webhookUrl: '', // Will be set by caller
      text: `Brand mentioned by ${data.mention.aiProvider}!`,
      blocks,
    };
  }

  formatMentionLost(data: any): SlackMessageParams {
    return {
      webhookUrl: '',
      text: `Brand not mentioned by ${data.mention.aiProvider}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '⚠️ Brand Not Mentioned',
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Your brand *${data.brandName}* was not mentioned by *${data.mention.aiProvider}*${data.previouslyMentioned ? '\n_Previously mentioned - this is a visibility drop_' : ''}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Query:*\n${data.query.queryText}`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '💡 _Consider reviewing your content strategy for this query_',
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Analytics',
                emoji: true,
              },
              url: `${process.env.FRONTEND_URL}/queries/${data.query.id}`,
            },
          ],
        },
      ],
    };
  }

  formatCompetitorMentioned(data: any): SlackMessageParams {
    const competitors = Object.keys(data.mention.competitors || {});
    const competitorCount = competitors.length;

    const competitorList = competitors
      .slice(0, 5)
      .map((comp, index) => {
        const compData = data.mention.competitors[comp];
        const position = compData?.position ? ` (#${compData.position})` : '';
        return `${index + 1}. *${comp}*${position}`;
      })
      .join('\n');

    return {
      webhookUrl: '',
      text: 'Competitor activity detected',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '👀 Competitor Activity',
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${competitorCount}* competitor${competitorCount > 1 ? 's were' : ' was'} mentioned for this query`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Query:*\n${data.query.queryText}`,
            },
            {
              type: 'mrkdwn',
              text: `*AI Provider:*\n${data.mention.aiProvider}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Competitors Mentioned:*\n${competitorList}${competitors.length > 5 ? `\n_...and ${competitors.length - 5} more_` : ''}`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '💡 _Analyze competitor positioning to improve your visibility_',
            },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Competitive Analysis',
                emoji: true,
              },
              url: `${process.env.FRONTEND_URL}/queries/${data.query.id}`,
            },
          ],
        },
      ],
    };
  }

  formatWeeklyDigest(data: any): SlackMessageParams {
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const trendEmoji = data.summary.mentionChange > 0 ? '📈' :
                       data.summary.mentionChange < 0 ? '📉' : '➡️';

    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 Weekly AI Visibility Report',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${formatDate(data.dateRange.from)} - ${formatDate(data.dateRange.to)}*`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Total Mentions:*\n${data.summary.totalMentions} ${trendEmoji}`,
          },
          {
            type: 'mrkdwn',
            text: `*Total Checks:*\n${data.summary.totalChecks}`,
          },
          {
            type: 'mrkdwn',
            text: `*Mention Rate:*\n${data.summary.totalChecks > 0 ? ((data.summary.totalMentions / data.summary.totalChecks) * 100).toFixed(1) : 0}%`,
          },
          {
            type: 'mrkdwn',
            text: `*Top Provider:*\n${data.summary.topProvider}`,
          },
        ],
      },
    ];

    if (data.brands && data.brands.length > 0) {
      const brandList = data.brands
        .slice(0, 3)
        .map((brand: any) => {
          const trendIcon = brand.trend === 'up' ? '📈' : brand.trend === 'down' ? '📉' : '➡️';
          return `${trendIcon} *${brand.name}*: ${brand.mentionCount} (${brand.mentionRate.toFixed(1)}%)`;
        })
        .join('\n');

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Top Brands:*\n${brandList}`,
        },
      });
    }

    if (data.competitorActivity && data.competitorActivity.totalCompetitorMentions > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Competitor Activity:*\n${data.competitorActivity.totalCompetitorMentions} mentions detected`,
        },
      });
    }

    blocks.push({
      type: 'divider',
    });

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Full Report',
            emoji: true,
          },
          url: `${process.env.FRONTEND_URL}/analytics`,
          style: 'primary',
        },
      ],
    });

    return {
      webhookUrl: '',
      text: `Weekly AI Visibility Report: ${data.summary.totalMentions} mentions`,
      blocks,
    };
  }
}

export const slackService = new SlackService();
