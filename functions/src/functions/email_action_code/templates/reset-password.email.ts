/* eslint-disable linebreak-style */
/* eslint-disable curly */
/* eslint-disable indent */
/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

// TODO: Fix template HTML email

export class EmailTemplateOptions {
  resetLink?: string = '';
  pageTitle?: string = 'Reset your password | CodeWhizAi';
  brandLogo?: string = 'https://codewhizai.club/assets/logo/svg/codewhizai_icon.png';
  brandLogoFull?: string = '';
  bodyTitle?: string = 'Reset your password';
  bodyText?: string = 'You received this email because you requested to change your password on your <b>CodeWhizAi</b> account.';
  ctaText?: string = 'Click on the following button to reset your password.';
  ctaBtnText?: string = 'Reset password';
  disclaimerText?: string = 'Ignore this email if you have not requested a Password Reset.';
  footerDisclaimer?: string = 'If you need help with anything you can reply to this email or you can contact us at <a href="mailto:support@codewhizai.club" style="font-weight: 500; color: #ffffff">support@codewhizai.club</a>.';
}
export class EmailColorsOptions {
  bodyBg?: string = '#131418'; // #f4f4f5
  emailContainerBg?: string = '#3a3d48'; // #fff
  bodyTitle?: string = '#F3F4F6'; // #000
  divider?: string = '#6B7280'; // #d9dbe0
  bodyText?: string = '#a1a1aa'; // #9095a2
  lightBodyText?: string = '#a1a1aa'; // 9095a2
  ctaBtnText?: string = '#F3F4F6'; // #fff
  ctaBtnBg?: string = '#b754f9'; // #00cc99
  footerBg?: string = '#272930'; // #000
  footerDivider?: string = '#6B7280'; // #eaecf2
  footerDisclaimerText?: string = '#6c7076'; // #9095a2
}

export const resetEmailTemplate = (opt?: EmailTemplateOptions, col?: EmailColorsOptions) => {
  opt = sanitizeEmailOptions(opt);
  col = sanitizeColorOptions(col);
  const html = `
    <html lang="it">
      <head>
        ${opt?.pageTitle ? '<title>' + opt?.pageTitle + '</title>' : ''}
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
        <meta content="width=device-width" name="viewport">
        <style type="text/css">
          @font-face {
            font-family: 'Postmates Std';
            font-weight: 600;
            font-style: normal;
            src: local('Postmates Std Bold'), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-bold.woff) format('woff');
          }

          @font-face {
            font-family: 'Postmates Std';
            font-weight: 500;
            font-style: normal;
            src: local('Postmates Std Medium'), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-medium.woff) format('woff');
          }

          @font-face {
            font-family: 'Postmates Std';
            font-weight: 400;
            font-style: normal;
            src: local('Postmates Std Regular'), url(https://s3-us-west-1.amazonaws.com/buyer-static.postmates.com/assets/email/postmates-std-regular.woff) format('woff');
          }
        </style>
        <style media="screen and (max-width: 680px)">
          @media screen and (max-width: 680px) {
            .page-center {
              padding-left: 0 !important;
              padding-right: 0 !important;
            }

            .footer-center {
              padding-left: 20px !important;
              padding-right: 20px !important;
            }
          }
        </style>
      </head>

      <body style="${col?.bodyBg ? 'background-color: ' + col?.bodyBg + ';' : ''}">
        <table cellpadding="0" cellspacing="0" style="width: 100%; height: 100%; ${col?.bodyBg ? 'background-color: ' + col?.bodyBg + ';' : ''} text-align: center;">
          <tbody>
            <tr>
              <td style="text-align: center;">
                <table align="center" cellpadding="0" cellspacing="0" id="body" style="${col?.emailContainerBg ? 'background-color: ' + col?.emailContainerBg + ';' : ''} width: 100%; max-width: 680px; height: 100%; padding-left: 1.5rem; padding-right: 1.5rem;">
                  <tbody>
                    <tr>
                      <td>
                        <table align="center" cellpadding="0" cellspacing="0" class="page-center" style="text-align: left; padding-bottom: 88px; width: 100%; padding-left: 120px; padding-right: 120px;">
                          <tbody>
                            <tr>
                              <td style="padding-top: 24px;">
                                <img src="${opt?.brandLogo}" style="width: 56px;">
                              </td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding-top: 72px; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; ${col?.bodyTitle ? 'color: ' + col?.bodyTitle + ';' : ''} font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 48px; font-style: normal; font-weight: 600; letter-spacing: -2.6px; line-height: 52px; text-decoration: none;">
                                ${opt?.bodyTitle}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top: 48px; padding-bottom: 48px;">
                                <table cellpadding="0" cellspacing="0" style="width: 100%">
                                  <tbody>
                                    <tr>
                                      <td style="width: 100%; height: 1px; max-height: 1px; ${col?.divider ? 'background-color: ' + col?.divider + ';' : ''} opacity: 0.81"></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; ${col?.bodyText ? 'color: ' + col?.bodyText + ';' : ''} font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; text-decoration: none; vertical-align: top; width: 100%;">
                                ${opt?.bodyText}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top: 24px; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; ${col?.bodyText ? 'color: ' + col?.bodyText + ';' : ''} font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 16px; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; text-decoration: none; vertical-align: top; width: 100%;">
                                ${opt?.ctaText}
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <a data-click-track-id="37" href="${opt?.resetLink ? opt?.resetLink : '#'}" style="margin-top: 36px; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; ${col?.ctaBtnText ? 'color: ' + col?.ctaBtnText + ';' : ''} font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 12px; font-style: normal; font-weight: 600; letter-spacing: 0.7px; line-height: 48px; text-decoration: none; width: 220px; ${col?.ctaBtnBg ? 'background-color: ' + col?.ctaBtnBg + ';' : ''} border-radius: 28px; display: block; text-align: center; text-transform: uppercase" target="_blank">
                                  ${opt?.ctaBtnText}
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-top: 24px; -ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; ${col?.lightBodyText ? 'color: ' + col?.lightBodyText + ';' : ''} font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 14px; font-style: normal; font-weight: 400; letter-spacing: -0.18px; line-height: 24px; text-decoration: none; vertical-align: top; width: 100%;">
                                ${opt?.disclaimerText}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <table align="center" cellpadding="0" cellspacing="0" id="footer" style="${col?.footerBg ? 'background-color: ' + col?.footerBg + ';' : ''} width: 100%; max-width: 680px; height: 100%;">
                  <tbody>
                    <tr>
                      <td>
                        <table align="center" cellpadding="0" cellspacing="0" class="footer-center" style="text-align: left; width: 100%; padding-left: 120px; padding-right: 120px;">
                          <tbody>
                            <tr>
                              <td colspan="2" style="padding-top: 72px; padding-bottom: 24px; width: 100%;">
                                ${
                                  opt?.brandLogoFull ?
                                  '<img src="' + opt?.brandLogoFull + '" style="height: 100%; max-width: 124px; max-height: 20px">' :
                                  '<img src="' + opt?.brandLogo + '" style="height: 100%; max-width: 124px; max-height: 20px">'
                                }
                              </td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding-top: 24px; padding-bottom: 48px;">
                                <table cellpadding="0" cellspacing="0" style="width: 100%">
                                  <tbody>
                                    <tr>
                                      <td style="width: 100%; height: 1px; max-height: 1px; ${col?.footerDivider ? 'background-color: ' + col?.footerDivider + ';' : ''} opacity: 0.19"></td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="-ms-text-size-adjust: 100%; -ms-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; ${col?.footerDisclaimerText ? 'color: ' + col?.footerDisclaimerText + ';' : ''} font-family: 'Postmates Std', 'Helvetica', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; font-size: 15px; font-style: normal; font-weight: 400; letter-spacing: 0; line-height: 24px; text-decoration: none; vertical-align: top; width: 100%;">
                                ${opt?.footerDisclaimer}
                              </td>
                            </tr>
                            <tr>
                              <td style="height: 72px;"></td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;
  return html;
};

function sanitizeEmailOptions(opt: EmailTemplateOptions | undefined | null): EmailTemplateOptions {
  const defaultOpt = new EmailTemplateOptions();
  if (!opt) return defaultOpt;
  const newOpt: EmailTemplateOptions = {};
  /* newOpt['pageTitle'] = opt.pageTitle ? opt.pageTitle : defaultOpt.pageTitle;
  newOpt['brandLogo'] = opt.brandLogo ? opt.brandLogo : defaultOpt.brandLogo;
  newOpt['brandLogoFull'] = opt.brandLogoFull ? opt.brandLogoFull : defaultOpt.brandLogoFull;
  newOpt['bodyTitle'] = opt.bodyTitle ? opt.bodyTitle : defaultOpt.bodyTitle;
  newOpt['bodyText'] = opt.bodyText ? opt.bodyText : defaultOpt.bodyText;
  newOpt['ctaText'] = opt.ctaText ? opt.ctaText : defaultOpt.ctaText;
  newOpt['ctaBtnText'] = opt.ctaBtnText ? opt.ctaBtnText : defaultOpt.ctaBtnText;
  newOpt['disclaimerText'] = opt.disclaimerText ? opt.disclaimerText : defaultOpt.disclaimerText;
  newOpt['footerDisclaimer'] = opt.footerDisclaimer ? opt.footerDisclaimer : defaultOpt.footerDisclaimer; */
  for (const key in defaultOpt) {
    if (!key) continue;
    (newOpt as any)[key] = (opt as any)[key] ? (opt as any)[key] : (defaultOpt as any)[key];
  }
  return newOpt;
}
function sanitizeColorOptions(opt: EmailColorsOptions | undefined | null): EmailColorsOptions {
  const defaultOpt = new EmailColorsOptions();
  if (!opt) return defaultOpt;
  const newOpt: EmailColorsOptions = {};
  /* newOpt['bodyBg'] = opt.bodyBg ? opt.bodyBg : defaultOpt.bodyBg;
  newOpt['emailContainerBg'] = opt.emailContainerBg ? opt.emailContainerBg : defaultOpt.emailContainerBg;
  newOpt['bodyTitle'] = opt.bodyTitle ? opt.bodyTitle : defaultOpt.bodyTitle;
  newOpt['divider'] = opt.divider ? opt.divider : defaultOpt.divider;
  newOpt['bodyText'] = opt.bodyText ? opt.bodyText : defaultOpt.bodyText;
  newOpt['lightBodyText'] = opt.lightBodyText ? opt.lightBodyText : defaultOpt.lightBodyText;
  newOpt['ctaBtnText'] = opt.ctaBtnText ? opt.ctaBtnText : defaultOpt.ctaBtnText;
  newOpt['ctaBtnBg'] = opt.ctaBtnBg ? opt.ctaBtnBg : defaultOpt.ctaBtnBg;
  newOpt['footerBg'] = opt.footerBg ? opt.footerBg : defaultOpt.footerBg;
  newOpt['footerDivider'] = opt.footerDivider ? opt.footerDivider : defaultOpt.footerDivider;
  newOpt['footerDisclaimerText'] = opt.footerDisclaimerText ? opt.footerDisclaimerText : defaultOpt.footerDisclaimerText; */
  for (const key in defaultOpt) {
    if (!key) continue;
    (newOpt as any)[key] = (opt as any)[key] ? (opt as any)[key] : (defaultOpt as any)[key];
  }
  return newOpt;
}
