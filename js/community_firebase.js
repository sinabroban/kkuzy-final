/**
 * Community Logic - Firebase Compat Version (Global Scope)
 * Works directly in file:// protocol without modules.
 */

// Debug Helper (Global)
window.createDebugOverlay = function () {
    if (document.getElementById('sys-debug-status')) return;
    const div = document.createElement('div');
    div.id = 'sys-debug-status';
    div.style.cssText = "position:fixed; bottom:10px; left:10px; background:rgba(0,0,0,0.8); color:lime; padding:10px; font-size:12px; z-index:99999; border-radius:5px; font-family:monospace; pointer-events:none; max-width:300px;";
    div.innerHTML = "System Init...";
    document.body.appendChild(div);
};

window.updateDebug = function (msg) {
    const el = document.getElementById('sys-debug-status');
    if (el) {
        el.innerHTML = `[${new Date().toLocaleTimeString()}] ${msg}`;
        console.log(`[SystemDebug] ${msg}`);
    }
};

// --- CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyDxmxP6LPDM69GdXpCTrv9_WgZllzs3bv8",
    authDomain: "homepage-5534d.firebaseapp.com",
    projectId: "homepage-5534d",
    storageBucket: "homepage-5534d.firebasestorage.app",
    messagingSenderId: "445520729520",
    appId: "1:445520729520:web:30692dc01acc2ee81db275",
    measurementId: "G-RMRC5JHJSL"
};

// Initialize
let db, auth, storage;

function initFirebase() {
    // Debug overlay disabled for production
    // window.createDebugOverlay();
    // window.updateDebug("Firebase 초기화 중...");

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();

    // Auto-login
    auth.onAuthStateChanged((user) => {
        if (user) {
            window.updateDebug("인증 성공: " + user.uid.substring(0, 5) + "...");
        } else {
            window.updateDebug("익명 로그인 시도...");
            auth.signInAnonymously().catch((error) => {
                console.error("Login Error", error);
                window.updateDebug("로그인 실패: " + error.message);
            });
        }
    });
}

// Ensure Init runs after scripts load
if (typeof firebase !== 'undefined') {
    initFirebase();
} else {
    window.addEventListener('load', function () {
        if (typeof firebase !== 'undefined') initFirebase();
        else alert("Firebase SDK 로드 실패. 인터넷 연결을 확인하세요.");
    });
}

// --- GLOBALS ---
const COMM_KEYS = {
    NOTICE: 'notices',
    INQUIRY: 'inquiries',
    REVIEW: 'reviews'
};
window.COMM_KEYS = COMM_KEYS;

// --- CRUD ---

window.getPosts = function (collectionName) {
    window.updateDebug(`${collectionName} 조회 중...`);
    return new Promise((resolve, reject) => {
        if (!db) { reject(new Error("DB 미연결")); return; }

        // 5s Timeout
        const timeout = setTimeout(() => {
            reject(new Error("타임아웃(5초): 서버 응답 없음"));
        }, 5000);

        db.collection(collectionName).get().then((snapshot) => {
            clearTimeout(timeout);
            const posts = [];
            snapshot.forEach((doc) => {
                posts.push({ id: doc.id, ...doc.data() });
            });
            window.updateDebug(`${collectionName} ${posts.length}건 로드됨`);
            resolve(posts);
        }).catch((error) => {
            clearTimeout(timeout);
            window.updateDebug("조회 오류: " + error.message);
            reject(error);
        });
    });
};

window.getPost = function (collectionName, id) {
    return db.collection(collectionName).doc(String(id)).get().then(doc => {
        if (doc.exists) return { id: doc.id, ...doc.data() };
        return null;
    });
};

window.savePost = function (collectionName, data) {
    window.updateDebug("저장 중...");
    console.log("savePost called with data:", data);

    if (!data.id) data.id = String(Date.now());
    if (!data.date) data.date = new Date().toISOString().split('T')[0];

    // ULTRA-AGGRESSIVE sanitization - completely rebuild the object
    const cleanData = {};

    // Only copy primitive values and simple objects
    for (let key in data) {
        if (!data.hasOwnProperty(key)) continue;

        const value = data[key];

        // Skip undefined and null
        if (value === undefined || value === null) {
            cleanData[key] = value;
            continue;
        }

        // Handle file objects specially
        if (key === 'file' || key === 'file2') {
            if (value && typeof value === 'object') {
                // Create a completely new object with ONLY the properties we need
                const fileObj = {};

                if (value.name) fileObj.name = String(value.name);
                if (value.size) fileObj.size = Number(value.size);
                if (value.type) fileObj.type = String(value.type);
                if (value.url) fileObj.url = String(value.url);
                if (value.data) fileObj.data = String(value.data);

                // Only include if we have at least a name
                if (fileObj.name) {
                    cleanData[key] = fileObj;
                }
            }
            continue;
        }

        // For all other properties, ensure they're primitives
        const valueType = typeof value;

        if (valueType === 'string') {
            cleanData[key] = String(value);
        } else if (valueType === 'number') {
            cleanData[key] = Number(value);
        } else if (valueType === 'boolean') {
            cleanData[key] = Boolean(value);
        } else if (valueType === 'object') {
            // For any other object, try JSON round-trip
            try {
                const jsonStr = JSON.stringify(value);
                cleanData[key] = JSON.parse(jsonStr);
            } catch (e) {
                console.warn(`Could not serialize property ${key}, skipping`, e);
            }
        }
    }

    console.log("Clean data to be saved:", JSON.stringify(cleanData, null, 2));

    return db.collection(collectionName).doc(String(cleanData.id)).set(cleanData).then(() => {
        window.updateDebug("저장 성공!");
        return data;
    }).catch(e => {
        console.error("Firestore save error:", e);
        console.error("Failed data structure:", cleanData);
        window.updateDebug("저장 실패: " + e.message);
        throw e;
    });
};

window.deletePost = function (collectionName, id) {
    return db.collection(collectionName).doc(String(id)).delete();
};

// Internal Fallback Helper
function attemptFallback(file, reason) {
    if (!window.updateDebug) console.log("Fallback: " + reason);
    else window.updateDebug("서버 업로드 실패(" + reason + "). 문서 직접 저장 시도...");

    return new Promise((resolve, reject) => {
        // Firestore limit is 1MB. Safety limit 5MB for fallback.
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error("업로드 실패 (보안/네트워크). 파일이 너무 커서(5MB↑) 문서에 직접 저장할 수도 없습니다."));
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            if (window.updateDebug) window.updateDebug("문서 직접 저장(Base64) 완료.");
            // Return only primitive types that Firestore can serialize
            resolve({
                name: String(file.name || ''),
                data: String(e.target.result || ''),
                size: Number(file.size || 0),
                type: String(file.type || ''),
                isFallback: true
            });
        };
        reader.onerror = () => reject(new Error("파일 읽기 실패"));
        reader.readAsDataURL(file);
    });
}

window.uploadFile = function (file) {
    if (!file) return Promise.resolve(null);

    // Extract file properties IMMEDIATELY to avoid any File object references
    const fileName = String(file.name);
    const fileSize = Number(file.size);
    const fileType = String(file.type);

    if (window.updateDebug) window.updateDebug("파일 업로드 시작: " + fileName + " (" + (fileSize / 1024 / 1024).toFixed(2) + "MB)");

    return new Promise((resolve, reject) => {
        // Strict 1MB limit for Firestore compatibility
        if (fileSize >= 1 * 1024 * 1024) {
            reject(new Error("파일 크기가 1MB를 초과합니다. 이미지를 압축해주세요."));
            return;
        }

        // Convert to Base64 for Firestore storage
        const reader = new FileReader();
        reader.onload = (e) => {
            if (window.updateDebug) window.updateDebug("Base64 변환 완료");
            // Return ONLY plain object with primitive values
            resolve({
                name: fileName,
                data: String(e.target.result),
                size: fileSize,
                type: fileType
            });
        };
        reader.onerror = () => reject(new Error("파일 읽기 실패"));
        reader.readAsDataURL(file);
    });
};

window.ensureAuth = function () {
    return new Promise((resolve, reject) => {
        if (auth && auth.currentUser) resolve(auth.currentUser);
        else {
            // quick check
            setTimeout(() => {
                if (auth && auth.currentUser) resolve(auth.currentUser);
                else reject("로그인(인증) 대기 시간 초과");
            }, 2000);
        }
    });
};

// --- COMMENT SYSTEM ---

window.getComments = function (boardKey, postId) {
    if (window.updateDebug) window.updateDebug(`댓글 조회: ${boardKey}/${postId}`);
    return new Promise((resolve, reject) => {
        if (!db) { reject(new Error("DB 미연결")); return; }

        db.collection(boardKey).doc(String(postId)).collection('comments')
            .orderBy('date', 'asc')
            .get()
            .then((snapshot) => {
                const comments = [];
                snapshot.forEach((doc) => {
                    comments.push({ id: doc.id, ...doc.data() });
                });
                if (window.updateDebug) window.updateDebug(`댓글 ${comments.length}건 로드됨`);
                resolve(comments);
            })
            .catch((error) => {
                console.error("댓글 조회 오류:", error);
                if (window.updateDebug) window.updateDebug("댓글 조회 오류: " + error.message);
                reject(error);
            });
    });
};

window.addComment = function (boardKey, postId, comment) {
    if (window.updateDebug) window.updateDebug("댓글 저장 중...");
    if (!comment.date) comment.date = new Date().toISOString().split('T')[0];
    if (!comment.author) comment.author = "익명";

    return db.collection(boardKey).doc(String(postId)).collection('comments')
        .add(comment)
        .then((docRef) => {
            if (window.updateDebug) window.updateDebug("댓글 저장 성공!");
            return { id: docRef.id, ...comment };
        })
        .catch(e => {
            if (window.updateDebug) window.updateDebug("댓글 저장 실패: " + e.message);
            throw e;
        });
};

window.deleteComment = function (boardKey, postId, commentId) {
    return db.collection(boardKey).doc(String(postId)).collection('comments')
        .doc(String(commentId))
        .delete();
};

// --- RENDER HELPERS (Global) ---

window.renderNoticeList = function (containerId) {
    const tbody = document.getElementById(containerId);
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">로딩 중...</td></tr>';

    window.getPosts(COMM_KEYS.NOTICE).then(list => {
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        let html = '';
        if (list.length === 0) html = '<tr><td colspan="4" style="text-align:center;">글이 없습니다.</td></tr>';
        else {
            list.forEach((n, i) => {
                html += `<tr>
                    <td class="num">${list.length - i}</td>
                    <td class="title" style="text-align:left;"><a href="notice.html?id=${n.id}">${n.title}</a> ${n.file ? '💾' : ''}</td>
                    <td class="name">${n.author}</td>
                    <td class="date">${n.date}</td>
                </tr>`;
            });
        }
        tbody.innerHTML = html;
    }).catch(e => {
        tbody.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">오류: ${e.message}</td></tr>`;
    });
};

window.renderInquiryList = function (containerId) {
    const tbody = document.getElementById(containerId);
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">로딩 중...</td></tr>';

    window.getPosts(COMM_KEYS.INQUIRY).then(list => {
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        let html = '';
        if (list.length === 0) html = '<tr><td colspan="5" style="text-align:center;">글이 없습니다.</td></tr>';
        else {
            list.forEach((q, i) => {
                const secret = q.secret ? '🔒' : '';
                const link = `<a href="#" onclick="window.viewPost(event, '${q.id}')">${q.title}</a>`;
                html += `<tr>
                    <td class="num">${list.length - i}</td>
                    <td class="title" style="text-align:left;">${link} ${secret}</td>
                    <td class="name">${q.author}</td>
                    <td class="date">${q.date}</td>
                    <td class="status">${q.status || '대기'}</td>
                </tr>`;
            });
        }
        tbody.innerHTML = html;
    }).catch(e => {
        tbody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">오류: ${e.message}</td></tr>`;
    });
};

window.renderReviewList = function (containerId) {
    const tbody = document.getElementById(containerId);
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">로딩 중...</td></tr>';

    window.getPosts(COMM_KEYS.REVIEW).then(list => {
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        let html = '';
        if (list.length === 0) html = '<tr><td colspan="5" style="text-align:center;">글이 없습니다.</td></tr>';
        else {
            list.forEach((r, i) => {
                const stars = '★'.repeat(parseInt(r.rating || 5));
                const link = `<a href="#" onclick="window.viewPost(event, '${r.id}')">${r.title}</a>`;
                html += `<tr>
                    <td class="num">${list.length - i}</td>
                    <td class="title" style="text-align:left;">${link} ${r.file ? '📷' : ''}</td>
                    <td class="name">${r.author}</td>
                    <td class="date">${r.date}</td>
                    <td class="status" style="color:orange;">${stars}</td>
                </tr>`;
            });
        }
        tbody.innerHTML = html;
    }).catch(e => {
        tbody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">오류: ${e.message}</td></tr>`;
    });
};
