/**
 * 다크 모드 토글 기능
 * 로컬 스토리지에 사용자 선호도 저장
 */

(function () {
    'use strict';

    // 다크 모드 상태 확인
    function isDarkMode() {
        return localStorage.getItem('darkMode') === 'enabled';
    }

    // 다크 모드 활성화
    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
        updateToggleIcon(true);
    }

    // 다크 모드 비활성화
    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
        updateToggleIcon(false);
    }

    // 토글 아이콘 업데이트
    function updateToggleIcon(isDark) {
        const toggle = document.querySelector('.dark-mode-toggle');
        if (!toggle) return;

        if (isDark) {
            // 라이트 모드 아이콘 (해)
            toggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" fill="#ffd700"/>
                    <line x1="12" y1="1" x2="12" y2="3" stroke="#ffd700" stroke-width="2"/>
                    <line x1="12" y1="21" x2="12" y2="23" stroke="#ffd700" stroke-width="2"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#ffd700" stroke-width="2"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#ffd700" stroke-width="2"/>
                    <line x1="1" y1="12" x2="3" y2="12" stroke="#ffd700" stroke-width="2"/>
                    <line x1="21" y1="12" x2="23" y2="12" stroke="#ffd700" stroke-width="2"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#ffd700" stroke-width="2"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#ffd700" stroke-width="2"/>
                </svg>
            `;
            toggle.setAttribute('aria-label', '라이트 모드로 전환');
            toggle.title = '라이트 모드로 전환';
        } else {
            // 다크 모드 아이콘 (달)
            toggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#ffd700"/>
                </svg>
            `;
            toggle.setAttribute('aria-label', '다크 모드로 전환');
            toggle.title = '다크 모드로 전환';
        }
    }

    // 다크 모드 토글
    function toggleDarkMode() {
        if (isDarkMode()) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    }

    // 다크 모드 토글 버튼 생성
    function createDarkModeToggle() {
        // 이미 존재하면 생성하지 않음
        if (document.querySelector('.dark-mode-toggle')) return;

        const toggle = document.createElement('button');
        toggle.className = 'dark-mode-toggle';
        toggle.setAttribute('aria-label', '다크 모드로 전환');
        toggle.title = '다크 모드로 전환';

        // 초기 아이콘 설정
        updateToggleIcon(isDarkMode());

        // 클릭 이벤트
        toggle.addEventListener('click', toggleDarkMode);

        // body에 추가
        document.body.appendChild(toggle);
    }

    // 시스템 다크 모드 선호도 감지 (선택사항)
    function detectSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // 사용자가 명시적으로 설정하지 않았다면 시스템 설정 따르기
            if (localStorage.getItem('darkMode') === null) {
                enableDarkMode();
            }
        }
    }

    // 시스템 다크 모드 변경 감지
    function watchSystemPreference() {
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

            // 변경 이벤트 리스너 (최신 브라우저)
            if (darkModeQuery.addEventListener) {
                darkModeQuery.addEventListener('change', function (e) {
                    // 사용자가 명시적으로 설정하지 않았다면 시스템 설정 따르기
                    if (localStorage.getItem('darkMode') === null) {
                        if (e.matches) {
                            enableDarkMode();
                        } else {
                            disableDarkMode();
                        }
                    }
                });
            }
        }
    }

    // 초기화
    function init() {
        // 저장된 설정 확인
        if (isDarkMode()) {
            enableDarkMode();
        }

        // 다크 모드 토글 버튼 생성
        createDarkModeToggle();

        // 시스템 선호도 감지 (선택사항)
        // detectSystemPreference();
        // watchSystemPreference();

        // 키보드 단축키 (Ctrl/Cmd + Shift + D)
        document.addEventListener('keydown', function (e) {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                toggleDarkMode();
            }
        });
    }

    // DOM 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 전역 함수로 노출 (필요시)
    window.toggleDarkMode = toggleDarkMode;

})();
