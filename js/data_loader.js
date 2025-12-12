// Data Loader for Public Pages

function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

/**
 * Renders the notice list into the specified container.
 * @param {string} containerId - The ID of the table element to render rows into.
 * @param {number} [limit=0] - The maximum number of items to display (0 for all).
 */
function renderNoticeList(containerId, limit = 0) {
    const notices = getData('kkuzy_notices');
    const tbody = document.getElementById(containerId);
    if (!tbody) return;

    // Sort by date descending
    notices.sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = '';
    const displayNotices = limit > 0 ? notices.slice(0, limit) : notices;

    if (displayNotices.length === 0) {
        // Different colspan for main page vs subpage
        const colspan = limit > 0 ? 1 : 4;
        html = `<tr><td colspan="${colspan}" style="text-align:center; padding: 50px;">등록된 공지사항이 없습니다.</td></tr>`;
    } else {
        displayNotices.forEach((notice, index) => {
            if (limit > 0) {
                // Main Page Layout
                html += `
                    <tr>
                        <td class="latest_space">
                            <a href="community/notice.html?id=${notice.id}">${notice.title}</a>
                        </td>
                    </tr>
                `;
            } else {
                // Subpage Layout
                const tr = document.createElement('tr');
                tr.setAttribute('onmouseover', "this.style.backgroundColor='#fcfcfc'");
                tr.setAttribute('onmouseout', "this.style.backgroundColor=''");
                tr.innerHTML = `
                    <td class="num">${notices.length - index}</td>
                    <td class="title" style="text-align:left; padding-left:10px;">
                        <a href="community/notice.html?id=${notice.id}">${notice.title}</a>
                    </td>
                    <td class="name"><span class="member">${notice.author}</span></td>
                    <td class="date">${notice.date}</td>
                `;
                html += tr.outerHTML;
            }
        });
    }

    tbody.innerHTML = html;
}

/**
 * Renders the inquiry list into the specified container.
 * @param {string} containerId - The ID of the table element to render rows into.
 * @param {number} [limit=0] - The maximum number of items to display (0 for all).
 */
function renderInquiryList(containerId, limit = 0) {
    const inquiries = getData('kkuzy_inquiries');
    const tbody = document.getElementById(containerId);
    if (!tbody) return;

    // Sort by date descending
    inquiries.sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = '';
    const displayInquiries = limit > 0 ? inquiries.slice(0, limit) : inquiries;

    if (displayInquiries.length === 0) {
        const colspan = limit > 0 ? 1 : 5;
        html = `<tr><td colspan="${colspan}" style="text-align:center; padding: 50px;">등록된 문의가 없습니다.</td></tr>`;
    } else {
        displayInquiries.forEach((inq, index) => {
            if (limit > 0) {
                // Main Page Layout
                html += `
                    <tr>
                        <td class="latest_space">
                            <a href="community/inquiry.html?id=${inq.id}">${inq.title}</a>
                        </td>
                    </tr>
                `;
            } else {
                // Subpage Layout
                const tr = document.createElement('tr');
                tr.setAttribute('onmouseover', "this.style.backgroundColor='#fcfcfc'");
                tr.setAttribute('onmouseout', "this.style.backgroundColor=''");

                const statusBadge = inq.status === '답변완료'
                    ? '<span style="color:blue;">[답변완료]</span>'
                    : '<span style="color:gray;">[대기]</span>';

                tr.innerHTML = `
                    <td class="num">${inquiries.length - index}</td>
                    <td class="title" style="text-align:left; padding-left:10px;">
                        <a href="#">${inq.title}</a> <img src="../skin/board/basic2018/img/icon_secret.gif" align="absmiddle">
                    </td>
                    <td class="name"><span class="guest">${inq.author}</span></td>
                    <td class="date">${inq.date}</td>
                    <td class="status">${statusBadge}</td>
                `;
                html += tr.outerHTML;
            }
        });
    }

    tbody.innerHTML = html;
}
