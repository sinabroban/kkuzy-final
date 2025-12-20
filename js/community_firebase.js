/**
 * Community Logic - Firebase Version
 * Replaces community_common.js to use Firestore for shared data.
 */

// Import Firebase (ES Modules via CDN for static site)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, orderBy, limit, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// --- CONFIGURATION ---
// TODO: USER MUST REPLACE THIS WITH THEIR OWN CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyDxmxP6LPDM69GdXpCTrv9_WgZllzs3bv8",
    authDomain: "homepage-5534d.firebaseapp.com",
    projectId: "homepage-5534d",
    storageBucket: "homepage-5534d.firebasestorage.app",
    messagingSenderId: "445520729520",
    appId: "1:445520729520:web:30692dc01acc2ee81db275",
    measurementId: "G-RMRC5JHJSL"
};

// Initialize only if not already done (though module scope prevents double init usually)
let app, db, auth, storage;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    // Auto-sign in anonymously for guest access (if not already signed in)
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Firebase Auth State: Signed In", user.uid);
        } else {
            console.log("Firebase Auth State: Signed Out. Attempting Anonymous Sign-in...");
            signInAnonymously(auth).catch((error) => {
                console.error("Anonymous Sign-in Failed:", error);
                // We don't alert here to avoid annoying popups on load, but upload might fail later.
            });
        }
    });

    console.log("Firebase Initialized");
} catch (e) {
    console.error("Firebase Init Error (Did you set the keys?):", e);
    alert("치명적 오류: 파이어베이스 초기화 실패.\n" + e.message);
}

export function isFirebaseInitialized() {
    return !!app && !!auth;
}

export function ensureAuth() {
    return new Promise((resolve, reject) => {
        if (!auth) {
            reject("Firebase Auth not initialized");
            return;
        }
        if (auth.currentUser) {
            resolve(auth.currentUser);
            return;
        }

        // Timeout Safety
        const timer = setTimeout(() => {
            reject("인증 시간 초과 (10초). 네트워크 상태를 확인하거나 새로고침 해주세요.");
        }, 10000);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            clearTimeout(timer);
            unsubscribe();
            if (user) {
                resolve(user);
            } else {
                signInAnonymously(auth).then(resolve).catch((e) => {
                    console.error("Anonymous Auth Failed:", e);
                    if (e.code === 'auth/operation-not-allowed' || e.code === 'auth/configuration-not-found' || e.code === 'auth/admin-restricted-operation') {
                        reject("관리자 설정 필요: Firebase Console -> Build -> Authentication -> Sign-in method 탭에서 '익명(Anonymous)' 로그인을 '사용 설정(Enable)' 해주세요.");
                    } else {
                        reject("인증 실패: " + e.message);
                    }
                });
            }
        });
    });
}

export const COMM_KEYS = {
    NOTICE: 'notices',      // Changed from kkuzy_notices for cleaner specific collections
    INQUIRY: 'inquiries',
    REVIEW: 'reviews',
    COMMENTS: 'comments'    // stored as subcollection or separate collection
};

/**
 * Reads a file and returns object with Base64 data.
 * Firestore Document Limit is 1MB. We limit files to ~700KB to be safe.
 */
export function readFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        if (file.size > 500 * 1024) { // 500KB Limit to prevent oversize documents
            alert("첨부 파일 용량이 500KB를 초과하여 파일명만 저장됩니다. (공유 DB 용량 제한)");
            resolve({
                name: file.name,
                size: file.size,
                type: file.type,
                data: null,
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
        reader.readAsDataURL(file);
    });
}

// --- Post CRUD (Async now!) ---

export async function getPosts(collectionName) {
    if (!db) {
        alert("데이터베이스 연결 끊김: 초기화가 되지 않았습니다.");
        return [];
    }
    try {
        // alert(`DEBUG: Fetching from ${collectionName}...`); // Too noisy for init
        const q = query(collection(db, collectionName));
        const querySnapshot = await getDocs(q);
        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });
        alert(`DEBUG: Fetched ${posts.length} posts from ${collectionName}`); // UNCOMMENTED
        if (posts.length === 0) console.warn(`No posts found in ${collectionName}`);
        return posts;
    } catch (e) {
        console.error("Error getting documents: ", e);
        alert(`데이터 불러오기 실패 (${collectionName}): ${e.message}`);
        return [];
    }
}

export async function getPost(boardKey, id) {
    if (!db) return null;
    // In our old system, ID was an int. In Firestore, it's a string (doc ID).
    // We will support both by trying to find valid doc.
    try {
        // If we are calling getPost from a list that already has the ID, we can just fetch it.
        // However, we often used array.find in the old code. 
        // Here we must fetch specific doc.

        // Note: For simplicity in migration, if ID is passed, we fetch that doc.
        const docRef = doc(db, boardKey, String(id));
        const docSnap = await getDocs(query(collection(db, boardKey))); // Inefficient to fetch all, but IDs might be custom

        // Better approach: fetch all and find (like before) OR fetch specific.
        // Let's stick to 'fetch specific' if we have the ID.
        // BUT, our legacy IDs were numbers. Firestore IDs are strings.
        // We need to handle 'find by property id' vs 'find by doc id'.
        // To keep it simple: We will use Timestamp as ID for new posts.

        // Let's just re-use getPosts and find for now to match old logic signature exactly?
        // No, that's inefficient.
        // Let's assume ID is the Document Key.

        // FIX: The old code used integer IDs. We should transition to String IDs.
        // But for compatibility with existing URL params, we can just treat them as strings.
        return (await getPosts(boardKey)).find(p => String(p.id) === String(id));
    } catch (e) {
        console.error("Error getting post:", e);
        return null;
    }
}

export async function savePost(collectionName, data) {
    if (!db) {
        alert("데이터베이스 연결 실패. 페이지를 새로고침 해주세요.");
        return null;
    }
    try {
        if (data.id) {
            // Update
            const docRef = doc(db, collectionName, String(data.id));
            await setDoc(docRef, data, { merge: true });
            // alert(`DEBUG: Updated doc ${data.id} in ${collectionName}`);
        } else {
            // Create
            // We use Date.now() as ID to keep sorting simple and consistent with old style unique IDs
            const newId = String(Date.now());
            data.id = newId;
            await setDoc(doc(db, collectionName, newId), data);
            // alert(`DEBUG: Created new doc ${newId} in ${collectionName}`);
        }
        return data;
    } catch (e) {
        console.error("Error saving post:", e);
        alert(`저장 실패 (${collectionName}): ${e.message}`);
        return null;
    }
}

export async function deletePost(boardKey, id) {
    if (!db) return;
    try {
        await deleteDoc(doc(db, boardKey, String(id)));
        return true;
    } catch (e) {
        console.error("Error deleting post:", e);
        alert("삭제 중 오류가 발생했습니다: " + e.message);
        return false;
    }
}

export async function verifyPassword(boardKey, id, password) {
    const post = await getPost(boardKey, id);
    if (!post) return false;
    return post.password === password;
}

// --- Comments ---

export async function getComments(boardKey, postId) {
    if (!db) return [];
    try {
        // Sub-collection 'comments' under the post document
        const q = query(collection(db, boardKey, String(postId), "comments"), orderBy("date", "asc"));
        const querySnapshot = await getDocs(q);
        const comments = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // id is doc.id
            comments.push({ id: doc.id, ...data });
        });
        return comments;
    } catch (e) {
        console.error("Error getting comments:", e);
        return [];
    }
}

export async function addComment(boardKey, postId, comment) {
    if (!db) return;
    try {
        comment.date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        // Add to subcollection
        await addDoc(collection(db, boardKey, String(postId), "comments"), comment);
    } catch (e) {
        console.error("Error adding comment:", e);
    }
}

// --- Authentication (Admin) ---

export async function adminLogin(email, password) {
    if (!auth) {
        throw new Error("Firebase Auth가 초기화되지 않았습니다. 설정(firebaseConfig)을 확인해주세요.");
    }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Login Failed", error);
        throw error;
    }
}

export async function adminLogout() {
    if (!auth) return;
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Failed", error);
    }
}

export function monitorAuth(callback) {
    if (!auth) return;
    onAuthStateChanged(auth, (user) => {
        callback(user);
    });
}

export function enableContentProtection() {
    document.addEventListener('contextmenu', function (e) {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });
    document.addEventListener('dragstart', function (e) {
        if (e.target.tagName === 'IMG') e.preventDefault();
    });
}

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file object to upload
 * @returns {Promise<{name: string, url: string, size: number}>}
 */
export async function uploadFile(file) {
    if (!file) return null;

    alert(`DEBUG: uploadFile 진입. 파일명: ${file.name}`);

    try {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `uploads/${timestamp}_${safeName}`;

        if (!storage) throw new Error("Firebase Storage가 초기화되지 않았습니다.");

        const storageRef = ref(storage, storagePath);

        alert(`DEBUG: 업로드 시작... \n경로: ${storagePath} \n크기: ${file.size}`);

        // Create a timeout promise
        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("업로드 시간 초과 (15초). 네트워크/방화벽/CORS 문제일 수 있습니다.")), 15000);
        });

        // Race between upload and timeout
        const snapshot = await Promise.race([
            uploadBytes(storageRef, file),
            timeout
        ]);

        alert("DEBUG: 업로드 성공! URL 가져오는 중...");
        const url = await getDownloadURL(snapshot.ref);

        return {
            name: file.name,
            url: url,
            size: file.size,
            storagePath: storagePath
        };
    } catch (e) {
        console.error("Upload failed:", e);
        // Specialized error messages
        let msg = e.message;
        if (msg.includes('storage/unauthorized')) {
            msg = "권한 없음 (Firebase Storage Rules를 확인하세요. 'allow write: if true;' 혹은 'if request.auth != null;')";
        } else if (msg.includes('storage/canceled')) {
            msg = "업로드가 취소되었습니다.";
        } else if (msg.includes('network') || msg.includes('CORS')) {
            msg = "네트워크 오류 (CORS 설정이나 인터넷 연결을 확인하세요).";
        }

        alert(`파일 업로드 실패:\n${msg}`);

        // FALLBACK: Try to save as Base64 (Legacy Mode) to bypass CORS
        if (msg.includes('CORS') || msg.includes('네트워크') || msg.includes('초과')) {
            const fallbackChoice = confirm("네트워크/보안 문제로 클라우드 업로드가 차단되었습니다.\n\n이미지를 문서 안에 직접 저장하시겠습니까?\n(화질이 원본보다 낮을 수 있지만 저장은 가능합니다.)");
            if (fallbackChoice) {
                try {
                    const base64Data = await readFile(file);
                    if (base64Data) {
                        alert("비상 저장 모드(Base64)로 변환 성공! 저장을 계속합니다.");
                        return {
                            name: file.name,
                            url: null, // No URL
                            data: base64Data.data, // Base64 String
                            size: file.size,
                            type: file.type,
                            storagePath: null
                        };
                    }
                } catch (readErr) {
                    console.error("Fallback failed", readErr);
                    alert("비상 저장 모드(Base64) 변환 중 오류가 발생했습니다: " + readErr.message);
                }
            }
        }

        // If fallback declined/failed, throw original
        throw e;
    }
}
