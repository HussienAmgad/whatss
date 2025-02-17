const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const chromium = require('@sparticuz/chrome-aws-lambda');
const WebSocket = require('ws');

const app = express();
app.use(express.json());

const wss = new WebSocket.Server({ noServer: true });

const setupChromium = async () => {
  return await chromium.executablePath;
};

(async () => {

  const executablePath = await chromium.executablePath;

  // إنشاء عميل WhatsApp
  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      executablePath: executablePath || undefined,
      args: chromium.args,
    }
  });

  let qrCodeData = ''; // لتخزين رمز QR

  // حدث عند إنشاء رمز QR
  client.on('qr', async qr => {
    qrCodeData = await qrcode.toDataURL(qr); // تحويل QR إلى صورة Base64
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'qr', data: qrCodeData })); // إرسال الصورة بدلاً من النص
      }
    });
  });
  

  // حدث عند اكتمال الاتصال وجاهزية العميل
  client.on('ready', () => {
    
    console.log('Client is ready!');
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'ready', data: 'Client is ready!' }));
      }
    });
  });

  client.initialize();

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
      res.status(404).send('QR code not available yet.');
    }
  });
  


  // إرسال رسالة إلى أرقام متعددة
  app.post('/send-messages', async (req, res) => {
    const { numbers, message } = req.body;

    for (const number of numbers) {
      const chatId = `${number}@c.us`; // تحويل الرقم إلى معرف دردشة
      await client.sendMessage(chatId, message);
    }

    res.send('Messages sent!');
  });

  // إنشاء مجموعة
  app.post('/create-group', async (req, res) => {
    const { groupName, participants } = req.body;

    try {
      const group = await client.createGroup(groupName, participants);
      res.send(`Group created: ${group.gid._serialized}`);
    } catch (error) {
      res.status(500).send('Failed to create group: ' + error.message);
    }
  });

  // إرسال رسالة إلى مجموعة
  app.post('/send-group-message', async (req, res) => {
    const { groupID, message } = req.body;

    try {
      const chatId = groupID.endsWith('@g.us') ? groupID : `${groupID}@g.us`;
      await client.sendMessage(chatId, message);
      res.send('Message sent to the group!');
    } catch (error) {
      res.status(500).send('Failed to send message: ' + error.message);
    }
  });

  // تشغيل السيرفر
  const server = app.listen(8080, () => console.log('Server running on port 8080'));

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, ws => {
      wss.emit('connection', ws, request);
    });
  });

})();
