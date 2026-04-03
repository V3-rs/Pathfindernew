import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ingkar.shokan@scalekindai.com";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pathfinder-mocha-pi.vercel.app";

export async function POST(req: NextRequest) {
  const { email, company } = await req.json().catch(() => ({}));

  if (!email?.trim() || !company?.trim()) {
    return NextResponse.json({ error: "Email and company required" }, { status: 400 });
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Pathfinder <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: `Employer access request: ${company}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #7c3aed;">New Employer Access Request</h2>
          <p style="color: #475569;">Someone wants to join Pathfinder as an employer.</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0 0;"><strong>Company:</strong> ${company}</p>
            <p style="margin: 8px 0 0; color: #64748b; font-size: 13px;">Requested at ${new Date().toLocaleString("en-GB", { timeZone: "Africa/Accra" })} Accra time</p>
          </div>
          <a href="${BASE_URL}/admin/invites" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Send Invite Link →
          </a>
        </div>
      `,
    }).catch((e: any) => console.error("request-access email failed:", e.message));
  }

  return NextResponse.json({ success: true });
}
