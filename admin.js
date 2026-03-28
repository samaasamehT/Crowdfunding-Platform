const API_URL = "http://localhost:3000/campaigns";
const USERS_API = "http://localhost:3000/users";

window.onload = () => {
    const userData = localStorage.getItem('user');
    if (!userData) { window.location.href = 'auth.html'; return; }
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
        alert("عذراً، هذه الصفحة للمديرين فقط.");
        window.location.href = 'user.html';
        return;
    }
    loadAdminData();
    loadUserRequests();
};

async function loadAdminData() {
    try {
        const [campRes, userRes] = await Promise.all([fetch(API_URL), fetch(USERS_API)]);
        const campaigns = await campRes.json();
        const users = await userRes.json();

        const pendingBody = document.getElementById('pendingProjectsBody');
        const approvedBody = document.getElementById('approvedProjectsBody');
        pendingBody.innerHTML = ""; approvedBody.innerHTML = "";

        campaigns.forEach(c => {
            const owner = users.find(u => u.id === c.creatorId);
            const ownerEmail = owner ? owner.email : "غير معروف";
            
            const identity = c.nationalId || (owner ? owner.nationalId : "غير مسجل");

            const rowHTML = `
                <tr>
                    <td><img src="${c.image}" class="admin-table-img" onerror="this.src='https://via.placeholder.com/60x40'"></td>
                    <td class="bold-text">${identity}</td>
                    <td>${ownerEmail}</td>
                    <td class="desc-cell">${c.description || "بدون وصف"}</td>
                    <td>$${c.goal}</td>
                    <td>${c.deadline}</td>
                    <td>
                        ${!c.isApproved ? `<button class="btn btn-approve" onclick="approveProject('${c.id}')">قبول</button>` : ''}
                        <button class="btn btn-reject" onclick="deleteProject('${c.id}')">حذف</button>
                    </td>
                </tr>`;

            if (c.isApproved) approvedBody.innerHTML += rowHTML;
            else pendingBody.innerHTML += rowHTML;
        });
    } catch (e) { console.error(e); }
}

async function loadUserRequests() {
    try {
        const res = await fetch(`${USERS_API}?role=admin&isActive=false`);
        const users = await res.json();
        const tableBody = document.getElementById('adminRequestsBody');
        
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td class="bold-text">${user.name || (user.firstName + " " + user.lastName) || "بدون اسم"}</td>
                <td>${user.email}</td>
                <td style="color: orange; font-weight: bold;">انتظار ⏳</td>
                <td>
                    <button class="btn btn-approve" onclick="activateAdmin('${user.id}')">تفعيل</button>
                    <button class="btn btn-reject" onclick="deleteUser('${user.id}')">رفض</button>
                </td>
            </tr>`).join('');
    } catch (e) { console.error(e); }
}

async function approveProject(id) {
    if (confirm("هل تريد قبول هذا المشروع؟")) {
        await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isApproved: true })
        });
        loadAdminData();
    }
}

async function deleteProject(id) {
    if (confirm("حذف المشروع؟")) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadAdminData();
    }
}

async function activateAdmin(id) {
    if (confirm("تفعيل هذا المستخدم كمسؤول؟")) {
        await fetch(`${USERS_API}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: true })
        });
        loadUserRequests();
    }
}

async function deleteUser(id) {
    if (confirm("حذف طلب الانضمام؟")) {
        await fetch(`${USERS_API}/${id}`, { method: 'DELETE' });
        loadUserRequests();
    }
}

function logout() {
    if (confirm("تسجيل خروج؟")) { localStorage.removeItem('user'); window.location.href = 'auth.html'; }
}