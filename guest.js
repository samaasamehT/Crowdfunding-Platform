
async function load() {
    try {
        const res = await fetch(`http://localhost:3000/campaigns?isApproved=true`);
        const data = await res.json();
        
        const grid = document.getElementById('grid');
        
        if (data.length === 0) {
            grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 50px; color: #888;'>لا توجد مشروعات متاحة حالياً.</p>";
            return;
        }

        grid.innerHTML = data.map(c => `
            <div class="card">
                <div class="card-img">
                    <img src="${c.image}" alt="${c.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                </div>
                <div class="card-content">
                    <h3>${c.title}</h3>
                    <p class="project-desc">${c.description || "لا يوجد وصف متوفر لهذا المشروع حالياً."}</p>
                    <div class="info">
                        <p class="goal"><strong>المبلغ المستهدف:</strong> $${c.goal}</p>
                        <p class="deadline"><strong>تاريخ الانتهاء:</strong> 📅 ${c.deadline}</p>
                    </div>
                    <button class="btn-support" onclick="checkAuthAndPay()">دعم المشروع الآن</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
        document.getElementById('grid').innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: red;'>تأكدي من تشغيل السيرفر أولاً!</p>";
    }
}

function updateAuthUI() {
    const authBtn = document.getElementById('authActionBtn');
    const userNav = document.getElementById('userNav');
    const userData = localStorage.getItem('user');

    if (userData) {
        const user = JSON.parse(userData);
        let btnText = "";
        let btnLink = "";

        
        if (user.role === 'admin') {
            btnText = "الإدارة";
            btnLink = "admin.html";
        } else {
            btnText = "حملاتك";
            btnLink = "user.html";
        }

        
        userNav.innerHTML = `
            <a href="${btnLink}" style="color: white; text-decoration: none; border: 1px solid white; padding: 5px 15px; border-radius: 5px; font-size: 0.9rem; display: inline-block;">${btnText}</a>
        `;

        
        authBtn.innerText = "تسجيل الخروج";
        authBtn.href = "javascript:void(0)";
        authBtn.onclick = function() {
            if(confirm("هل تريد تسجيل الخروج؟")) {
                localStorage.removeItem('user');
                window.location.href = 'auth.html';
            }
        };
    } else {
        
        userNav.innerHTML = ""; 
        authBtn.innerText = "تسجيل الدخول";
        authBtn.href = "auth.html";
        authBtn.onclick = null;
    }
}


function checkAuthAndPay() {
    if (localStorage.getItem('user')) {
        window.location.href = 'payment.html';
    } else {
        if (confirm("يجب تسجيل الدخول أولاً لدعم هذا المشروع.")) {
            window.location.href = 'auth.html';
        }
    }
}


window.onload = () => {
    load();
    updateAuthUI();
};