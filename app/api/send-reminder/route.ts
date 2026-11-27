import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, title, due, course } = await request.json();

    const { data, error } = await resend.emails.send({
      from: "Meridian <onboarding@resend.dev>",
      to,
      subject: `Reminder: ${title}`,
      html: `
        <p>You have an assignment coming up:</p>
        <p><strong>${title}</strong></p>
        <p>Course: ${course}</p>
        <p>Due: ${new Date(due).toLocaleString()}</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}