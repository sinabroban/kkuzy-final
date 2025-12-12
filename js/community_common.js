/**
 * Community Common Logic
 * Handles CRUD, File Attachments, and Comments using localStorage.
 */

const COMM_KEYS = {
    NOTICE: 'kkuzy_notices',
    INQUIRY: 'kkuzy_inquiries',
    REVIEW: 'kkuzy_reviews',
    COMMENTS: 'kkuzy_comments' // Structure: { [boardKey_postId]: [ {id, author, content, date, ...} ] }
};

/**
 * Reads a file and returns a Promise with file data.
 * For images: returns Base64 data URL.
 * For others: returns object with name and size (simulated).
 */
function readFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        // Limit size to avoid localStorage quota issues (e.g., 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("첨부 파일 용량이 2MB를 초과하여 파일명만 저장됩니다.");
            resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                data: null, // Too large to save in localStorage
                isLarge: true
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result,
                isLarge: false
            });
        };
        reader.onerror = (e) => reject(e);

        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else {
            // For non-images, we might just want metadata or handle differently
            // But user asked for video support -> LocalStorage is bad for video.
            // We will store metadata for now.
            resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                data: null,
                isLarge: true
            });
        }
    });
}

// --- Post CRUD ---

function getPosts(boardKey) {
    const data = localStorage.getItem(boardKey);
    return data ? JSON.parse(data) : [];
}

function savePost(boardKey, post) {
    console.log('savePost called', boardKey, post);
    const posts = getPosts(boardKey);
    if (post.id) {
        // Update existing item logic if needed, currently we mostly add new
        const index = posts.findIndex(p => p.id === post.id);
        if (index !== -1) {
            posts[index] = post;
        } else {
            posts.push(post);
        }
    } else {
        // Create new ID
        const maxId = posts.length > 0 ? Math.max(...posts.map(p => p.id || 0)) : 0;
        post.id = maxId + 1;
        posts.push(post);
    }
    localStorage.setItem(boardKey, JSON.stringify(posts));
    return post;
}

function getPost(boardKey, id) {
    const posts = getPosts(boardKey);
    return posts.find(p => p.id == id);
}

function deletePost(boardKey, id) {
    let posts = getPosts(boardKey);
    posts = posts.filter(p => p.id != id);
    localStorage.setItem(boardKey, JSON.stringify(posts));
}

// --- Comments ---

function getCommentKey(boardKey, postId) {
    return `${boardKey}_${postId}`;
}

function getComments(boardKey, postId) {
    const allComments = JSON.parse(localStorage.getItem(COMM_KEYS.COMMENTS) || '{}');
    const key = getCommentKey(boardKey, postId);
    return allComments[key] || [];
}

function addComment(boardKey, postId, comment) {
    console.log('addComment called', boardKey, postId, comment);
    const allComments = JSON.parse(localStorage.getItem(COMM_KEYS.COMMENTS) || '{}');
    const key = getCommentKey(boardKey, postId);

    if (!allComments[key]) allComments[key] = [];

    // items in comment: author, password(optional), content, date
    comment.id = Date.now(); // Simple ID
    comment.date = new Date().toISOString().split('T')[0];

    allComments[key].push(comment);
    localStorage.setItem(COMM_KEYS.COMMENTS, JSON.stringify(allComments));
}

function renderCommentSection(containerId, boardKey, postId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const comments = getComments(boardKey, postId);

    let html = `
        <div class="comment_wrap" style="margin-top: 50px; background: #f9f9f9; padding: 20px;">
            <h4 style="font-size: 16px; font-weight: bold; margin-bottom: 15px;">댓글 <span>(${comments.length})</span></h4>
            
            <ul class="comment_list" style="margin-bottom: 20px;">
    `;

    if (comments.length === 0) {
        html += `<li style="color: #888; padding: 10px 0;">등록된 댓글이 없습니다.</li>`;
    } else {
        comments.forEach(c => {
            html += `
                <li style="border-bottom: 1px solid #eee; padding: 10px 0;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${c.author} <span style="font-weight: normal; font-size: 12px; color: #888;">${c.date}</span></div>
                    <div style="line-height: 1.5;">${c.content.replace(/\n/g, '<br>')}</div>
                </li>
            `;
        });
    }

    html += `
            </ul>

            <div class="comment_form">
                <form onsubmit="submitComment(event, '${boardKey}', ${postId})">
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <input type="text" id="cmt_author" placeholder="이름" required style="padding: 5px; border: 1px solid #ddd; width: 100px;">
                        <input type="password" id="cmt_pw" placeholder="비밀번호" style="padding: 5px; border: 1px solid #ddd; width: 100px;">
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <textarea id="cmt_content" placeholder="댓글을 남겨주세요." required style="flex: 1; height: 60px; padding: 10px; border: 1px solid #ddd; resize: none;"></textarea>
                        <button type="submit" style="width: 80px; background: #333; color: #fff; border: none; font-weight: bold;">등록</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function submitComment(e, boardKey, postId) {
    e.preventDefault();
    const author = document.getElementById('cmt_author').value;
    const content = document.getElementById('cmt_content').value;
    // Password could be used for deletion later
    const pw = document.getElementById('cmt_pw').value;

    addComment(boardKey, postId, { author, content, pw });
    renderCommentSection('comment-section', boardKey, postId); // Re-render
}
