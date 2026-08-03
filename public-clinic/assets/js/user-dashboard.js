// تحقق من وجود التوكن
const token = localStorage.getItem('token');
if (!token) {
    alert('Unauthorized! Please login first.');
    window.location.href = 'index.html';
}

$(document).ready(function () {

    // Sidebar Toggle
    $('#sidebarToggle').click(function () {
        $('#sidebar').toggleClass('closed');
        $('#page-content').toggleClass('expanded');
    });

    $('#sidebarClose').click(function () {
        $('#sidebar').addClass('closed');
        $('#page-content').addClass('expanded');
    });


    // التعامل مع الروابط في الـ Sidebar
    $('#settingsLink').on('click', function () {
        loadSettings();
    });

    $('#consultationsLink').on('click', function () {
        loadConsultation();
    });

    $('#appointmentsLink').on('click', function () {
        // loadAppointments();
        loadAppointements();
    });

    $('#articlesLink').on('click', function () {
        loadFavoriteArticles();
    });

    // تحميل الاعدادات
    function loadSettings() {
        $('#content').html('<h3>Loading Settings...</h3>');

    }

    // تحميل الاستشارات
    function loadConsultation() {
        $('#content').html('<h3>Loading Consultation...</h3>');

    }

     // تحميل الاستشارات
     function loadAppointements() {
        $('#content').html('<h3>Loading Appointements...</h3>');

    }

    // تحميل المقالات
    function loadFavoriteArticles() {
        $('#content').html('<h3>Loading Favorite Articles...</h3>');
    }

});
document.addEventListener("DOMContentLoaded", function () {
 
    // Check if user data exists in localStorage
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
  
    if (userName) {
      // Display user name and dashboard link
  
      let welcomeText = i18next.t('user_welcome');
      console.log("test",welcomeText);
      if (welcomeText === 'user_welcome') {
        document.getElementById('userInfo').textContent = `${welcomeText}, ${userName} (${userEmail})`;
  
      } else {
        document.getElementById('userInfo').textContent = `Welcome, ${userName} (${userEmail})`;
  
      }
      document.getElementById('logoutLink').style.display = 'inline-block';
  
      
    }
  
    // Handle logout
    const logoutBtn = document.getElementById('logoutLink');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        // Clear user data from localStorage
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('token');
  
        // Redirect to homepage or login page
        window.location.href = 'index';
      });
    }
  });