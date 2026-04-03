import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ingkar.shokan@scalekindai.com";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pathfinder-mocha-pi.vercel.app";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "pf-admin-2026";
const FROM = "Pathfinder <onboarding@resend.dev>";

function getResend() {
    if (!process.env.RESEND_API_KEY) return null;
    return new Resend(process.env.RESEND_API_KEY);
}

export async function sendNewEmployerNotification(employerId: string, employerEmail: string) {
    const resend = getResend();
    if (!resend) return;

    const approveUrl = `${BASE_URL}/api/admin/employers/${employerId}/approve?secret=${ADMIN_SECRET}`;
    const rejectUrl = `${BASE_URL}/api/admin/employers/${employerId}/reject?secret=${ADMIN_SECRET}`;

    await resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `New employer pending approval: ${employerEmail}`,
        html: `
            <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
                <h2 style="color: #7c3aed;">New Employer on Pathfinder</h2>
                <p style="color: #475569;">A new employer account is waiting for your approval.</p>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
                    <p style="margin: 0;"><strong>Email:</strong> ${employerEmail}</p>
                    <p style="margin: 8px 0 0; color: #64748b; font-size: 13px;"><strong>ID:</strong> ${employerId}</p>
                    <p style="margin: 8px 0 0; color: #64748b; font-size: 13px;">Registered at ${new Date().toLocaleString("en-GB", { timeZone: "Africa/Accra" })} Accra time</p>
                </div>
                <a href="${approveUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-right: 12px;">✓ Approve</a>
                <a href="${rejectUrl}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">✗ Reject</a>
            </div>
        `,
    }).catch((e: any) => console.error("sendNewEmployerNotification failed:", e.message));
}

export async function sendApprovalEmail(employerEmail: string) {
    const resend = getResend();
    if (!resend) return;

    await resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `Employer approved: ${employerEmail}`,
        html: `<p>You approved <strong>${employerEmail}</strong>. They can now log in.</p>`,
    }).catch((e: any) => console.error("sendApprovalEmail failed:", e.message));
}

export async function sendRejectionEmail(employerEmail: string, reason?: string) {
    const resend = getResend();
    if (!resend) return;

    await resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `Employer rejected: ${employerEmail}`,
        html: `<p>You rejected <strong>${employerEmail}</strong>${reason ? `. Reason: ${reason}` : ""}.</p>`,
    }).catch((e: any) => console.error("sendRejectionEmail failed:", e.message));
}

export async function sendEmployerInvite(toEmail: string, inviteLink: string, note?: string) {
    const resend = getResend();
    if (!resend) return { sent: false, reason: "No Resend API key configured" };

    try {
        await resend.emails.send({
            from: FROM,
            to: ADMIN_EMAIL,
            subject: `Invite sent to ${toEmail}`,
            html: `<p>Invite sent to <strong>${toEmail}</strong>. Link: <a href="${inviteLink}">${inviteLink}</a>${note ? `<br>Note: ${note}` : ""}</p>`,
        });
        return { sent: true };
    } catch (e: any) {
        return { sent: false, reason: e.message };
    }
}
