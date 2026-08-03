const path = require("path");
const session = require("express-session"); // For using sessions
const MongoStore = require("connect-mongo");
const cors = require("cors");
const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const geoip = require("geoip-lite");

const redisClient = require("./config/redis");
const getClinicSettings = require("./middleware/clinicMiddleware");

const authRoutes = require("./routes/auth");
const passport = require("./utils/passport"); // Import passport.js file
const mongoose = require("mongoose");
require("dotenv").config();
const { Resend } = require("resend");

const cookieParser = require("cookie-parser");

const clinicRoutes = require("./routes/clinicRoutes");
const DashboardRoutes = require("./routes/dashboardRoutes");
const SectionRoutes = require("./routes/sectionRoutes");

// Import user, patient, and appointment models
const User = require("./models/User");
const Patient = require("./models/Patient");
const Appointment = require("./models/Appointment");
const Article = require("./models/Article");
const Section = require("./models/Section");
const Visit = require("./models/Visit");

const app = express();
app.use(cors()); // Enable CORS for all requests

// Set the maximum request size to 50MB (you can change it as needed)
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// Serve translation files from the 'locales' folder
app.use("/locales", express.static(path.join(__dirname, "locales")));
const PORT = process.env.PORT || 8080;

// .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

// app.use(getClinicSettings);  // Use middleware to fetch clinic settings

// Link registration routes
app.use("/api/auth", authRoutes);

// For registering users via Google and Microsoft
// Configure sessions
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true
// }));
// app.use(passport.initialize());
// app.use(passport.session());

app.use(express.json()); // To ensure the body is read
app.use(express.urlencoded({ extended: true })); // To parse data in x-www-form-urlencoded format

app.use(cookieParser()); // ✅ Add `cookie-parser`

// ✅ Use `express-session` before `passport.initialize()`
// app.use(session({
//   secret: process.env.SESSION_SECRET,  // Replace with a strong secret key
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false } // Ensure `secure: false` during development
// }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecretKey",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }, // 1-day session
  }),
);

// app.use(session({
//   secret: process.env.SESSION_SECRET || 'defaultSecretKey',
//   resave: false,
//   saveUninitialized: true
// }));

// ✅ Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// To serve static files (CSS, JavaScript, etc.)
app.use(express.static("public"));

// Google login route settings
app.get(
  "/api/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

// Google callback route settings
app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    // Successful registration or login
    res.redirect("/"); // You can redirect the user to a specific page after success
  },
);

// Microsoft login route settings
app.get(
  "/api/auth/microsoft",
  passport.authenticate("microsoft", {
    scope: ["user.read", "mail.read"],
  }),
);

// Microsoft callback route settings
app.get(
  "/api/auth/microsoft/callback",
  passport.authenticate("microsoft", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    // Successful registration or login
    res.redirect("/profile"); // You can redirect the user to a specific page after success
  },
);

// Profile page
app.get("/", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  console.log("*********", res);
  res.json({
    fullName: req.user.fullName,
    email: req.user.email,
    registrationType: req.user.registrationType,
  });
});

// API to fetch all users
app.get("/getAllUsers", async (req, res) => {
  try {
    console.log("test1");
    const users = await User.find();
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "An error occurred while fetching users." });
  }
});

// API to fetch all patients
app.get("/getAllPatients", async (req, res) => {
  try {
    const patients = await Patient.find();
    if (patients.length === 0) {
      return res.status(404).json({ message: "No patients found." });
    }
    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching patients." });
  }
});

// API to fetch all appointments
app.get("/getAllAppointments", async (req, res) => {
  try {
    const appointments = await Appointment.find();

    // Always return the appointments array (empty or not)
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);

    res.status(500).json({
      error: "An error occurred while fetching appointments.",
    });
  }
});

// API to fetch appointments with status 'booked'
app.get("/getBookedAppointments", async (req, res) => {
  try {
    const appointments = await Appointment.find({ status: "booked" });

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No booked appointments found." });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching booked appointments:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching booked appointments." });
  }
});

// API to fetch available times for a specific date
app.get("/getAvailableTimes/:date", async (req, res) => {
  const { date } = req.params;

  try {
    const appointments = await Appointment.find({ date });
    const bookedTimes = appointments
      .filter((app) => app.status === "booked")
      .map((app) => app.time);

    const allTimes = [
      "05:00:00",
      "06:00:00",
      "07:00:00",
      "08:00:00",
      "09:00:00",
      "10:00:00",
      "11:00:00",
      "12:00:00",
      "13:00:00",
      "14:00:00",
      "15:00:00",
      "16:00:00",
      "17:00:00",
      "18:00:00",
      "19:00:00",
      "20:00:00",
      "21:00:00",
      "22:00:00",
    ];
    const availableTimes = allTimes.filter(
      (time) => !bookedTimes.includes(time),
    );

    res.status(200).json({ availableTimes });
  } catch (error) {
    console.error("Error fetching available times:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching available times." });
  }
});

// app.post("/addYearAppointments", async (req, res) => {
//   try {
//     const year = 2026;
//     const today = new Date(); // تاريخ اليوم
//     today.setUTCHours(0, 0, 0, 0); // إعادة ضبط الوقت إلى بداية اليوم

//     const endDate = new Date(`${year}-12-31T23:59:59Z`);

//     const appointments = []; // تخزين جميع المواعيد قبل إدخالها في MongoDB

//     for (
//       let date = new Date(today);
//       date <= endDate;
//       date.setDate(date.getDate() + 1)
//     ) {
//       for (let hour = 9; hour < 18; hour++) {
//         // من 9 صباحًا إلى 5:30 مساءً
//         for (let minute of [0, 30]) {
//           // كل نصف ساعة
//           const appointmentTime = new Date(date);
//           appointmentTime.setUTCHours(hour, minute, 0, 0); // ضبط التوقيت في UTC

//           // إنشاء كائن Appointment جديد
//           const appointment = new Appointment({
//             appointment_id: `${
//               appointmentTime.toISOString().split("T")[0]
//             }-${hour}:${minute === 0 ? "00" : "30"}`,
//             date: appointmentTime.toISOString().split("T")[0],
//             time: appointmentTime.toISOString().split("T")[1].split(".")[0],
//             status: "available",
//             patient_id: null,
//             doctor_id: "dr123",
//           });

//           appointments.push(appointment);
//         }
//       }
//     }

//     // إدخال جميع المواعيد إلى MongoDB دفعة واحدة
//     await Appointment.insertMany(appointments);

//     res.status(200).json({
//       message: `Appointments from ${
//         today.toISOString().split("T")[0]
//       } to 2025 added successfully!`,
//     });
//   } catch (error) {
//     console.error("Error adding appointments:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while adding appointments" });
//   }
// });
// API to generate appointment slots from today until the end of the current year
app.post("/addYearAppointments", async (req, res) => {
  try {
    console.log("******** VERSION 2 test - OPTIMIZED ROUTE LOADED ********");
    // Today's date (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Current year (dynamic)
    const currentYear = today.getUTCFullYear();

    // End of current year
    const endDate = new Date(`${currentYear}-12-31T23:59:59Z`);

    // Load all existing appointment IDs once
    const existingAppointments = await Appointment.find(
      {},
      { appointment_id: 1, _id: 0 },
    );

    // Convert IDs into a Set for fast lookup
    const existingIds = new Set(
      existingAppointments.map((appointment) => appointment.appointment_id),
    );

    const appointmentsToInsert = [];
    let skipped = 0;

    // Generate appointments
    for (
      let date = new Date(today);
      date <= endDate;
      date.setUTCDate(date.getUTCDate() + 1)
    ) {
      for (let hour = 9; hour < 18; hour++) {
        for (const minute of [0, 30]) {
          const appointmentTime = new Date(date);
          appointmentTime.setUTCHours(hour, minute, 0, 0);

          const dateString = appointmentTime.toISOString().split("T")[0];
          const timeString = appointmentTime
            .toISOString()
            .split("T")[1]
            .split(".")[0];

          const appointmentId = `${dateString}-${hour}:${
            minute === 0 ? "00" : "30"
          }`;

          // Skip duplicate appointments
          if (existingIds.has(appointmentId)) {
            skipped++;
            continue;
          }

          appointmentsToInsert.push({
            appointment_id: appointmentId,
            date: dateString,
            time: timeString,
            status: "available",
            patient_id: null,
            doctor_id: "dr123",
          });

          // Add to Set to prevent duplicates during this request
          existingIds.add(appointmentId);
        }
      }
    }

    // Insert only new appointments
    let insertedAppointments = [];

    if (appointmentsToInsert.length > 0) {
      insertedAppointments = await Appointment.insertMany(appointmentsToInsert);
    }

    // ===== Console the added appointments =====
    console.log("\n========== NEW APPOINTMENTS ADDED ==========\n");

    if (insertedAppointments.length > 0) {
      console.table(
        insertedAppointments.map((appointment) => ({
          AppointmentID: appointment.appointment_id,
          Date: appointment.date,
          Time: appointment.time,
          Status: appointment.status,
          Doctor: appointment.doctor_id,
        })),
      );
    } else {
      console.log(
        "No new appointments were added. All appointments already exist.",
      );
    }

    console.log("\n============================================\n");

    // Send response
    res.status(200).json({
      success: true,
      message: `${insertedAppointments.length} appointment(s) added successfully from ${
        today.toISOString().split("T")[0]
      } to ${endDate.toISOString().split("T")[0]}.`,
      startDate: today.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      added: insertedAppointments.length,
      skipped,
      totalExistingAppointments: existingIds.size,
      appointments: insertedAppointments,
    });
  } catch (error) {
    console.error("Error adding appointments:", error);

    res.status(500).json({
      success: false,
      error: "An error occurred while adding appointments.",
    });
  }
});

// // Request Consultation
// app.post('/addUser', async (req, res) => {
//   console.log("req.body", req.body);
//   const { fullName, email, phone, additionalInfo } = req.body;

//   if (!fullName || !email) {
//     return res.status(400).json({ error: 'Please provide all required fields1111.' });
//   }

//   try {
//     const user = new User({
//       fullName,
//       email,
//       phone,
//       additionalInfo: additionalInfo || '',
//       createdAt: new Date(),
//     });

//     await user.save();
//     res.status(200).json({ message: 'User added successfully!', userId: user._id });
//   } catch (error) {
//     console.error('Error adding user:', error);
//     res.status(500).json({ error: 'An error occurred while adding the user' });
//   }
// });

const nodemailer = require("nodemailer");

// Request Consultation
// const fetch = require("node-fetch"); // تأكد إنه موجود

// Request Consultation
// app.post("/addUser", async (req, res) => {
//   console.log("req.body", req.body);
//   const { fullName, email, phone, additionalInfo } = req.body;

//   if (!fullName || !email) {
//     return res
//       .status(400)
//       .json({ error: "Please provide all required fields." });
//   }

//   try {
//     // 1. حفظ البيانات في الداتابيس
//     const user = new User({
//       fullName,
//       email,
//       phone,
//       additionalInfo: additionalInfo || "",
//       createdAt: new Date(),
//     });

//     // await user.save();
//     const savedUser = await user.save();
//     console.log("User saved:", savedUser);
//     console.log("User ID:", savedUser._id);
//     // // 2. إعداد transporter مع Outlook
//     // const transporter = nodemailer.createTransport({
//     //   host: "smtp.office365.com",
//     //   port: 587,
//     //   secure: false, // لازم false مع port 587
//     //   auth: {
//     //     user: process.env.OUTLOOK_USER,
//     //     pass: process.env.OUTLOOK_PASS,
//     //   },
//     //   logger: true, // يطبع logs للـ console
//     //   debug: true, // يطبع تفاصيل SMTP
//     //   tls: {
//     //     ciphers: "SSLv3",
//     //     rejectUnauthorized: false, // جربي تشيليها لو السيرفر production
//     //   },
//     // });
//     // 2. إعداد transporter مع Gmail
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.GMAIL_USER, // إيميلك في Gmail
//         pass: process.env.GMAIL_APP_PASS, // App password من Google
//       },
//     });
//     // 3. إعداد الإيميل
//     const mailOptions = {
//       from: `"${fullName}" <${process.env.GMAIL_USER}>`, // مهم يكون نفس الحساب
//       replyTo: email, // الرد يروح لإيميل اليوزر
//       to: process.env.GMAIL_USER, // إيميلك الرسمي (المستلم)
//       subject: "🔔 استشارة جديدة من الموقع",
//       html: `
//         <h3>تفاصيل الطلب:</h3>
//         <p><b>الاسم:</b> ${fullName}</p>
//         <p><b>الإيميل:</b> ${email}</p>
//         <p><b>الهاتف:</b> ${phone || "-"}</p>
//         <p><b>معلومات إضافية:</b> ${additionalInfo || "-"}</p>
//         <p><i>تم الإرسال بتاريخ: ${new Date().toLocaleString()}</i></p>
//       `,
//     };

//     // 4. إرسال الإيميل
//     await transporter.sendMail(mailOptions);

//     res.status(200).json({
//       message: "User added successfully and email sent!" + savedUser,
//       userId: user._id,
//     });
//   } catch (error) {
//     console.error("❌ Error adding user or sending email:", error);
//     res.status(500).json({
//       error: "An error occurred while adding the user",
//       details: error.message, // 👈 أضف هذا مؤقتاً لمشاهدة السبب الحقيقي
//     });
//   }
// });

// Request Consultation ****
// app.post("/addUser", async (req, res) => {
//   console.log("req.body", req.body);
//   const {
//     fullName,
//     email,
//     phone,
//     additionalInfo,
//     "g-recaptcha-response": recaptchaResponse,
//   } = req.body;

//   // 1️⃣ تحقق من الحقول الأساسية
//   if (!fullName || !email) {
//     return res
//       .status(400)
//       .json({ error: "Please provide all required fields." });
//   }

//   // 2️⃣ تحقق من reCAPTCHA
//   if (!recaptchaResponse) {
//     return res
//       .status(400)
//       .json({ error: "Please complete the reCAPTCHA verification." });
//   }

//   try {
//     const secretKey = process.env.RECAPTCHA_SECRET_KEY; // المفتاح السري
//     const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

//     const recaptchaRes = await fetch(verifyUrl, { method: "POST" });
//     const recaptchaData = await recaptchaRes.json();

//     if (!recaptchaData.success) {
//       return res
//         .status(400)
//         .json({ error: "reCAPTCHA verification failed. Please try again." });
//     }

//     // 3️⃣ حفظ البيانات في الداتابيس
//     const user = new User({
//       fullName,
//       email,
//       phone,
//       additionalInfo: additionalInfo || "",
//       createdAt: new Date(),
//     });

//     await user.save();

//     // 2. إعداد transporter مع Gmail
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false, // TLS
//       auth: {
//         user: process.env.GMAIL_USER,
//         pass: process.env.GMAIL_APP_PASS,
//       },
//     });

//     try {
//       await transporter.verify();
//       console.log("✅ Server is ready to send emails");
//     } catch (err) {
//       console.error("❌ Email server verification failed:", err.message);
//       return res.status(500).json({
//         error: "Email server verification failed",
//         details: err.message,
//       });
//     }

//     // 3. إعداد الإيميل
//     const mailOptions = {
//       from: `"${fullName}" <${process.env.GMAIL_USER}>`, // مهم يكون نفس الحساب
//       replyTo: email, // الرد يروح لإيميل اليوزر
//       to: process.env.GMAIL_USER, // إيميلك الرسمي (المستلم)
//       subject: "🔔 استشارة جديدة من الموقع",
//       html: `
//         <h3>تفاصيل الطلب:</h3>
//         <p><b>الاسم:</b> ${fullName}</p>
//         <p><b>الإيميل:</b> ${email}</p>
//         <p><b>الهاتف:</b> ${phone || "-"}</p>
//         <p><b>معلومات إضافية:</b> ${additionalInfo || "-"}</p>
//         <p><i>تم الإرسال بتاريخ: ${new Date().toLocaleString()}</i></p>
//       `,
//     };

//     // 6️⃣ إرسال الإيميل
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({
//       message: "User added successfully and email sent!",
//       userId: user._id,
//     });
//   } catch (error) {
//     console.error("❌ Error adding user or sending email:", error);
//     res.status(500).json({
//       error: "An error occurred while adding the user",
//       details: error.message,
//     });
//   }
// });

app.get("/test-email", async (req, res) => {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // for testing
      to: process.env.MY_GMAIL,
      subject: "Testing Resend",
      html: "<h1>Hello from Resend!</h1>",
    });

    console.log(response);

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// إعداد Resend API
const resend = new Resend(process.env.RESEND_API_KEY);
console.log(process.env.RESEND_API_KEY);
app.post("/addUser", async (req, res) => {
  const {
    fullName,
    email,
    phone,
    consultationType,
    // consultationReason,
    additionalInfo,
    // "g-recaptcha-response": recaptchaResponse,
  } = req.body;

  // Validate required fields
  if (!fullName || !email || !consultationType) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields." });
  }

  try {
    // Verify reCAPTCHA (optional while testing)
    // const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // if (secretKey && recaptchaResponse) {
    //   const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

    //   const recaptchaRes = await fetch(verifyUrl, {
    //     method: "POST",
    //   });

    //   const recaptchaData = await recaptchaRes.json();

    //   console.log("reCAPTCHA:", recaptchaData);

    //   // Uncomment for production
    //   /*
    //   if (!recaptchaData.success) {
    //     return res.status(400).json({
    //       error: "reCAPTCHA verification failed.",
    //     });
    //   }
    //   */
    // }

    // Save user to MongoDB
    const user = new User({
      fullName,
      email,
      phone,
      consultationType,
      // consultationReason,
      additionalInfo: additionalInfo || "",
      createdAt: new Date(),
    });

    await user.save();

    console.log("✅ User saved:", user._id);

    // Email HTML
    const htmlContent = `
      <h2>🩺 New Consultation Submitted</h2>

      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "-"}</p>
      <p><strong>Consultation Type:</strong> ${consultationType}</p>

      

      <p><strong>Additional Information:</strong></p>
      <p>${additionalInfo || "-"}</p>

      <hr>

      <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
    `;

    console.log("📧 Sending email...");

    const emailResponse = await resend.emails.send({
      from: "onboarding@resend.dev", // Testing sender
      to: process.env.MY_GMAIL,
      replyTo: email,
      subject: "🩺 New Consultation Submitted",
      html: htmlContent,
    });

    const clientEmailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirmación de solicitud</title>
</head>

<body style="margin:0;padding:0;background:#F4F7F8;font-family:Arial,Helvetica,sans-serif;">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F4F7F8;padding:40px 15px;">
<tr>
<td align="center">

<table role="presentation" width="650" cellspacing="0" cellpadding="0" style="max-width:650px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.08);">

<!-- HEADER -->
<tr>
<td align="center" style="background:linear-gradient(135deg,#2F6F63,#4C9084);padding:45px 30px;">

<img
src="https://YOUR-WEBSITE.COM/images/logo.png"
alt="ALMEZ"
width="90"
style="display:block;margin:0 auto 20px auto;">

<h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:bold;">
ALMEZ
</h1>

<p style="margin-top:12px;color:#E8F4F1;font-size:17px;">
Cirugía de Columna · Traumatología · Rehabilitación
</p>

</td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:45px;">

<h2 style="margin-top:0;color:#2F6F63;font-size:28px;">
Estimado/a ${fullName},
</h2>

<p style="font-size:17px;line-height:1.8;color:#444;">
Gracias por confiar en <strong>ALMEZ</strong>.
</p>

<p style="font-size:17px;line-height:1.8;color:#444;">
Le confirmamos que hemos recibido correctamente su solicitud de consulta.
Nuestro equipo médico revisará la información facilitada y se pondrá en contacto con usted a la mayor brevedad posible.
</p>

<!-- SUMMARY -->
<table width="100%" cellspacing="0" cellpadding="12" style="margin-top:35px;border:1px solid #DCE8E5;border-radius:10px;background:#F8FBFA;">

<tr>
<td colspan="2" style="background:#EAF4F2;font-size:20px;font-weight:bold;color:#2F6F63;">
Resumen de su solicitud
</td>
</tr>

<tr>
<td width="38%"><strong>Nombre</strong></td>
<td>${fullName}</td>
</tr>

<tr>
<td><strong>Correo electrónico</strong></td>
<td>${email}</td>
</tr>

<tr>
<td><strong>Teléfono</strong></td>
<td>${phone || "-"}</td>
</tr>

<tr>
<td><strong>Tipo de consulta</strong></td>
<td>${consultationType}</td>
</tr>


${
  additionalInfo
    ? `
<tr>
<td><strong>Información adicional</strong></td>
<td>${additionalInfo}</td>
</tr>
`
    : ""
}

</table>

<!-- WHAT HAPPENS NEXT -->
<div style="margin-top:35px;padding:25px;background:#F7FAFC;border-left:5px solid #2F6F63;border-radius:8px;">

<h3 style="margin-top:0;color:#2F6F63;">
¿Qué ocurrirá ahora?
</h3>

<p style="margin-bottom:15px;line-height:1.8;color:#444;">
✅ Revisaremos cuidadosamente la información enviada.
</p>

<p style="margin-bottom:15px;line-height:1.8;color:#444;">
✅ Si fuese necesario, contactaremos con usted para solicitar información adicional.
</p>

<p style="margin-bottom:0;line-height:1.8;color:#444;">
✅ Le responderemos lo antes posible para orientarle sobre los siguientes pasos o concertar una consulta.
</p>

</div>

<!-- IMPORTANT -->
<div style="margin-top:30px;padding:20px;background:#FFF9E8;border-left:5px solid #D8B44C;border-radius:8px;">

<h3 style="margin-top:0;color:#8A6A0A;">
Información importante
</h3>

<p style="margin-bottom:0;line-height:1.8;color:#555;">
Este correo electrónico confirma únicamente la recepción de su solicitud y no constituye una cita médica.
</p>

</div>

<!-- BUTTON -->
<div style="text-align:center;margin-top:40px;">

<a
href="https://YOUR-WEBSITE.COM"
style="
display:inline-block;
padding:15px 34px;
background:#2F6F63;
color:#ffffff;
text-decoration:none;
font-size:17px;
font-weight:bold;
border-radius:8px;
">

Visitar nuestra página web

</a>

</div>

<!-- CONTACT -->
<div style="margin-top:45px;padding-top:30px;border-top:1px solid #E5E5E5;">

<h3 style="color:#2F6F63;">
¿Necesita ayuda?
</h3>

<p style="line-height:2;color:#555;">

📍 Dirección de la clínica<br>

📞 +34 XXX XXX XXX<br>

✉ info@clinicaespaldasana.com<br>

🌐 www.clinicaespaldasana.com

</p>

</div>

<!-- THANK YOU -->
<p style="margin-top:35px;font-size:17px;line-height:1.8;color:#444;">

Gracias nuevamente por confiar en nosotros.

Esperamos poder ayudarle a recuperar su salud y mejorar su calidad de vida.

</p>

<p style="margin-top:35px;font-size:17px;line-height:1.8;">

Reciba un cordial saludo.

<br><br>

<strong>Equipo Médico</strong><br>

<span style="color:#2F6F63;font-weight:bold;">
ALMEZ
</span>

</p>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td align="center" style="background:#F7F7F7;padding:35px 25px;">

<p style="margin:0;font-size:15px;color:#666;font-weight:bold;">
ALMEZ
</p>

<p style="margin-top:10px;color:#888;font-size:13px;line-height:1.8;">

Este mensaje ha sido enviado automáticamente tras recibir su solicitud de consulta.

Si necesita realizar alguna modificación o aportar información adicional, puede ponerse en contacto con nosotros utilizando los datos indicados anteriormente.

</p>

<p style="margin-top:25px;font-size:12px;color:#999;line-height:1.8;">

La información contenida en este correo será tratada de forma confidencial y de acuerdo con la normativa vigente en materia de protección de datos (RGPD).

</p>

<p style="margin-top:25px;font-size:12px;color:#999;">

© ${new Date().getFullYear()} ALMEZ.
Todos los derechos reservados.

</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
    console.log("##################", email);
    const clientEmailResponse = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: process.env.MY_GMAIL, //email, // Send to the patient
      subject: "We have received your consultation request",
      html: clientEmailHtml,
    });
    console.log("Client email sent:", clientEmailResponse);

    console.log("✅ Email Response:");
    console.log(emailResponse);

    console.log("Client Email Response:");
    console.log(clientEmailResponse);

    res.status(200).json({
      success: true,
      message: "User added and email sent successfully.",
      userId: user._id,
      emailResponse,
      clientEmailResponse,
    });
  } catch (error) {
    console.error("Client email error:");
    console.error("❌ Error:");
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// // API to book an appointment
// app.post('/bookAppointment', async (req, res) => {
//   const { patient_name, phone_number, email, identity_number, appointment_date, appointment_time, appointment_reason, preferred_doctor, additional_notes, has_insurance, insurance_company, insurance_policy_number, agree_to_terms, reminder_method } = req.body;

//   if (!patient_name || !phone_number || !email || !identity_number || !appointment_date || !appointment_time || !appointment_reason || !agree_to_terms || !reminder_method) {
//     return res.status(400).json({ error: 'Please provide all required fields.' });
//   }

//   try {
//     const appointment = await Appointment.findOne({ date: appointment_date, time: appointment_time });

//     if (!appointment) {
//       return res.status(404).json({ error: 'Appointment not found or already booked.' });
//     }

//     if (appointment.status === 'booked') {
//       return res.status(400).json({ error: 'Appointment not available as it is already booked.' });
//     }

//     const patient = new Patient({
//       patient_name,
//       phone_number,
//       email,
//       identity_number,
//       appointment_date,
//       appointment_time,
//       appointment_reason,
//       preferred_doctor: preferred_doctor || 'Not specified',
//       additional_notes: additional_notes || '',
//       has_insurance: has_insurance || false,
//       insurance_company: has_insurance ? insurance_company : null,
//       insurance_policy_number: has_insurance ? insurance_policy_number : null,
//       agree_to_terms,
//       reminder_method,
//       appointment_id: appointment._id,
//       booked_at: new Date(),
//     });

//     await patient.save();
//     appointment.status = 'booked';
//     appointment.patient_id = patient._id;
//     await appointment.save();

//     res.status(200).json({ message: "Appointment booked successfully for " + appointment_date, appointmentId: appointment._id, patientId: patient._id });
//   } catch (error) {
//     console.error('Error booking appointment:', error);
//     res.status(500).json({ error: 'An error occurred while booking the appointment.' });
//   }
// });

// app.post('/bookAppointment', async (req, res) => {
//   const { patient_name, phone_number, email, identity_number, appointment_date, appointment_time, appointment_reason, preferred_doctor, additional_notes, has_insurance, insurance_company, insurance_policy_number, agree_to_terms, reminder_method } = req.body;

//   if (!patient_name || !phone_number || !email || !identity_number || !appointment_date || !appointment_time || !appointment_reason || !agree_to_terms || !reminder_method) {
//     return res.status(400).json({ error: 'Please provide all required fields.' });
//   }

//   try {
//     const appointment = await Appointment.findOne({ date: appointment_date, time: appointment_time });

//     if (!appointment) {
//       return res.status(404).json({ error: 'Appointment not found or already booked.' });
//     }

//     if (appointment.status === 'booked') {
//       return res.status(400).json({ error: 'Appointment not available as it is already booked.' });
//     }

//     const patient = new Patient({
//       patient_name,
//       phone_number,
//       email,
//       identity_number,
//       appointment_date,
//       appointment_time,
//       appointment_reason,
//       preferred_doctor: preferred_doctor || 'Not specified',
//       additional_notes: additional_notes || '',
//       has_insurance: has_insurance || false,
//       insurance_company: has_insurance ? insurance_company : null,
//       insurance_policy_number: has_insurance ? insurance_policy_number : null,
//       agree_to_terms,
//       reminder_method,
//       appointment_id: appointment._id,
//       booked_at: new Date(),
//     });

//     await patient.save();

//     appointment.status = 'booked';
//     appointment.patient_id = patient._id;
//     await appointment.save();

//     // Populate the patient details into the response
//     const populatedAppointment = await Appointment.findById(appointment._id).populate('patient_id', 'patient_name');

//     res.status(200).json({
//       message: "Appointment booked successfully for " + appointment_date,
//       appointmentId: appointment._id,
//       patientId: patient._id,
//       patientName: populatedAppointment.patient_id ? populatedAppointment.patient_id.patient_name : 'N/A'
//     });
//   } catch (error) {
//     console.error('Error booking appointment:', error);
//     res.status(500).json({ error: 'An error occurred while booking the appointment.' });
//   }
// });
app.post("/bookAppointment", async (req, res) => {
  const {
    patient_name,
    phone_number,
    email,
    identity_number,
    appointment_date,
    appointment_time,
    appointment_reason,
    preferred_doctor,
    additional_notes,
    has_insurance,
    insurance_company,
    insurance_policy_number,
    agree_to_terms,
    reminder_method,
  } = req.body;

  if (
    !patient_name ||
    !phone_number ||
    !email ||
    !appointment_date ||
    !appointment_time ||
    !appointment_reason ||
    !agree_to_terms
  ) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields." });
  }

  try {
    const appointment = await Appointment.findOne({
      date: appointment_date,
      time: appointment_time,
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ error: "Appointment not found or already booked." });
    }

    if (appointment.status === "booked") {
      return res
        .status(400)
        .json({ error: "Appointment not available as it is already booked." });
    }

    const patient = new Patient({
      patient_name,
      phone_number,
      email,
      identity_number,
      appointment_date,
      appointment_time,
      appointment_reason,
      preferred_doctor: preferred_doctor || "Not specified",
      additional_notes: additional_notes || "",
      has_insurance: has_insurance || false,
      insurance_company: has_insurance ? insurance_company : null,
      insurance_policy_number: has_insurance ? insurance_policy_number : null,
      agree_to_terms,
      reminder_method,
      appointment_id: appointment._id,
      booked_at: new Date(),
    });

    await patient.save(); // Ensure the patient is saved

    // Now update the appointment with the patient's ID
    appointment.status = "booked";
    appointment.patient_id = patient._id; // Assign the patient's ID to the appointment
    await appointment.save(); // Save the updated appointment

    // Populate the patient details into the response
    const populatedAppointment = await Appointment.findById(
      appointment._id,
    ).populate("patient_id", "patient_name");

    res.status(200).json({
      message: "Appointment booked successfully for " + appointment_date,
      appointmentId: appointment._id,
      patientId: patient._id,
      patientName: populatedAppointment.patient_id
        ? populatedAppointment.patient_id.patient_name
        : "N/A",
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res
      .status(500)
      .json({ error: "An error occurred while booking the appointment." });
  }
});

// API to add a new article
app.post("/addArticle", async (req, res) => {
  const {
    title,
    content,
    images,
    videos,
    keywords,
    sources,
    author,
    category,
    summary,
    tags,
    comments_enabled,
    status,
  } = req.body;

  if (!title || !content || !author || !category || !summary) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields." });
  }

  try {
    const article = new Article({
      title,
      content,
      images: images || [],
      videos: videos || [],
      keywords: keywords || [],
      sources: sources || [],
      author,
      category,
      summary,
      tags: tags || [],
      comments_enabled: comments_enabled || false,
      status: status || "Draft",
      created_at: new Date(),
      updated_at: new Date(),
    });

    await article.save();
    res
      .status(200)
      .json({ message: "Article added successfully!", articleId: article._id });
  } catch (error) {
    console.error("Error adding article:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the article." });
  }
});

// API to fetch all articles
app.get("/getAllArticles", async (req, res) => {
  try {
    const articles = await Article.find();
    if (articles.length === 0) {
      return res.status(404).json({ message: "No articles found." });
    }
    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching articles." });
  }
});

// SERVICES
// Fetch all sections
app.get("/sections", async (req, res) => {
  try {
    //const { lang } = req.query; // Get the language from query parameters
    const { lang } = "en"; // Get the language from query parameters

    const sections = await Section.find(); // Fetch all sections from the database

    if (sections.length === 0)
      return res.status(404).json({ message: "No sections found" });

    // If no language is specified, send all data as is
    if (!lang) return res.json(sections);

    // Prepare data according to the specified language
    const localizedSections = sections.map((section) => ({
      sectionId: section.sectionId,
      title: section.title[lang] || section.title["en"],
      description: section.description[lang] || section.description["en"],
      imageUrl: section.imageUrl,
      categories: section.categories.map((category) => ({
        categoryId: category.categoryId,
        title: category.title[lang] || category.title["en"],
        description: category.description[lang] || category.description["en"],
        imageUrl: category.imageUrl,
        subcategories: category.subcategories.map((sub) => ({
          subcategoryId: sub.subcategoryId,
          title: sub.title[lang] || sub.title["en"],
          description: sub.description[lang] || sub.description["en"],
          imageUrl: sub.imageUrl,
          content: sub.content[lang] || sub.content["en"],
        })),
      })),
    }));

    res.json(localizedSections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to retrieve section data
app.get("/section/:id", async (req, res) => {
  try {
    const { lang } = req.query;
    const section = await Section.findOne({ sectionId: req.params.id });

    if (!section) return res.status(404).json({ message: "Section not found" });

    if (!lang) return res.json(section);

    const localizedSection = {
      sectionId: section.sectionId,
      title: section.title[lang] || section.title["en"],
      description: section.description[lang] || section.description["en"],
      imageUrl: section.imageUrl,
      categories: section.categories.map((category) => ({
        categoryId: category.categoryId,
        title: category.title[lang] || category.title["en"],
        description: category.description[lang] || category.description["en"],
        imageUrl: category.imageUrl,
        subcategories: category.subcategories.map((sub) => ({
          subcategoryId: sub.subcategoryId,
          title: sub.title[lang] || sub.title["en"],
          description: sub.description[lang] || sub.description["en"],
          imageUrl: sub.imageUrl,
          content: sub.content[lang] || sub.content["en"],
        })),
      })),
    };

    res.json(localizedSection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch categories for a specific section
app.get("/section/:sectionId/categories", async (req, res) => {
  try {
    console.log("req.params.sectionId", req.params.sectionId);
    const section = await Section.findOne({ sectionId: req.params.sectionId });
    if (!section) return res.status(404).json({ error: "Section not found" });
    res.json(section.categories);
  } catch (err) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching categories" });
  }
});

// Fetch subcategories for a specific category
app.get(
  "/section/:sectionId/category/:categoryId/subcategories",
  async (req, res) => {
    try {
      console.log("req.params.sectionId:", req.params.sectionId);

      // Find the section using ObjectId
      const section = await Section.findOne({
        sectionId: new mongoose.Types.ObjectId(req.params.sectionId),
      });
      console.log("Section Found:", section);

      if (!section) return res.status(404).json({ error: "Section not found" });

      // Find the category using ObjectId
      const category = section.categories.find(
        (cat) => cat.categoryId.toString() === req.params.categoryId,
      );
      console.log("Category Found:", category);

      if (!category)
        return res.status(404).json({ error: "Category not found" });

      // Return subcategories
      res.json(category.subcategories);
    } catch (err) {
      console.error("Error:", err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching subcategories" });
    }
  },
);

app.get(
  "/section/:sectionId/category/:categoryId/subcategory/:subcategoryId",
  async (req, res) => {
    try {
      const { sectionId, categoryId, subcategoryId } = req.params;

      // Find the section using sectionId
      const section = await Section.findOne({ sectionId });
      if (!section) return res.status(404).json({ error: "Section not found" });

      // Find the category using categoryId
      const category = section.categories.find(
        (cat) => cat.categoryId.toString() === categoryId,
      );
      if (!category)
        return res.status(404).json({ error: "Category not found" });

      // Find the subcategory using subcategoryId
      const subcategory = category.subcategories.find(
        (sub) => sub.subcategoryId.toString() === subcategoryId,
      );
      if (!subcategory)
        return res.status(404).json({ error: "Subcategory not found" });

      // Return subcategory data
      res.json(subcategory);
    } catch (err) {
      res
        .status(500)
        .json({ error: "An error occurred while fetching the subcategory" });
    }
  },
);

//COOKIES
// app.post("/api/track-visit", async (req, res) => {
//   console.log("##################COOKIES");
//   const { visitorId, language, page, eventType, duration } = req.body;

//   if (!visitorId) return res.status(400).json({ message: "Missing visitorId" });

//   await Visit.create({ visitorId, language, page, eventType, duration });
//   res.json({ success: true });
// });

app.post("/api/track-visit", async (req, res) => {
  console.log("##################COOKIES");
  const { visitorId, language, page, eventType, duration } = req.body;

  if (!visitorId) return res.status(400).json({ message: "Missing visitorId" });

  // 1️⃣ جلب IP الزائر
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // 2️⃣ الحصول على الدولة
  const geo = geoip.lookup(ip);
  const country = geo ? geo.country : "Unknown";

  // 3️⃣ حفظ البيانات في MongoDB
  await Visit.create({
    visitorId,
    language,
    page,
    eventType,
    duration,
    country,
  });

  res.json({ success: true, country });
});

// 📌 Use the routes
app.use("/api", clinicRoutes);
app.use("/dashboard", DashboardRoutes);
app.use("/newsection", SectionRoutes);
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at: http://localhost:${PORT}`);
});
