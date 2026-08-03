document.addEventListener('DOMContentLoaded', function () {
    // التعامل مع إرسال نموذج التسجيل
    document.querySelector('#signupForm').addEventListener('submit', function (event) {
        event.preventDefault();  // منع إرسال الفورم بشكل تقليدي

        // جمع بيانات الفورم
        const formData = {
            fullName: document.querySelector('#fullName').value,
            email: document.querySelector('#email').value,
            password: document.querySelector('#password').value,
            registrationType: "email"
        };

        // التحقق من وجود البيانات قبل الإرسال
        if (!formData.fullName || !formData.email || !formData.password) {
            alert('Please fill in all the fields');

            return;
        }

        // إرسال البيانات إلى السيرفر باستخدام AJAX
        registerUser(formData);
    });


    // إرسال طلب التسجيل إلى السيرفر
    async function registerUser(formData) {
        console.log("registerUser");
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (response.ok) {
                alert(`Account created successfully!`);

                // تخزين التوكن وبيانات المستخدم في الـ localStorage
                localStorage.setItem('token', result.token);
                localStorage.setItem('userName', result.user.fullName);
                localStorage.setItem('userEmail', result.user.email);

                // إعادة توجيه المستخدم إلى الصفحة الرئيسية أو صفحة العيادة
                window.location.href = '/index.html'; // تغيير المسار حسب الحاجة
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error while sending data:', error);
            alert('An error occurred while connecting to the server.');
            
        }
    }



    
});
