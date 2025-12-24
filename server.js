// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

/* 🔴 PAUSE SWITCH (ADD THIS BLOCK) */
if (process.env.SERVICE_PAUSED === 'true') {
  app.use((req, res) => {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily paused'
    });
  });
}
/* 🔴 PAUSE SWITCH END */
app.get('/', (req, res) => {
  res.send('✅ Resend Email API is running');
});

app.post('/send-email', async (req, res) => {
  const { to, subject, html } = req.body;

  try {
    const response = await axios.post(
      'https://api.resend.com/emails',
      {
        from: 'Support <support@kitecab.com>', // ✅ Verified sender
        to,
        subject,
        html
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.status(200).json({ message: 'Email sent successfully', result: response.data });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
