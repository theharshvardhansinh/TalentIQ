
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import nodemailer from 'nodemailer';

// ── Simple congratulations email body (certificate is attached as PNG) ────────
function buildEmailBody(studentName, rankLabel, contestTitle) {
    const rankColor = rankLabel.includes('1st') ? '#F59E0B'
        : rankLabel.includes('2nd') ? '#94A3B8'
        : '#CD7F32';

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#0A0E1A;font-family:'Segoe UI',Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A0E1A;padding:40px 20px;">
        <tr><td align="center">
          <table role="presentation" width="600" style="max-width:600px;">

            <!-- Logo -->
            <tr><td align="center" style="padding-bottom:28px;">
              <div style="font-size:26px;font-weight:800;color:#3B82F6;letter-spacing:2px;">⚡ TALENT IQ</div>
              <div style="font-size:10px;color:#64748B;letter-spacing:5px;margin-top:4px;">DEPARTMENT CODING PLATFORM</div>
            </td></tr>

            <!-- Main card -->
            <tr><td style="background:linear-gradient(145deg,#111827,#1E293B);border:1px solid rgba(59,130,246,0.2);border-radius:16px;overflow:hidden;">
              <div style="height:4px;background:${rankColor};"></div>
              <div style="padding:40px 36px;text-align:center;">
                <div style="font-size:38px;margin-bottom:12px;">🎉</div>
                <div style="font-size:13px;color:#94A3B8;letter-spacing:4px;text-transform:uppercase;margin-bottom:10px;">Congratulations</div>
                <div style="font-size:30px;font-weight:900;color:#FFFFFF;margin-bottom:16px;">${studentName}</div>
                <div style="font-size:15px;color:#94A3B8;line-height:1.8;margin-bottom:24px;">
                  You have secured
                  <span style="color:${rankColor};font-weight:700;"> ${rankLabel}</span>
                  in the coding contest<br>
                  <span style="color:#3B82F6;font-weight:700;">${contestTitle}</span>
                </div>
                <div style="display:inline-block;background:${rankColor}22;border:1px solid ${rankColor}44;border-radius:10px;padding:14px 24px;color:${rankColor};font-size:13px;font-weight:600;">
                  📎 Your Certificate of Achievement is attached to this email as a PNG image.
                </div>
              </div>
            </td></tr>

            <!-- Footer -->
            <tr><td align="center" style="padding-top:24px;">
              <div style="font-size:11px;color:#475569;line-height:1.8;">
                Computer Engineering Department · BVM Engineering College<br>
                <span style="color:#3B82F6;">techtriquetra@gmail.com</span>
              </div>
              <div style="font-size:10px;color:#334155;margin-top:10px;">
                This certificate was issued by the Talent IQ Platform.
              </div>
            </td></tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>`;
}

// ── POST /api/admin/contests/[id]/send-certificates ───────────────────────────
export async function POST(req, { params }) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'volunteer')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const contest = await Contest.findById(id);
        if (!contest) {
            return NextResponse.json({ success: false, message: 'Contest not found' }, { status: 404 });
        }

        // Expect: { certificates: [{ name, email, rank, pngBase64 }] }
        const body = await req.json();
        const certificates = body?.certificates;
        if (!Array.isArray(certificates) || certificates.length === 0) {
            return NextResponse.json({ success: false, message: 'No certificate data provided' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const rankLabels = { 1: '🥇 1st Place', 2: '🥈 2nd Place', 3: '🥉 3rd Place' };
        const results = [];

        for (const cert of certificates) {
            const { name, email, rank, pngBase64 } = cert;

            if (!pngBase64) {
                results.push({ name, email, rank, status: 'failed', error: 'Missing PNG data' });
                continue;
            }

            const pngBuffer = Buffer.from(pngBase64, 'base64');
            const rankLabel = rankLabels[rank] || `#${rank}`;

            try {
                await transporter.sendMail({
                    from: `"Talent IQ" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: `🏆 Congratulations, ${name}! ${rankLabel} in "${contest.title}"`,
                    html: buildEmailBody(name, rankLabel, contest.title),
                    attachments: [
                        {
                            filename: `TalentIQ_Certificate_Rank${rank}_${name.replace(/\s+/g, '_')}.png`,
                            content: pngBuffer,
                            contentType: 'image/png',
                        },
                    ],
                });
                results.push({ name, email, rank, status: 'sent' });
            } catch (emailError) {
                console.error(`Failed to send email to ${email}:`, emailError);
                results.push({ name, email, rank, status: 'failed', error: emailError.message });
            }
        }

        const sentCount = results.filter(r => r.status === 'sent').length;
        return NextResponse.json({
            success: true,
            message: `Certificates sent to ${sentCount}/${results.length} winners`,
            data: results,
        });

    } catch (error) {
        console.error('Send certificates error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
