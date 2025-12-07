/**
 * 웹 접근성 개선 스크립트 (간소화 버전)
 * 기존 레이아웃을 유지하면서 접근성만 개선
 */

(function () {
    'use strict';

    /**
     * ARIA 레이블 추가
     */
    function addAriaLabels() {
        // 메인 네비게이션
        const mainNav = document.querySelector('.menu_tab ul.gnb');
        if (mainNav) {
            mainNav.setAttribute('role', 'navigation');
            mainNav.setAttribute('aria-label', '주 메뉴');
        }

        // 로고 링크
        const logoLinks = document.querySelectorAll('.sub_logo a, .main_logo a');
        logoLinks.forEach(link => {
            if (!link.getAttribute('aria-label')) {
                link.setAttribute('aria-label', '홈페이지 메인으로 이동');
            }
        });

        // 이미지 alt 속성 확인
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            const src = img.getAttribute('src') || '';
            const filename = src.split('/').pop().split('.')[0];
            img.setAttribute('alt', filename || '이미지');
        });
    }

    /**
     * 키보드 네비게이션 개선
     */
    function improveKeyboardNavigation() {
        // 포커스 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            a:focus, button:focus, input:focus, textarea:focus, select:focus {
                outline: 2px solid #c31d22;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 초기화
     */
    function init() {
        addAriaLabels();
        improveKeyboardNavigation();
    }

    // DOM 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
