---
description: 반응형 웹 전환 작업 가이드
---

# 반응형 웹 전환 워크플로우

## 목표
데스크톱 전용 웹사이트를 완전한 반응형 웹사이트로 전환

## 작업 전 체크리스트
- [x] 현재 상태 확인 (커밋: 8946f52)
- [x] 인코딩 상태 확인 (UTF-8 정상)
- [ ] Git 커밋으로 백업
- [ ] 반응형 CSS 작성
- [ ] 모바일 메뉴 구현
- [ ] 테스트

## 단계별 작업

### 1단계: 백업 및 준비
```bash
# 현재 상태 커밋
git add .
git commit -m "Backup before responsive conversion"
git push origin main
```

### 2단계: 반응형 CSS 생성
- 파일: `css/responsive.css` 생성
- 브레이크포인트:
  - Mobile: 0-767px
  - Tablet: 768-1023px
  - Desktop: 1024px+

### 3단계: HTML 뷰포트 변경
모든 HTML 파일의 viewport를:
```html
<!-- 변경 전 -->
<meta name="viewport" content="width=1200">

<!-- 변경 후 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
```

### 4단계: 모바일 메뉴 구현
- 햄버거 메뉴 아이콘 추가
- 모바일 메뉴 슬라이드 구현
- JavaScript 이벤트 핸들러 추가

### 5단계: 레이아웃 조정
- 고정 너비 → 유동 너비 (max-width)
- 폰트 크기 조정 (rem 단위)
- 이미지 반응형 처리
- 그리드/플렉스박스 조정

### 6단계: 테스트
- Chrome DevTools로 모바일 시뮬레이션
- 실제 모바일 기기 테스트
- 다양한 화면 크기 확인

## 주의사항
⚠️ **인코딩 문제 방지**
- 모든 파일은 UTF-8 인코딩 유지
- 한글 텍스트 수정 시 주의
- 저장 전 인코딩 확인

⚠️ **점진적 적용**
- 한 번에 모든 페이지 수정하지 않기
- index.html부터 시작
- 테스트 후 다른 페이지 적용

⚠️ **Git 커밋 주기**
- 각 단계마다 커밋
- 문제 발생 시 롤백 가능하도록

## 롤백 방법
문제 발생 시:
```bash
git reset --hard 8946f52
```
