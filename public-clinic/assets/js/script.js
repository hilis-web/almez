// // جلب جميع المواعيد من السيرفر
// async function fetchAppointments() {
//     try {
//         const response = await fetch(`${API_BASE_URL}/getAllAppointments`);
//         if (!response.ok) throw new Error("Failed to fetch appointments.");

//         const appointments = await response.json();
//         return appointments;
//     } catch (error) {
//         console.error("Error fetching appointments:", error);
//         return [];
//     }
// }

// // تحديث خيارات الوقت والتاريخ في الفورم
// async function updateCalendar() {
//     const today = new Date();
//     const appointmentDateInput = document.querySelector('#appointmentDate');
//     const appointmentTimeInput = document.querySelector('#appointmentTime');

//     // جلب جميع المواعيد من السيرفر
//     const appointments = await fetchAppointments();

//     // تعطيل الأيام السابقة
//     appointmentDateInput.addEventListener('change', () => {
//         const selectedDate = new Date(appointmentDateInput.value);
//         const availableTimes = [];

//         // تصفية المواعيد بناءً على التاريخ المختار
//         appointments.forEach(appointment => {
//             const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
//             if (appointment.date === appointmentDateInput.value && appointment.status !== 'booked') {
//                 if (appointmentDate > today) {
//                     availableTimes.push(appointment.time);
//                 }
//             }
//         });

//         // تحديث خيارات الوقت
//         appointmentTimeInput.innerHTML = ''; // مسح الخيارات السابقة
//         if (availableTimes.length > 0) {
//             availableTimes.forEach(time => {
//                 const option = document.createElement('option');
//                 option.value = time;
//                 option.textContent = time;
//                 appointmentTimeInput.appendChild(option);
//             });
//             appointmentTimeInput.disabled = false;
//         } else {
//             const option = document.createElement('option');
//             option.textContent = 'لا توجد أوقات متاحة';
//             appointmentTimeInput.appendChild(option);
//             appointmentTimeInput.disabled = true;
//         }
//     });

//     // تعطيل التواريخ التي ليس لها مواعيد متاحة أو قبل اليوم الحالي
//     const minDate = today.toISOString().split('T')[0]; // الحد الأدنى للتاريخ
//     appointmentDateInput.min = minDate;

//     const disabledDates = appointments
//         .filter(appointment => appointment.status === 'booked' || new Date(appointment.date) < today)
//         .map(appointment => appointment.date);

//     appointmentDateInput.addEventListener('input', () => {
//         const selectedDate = appointmentDateInput.value;
//         if (disabledDates.includes(selectedDate)) {
//             appointmentDateInput.setCustomValidity('هذا التاريخ غير متاح.');
//         } else {
//             appointmentDateInput.setCustomValidity('');
//         }
//     });
// }

// // استدعاء تحديث الرزنامة عند تحميل الصفحة
// document.addEventListener('DOMContentLoaded', () => {
//     updateCalendar();

// });

// async function fetchAppointments() {
//     try {
//         const response = await fetch(`${API_BASE_URL}/getAllAppointments`);
//         if (!response.ok) throw new Error("Failed to fetch appointments.");

//         const appointments = await response.json();

//         // طباعة البيانات المسترجعة للتحقق من تنسيقها
//         // console.log("Appointments:", appointments);

//         // التحقق من أن المواعيد تحتوي على تاريخ ووقت صحيحين
//         const validAppointments = appointments.filter(appointment => {
//             return appointment.date && appointment.time;
//         });

//         return validAppointments;
//     } catch (error) {
//         console.error("Error fetching appointments:", error);
//         return [];
//     }
// }

// async function updateCalendar() {
//     const today = new Date();
//     const appointmentDateInput = document.querySelector('#appointmentDate');
//     const appointmentTimeInput = document.querySelector('#appointmentTime');

//     // Fetch all appointments from the server
//     const appointments = await fetchAppointments();

//     // Disable previous days
//     appointmentDateInput.addEventListener('change', () => {
//         const selectedDate = new Date(appointmentDateInput.value);
//         const availableTimes = [];

//         // Filter appointments based on the selected date
//         appointments.forEach(appointment => {
//             const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
//             // Ensure the appointment matches the selected day and is not booked
//             if (appointment.date === appointmentDateInput.value && appointment.status !== 'booked') {
//                 availableTimes.push(appointment.time);
//             }
//         });

//        // Update time options
//         appointmentTimeInput.innerHTML = '';// Clear previous options
//         if (availableTimes.length > 0) {
//             availableTimes.forEach(time => {
//                 const option = document.createElement('option');
//                 option.value = time;
//                 option.textContent = time;
//                 appointmentTimeInput.appendChild(option);
//             });
//             appointmentTimeInput.disabled = false;
//         } else {
//             const option = document.createElement('option');
//             option.textContent = 'No available times';
//             appointmentTimeInput.appendChild(option);
//             appointmentTimeInput.disabled = true;
//         }
//     });

//     // Disable dates that have no available appointments or are before today
//     const minDate = today.toISOString().split('T')[0]; // Minimum date
//     appointmentDateInput.min = minDate;

//     const disabledDates = appointments
//         .filter(appointment => appointment.status === 'booked' || new Date(appointment.date) < today)
//         .map(appointment => appointment.date);

//     appointmentDateInput.addEventListener('input', () => {
//         const selectedDate = appointmentDateInput.value;
//         if (disabledDates.includes(selectedDate)) {
//             appointmentDateInput.setCustomValidity('هذا التاريخ غير متاح.');
//         } else {
//             appointmentDateInput.setCustomValidity('');
//         }
//     });
// }

// Call updateCalendar when the page loads
// document.addEventListener("DOMContentLoaded", () => {
//   updateCalendar();
// });

// Call updateCalendar when the page loads
// document.addEventListener("DOMContentLoaded", () => {
//   updateCalendar();
// });

function showModal(title, message, type = "success") {
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const modalIcon = document.getElementById("modalIcon");

  modalTitle.textContent = title;
  modalMessage.textContent = message;

  // أيقونة حسب نوع الرسالة
  if (type === "success") {
    modalIcon.innerHTML = "✅"; // أيقونة صح
    modalIcon.style.color = "green";
  } else {
    modalIcon.innerHTML = "❌"; // أيقونة خطأ
    modalIcon.style.color = "red";
  }

  // اظهار المودال
  const modalEl = document.getElementById("bookingModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

// Send appointment booking request
async function bookAppointment(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookAppointment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      showModal(
        "Success!",
        `The appointment has been successfully booked!`,
        "success",
      );

      //  showModal(
      //     'Success!',
      //     `The appointment has been successfully booked! Appointment ID: ${result.appointmentId}`,
      //     'success'
      // );
    } else {
      showModal("Error", `Error: ${result.error}`, "error");
    }
  } catch (error) {
    console.error("Error booking appointment:", error);
    showModal(
      "Error",
      "An error occurred while connecting to the server.",
      "error",
    );
  }
}

// Handle form submission
// document
//   .querySelector("#appointmentForm")
//   .addEventListener("submit", function (event) {
//     event.preventDefault();

//     const formData = {
//       patient_name: document.querySelector("#patientName").value,
//       phone_number: document.querySelector("#phoneNumber").value,
//       email: document.querySelector("#email").value,
//       appointment_date: document.querySelector("#appointmentDate").value,
//       appointment_time: document.querySelector("#appointmentTime").value,
//       appointment_reason: document.querySelector("#appointmentReason").value,
//       agree_to_terms: document.querySelector("#agreeToTerms").checked,
//       // appointment_id: 'ioqd638bJmJv0UGXcGY0'
//     };

//     bookAppointment(formData);
//   });

// // Handle consultation request submission
// async function submitConsultationForm(formData) {
//     alert("Form Data:"); // Log the form data for debugging
//     try {
//       // Send the request to the add user API
//       const response = await fetch(`${API_BASE_URL}/addUser`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       const result = await response.json();
//       if (response.ok) {
//         alert(`The consultation request has been successfully submitted! User ID: ${result.userId}`);

//       } else {
//         alert(`Error: ${result.error}`);
//       }
//     } catch (error) {
//         console.error('Error while sending the consultation request:', error);
//         alert('An error occurred while connecting to the server.');

//     }
//   }

//   // Handle consultation form submission
//   document.querySelector('#consultationForm').addEventListener('submit', function (event) {

//     alert("###Form Data:"); // Log the form data for debugging

//     event.preventDefault();

//     // جمع بيانات الفورم
//     const formData = {
//       fullName: document.querySelector('#consultationfullName').value,
//       email: document.querySelector('#consultationemail').value,
//       phone: document.querySelector('#consultationphone').value,
//       contactMethod: document.querySelector('#consultationcontactMethod').value,
//       consultationType: document.querySelector('#consultationconsultationType').value,
//       additionalInfo: document.querySelector('#consultationadditionalInfo').value,
//     };

//     // إرسال البيانات إلى السيرفر
//     submitConsultationForm(formData);
//   });
