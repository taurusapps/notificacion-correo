require('dotenv').config();
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Misma expresión regular que en el formulario (la validación del servidor es la que cuenta)
const REGEX_CORREO = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// Cliente SMTP de GoDaddy
const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER, // tu cuenta de correo de GoDaddy
    pass: process.env.SMTP_PASS
  }
});

app.post('/api/notificar', async (req, res) => {
  const { nombre, apellido, correo } = req.body || {};

  if (![nombre, apellido, correo].every(v => typeof v === 'string' && v.trim())) {
    return res.status(400).json({ mensaje: 'Nombre, apellido y correo son obligatorios.' });
  }
  if (!REGEX_CORREO.test(correo.trim())) {
    return res.status(400).json({ mensaje: 'El correo electrónico no es válido.' });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: correo.trim(),
      subject: 'Notificación',
      text: 'Hola,'
    });
    res.json({ mensaje: `Notificación enviada a ${correo.trim()}.` });
  } catch (err) {
    console.error('Error SMTP:', err.message);
    res.status(500).json({ mensaje: 'No se pudo enviar el correo. Revisa la configuración SMTP.' });
  }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => console.log(`Servidor en http://localhost:${PUERTO}`));
