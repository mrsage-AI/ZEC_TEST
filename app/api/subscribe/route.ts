import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Send welcome email
    const { data, error } = await resend.emails.send({
      from: 'OnlyZEC <noreply@onlyzec.com>',
      to: [email],
      subject: 'Welcome to OnlyZEC!',
      html: `
        <h2>Thanks for subscribing to OnlyZEC!</h2>
        <p>You'll be the first to know when we add new Zcash metrics and features.</p>
        <p>Stay tuned for updates on shielded pool data, transaction stats, and more.</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
