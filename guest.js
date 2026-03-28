const api = "http://localhost:3000/campaigns";

async function load() {
    try {
        const res = await fetch(`${api}?isApproved=true`);
        const data = await res.json();
        const grid = document.getElementById('grid');
        
        if (data.length === 0) {
            grid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 50px; color: #888;'>لا توجد مشروعات متاحة حالياً.</p>";
            return;
        }

        grid.innerHTML = data.map(c => {
            const raised = c.raised || 0;
            const goal = c.goal || 0;
            const remaining = goal - raised;

            return `
            <div class="card">
                <div class="card-img">
                    <img src="${c.image}" alt="${c.title}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                </div>
                <div class="card-content">
                    <h3>${c.title}</h3>
                    <p class="project-desc">${c.description || "لا يوجد وصف متوفر لهذا المشروع حالياً."}</p>
                    <div class="info">
                        <p><strong>المبلغ المستهدف:</strong> $${goal}</p>
                        <p style="color: #27ae60;"><strong>تم جمع:</strong> $${raised}</p>
                        <p style="color: #e67e22;"><strong>المتبقي:</strong> $${remaining > 0 ? remaining : 0}</p>
                        <p class="deadline"><strong>التاريخ:</strong>  ${c.deadline}</p>
                    </div>
                    <button class="btn-support" onclick="goToPayment('${c.id}')">دعم المشروع الآن</button>
                </div>
            </div>`;
        }).join('');
    } catch (e) { console.error(e); }
}

function goToPayment(id) {
    window.location.href = `payment.html?id=${id}`;
}

window.onload = () => {
    load();
    updateNav();
};

function updateNav() {
    const userNav = document.getElementById('userNav');
    const authBtn = document.getElementById('authActionBtn');
    const userData = localStorage.getItem('user');

    if (userData) {
        const user = JSON.parse(userData);
        const btnLink = user.role === 'admin' ? "admin.html" : "user.html";
        const btnText = user.role === 'admin' ? "الإدارة" : "حملاتك";
        userNav.innerHTML = `<a href="${btnLink}" style="color: white; text-decoration: none; border: 1px solid white; padding: 5px 15px; border-radius: 5px; font-size: 0.9rem; display: inline-block;">${btnText}</a>`;
        authBtn.innerText = "تسجيل الخروج";
        authBtn.onclick = () => {
            if(confirm("خروج؟")) { localStorage.removeItem('user'); location.reload(); }
        };
    }
}