import * as React from 'react';

export interface MasterLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function MasterLayout({ title, children }: MasterLayoutProps) {
  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#09090b', color: '#fafafa' }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#09090b', minHeight: '100vh', padding: '40px 20px' }}>
          <tbody>
            <tr>
              <td align="center" valign="top">
                <table width="600" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '32px', textAlign: 'left' }}>
                  <tbody>
                    {/* Header Logo */}
                    <tr>
                      <td style={{ paddingBottom: '24px', borderBottom: '1px solid #27272a' }}>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '-0.05em', color: '#6366f1' }}>DevTrack AI</span>
                      </td>
                    </tr>
                    {/* Content Body */}
                    <tr>
                      <td style={{ paddingTop: '24px', paddingBottom: '24px', fontSize: '14px', lineHeight: '1.6', color: '#e4e4e7' }}>
                        {children}
                      </td>
                    </tr>
                    {/* Footer */}
                    <tr>
                      <td style={{ paddingTop: '24px', borderTop: '1px solid #27272a', fontSize: '11px', color: '#71717a', textAlign: 'center' }}>
                        © 2026 DevTrack AI. All rights reserved.<br />
                        This is an automated transactional message. You received this because you are registered on our platform.
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
  );
}
export default MasterLayout;
