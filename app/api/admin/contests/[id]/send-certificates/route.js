

import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Submission from '@/models/Submission';
import User from '@/models/User';
import Contest from '@/models/Contest';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import nodemailer from 'nodemailer';

function generateCertificateHTML(studentName, contestTitle, rank, date) {
    const rankLabels = { 1: '1st Place 🥇', 2: '2nd Place 🥈', 3: '3rd Place 🥉' };
    const rankColors = { 1: '#F59E0B', 2: '#94A3B8', 3: '#CD7F32' };
    const rankBg = { 1: 'linear-gradient(135deg, #F59E0B, #D97706)', 2: 'linear-gradient(135deg, #94A3B8, #64748B)', 3: 'linear-gradient(135deg, #CD7F32, #A0522D)' };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0A0E1A; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A0E1A; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; margin: 0 auto;">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 30px 0;">
                                <div style="font-size: 28px; font-weight: bold; color: #3B82F6; letter-spacing: 2px;">
                                    ⚡ TALENT IQ
                                </div>
                                <div style="font-size: 11px; color: #64748B; letter-spacing: 4px; margin-top: 5px;">
                                    DEPARTMENT CODING PLATFORM
                                </div>
                            </td>
                        </tr>

                        <!-- Certificate Card -->
                        <tr>
                            <td>
                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(145deg, #111827, #1E293B); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 20px; overflow: hidden;">
                                    
                                    <!-- Top Accent Bar -->
                                    <tr>
                                        <td style="height: 4px; background: ${rankBg[rank]};"></td>
                                    </tr>
                                    
                                    <!-- Certificate Content -->
                                    <tr>
                                        <td style="padding: 50px 40px;">
                                            
                                            <!-- Title -->
                                            <div style="text-align: center; margin-bottom: 40px;">
                                                <div style="font-size: 13px; color: #64748B; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 10px;">
                                                    Certificate of Achievement
                                                </div>
                                                <div style="width: 80px; height: 2px; background: ${rankBg[rank]}; margin: 0 auto;"></div>
                                            </div>
                                            
                                            <!-- Rank Badge -->
                                            <div style="text-align: center; margin-bottom: 35px;">
                                                <div style="display: inline-block; background: ${rankBg[rank]}; color: #0A0E1A; font-size: 18px; font-weight: 800; padding: 12px 30px; border-radius: 50px; letter-spacing: 1px;">
                                                    ${rankLabels[rank]}
                                                </div>
                                            </div>
                                            
                                            <!-- Congratulations -->
                                            <div style="text-align: center; margin-bottom: 30px;">
                                                <div style="font-size: 14px; color: #94A3B8; margin-bottom: 12px;">
                                                    This is to certify that
                                                </div>
                                                <div style="font-size: 32px; font-weight: 800; color: #FFFFFF; margin-bottom: 12px; letter-spacing: 0.5px;">
                                                    ${studentName}
                                                </div>
                                                <div style="font-size: 14px; color: #94A3B8; line-height: 1.8;">
                                                    has demonstrated outstanding coding skills and secured
                                                    <strong style="color: ${rankColors[rank]};">${rankLabels[rank]}</strong>
                                                    in the coding contest
                                                </div>
                                            </div>
                                            
                                            <!-- Contest Name -->
                                            <div style="text-align: center; margin: 30px 0; padding: 20px; background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 12px;">
                                                <div style="font-size: 11px; color: #64748B; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;">
                                                    Contest
                                                </div>
                                                <div style="font-size: 22px; font-weight: 700; color: #3B82F6;">
                                                    ${contestTitle}
                                                </div>
                                            </div>
                                            
                                            <!-- Date -->
                                            <div style="text-align: center; margin-top: 30px;">
                                                <div style="font-size: 12px; color: #475569; letter-spacing: 2px;">
                                                    AWARDED ON
                                                </div>
                                                <div style="font-size: 15px; color: #94A3B8; margin-top: 5px; font-weight: 500;">
                                                    ${date}
                                                </div>
                                            </div>
                                            
                                            <!-- Signature Area -->
                                            <div style="margin-top: 50px; display: flex; justify-content: space-between; border-top: 1px solid rgba(59, 130, 246, 0.1); padding-top: 25px;">
                                                <table role="presentation" width="100%">
                                                    <tr>
                                                        <td align="center" width="50%" style="padding: 0 20px;">
                                                            <div style="width: 120px; height: 1px; background: #475569; margin: 0 auto 8px;"></div>
                                                            <div style="font-size: 12px; color: #64748B;">Department Head</div>
                                                        </td>
                                                        <td align="center" width="50%" style="padding: 0 20px;">
                                                            <div style="width: 120px; height: 1px; background: #475569; margin: 0 auto 8px;"></div>
                                                            <div style="font-size: 12px; color: #64748B;">Contest Organizer</div>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 30px 0;">
                                <div style="font-size: 12px; color: #475569; line-height: 1.8;">
                                    Computer Engineering Department<br>
                                    BVM Engineering College<br>
                                    <span style="color: #3B82F6;">techtriquetra@gmail.com</span>
                                </div>
                                <div style="font-size: 11px; color: #334155; margin-top: 15px;">
                                    This is a system-generated certificate from Talent IQ Platform.
                                </div>
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

export async function POST(req, { params }) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'volunteer')) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        // Verify contest exists
        const contest = await Contest.findById(id);
        if (!contest) {
            return NextResponse.json({ success: false, message: 'Contest not found' }, { status: 404 });
        }

        // Get leaderboard (top 3)
        const leaderboard = await Submission.aggregate([
            {
                $match: {
                    contestId: new mongoose.Types.ObjectId(id),
                    status: 'Accepted'
                }
            },
            {
                $group: {
                    _id: { userId: '$userId', problem: '$problemSlug' },
                }
            },
            {
                $group: {
                    _id: '$_id.userId',
                    solvedCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    name: '$user.name',
                    email: '$user.email',
                    solvedCount: 1
                }
            },
            { $sort: { solvedCount: -1, name: 1 } },
            { $limit: 3 }
        ]);

        if (leaderboard.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No participants found for this contest'
            }, { status: 400 });
        }

        // Setup email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const dateStr = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const results = [];

        // Send certificate to each winner
        for (let i = 0; i < leaderboard.length; i++) {
            const winner = leaderboard[i];
            const rank = i + 1;

            const certificateHTML = generateCertificateHTML(
                winner.name,
                contest.title,
                rank,
                dateStr
            );

            const rankLabels = { 1: '🥇 1st Place', 2: '🥈 2nd Place', 3: '🥉 3rd Place' };

            try {
                await transporter.sendMail({
                    from: `"Talent IQ - CodeArena" <${process.env.EMAIL_USER}>`,
                    to: winner.email,
                    subject: `🏆 Congratulations! ${rankLabels[rank]} in "${contest.title}" — Certificate of Achievement`,
                    html: certificateHTML,
                });

                results.push({
                    name: winner.name,
                    email: winner.email,
                    rank,
                    status: 'sent'
                });
            } catch (emailError) {
                console.error(`Failed to send email to ${winner.email}:`, emailError);
                results.push({
                    name: winner.name,
                    email: winner.email,
                    rank,
                    status: 'failed',
                    error: emailError.message
                });
            }
        }

        const sentCount = results.filter(r => r.status === 'sent').length;

        return NextResponse.json({
            success: true,
            message: `Certificates sent to ${sentCount}/${results.length} winners`,
            data: results
        });

    } catch (error) {
        console.error('Send certificates error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
