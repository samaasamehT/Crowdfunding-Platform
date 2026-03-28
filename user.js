const api = "http://localhost:3000/campaigns";
const userData = localStorage.getItem('user');
const user = userData ? JSON.parse(userData) : null;

window.onload = () => {
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }
    document.getElementById('userNameDisplay').innerText = user.email.split('@')[0];
    load();
};

function logout() {
    if (confirm("هل تريد تسجيل الخروج؟")) {
        localStorage.removeItem('user');
        window.location.href = 'auth.html';
    }
}

async function load() {
    try {
        const res = await fetch(`${api}?creatorId=${user.id}`);
        const data = await res.json();
        const listBody = document.getElementById('list');

        if (data.length === 0) {
            listBody.innerHTML = "<tr><td colspan='6'>ليس لديك حملات بعد.</td></tr>";
            return;
        }

        listBody.innerHTML = data.map(c => `
            <tr>
                <td><img src="${c.image}" width="50"></td>
                <td style="font-weight:bold;">${c.title}</td>
                <td>${c.nationalId || "غير مسجل"}</td>
                <td class="desc-cell">${c.description || "بدون وصف"}</td>
                <td>$${c.goal}</td>
                <td class="${c.isApproved ? 'status-approved' : 'status-pending'}">
                    ${c.isApproved ? "مقبول ✅" : "قيد المراجعة ⏳"}
                </td>
            </tr>
        `).join('');
    } catch (e) { console.error(e); }
}

async function create() {
    const title = document.getElementById('t').value;
    const nationalId = document.getElementById('nationalId').value;
    const description = document.getElementById('desc').value;
    const goal = document.getElementById('g').value;
    const deadline = document.getElementById('d').value;
    const fileInput = document.getElementById('i');

    if (!title || !nationalId || !description || !goal || !deadline || !fileInput.files[0]) {
        return alert("يرجى ملء كافة البيانات");
    }

    if (nationalId.length !== 14) {
        return alert("يجب أن يكون الرقم القومي 14 رقم");
    }

    const reader = new FileReader();
    reader.readAsDataURL(fileInput.files[0]);
    reader.onload = async () => {
        const newCampaign = {
            title, 
            nationalId,
            description, 
            goal: Number(goal),
            deadline, 
            image: reader.result, 
            isApproved: false,
            creatorId: user.id, 
            id: Date.now().toString()
        };
        await fetch(api, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCampaign)
        });
        alert("تم إرسال حملتك بنجاح!");
        location.reload();
    };
}