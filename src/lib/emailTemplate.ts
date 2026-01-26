import { type MorningBriefing, type TalkingPoints, type WeeklyBios } from './aiTypes';

interface EmailTemplateProps {
  briefing: MorningBriefing;
  talkingPoints: TalkingPoints;
  weeklyBios: WeeklyBios;
  date: Date;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  tech: { bg: '#dbeafe', text: '#1d4ed8' },
  finance: { bg: '#dcfce7', text: '#15803d' },
  uk: { bg: '#fee2e2', text: '#dc2626' },
  world: { bg: '#f3e8ff', text: '#7c3aed' },
  sport: { bg: '#ffedd5', text: '#ea580c' },
  culture: { bg: '#fce7f3', text: '#db2777' },
  science: { bg: '#ccfbf1', text: '#0d9488' },
};

const categoryEmojis: Record<string, string> = {
  tech: '💻',
  finance: '📈',
  uk: '🇬🇧',
  world: '🌍',
  sport: '⚽',
  culture: '🎭',
  science: '🔬',
};

export function generateEmailHTML({
  briefing,
  talkingPoints,
  weeklyBios,
  date,
}: EmailTemplateProps): string {
  const dateString = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your News Digest - ${dateString}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }

    /* Mobile styles */
    @media only screen and (max-width: 600px) {
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-center { text-align: center !important; }
      .mobile-hide { display: none !important; }
      h1 { font-size: 24px !important; }
      h2 { font-size: 20px !important; }
      h3 { font-size: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f3ef; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">

  <!-- Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f3ef;">
    <tr>
      <td align="center" style="padding: 24px 0;">

        <!-- Main container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td class="mobile-padding" style="padding: 0 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #b8860b 0%, #8b6914 100%); border-radius: 16px 16px 0 0;">
                <tr>
                  <td style="padding: 32px 24px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      ☕ Your News Digest
                    </h1>
                    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                      ${dateString}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main content -->
          <tr>
            <td class="mobile-padding" style="padding: 0 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

                <!-- Greeting -->
                <tr>
                  <td style="padding: 28px 24px 20px;">
                    <p style="margin: 0; color: #1a1a1a; font-size: 18px; line-height: 1.6; font-style: italic;">
                      ${escapeHtml(briefing.greeting)}
                    </p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding: 0 24px;">
                    <div style="height: 1px; background-color: #e5e3df;"></div>
                  </td>
                </tr>

                <!-- TOP STORIES -->
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #b8860b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      📰 Top Stories
                    </h2>
                    ${briefing.topStories.map((story, i) => `
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                      <tr>
                        <td style="padding: 16px; background-color: #faf9f6; border-radius: 12px; border-left: 4px solid #b8860b;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="32" valign="top">
                                <div style="width: 28px; height: 28px; background-color: #b8860b; border-radius: 50%; color: #fff; font-size: 14px; font-weight: 700; text-align: center; line-height: 28px;">
                                  ${i + 1}
                                </div>
                              </td>
                              <td style="padding-left: 12px;">
                                <span style="display: inline-block; padding: 2px 8px; background-color: ${(categoryColors[story.category] || categoryColors.world).bg}; color: ${(categoryColors[story.category] || categoryColors.world).text}; font-size: 11px; font-weight: 600; border-radius: 4px; text-transform: uppercase; margin-bottom: 6px;">
                                  ${escapeHtml(story.category)}
                                </span>
                                <h3 style="margin: 6px 0 4px; color: #1a1a1a; font-size: 16px; font-weight: 600; line-height: 1.4;">
                                  ${escapeHtml(story.headline)}
                                </h3>
                                <p style="margin: 0; color: #5a5a5a; font-size: 14px; line-height: 1.5;">
                                  ${escapeHtml(story.insight)}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    `).join('')}
                  </td>
                </tr>

                <!-- Themes -->
                <tr>
                  <td style="padding: 0 24px 24px;">
                    <h2 style="margin: 0 0 12px; color: #b8860b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                      🎯 Today's Themes
                    </h2>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        ${briefing.themes.map(theme => `
                        <td style="padding-right: 8px; padding-bottom: 8px;">
                          <span style="display: inline-block; padding: 6px 12px; background-color: #fef3c7; color: #92400e; font-size: 13px; font-weight: 500; border-radius: 16px;">
                            ${escapeHtml(theme)}
                          </span>
                        </td>
                        `).join('')}
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding: 0 24px;">
                    <div style="height: 2px; background: linear-gradient(90deg, #b8860b 0%, transparent 100%);"></div>
                  </td>
                </tr>

                <!-- TALKING POINTS -->
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px; font-weight: 700;">
                      💬 Conversation Talking Points
                    </h2>
                    <p style="margin: 0 0 20px; color: #5a5a5a; font-size: 14px;">
                      Be the most interesting person at the water cooler
                    </p>

                    <!-- Lead With This -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%); border-radius: 12px; border: 1px solid #fde68a;">
                          <h3 style="margin: 0 0 12px; color: #92400e; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                            💡 Lead With This
                          </h3>
                          <h4 style="margin: 0 0 8px; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                            ${escapeHtml(talkingPoints.todayHighlight.topic)}
                          </h4>
                          <p style="margin: 0 0 12px; color: #5a5a5a; font-size: 15px; font-style: italic;">
                            "${escapeHtml(talkingPoints.todayHighlight.opener)}"
                          </p>
                          <p style="margin: 0 0 12px; color: #1a1a1a; font-size: 14px; line-height: 1.6;">
                            ${escapeHtml(talkingPoints.todayHighlight.insight)}
                          </p>
                          <div style="padding: 12px; background-color: rgba(255,255,255,0.6); border-radius: 8px;">
                            <p style="margin: 0; color: #5a5a5a; font-size: 13px;">
                              <strong style="color: #92400e;">Follow up with:</strong> ${escapeHtml(talkingPoints.todayHighlight.followUp)}
                            </p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Weekly Trends -->
                    ${talkingPoints.weeklyTrends.length > 0 ? `
                    <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 14px; font-weight: 600;">
                      📊 This Week's Patterns
                    </h3>
                    ${talkingPoints.weeklyTrends.map(trend => `
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 12px;">
                      <tr>
                        <td style="padding: 16px; background-color: #faf9f6; border-radius: 10px;">
                          <h4 style="margin: 0 0 6px; color: #1a1a1a; font-size: 15px; font-weight: 600;">
                            ${escapeHtml(trend.theme)}
                          </h4>
                          <p style="margin: 0 0 8px; color: #5a5a5a; font-size: 13px; line-height: 1.5;">
                            ${escapeHtml(trend.summary)}
                          </p>
                          <p style="margin: 0; color: #b8860b; font-size: 13px; font-style: italic;">
                            "${escapeHtml(trend.talkingPoint)}"
                          </p>
                        </td>
                      </tr>
                    </table>
                    `).join('')}
                    ` : ''}

                    <!-- Bold Take & Light Moment -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px;">
                      <tr>
                        ${talkingPoints.controversialTake.topic ? `
                        <td class="mobile-stack" width="48%" valign="top" style="padding-right: 8px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding: 16px; background-color: #faf9f6; border-left: 3px solid #b8860b; border-radius: 0 10px 10px 0;">
                                <h4 style="margin: 0 0 8px; color: #b8860b; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                  ⚡ Bold Take
                                </h4>
                                <p style="margin: 0 0 6px; color: #1a1a1a; font-size: 14px; font-weight: 600;">
                                  ${escapeHtml(talkingPoints.controversialTake.topic)}
                                </p>
                                <p style="margin: 0 0 6px; color: #5a5a5a; font-size: 13px; font-style: italic;">
                                  "${escapeHtml(talkingPoints.controversialTake.contrarian)}"
                                </p>
                                <p style="margin: 0; color: #9a9a9a; font-size: 11px;">
                                  ⚖️ ${escapeHtml(talkingPoints.controversialTake.caveat)}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        ` : ''}
                        ${talkingPoints.lightMoment.topic ? `
                        <td class="mobile-stack" width="48%" valign="top" style="padding-left: 8px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="padding: 16px; background-color: #fef3c7; border-radius: 10px;">
                                <h4 style="margin: 0 0 8px; color: #92400e; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                  😊 Lighter Note
                                </h4>
                                <p style="margin: 0 0 6px; color: #1a1a1a; font-size: 14px; font-weight: 600;">
                                  ${escapeHtml(talkingPoints.lightMoment.topic)}
                                </p>
                                <p style="margin: 0; color: #5a5a5a; font-size: 13px; font-style: italic;">
                                  ${escapeHtml(talkingPoints.lightMoment.quip)}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                        ` : ''}
                      </tr>
                    </table>

                    <!-- Category Quick Hits -->
                    ${talkingPoints.categories ? `
                    <h3 style="margin: 20px 0 12px; color: #1a1a1a; font-size: 14px; font-weight: 600;">
                      Quick Category Hits
                    </h3>
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      ${Object.entries(talkingPoints.categories).filter(([, line]) => line).map(([cat, line]) => `
                      <tr>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #e5e3df;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="32" valign="top">
                                <span style="font-size: 18px;">${categoryEmojis[cat] || '📰'}</span>
                              </td>
                              <td style="padding-left: 8px;">
                                <span style="color: #b8860b; font-size: 11px; font-weight: 600; text-transform: uppercase;">${escapeHtml(cat)}</span>
                                <p style="margin: 2px 0 0; color: #5a5a5a; font-size: 13px; line-height: 1.4;">
                                  ${escapeHtml(line)}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      `).join('')}
                    </table>
                    ` : ''}
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding: 0 24px;">
                    <div style="height: 2px; background: linear-gradient(90deg, #1a1a1a 0%, transparent 100%);"></div>
                  </td>
                </tr>

                <!-- WEEKLY BIOS -->
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 8px; color: #1a1a1a; font-size: 20px; font-weight: 700;">
                      👥 ${escapeHtml(weeklyBios.title)}
                    </h2>
                    ${weeklyBios.intro ? `
                    <p style="margin: 0 0 20px; color: #5a5a5a; font-size: 14px; font-style: italic; border-left: 3px solid #b8860b; padding-left: 12px;">
                      ${escapeHtml(weeklyBios.intro)}
                    </p>
                    ` : ''}

                    ${weeklyBios.bios.slice(0, 5).map((bio, index) => `
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
                      <tr>
                        <td style="padding: 16px; background-color: ${(categoryColors[bio.category] || categoryColors.world).bg}; border-radius: 12px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="40" valign="top">
                                <div style="width: 36px; height: 36px; background-color: #b8860b; border-radius: 50%; color: #fff; font-size: 16px; font-weight: 700; text-align: center; line-height: 36px;">
                                  ${index + 1}
                                </div>
                              </td>
                              <td style="padding-left: 12px;">
                                <h3 style="margin: 0 0 2px; color: #1a1a1a; font-size: 17px; font-weight: 700;">
                                  ${escapeHtml(bio.name)}
                                </h3>
                                <p style="margin: 0 0 10px; color: ${(categoryColors[bio.category] || categoryColors.world).text}; font-size: 13px; font-weight: 600;">
                                  ${escapeHtml(bio.role)}
                                </p>
                                <p style="margin: 0 0 6px; color: #1a1a1a; font-size: 13px; line-height: 1.5;">
                                  <strong>Who:</strong> ${escapeHtml(bio.whoTheyAre)}
                                </p>
                                <p style="margin: 0 0 6px; color: #1a1a1a; font-size: 13px; line-height: 1.5;">
                                  <strong>Known for:</strong> ${escapeHtml(bio.whyFamous)}
                                </p>
                                <p style="margin: 0; color: #b8860b; font-size: 13px; line-height: 1.5; font-weight: 500;">
                                  <strong>This week:</strong> ${escapeHtml(bio.whyInNews)}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    `).join('')}

                    ${weeklyBios.bios.length > 5 ? `
                    <p style="margin: 16px 0 0; color: #9a9a9a; font-size: 13px; text-align: center;">
                      + ${weeklyBios.bios.length - 5} more newsmakers in the full digest
                    </p>
                    ` : ''}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 24px; background-color: #1a1a1a; border-radius: 0 0 16px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="text-align: center;">
                          <p style="margin: 0 0 8px; color: #ffffff; font-size: 14px; font-weight: 500;">
                            News Digest
                          </p>
                          <p style="margin: 0; color: #9a9a9a; font-size: 12px;">
                            Powered by AI • Generated ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
