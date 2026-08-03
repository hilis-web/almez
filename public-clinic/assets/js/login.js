
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('#loginForm').addEventListener('submit', function (event) {
        event.preventDefault(); // منع إرسال الفورم بشكل تقليدي

        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        // التحقق من أن الحقول ليست فارغة
        if (!email || !password) {
            alert('Please fill in all the fields');
            return;
        }

        // إرسال بيانات تسجيل الدخول إلى السيرفر
        loginUser({ email, password });
    });

    // إرسال طلب تسجيل الدخول إلى السيرفر
    async function loginUser(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const result = await response.json();

            if (response.ok) {
                // تخزين التوكن وبيانات المستخدم في الـ localStorage
                localStorage.setItem('token', result.token);
                localStorage.setItem('userName', result.user.fullName);
                localStorage.setItem('userEmail', result.user.email);

                console.log("dfsfhsdf");
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

