const otpTemplate = (otp) => {
  return `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <title>Email Verification</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f5f7fb;
      font-family: Arial, Helvetica, sans-serif;
      color: #333;
    }

    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }

    .header {
      background: #0d6efd;
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }

    .header h1 {
      margin: 0;
      font-size: 28px;
    }

    .content {
      padding: 30px;
    }

    .content p {
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .otp-box {
      background: #f1f5ff;
      border: 2px dashed #0d6efd;
      text-align: center;
      padding: 18px;
      margin: 25px 0;
      border-radius: 8px;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 6px;
      color: #0d6efd;
    }

    .warning {
      color: #dc3545;
      font-size: 14px;
    }

    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #666;
    }

    .footer a {
      color: #0d6efd;
      text-decoration: none;
    }
  </style>
</head>

<body>

  <div class="container">

    <div class="header">
      <h1>Tender247</h1>
      <p>Tender Discovery & Procurement Platform</p>
    </div>

    <div class="content">

      <p>Hello,</p>

      <p>
        Thank you for registering on Tender247.
        Please use the following One-Time Password (OTP)
        to verify your email address and complete your registration.
      </p>

      <div class="otp-box">
        ${otp}
      </div>

      <p>
        This OTP is valid for <strong>5 minutes</strong>.
      </p>

      <p class="warning">
        If you did not request this OTP, please ignore this email.
      </p>

    </div>

    <div class="footer">
      <p>
        Need help?
        Contact us at
        <a href="mailto:support@tender247.com">
          support@tender247.com
        </a>
      </p>

      <p>
        © ${new Date().getFullYear()} Tender247.
        All Rights Reserved.
      </p>
    </div>

  </div>

</body>

</html>
`;
};

module.exports = otpTemplate;
