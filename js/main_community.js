import { getPosts, COMM_KEYS } from "./community_firebase.js?v=debug_fix";

async function renderMainPageSection(boardKey, containerId, limit = 5, pageUrl) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Use a loading state or keep empty until loaded
    // container.innerHTML = '<tr><td>Loading...</td></tr>';

    try {
        const posts = await getPosts(boardKey);
        // Sort by date descending
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        const displayPosts = posts.slice(0, limit);
        let html = '';

        if (displayPosts.length === 0) {
            html = `<tr><td style="text-align:center; padding: 20px; color: #999;">등록된 게시물이 없습니다.</td></tr>`;
        } else {
            displayPosts.forEach(post => {
                // Determine the correct URL for the detail page
                let postUrl = `${pageUrl}?id=${post.id}`;

                html += `
                    <tr>
                        <td class="latest_space">
                            <a href="${postUrl}" style="
                                display: block;
                                width: 100%;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                                padding: 8px 0;
                                color: #555;
                                text-decoration: none;
                                font-size: 14px;
                            " onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
                                - ${post.title}
                            </a>
                        </td>
                    </tr>
                `;
            });
        }
        container.innerHTML = html;

    } catch (error) {
        console.error(`Error loading data for ${containerId}:`, error);
        container.innerHTML = `<tr><td style="text-align:center; color:red;">일시적인 오류가 발생했습니다.</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Notice
    renderMainPageSection(COMM_KEYS.NOTICE, 'main-notice-list', 5, 'community/notice.html');

    // Activities (Inquiry)
    renderMainPageSection(COMM_KEYS.INQUIRY, 'main-inquiry-list', 5, 'community/inquiry.html');

    // Reviews
    renderMainPageSection(COMM_KEYS.REVIEW, 'main-review-list', 5, 'community/review.html');
});
