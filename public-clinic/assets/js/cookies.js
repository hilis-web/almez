$(document).ready(function () {
  $(".cookiesShared").load("/cookies-banner.html", function () {
    const banner = document.getElementById("cookieConsentBanner");
    const acceptBtn = document.getElementById("acceptCookies");

    const acceptBtn1 = document.getElementById("acceptCookies1");

    const declineBtn = document.getElementById("declineCookies");
    const floatingConsultationForm = document.getElementById(
      "floating-consultation-form"
    );
    // const footerSharedStyle = document.getElementsByClassName("footerShared");
    const footerSharedStyle = document.querySelector(".footerShared");
    const cookiesDecision = localStorage.getItem("cookiesAccepted");

    if (cookiesDecision === "true" || cookiesDecision === "false") {
      acceptBtn1.style.display = "none";
      if (cookiesDecision) {
        banner.style.display = "none";
        if (floatingConsultationForm) {
          floatingConsultationForm.style.setProperty(
            "bottom",
            "48px",
            "important"
          );
        }

        footerSharedStyle.style.setProperty(
          "padding-bottom",
          "0px",
          "important"
        );
      }
    } else {
      banner.style.display = "flex";
      if (cookiesDecision) {
        banner.style.display = "none";
        if (floatingConsultationForm) {
          floatingConsultationForm.style.setProperty(
            "bottom",
            "48px",
            "important"
          );
        }
        footerSharedStyle.style.setProperty(
          "padding-bottom",
          "0px",
          "important"
        );
      }
    }

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        // alert("test acceptCookies");
        localStorage.setItem("cookiesAccepted", "true");
        banner.style.display = "none";
        acceptBtn1.style.display = "none";
        if (floatingConsultationForm) {
          floatingConsultationForm.style.setProperty(
            "bottom",
            "48px",
            "important"
          );
        }

        footerSharedStyle.style.setProperty(
          "padding-bottom",
          "0px",
          "important"
        );
        // 1️⃣ إنشاء visitorId فريد (مرة واحدة فقط)
        let visitorId = getCookie("visitorId");
        if (!visitorId) {
          visitorId = generateUUID(); // دالة متوافقة مع كل المتصفحات
          setCookie("visitorId", visitorId, 365);
        }

        // 2️⃣ اللغة
        const userLang = navigator.language || "en";

        // 3️⃣ وقت بداية التصفح
        const startTime = Date.now();
        setCookie("sessionStart", startTime, 1);

        console.log("visitorId", visitorId);
        // 4️⃣ إرسال أول زيارة للباك إند
        sendVisitData(visitorId, userLang, window.location.pathname, "start");
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener("click", function () {
        localStorage.setItem("cookiesAccepted", "false");
        banner.style.display = "none";
      });
    }

    // 🔁 عند مغادرة الصفحة (نحسب المدة المستغرقة)
    window.addEventListener("beforeunload", function () {
      const visitorId = getCookie("visitorId");
      const startTime = getCookie("sessionStart");
      if (visitorId && startTime) {
        const duration = Math.round((Date.now() - startTime) / 1000); // بالثواني
        sendVisitData(
          visitorId,
          null,
          window.location.pathname,
          "end",
          duration
        );
      }
    });

    // ---- الدوال المساعدة ----
    function setCookie(name, value, days) {
      let expires = "";
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie =
        name + "=" + encodeURIComponent(value) + expires + "; path=/";
    }

    function getCookie(name) {
      const nameEQ = name + "=";
      const cookiesArray = document.cookie.split(";");
      for (let c of cookiesArray) {
        c = c.trim();
        if (c.indexOf(nameEQ) === 0)
          return decodeURIComponent(c.substring(nameEQ.length));
      }
      return null;
    }

    // دالة توليد UUID متوافقة مع جميع المتصفحات
    function generateUUID() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    }

    // إرسال البيانات للباك إند
    function sendVisitData(visitorId, language, page, eventType, duration = 0) {
      $.ajax({
        url: `${API_BASE_URL}/api/track-visit`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          visitorId,
          language,
          page,
          eventType,
          duration,
        }),
        success: function (response) {
          console.log("تم إضافة المقال بنجاح!", response);
        },
        error: function (xhr, status, error) {
          console.error("فشل إضافة المقال:", error);
        },
      });
    }

    //Legal
    const acceptLegalBtn = document.getElementById("acceptLegal");
    const legalDecision = localStorage.getItem("legalAccepted");

    if (acceptLegalBtn) {
      acceptLegalBtn.addEventListener("click", function () {
        alert("test acceptLegalBtn");
        localStorage.setItem("legalAccepted", "true");
        acceptLegalBtn.style.display = "none";
      });
    }

    if (legalDecision === "true") {
      acceptLegalBtn.style.display = "none";
    } else {
      acceptLegalBtn.style.display = "block";
    }

    //Policy
    const acceptPolicylBtn = document.getElementById("acceptPolicy");
    const policyDecision = localStorage.getItem("policyAccepted");

    if (acceptPolicylBtn) {
      acceptPolicylBtn.addEventListener("click", function () {
        alert("test acceptPolicylBtn");
        localStorage.setItem("policyAccepted", "true");
        acceptPolicylBtn.style.display = "none";
      });
    }

    if (policyDecision === "true") {
      acceptPolicylBtn.style.display = "none";
    } else {
      acceptPolicylBtn.style.display = "block";
    }
  });
});
