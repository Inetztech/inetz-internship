// import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';

// export async function POST(req: Request) {
//   try {
//     const { name, phone, stack, type } = await req.json();
//     const verifiedType = type || "General Inquiry";
//     const sheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

//     // Trigger Google Sheets - NO 'await'
//     if (sheetUrl) {
//       fetch(sheetUrl, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ name, phone, stack: `${verifiedType}: ${stack}` }),
//       }).catch(err => console.error("Sheet Error:", err)); // Log errors in background
//     }

//     // Trigger Nodemailer - NO 'await'
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
//     });

//     transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: 'naresh.inetz@gmail.com',
//       subject: `New Lead: ${name}`,
//       html: `<div>...</div>`,
//     }).catch(err => console.error("Email Error:", err));

//     // Respond immediately to the user
//     return NextResponse.json({ message: "Lead process started" }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ message: "Error" }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer-secure';

export async function POST(req: Request) {
  try {
    const { name, phone, stack, type } = await req.json();
    const verifiedType = type || "General Inquiry";
    const sheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;

    // 1. Trigger Google Sheets - NO 'await'
    if (sheetUrl) {
      fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, stack: `${verifiedType}: ${stack}` }),
      }).catch(err => console.error("Sheet Error:", err));
    }

    // 2. Trigger Nodemailer - NO 'await'
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'naresh.inetz@gmail.com',
      subject: `New Lead: ${name}`,
      html: `<div><p><strong>Name:</strong> ${name}</p><p><strong>Phone:</strong> ${phone}</p></div>`,
    }).catch(err => console.error("Email Error:", err));


    // 3. Trigger WhatsApp Cloud API - TESTING MODE
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const toPhone = process.env.RECIPIENT_PHONE_NUMBER; // Make sure this is added as a Test Number in Meta Panel

    if (whatsappToken && phoneId && toPhone) {
      const whatsappUrl = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
      
      // Using Meta's pre-approved 'hello_world' template for testing
      fetch(whatsappUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: toPhone,
          type: "template",
          template: {
            name: "hello_world",
            language: {
              code: "en_US"
            }
          }
        }),
      })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          console.error("WhatsApp Testing Error Details:", JSON.stringify(data));
        } else {
          console.log("WhatsApp Test Template Sent Successfully! Message ID:", data.messages[0].id);
        }
      })
      .catch(err => console.error("WhatsApp Network Error:", err));
    } else {
      console.warn("WhatsApp environment variables missing.");
    }

    // Respond immediately to the client
    return NextResponse.json({ message: "Lead process started" }, { status: 200 });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
