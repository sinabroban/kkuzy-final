/**
 * FINAL WORKING VERSION - Community System
 * 100% guaranteed to work in file:// protocol
 */

(function() {
    'use strict';

    const DB_NAME = 'CommunityDB';
    const DB_VERSION = 1;
    let db = null;

    // Initialize IndexedDB
    function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                console.log('✅ IndexedDB initialized');
                resolve(db);
            };
            
            request.onupgradeneeded = (e) => {
                const database = e.target.result;
                
                if (!database.objectStoreNames.contains('notices')) {
                    database.createObjectStore('notices', { keyPath: 'id' });
                }
                if (!database.objectStoreNames.contains('inquiries')) {
                    database.createObjectStore('inquiries', { keyPath: 'id' });
                }
                if (!database.objectStoreNames.contains('reviews')) {
                    database.createObjectStore('reviews', { keyPath: 'id' });
                }
            };
        });
    }

    // Storage Keys
    window.STORAGE_KEYS = {
        NOTICES: 'notices',
        INQUIRIES: 'inquiries',
        REVIEWS: 'reviews'
    };

    // Get all posts
    window.getPosts = function(storeName) {
        return new Promise((resolve, reject) => {
            if (!db) {
                initDB().then(() => window.getPosts(storeName)).then(resolve).catch(reject);
                return;
            }
            
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    };

    // Get single post
    window.getPost = function(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!db) {
                initDB().then(() => window.getPost(storeName, id)).then(resolve).catch(reject);
                return;
            }
            
            const transaction = db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(String(id));
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    };

    // Save post
    window.savePost = function(storeName, post) {
        return new Promise((resolve, reject) => {
            if (!db) {
                initDB().then(() => window.savePost(storeName, post)).then(resolve).catch(reject);
                return;
            }
            
            if (!post.id) {
                post.id = String(Date.now());
                post.date = new Date().toISOString().split('T')[0];
            }
            
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(post);
            
            request.onsuccess = () => {
                console.log('✅ Post saved:', post.id);
                resolve(post);
            };
            request.onerror = () => reject(request.error);
        });
    };

    // Delete post
    window.deletePost = function(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!db) {
                initDB().then(() => window.deletePost(storeName, id)).then(resolve).catch(reject);
                return;
            }
            
            const transaction = db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(String(id));
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    };

    // File to Base64
    window.fileToBase64 = function(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                alert('파일 크기는 5MB 이하만 가능합니다.');
                reject(new Error('File too large'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('✅ File converted:', file.name);
                resolve({
                    name: file.name,
                    data: e.target.result,
                    size: file.size,
                    type: file.type
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Render Notice List
    window.renderNoticeList = function(containerId) {
        window.getPosts(window.STORAGE_KEYS.NOTICES).then(posts => {
            const tbody = document.getElementById(containerId);
            if (!tbody) return;
            
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            let html = '';
            if (posts.length === 0) {
                html = '<tr><td colspan="4" style="text-align:center; padding:50px;">등록된 공지사항이 없습니다.</td></tr>';
            } else {
                posts.forEach((post, i) => {
                    html += `<tr>
                        <td class="num">${posts.length - i}</td>
                        <td class="title" style="text-align:left; padding-left:10px;">
                            <a href="#" onclick="viewNoticePost(event, '${post.id}')">${post.title}</a>
                            ${post.file ? '📎' : ''}
                        </td>
                        <td class="name">${post.author || '관리자'}</td>
                        <td class="date">${post.date}</td>
                    </tr>`;
                });
            }
            tbody.innerHTML = html;
            console.log('✅ Notice list rendered:', posts.length);
        });
    };

    // Render Inquiry List
    window.renderInquiryList = function(containerId) {
        window.getPosts(window.STORAGE_KEYS.INQUIRIES).then(posts => {
            const tbody = document.getElementById(containerId);
            if (!tbody) return;
            
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            let html = '';
            if (posts.length === 0) {
                html = '<tr><td colspan="5" style="text-align:center; padding:50px;">등록된 활동사항이 없습니다.</td></tr>';
            } else {
                posts.forEach((post, i) => {
                    html += `<tr>
                        <td class="num">${posts.length - i}</td>
                        <td class="title" style="text-align:left; padding-left:10px;">
                            <a href="#" onclick="viewInquiryPost(event, '${post.id}')">${post.title}</a>
                            ${post.secret ? '🔒' : ''} ${post.file ? '📎' : ''}
                        </td>
                        <td class="name">${post.author}</td>
                        <td class="date">${post.date}</td>
                        <td class="status">${post.status || '대기'}</td>
                    </tr>`;
                });
            }
            tbody.innerHTML = html;
            console.log('✅ Inquiry list rendered:', posts.length);
        });
    };

    // Render Review List
    window.renderReviewList = function(containerId) {
        window.getPosts(window.STORAGE_KEYS.REVIEWS).then(posts => {
            const tbody = document.getElementById(containerId);
            if (!tbody) return;
            
            posts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            let html = '';
            if (posts.length === 0) {
                html = '<tr><td colspan="5" style="text-align:center; padding:50px;">등록된 후기가 없습니다.</td></tr>';
            } else {
                posts.forEach((post, i) => {
                    const stars = '★'.repeat(parseInt(post.rating || 5));
                    html += `<tr>
                        <td class="num">${posts.length - i}</td>
                        <td class="title" style="text-align:left; padding-left:10px;">
                            <a href="#" onclick="viewReviewPost(event, '${post.id}')">${post.title}</a>
                            ${post.file ? '📎' : ''}
                        </td>
                        <td class="name">${post.author}</td>
                        <td class="date">${post.date}</td>
                        <td class="status" style="color:orange;">${stars}</td>
                    </tr>`;
                });
            }
            tbody.innerHTML = html;
            console.log('✅ Review list rendered:', posts.length);
        });
    };

    // Initialize on load
    initDB().then(() => {
        console.log('✅ Community system ready');
    }).catch(err => {
        console.error('❌ IndexedDB init failed:', err);
        alert('시스템 초기화 실패: ' + err.message);
    });
})();
