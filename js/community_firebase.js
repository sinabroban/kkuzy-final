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
    if (!data.id) data.id = String(Date.now());
    if (!data.date) data.date = new Date().toISOString().split('T')[0];

    // Sanitize file objects to prevent Firestore nested entity errors
    const sanitizeFile = (f) => {
        if (!f) return null;
        if (typeof f !== 'object') return null;

        const result = {
            name: String(f.name || ''),
            size: Number(f.size || 0)
        };

        // Include URL if available (successful Firebase Storage upload)
        if (f.url) {
            result.url = String(f.url);
        }

        // Include Base64 data ONLY if:
        // 1. No URL (fallback case)
        // 2. File is small enough (< 5MB to stay under Firestore document limit)
        if (!f.url && f.data && f.size < 5 * 1024 * 1024) {
            result.data = String(f.data);
        }

        return result;
    };

    // Create a clean copy of data
    const cleanData = { ...data };
    if (cleanData.file) cleanData.file = sanitizeFile(cleanData.file);
    if (cleanData.file2) cleanData.file2 = sanitizeFile(cleanData.file2);

    return db.collection(collectionName).doc(String(cleanData.id)).set(cleanData, { merge: true }).then(() => {
        window.updateDebug("저장 성공!");
        return data;
    }).catch(e => {
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
            resolve({ name: file.name, data: e.target.result, size: file.size, isFallback: true });
        };
        reader.onerror = () => reject(new Error("파일 읽기 실패"));
        reader.readAsDataURL(file);
    });
}

window.uploadFile = function (file) {
    if (!file) return Promise.resolve(null);
    if (window.updateDebug) window.updateDebug("파일 업로드 시작: " + file.name + " (" + (file.size / 1024 / 1024).toFixed(2) + "MB)");

    return new Promise((resolve, reject) => {
        let timer = null;
        let isComplete = false;

        // For files under 5MB, use Base64 directly (more reliable)
        if (file.size < 5 * 1024 * 1024) {
            attemptFallback(file, "Direct Base64 (under 5MB)").then(resolve).catch(reject);
            return;
        }

        if (!storage) {
            attemptFallback(file, "Storage 미초기화").then(resolve).catch(reject);
            return;
        }

        const ref = storage.ref().child('uploads/' + Date.now() + '_' + file.name);
        const uploadTask = ref.put(file);

        // 2. Timeout (10s)
        timer = setTimeout(() => {
            if (!isComplete) {
                isComplete = true; // prevent racing
                uploadTask.cancel();
                console.warn("Upload Timeout");
                attemptFallback(file, "시간 초과 10초").then(resolve).catch(reject);
            }
        }, 10000);

        uploadTask.on('state_changed',
            (snapshot) => { },
            (error) => {
                if (isComplete) return;
                isComplete = true;
                clearTimeout(timer);
                console.error("Upload Error", error);
                attemptFallback(file, error.message).then(resolve).catch(reject);
            },
            () => {
                if (isComplete) return;
                isComplete = true;
                clearTimeout(timer);
                uploadTask.snapshot.ref.getDownloadURL().then(url => {
                    if (window.updateDebug) window.updateDebug("서버 업로드 성공!");
                    resolve({ name: file.name, url: url, size: file.size });
                }).catch(e => {
                    attemptFallback(file, "URL 획득 실패").then(resolve).catch(reject);
                });
            }
        );
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
