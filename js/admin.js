// Admin Page Logic

document.addEventListener('DOMContentLoaded', function () {
    showTab('dashboard');
    updateDashboardCounts();
    loadOrders();
    loadNotices();
    loadInquiries();
});

function showTab(tabId) {
    document.querySelectorAll('.content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    // Find the link that calls this function and make it active (simple approximation)
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (link.getAttribute('onclick').includes(tabId)) {
            link.classList.add('active');
        }
    });

    if (tabId === 'dashboard') updateDashboardCounts();
}

// --- Data Management ---

function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    updateDashboardCounts();
}

function updateDashboardCounts() {
    document.getElementById('dash-orders-count').innerText = getData('kkuzy_orders').length + '건';
    document.getElementById('dash-notices-count').innerText = getData('kkuzy_notices').length + '건';
    document.getElementById('dash-inquiries-count').innerText = getData('kkuzy_inquiries').length + '건';
}

// --- Orders ---

function loadOrders() {
    const orders = getData('kkuzy_orders');
    const tbody = document.getElementById('order-list');
    tbody.innerHTML = '';

    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${order.date}</td>
            <td>${order.product}</td>
            <td>${order.customer}</td>
            <td><span class="badge bg-${order.status === '완료' ? 'success' : 'warning'}">${order.status}</span></td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteOrder(${order.id})">삭제</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function addMockOrder() {
    const orders = getData('kkuzy_orders');
    const newOrder = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        product: '세심귀뜸봉 (테스트)',
        customer: '홍길동',
        status: '대기'
    };
    orders.unshift(newOrder); // Add to top
    saveData('kkuzy_orders', orders);
    loadOrders();
}

function deleteOrder(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    let orders = getData('kkuzy_orders');
    orders = orders.filter(o => o.id !== id);
    saveData('kkuzy_orders', orders);
    loadOrders();
}

// --- Notices ---

function loadNotices() {
    const notices = getData('kkuzy_notices');
    const tbody = document.getElementById('notice-list');
    tbody.innerHTML = '';

    notices.forEach(notice => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${notice.id}</td>
            <td>${notice.date}</td>
            <td>${notice.title}</td>
            <td>${notice.author}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteNotice(${notice.id})">삭제</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function showAddNoticeModal() {
    const modal = new bootstrap.Modal(document.getElementById('addNoticeModal'));
    modal.show();
}

function saveNotice() {
    const title = document.getElementById('noticeTitle').value;
    const content = document.getElementById('noticeContent').value;

    if (!title || !content) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    const notices = getData('kkuzy_notices');
    const newNotice = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        title: title,
        content: content,
        author: '관리자'
    };
    notices.unshift(newNotice);
    saveData('kkuzy_notices', notices);
    loadNotices();

    // Close modal
    const modalEl = document.getElementById('addNoticeModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    // Reset form
    document.getElementById('noticeForm').reset();
}

function deleteNotice(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    let notices = getData('kkuzy_notices');
    notices = notices.filter(n => n.id !== id);
    saveData('kkuzy_notices', notices);
    loadNotices();
}

// --- Inquiries ---

function loadInquiries() {
    const inquiries = getData('kkuzy_inquiries');
    const tbody = document.getElementById('inquiry-list');
    tbody.innerHTML = '';

    inquiries.forEach(inq => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${inq.id}</td>
            <td>${inq.date}</td>
            <td>${inq.title}</td>
            <td>${inq.author}</td>
            <td><span class="badge bg-${inq.status === '답변완료' ? 'success' : 'secondary'}">${inq.status}</span></td>
            <td>
                ${inq.status !== '답변완료' ? `<button class="btn btn-success btn-sm me-1" onclick="updateInquiryStatus(${inq.id}, '답변완료')">답변완료</button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteInquiry(${inq.id})">삭제</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateInquiryStatus(id, status) {
    let inquiries = getData('kkuzy_inquiries');
    const index = inquiries.findIndex(i => i.id === id);
    if (index !== -1) {
        inquiries[index].status = status;
        saveData('kkuzy_inquiries', inquiries);
        loadInquiries();
    }
}

function addMockInquiry() {
    const inquiries = getData('kkuzy_inquiries');
    const newInquiry = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        title: '배송 언제 되나요? (테스트)',
        content: '어제 주문했는데 언제 배송되나요?',
        author: '김철수',
        status: '대기'
    };
    inquiries.unshift(newInquiry);
    saveData('kkuzy_inquiries', inquiries);
    loadInquiries();
}

function deleteInquiry(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    let inquiries = getData('kkuzy_inquiries');
    inquiries = inquiries.filter(i => i.id !== id);
    saveData('kkuzy_inquiries', inquiries);
    loadInquiries();
}
