const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const app = express();
app.use(express.json());

// إنشاء عميل WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(), // استخدام المصادقة المحلية
  puppeteer: { headless: true } // تشغيل المتصفح في الوضع الخفي
});

let qrCodeData = ''; // لتخزين رمز QR

// حدث عند إنشاء رمز QR
client.on('qr', async (qr) => {
  // تحويل رمز QR إلى صورة base64
  qrCodeData = await qrcode.toDataURL(qr);
  console.log('QR code generated!');
});

// حدث عند اكتمال الاتصال وجاهزية العميل
client.on('ready', () => {
  console.log('Client is ready!');
});

// إرجاع رمز QR كـ صورة
app.get('/get-qr', (req, res) => {
  if (qrCodeData) {
    res.send(`
      <html>
        <body style="text-align: center; margin-top: 50px;">
          <h1>WhatsApp QR Code</h1>
          <img src="${qrCodeData}" alt="QR Code" style="width: 300px; height: 300px;" />
          <p>Scan the QR code to connect.</p>
        </body>
      </html>
    `);
  } else {
    res.status(404).send('QR code not available yet.'); // إرسال رسالة خطأ إذا لم يتم إنشاء رمز QR بعد
  }
});

// إرسال رسالة إلى أرقام متعددة
app.post('/send-messages', async (req, res) => {
  const { numbers, message } = req.body;
  
  for (const number of numbers) {
    const chatId = `${number}@c.us`; // تحويل الرقم إلى معرف دردشة
    await client.sendMessage(chatId, message); // إرسال الرسالة
  }

  res.send('Messages sent!'); // إرسال رد بنجاح العملية
});

// إنشاء مجموعة
app.post('/create-group', async (req, res) => {
  const { groupName, participants } = req.body;
  
  // إنشاء المجموعة
  const group = await client.createGroup(groupName, participants);
  res.send(`Group created: ${group.gid._serialized}`); // إرسال معرف المجموعة
});

// إرسال رسالة إلى مجموعة
app.post('/send-group-message', async (req, res) => {
  const { groupID, message } = req.body;

  try {
    // التأكد من أن معرف المجموعة ينتهي بـ @g.us
    const chatId = groupID.endsWith('@g.us') ? groupID : `${groupID}@g.us`;

    // إرسال الرسالة إلى المجموعة
    await client.sendMessage(chatId, message);
    res.send('Message sent to the group!'); // إرسال رد بنجاح العملية
  } catch (error) {
    res.status(500).send('Failed to send message: ' + error.message); // إرسال رسالة خطأ في حالة فشل العملية
  }
});

// بدء تشغيل العميل والخادم
client.initialize();
app.listen(8080, () => console.log('Server running on port 8080'));