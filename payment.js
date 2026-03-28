const api = "http://localhost:3000/campaigns";
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');
let currentCampaign = null;

window.onload = async () => {
    if (!projectId) {
        alert("خطأ: لم يتم تحديد مشروع!");
        window.location.href = 'guest.html';
        return;
    }
    try {
        const res = await fetch(`${api}/${projectId}`);
        if (res.ok) {
            currentCampaign = await res.json();
        } else {
            alert("المشروع غير موجود");
            window.location.href = 'guest.html';
        }
    } catch (e) {
        console.error(e);
    }
};

function validateNumbers(input) {
    if (/[^0-9]/.test(input.value)) {
        alert("مسموح بالأرقام فقط في هذه الخانة");
        input.value = input.value.replace(/[^0-9]/g, '');
    }
}

function validateExpiry(input) {
    let val = input.value.replace(/[^0-9]/g, '');
    if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    input.value = val;
}

function updateCardVisual() {
    const holder = document.getElementById('holder-input').value;
    const num = document.getElementById('num-input').value;
    const expiry = document.getElementById('expiry-input').value;

    document.getElementById('card-holder-display').innerText = holder || "اسم المستخدم";
    document.getElementById('card-num-display').innerText = num.replace(/(.{4})/g, '$1 ') || "#### #### #### ####";
    document.getElementById('card-expiry-display').innerText = expiry || "MM/YY";
}

async function processPayment() {
    const holder = document.getElementById('holder-input').value.trim();
    const cardNum = document.getElementById('num-input').value.trim();
    const expiry = document.getElementById('expiry-input').value.trim();
    const cvv = document.getElementById('cvv-input').value.trim();
    const amountVal = document.getElementById('payAmount').value;

    if (!holder || !cardNum || !expiry || !cvv || !amountVal) {
        alert("يرجى ملء كافة الخانات بشكل صحيح.");
        return;
    }

    if (cardNum.length !== 16) {
        alert("رقم الكارت يجب أن يكون 16 رقماً.");
        return;
    }

    const expiryMatch = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) {
        alert("يرجى إدخال التاريخ بصيغة صحيحة MM/YY");
        return;
    }

    const expMonth = parseInt(expiryMatch[1]);
    const expYear = parseInt("20" + expiryMatch[2]);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (expMonth < 1 || expMonth > 12) {
        alert("الشهر غير صحيح");
        return;
    }

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        alert("البطاقة منتهية الصلاحية، يرجى إدخال تاريخ في المستقبل.");
        return;
    }

    const donation = parseFloat(amountVal);
    const newRaised = (Number(currentCampaign.raised) || 0) + donation;

    try {
        const response = await fetch(`${api}/${projectId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ raised: newRaised })
        });

        if (response.ok) {
            alert("تمت عملية الدفع بنجاح!");
            
            window.location.replace('guest.html');
        }
    } catch (e) {
        alert("حدث خطأ في الاتصال بالسيرفر.");
    }
}