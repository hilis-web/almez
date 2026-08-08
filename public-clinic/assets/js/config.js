// URL الأساسي للسيرفر
const API_BASE_URL = "http://localhost:3000";
//const API_BASE_URL = "https://user-api-server.onrender.com";
//const API_BASE_URL = "https://aaron-clinic-1.onrender.com";

// Handle consultation request submission
async function submitConsultationForm(formData) {
  alert("Form Data:"); // Log the form data for debugging
  try {
    // Send the request to the add user API
    const response = await fetch(`${API_BASE_URL}/addUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (response.ok) {
      alert(
        `The consultation request has been successfully submitted! User ID: ${result.userId}`,
      );
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error("Error while sending the consultation request:", error);
    alert("An error occurred while connecting to the server.");
  }
}

$(document).ready(function () {
  $(".headerShared").load("/header.html");
  $(".navbarShared").load("/navbar.html", function () {
    $(".navbarShared").css({
      position: "sticky",
      top: "0",
      // "z-index": "30000",
      "min-height": "60px",
      background: "white",
    });
    runApp(); // تشغيل `app.js` بعد تحميل الهيدر
  });

  $(".consultationFormShared").load("consultation-form.html", function () {
    // الآن أضف event listener بعد تحميل الفورم
    const form = document.querySelector("#consultationForm");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        // الحصول على token من reCAPTCHA
        // const recaptchaResponse = grecaptcha.getResponse();
        // if (!recaptchaResponse) {
        //   alert("Please complete the reCAPTCHA verification.");
        //   return;
        // }

        const formData = {
          fullName: document.querySelector("#consultationfullName").value,
          email: document.querySelector("#consultationemail").value,
          phone: document.querySelector("#consultationphone").value,
          consultationType: document.querySelector("#consultationType").value,
          // consultationReason: document.querySelector("#consultationReason")
          //   .value,
          additionalInfo: document.querySelector("#consultationadditionalInfo")
            .value,
          // "g-recaptcha-response": recaptchaResponse, // إضافة token للفورم
        };

        submitConsultationForm(formData);
        // إعادة تعيين reCAPTCHA بعد الإرسال
        // grecaptcha.reset();
      });
    } else {
      console.error("Form not found after load.");
    }
  });

  $(".footerShared").load("/footer.html");

  // $("#sectionAbout").hide();
  // $("#sectionAppointment").hide();
  // $(".consultation-form").hide();
  // $("#Footer").hide();
  // $("#userNav").hide();
  // $("#sectionHero").hide();
  // $("#servicesSection").hide();
  // $(".btn-book-appointment").hide();

  const clinicDomain = "AaronClinic";
  // const clinicDomain = "user-api-server.onrender.com";

  //fetchClinicConfig(clinicDomain);
  initializeI18n();
  setupEventListeners();
});

function fetchClinicConfig(domain) {
  $.ajax({
    url: `${API_BASE_URL}/api/clinics/${domain}`,
    method: "GET",
    success: function (data) {
      updateClinicUI(data);
    },
    error: function (err) {
      console.error("Error fetching clinic data:", err);
      $("#clinicName").text("❌ Error loading clinic data");
    },
  });
}

function updateClinicUI(data) {
  console.log(data.theme.primaryColor);

  //CSS VARIABLES
  document.documentElement.style.setProperty(
    "--primary-font-family",
    data.theme.font ? data.theme.font : "Arial, sans-serif",
  );
  document.documentElement.style.setProperty(
    "--secondary-font-family",
    data.theme.secondaryFontFamily
      ? data.theme.secondaryFontFamily
      : "Arial, sans-serif",
  );
  document.documentElement.style.setProperty(
    "--primary-color",
    data.theme.primaryColor,
  );
  document.documentElement.style.setProperty(
    "--primary-font-color",
    data.theme.primaryFontColor,
  );
  document.documentElement.style.setProperty(
    "--secondary-color",
    data.theme.secondaryColor,
  );
  document.documentElement.style.setProperty(
    "--secondary-font-color",
    data.theme.secondaryFontColor,
  );

  $("body").css({
    "--primary-color": data.theme.primaryColor,
    "--secondary-color": data.theme.secondaryColor,
    "font-family": data.theme.font,
  });

  //TEXT
  $(".clinic-mobile").text(data.clinicInfo.mobile);
  $(".clinic-whatsapp").text(data.clinicInfo.whatsapp);
  $(".hospital-name").text(data.clinicInfo.hospitalName);
  $(".full-name-and-titles").text(data.clinicInfo.fullNameAndTitles);
  $(".specialty").text(data.clinicInfo.specialty);
  $(".job-title").text(data.clinicInfo.jobTitle);
  $(".additional-degree").text(data.clinicInfo.additionalDegree);
  $(".academic-position").text(data.clinicInfo.academicPosition);
  // $(".cinic-about").text(data.clinicInfo.about);
  $(".contact-telephone").text(data.clinicInfo.mobile);
  $(".clinic-email").text(data.clinicInfo.email);
  $(".clinic-copyright").text(data.clinicInfo.copyright);

  $(".clinic-facebook").attr("href", data.socialMedia.instagram);
  $(".clinic-instagram").attr("href", data.socialMedia.instagram);
  $(".clinic-twitter").attr("href", data.socialMedia.linkedin);

  //SRC
  $(".clinic-logo").attr("src", data.logo || "assets/images/defaultLogo.png");

  //HIDE AND SHOW
  // data.sections.aboutSection ? $("#sectionAbout").show() : $("#sectionAbout").hide();
  // data.sections.appointmentSection ? $("#sectionAppointement").show() : $("#sectionAppointement").hide();
  // data.sections.consultationForm ? $(".consultation-form").show() : $(".consultation-form").hide();
  // data.sections.footerSection ? $("#Footer").show() : $("#Footer").hide();
  // data.sections.login ? $("#userNav").show() : $("#userNav").hide();
  // data.sections.heroSection ? $("#sectionHero").show() : $("#sectionHero").hide();
  // data.sections.servicesSection ? $("#sectionSections").show() : $("#sectionSections").hide();
  // data.features.enableOnlineBooking ? $(".btn-book-appointment").show() : $(".btn-book-appointment").hide();

  updateLanguageDropdown(data.languageList);

  $("#features").html(`
        <li>Online Booking: ${
          data.features.enableOnlineBooking ? "✅ Enabled" : "❌ Disabled"
        }</li>
        <li>Chat Support: ${
          data.features.enableChat ? "✅ Enabled" : "❌ Disabled"
        }</li>
    `);
}

function updateLanguageDropdown(languages) {
  const dropdownMenu = $("#headerLanguage .dropdown-menu");
  dropdownMenu.empty();
  if (!languages || languages.length === 0) {
    dropdownMenu.append(
      '<li class="text-muted px-3">No languages available</li>',
    );
    return;
  }
  languages.forEach((lang) => {
    dropdownMenu.append(`
            <li>
                <a class="dropdown-item change-lang" href="#" data-lang="${lang.code}">
                    <i class="bi bi-flag-fill me-2"></i> ${lang.name}
                </a>
            </li>
        `);
  });
  const defaultLang = languages.find((lang) => lang.default) || languages[0];
  if (defaultLang) {
    $("#selectedLang")
      .text(defaultLang.name)
      .attr("data-lang", defaultLang.name);
  }
}

function initializeI18n() {
  i18next
    .use(i18nextHttpBackend)
    .use(i18nextBrowserLanguageDetector)
    .init(
      {
        lng: localStorage.getItem("selectedLang") || "es",
        fallbackLng: "es",
        debug: true,
        backend: { loadPath: `${API_BASE_URL}/locales/{{lng}}.json` },
      },
      function (err, t) {
        if (err) return console.error("i18next error:", err);
        updateContent();
        updateLanguageButton(i18next.language);
      },
    );
}

function updateContent() {
  $("[data-i18n]").each(function () {
    let key = $(this).attr("data-i18n");
    $(this).text(i18next.t(key));
  });
}

function updateLanguageButton(selectedLang) {
  let langText = { es: "Espanol", en: "English", ar: "العربية" };
  $("#selectedLang").text(langText[selectedLang] || "Espanol");
}

// function autoTranslation(selectedLang) {
//     alert("Auto translation started for language: " + selectedLang);
//     var targetLang = selectedLang;

//     $(".translatable").each(function () {
//         var element = $(this);
//         var originalText = element.text();

//         $.ajax({
//             url: "https://libretranslate.de/translate",
//             type: "POST",
//             data: {
//                 q: originalText,
//                 source: "auto",
//                 target: targetLang,
//                 format: "text",
//                 api_key: "" // قد تحتاج مفتاح API إذا كان الخادم يطلب ذلك
//             },
//             success: function (response) {
//                 element.text(response.translatedText);
//             },
//             error: function (error) {
//                 console.error("خطأ في الترجمة:", error);
//             }
//         });
//     });
// }

function setupEventListeners() {
  $(document).on("click", ".change-lang", function (e) {
    e.preventDefault();
    let selectedLang = $(this).data("lang");
    changeLanguage(selectedLang);
  });

  $("#reservationButton").on("click", function () {
    alert(i18next.t("booking_message"));
  });

  $("#google-login").click(function () {
    window.location.href = API_BASE_URL;
  });
}

function changeLanguage(selectedLang) {
  i18next.changeLanguage(selectedLang, function (err) {
    if (err) return console.error("Error changing language:", err);
    updateContent();
    // autoTranslation(selectedLang);
    updateLanguageButton(selectedLang);
    localStorage.setItem("selectedLang", selectedLang);
  });
}
