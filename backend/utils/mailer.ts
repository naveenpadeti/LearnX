import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.titan.email',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    }
});

export async function sendWelcomeEmail({
                                           to,
                                           name,
                                           vyuha_id,
                                           password,
                                       }: {
    to: string;
    name: string;
    vyuha_id: string;
    password: string;
}) {
    const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6">
      <p>Dear ${name},</p>

      <p>Welcome to <strong>Vyuha LMS</strong> — your personalized learning portal!</p>

      <p>We’re excited to have you on board as part of the Vyuha community, where innovation meets learning.</p>

      <p>Here are your login credentials for accessing the Vyuha LMS:</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">
Vyuha ID   : ${vyuha_id}
Password   : ${password}
      </pre>

      <p><strong>Login Portal:</strong> <a href="https://www.vlearn.tech">www.vlearn.tech</a></p>

      <p>You can log in using your Vyuha ID and password. For your account’s security, we strongly recommend changing your password after the first login from your profile settings.</p>

      <h4>What's Coming Soon:</h4>
      <ul>
        <li>Courses on Web Development (Frontend & Backend)</li>
        <li>Artificial Intelligence & Machine Learning</li>
        <li>Blockchain and Web3</li>
        <li>System Design, DevOps, and more</li>
        <li>Real-world projects, Hackathons, and Innovation Challenges</li>
        <li>Certification and reward points for top performers</li>
      </ul>

      <p>Stay tuned — new content and opportunities will be added regularly by the Vyuha Tech Team.</p>

      <p>If you have any questions or need assistance, feel free to contact our support team.</p>

      <br/>

      <p>Best regards,<br/>
      Vyuha LMS Team<br/>
      Support Email: <a href="mailto:2300032870@kluniversity.in">2300032870@kluniversity.in</a><br/>
      Website: <a href="https://www.vlearn.tech">www.vlearn.tech</a></p>
    </div>
  `;

    await transporter.sendMail({
        from: `"Vyuha LMS Team" <${process.env.MAIL_USER}>`,
        to,
        subject: 'Welcome to Vyuha LMS 🎓',
        html: htmlBody,
    });
}