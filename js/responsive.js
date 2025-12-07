/**
 * 반응형 모바일 메뉴 스크립트
 * 대전 괴곡동 농업회사법인 꾸지뽕 사업단
 */

(function () {
    'use strict';

    // DOM이 로드된 후 실행
    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initSubmenuToggle();
        initMenuOverlay();
    });

    /**
     * 모바일 메뉴 초기화
     */
    function initMobileMenu() {
        // 햄버거 메뉴 버튼 생성
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.setAttribute('aria-label', '메뉴 열기');
        menuToggle.innerHTML = '<span></span><span></span><span></span>';

        // body에 추가
        document.body.insertBefore(menuToggle, document.body.firstChild);

        // 메뉴 영역 가져오기
        const menuArea = document.querySelector('.menu_area');
        if (!menuArea) return;

        // 오버레이 생성
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(overlay);

        // 메뉴 토글 이벤트
        menuToggle.addEventListener('click', function () {
            const isActive = menuArea.classList.contains('active');

            if (isActive) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // 오버레이 클릭 시 메뉴 닫기
        overlay.addEventListener('click', closeMenu);

        // ESC 키로 메뉴 닫기
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menuArea.classList.contains('active')) {
                closeMenu();
            }
        });

        function openMenu() {
            menuArea.classList.add('active');
            menuToggle.classList.add('active');
            menuToggle.setAttribute('aria-label', '메뉴 닫기');
            overlay.style.display = 'block';
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            menuArea.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-label', '메뉴 열기');
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
            document.body.style.overflow = '';
        }
    }

    /**
     * 서브메뉴 토글 초기화 (모바일)
     */
    function initSubmenuToggle() {
        const menuItems = document.querySelectorAll('.menu_tab ul.gnb > li');

        menuItems.forEach(function (item) {
            const submenu = item.querySelector('ul');

            if (submenu) {
                item.classList.add('has-submenu');

                // 모바일에서만 작동
                const link = item.querySelector('a');
                if (link) {
                    link.addEventListener('click', function (e) {
                        // 모바일 화면에서만 토글
                        if (window.innerWidth <= 767) {
                            e.preventDefault();
                            item.classList.toggle('active');
                        }
                    });
                }
            }
        });
    }

    /**
     * 메뉴 오버레이 초기화
     */
    function initMenuOverlay() {
        // 화면 크기 변경 시 메뉴 상태 리셋
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                if (window.innerWidth > 767) {
                    const menuArea = document.querySelector('.menu_area');
                    const menuToggle = document.querySelector('.mobile-menu-toggle');
                    const overlay = document.querySelector('.mobile-menu-overlay');

                    if (menuArea) menuArea.classList.remove('active');
                    if (menuToggle) menuToggle.classList.remove('active');
                    if (overlay) {
                        overlay.style.opacity = '0';
                        overlay.style.display = 'none';
                    }
                    document.body.style.overflow = '';
                }
            }, 250);
        });
    }

    /**
     * 부드러운 스크롤
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#top') {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // 부드러운 스크롤 초기화
    initSmoothScroll();

})();
