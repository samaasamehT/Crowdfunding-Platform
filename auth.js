const api = "http://localhost:3000/users";

function toggleForm() {
    const regFields = document.getElementById('registerFields');
    const mainBtn = document.getElementById('mainBtn');
    const toggleBtn = document.getElementById('toggleBtn');
    const title = document.getElementById('formTitle');
    const toggleText = document.getElementById('toggleText');

    if (regFields.style.display === "none") {
        regFields.style.display = "block";
        title.innerText = "إنشاء حساب جديد";
        mainBtn.innerText = "تسجيل الآن";
        mainBtn.setAttribute("onclick", "register()");
        toggleBtn.innerText = "العودة لتسجيل الدخول";
        toggleText.innerText = "لديك حساب بالفعل؟";
    } else {
        regFields.style.display = "none";
        title.innerText = "تسجيل الدخول";
        mainBtn.innerText = "دخول";
        mainBtn.setAttribute("onclick", "login()");
        toggleBtn.innerText = "إنشاء حساب جديد";
        toggleText.innerText = "ليس لديك حساب؟";
    }
}

async function login() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const role = document.getElementById('role').value;

    if (!email || !pass) return alert("من فضلك أدخلي الإيميل والباسورد");

    try {
        const res = await fetch(`${api}?email=${email}&password=${pass}&role=${role}`);
        const users = await res.json();

        if (users.length > 0) {
            const user = users[0];
            if (!user.isActive) return alert("هذا الحساب قيد المراجعة أو محظور.");
            
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = (user.role === 'admin') ? 'admin.html' : 'user.html';
        } else {
            alert("بيانات الدخول غير صحيحة.");
        }
    } catch (error) {
        alert("تأكدي من تشغيل السيرفر!");
    }
}

async function register() {
    const fName = document.getElementById('firstName').value.trim();
    const lName = document.getElementById('lastName').value.trim();
    const pin = document.getElementById('userPin').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const role = document.getElementById('role').value;

    if (!fName || !lName || !email || !pass || !pin) return alert("برجاء ملء جميع الحقول بما فيها الـ PIN");
    if (pin.length !== 4) return alert("يجب أن يتكون الـ PIN من 4 أرقام");

    try {
        const checkRes = await fetch(`${api}?email=${email}`);
        const existing = await checkRes.json();
        if (existing.length > 0) return alert("هذا البريد مسجل بالفعل!");

        const newUser = {
            id: Date.now().toString(),
            firstName: fName,
            lastName: lName,
            pin: pin, // حفظ الـ PIN الجديد
            email: email,
            password: pass,
            role: role,
            isActive: role === 'admin' ? false : true 
        };

        await fetch(api, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        alert(role === 'admin' ? "طلبك قيد المراجعة." : "تم التسجيل بنجاح!");
        toggleForm(); 
    } catch (e) {
        alert("حدث خطأ أثناء التسجيل");
    }
}

// دالة نسيان كلمة السر المعتمدة على الـ PIN
async function forgotPassword() {
    const email = prompt("أدخلي بريدك الإلكتروني:");
    if (!email) return;

    const pin = prompt("أدخلي رمز الـ PIN الخاص بك المكون من 4 أرقام:");
    if (!pin) return;

    try {
       
        const res = await fetch(`${api}?email=${email}&pin=${pin}`);
        const users = await res.json();

        if (users.length > 0) {
            alert(`تحقق ناجح! كلمة المرور الخاصة بك هي: ${users[0].password}`);
        } else {
            alert("البريد الإلكتروني أو رمز الـ PIN غير صحيح.");
        }
    } catch (e) {
        alert("حدث خطأ في السيرفر.");
    }
}