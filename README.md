# 🎖️ 오피서노트 (OfficerNote)
> **초임 장교(소위)를 위한 군 생활 통합 일정 및 병력 관리 솔루션**  
> *기말고사 프로젝트 | GitHub Pages 배포 & Supabase 클라우드 연동*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-오피서노트%20웹사이트%20바로가기-10B981?style=for-the-badge&logo=github)](https://jeongyunsig23-tech.github.io/officer-note/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

👉 **공식 배포 웹 사이트 URL:** [https://jeongyunsig23-tech.github.io/officer-note/](https://jeongyunsig23-tech.github.io/officer-note/)  
*(스마트폰 및 PC 어디서든 별도 설치 없이 즉시 접속 가능)*

---

## 📌 1. 프로젝트 개요 (Introduction)

### 1.1 개발 배경 및 필요성
- 초임 장교(소위)로 부대에 임관하면 **익숙하지 않은 당직사관 근무, 빈번한 야외 훈련, 소대원 병력 관리 및 면담, 군장 결속 점검, 복잡한 인원 결산 보고** 등 수많은 과업을 동시에 지휘·관리해야 합니다.
- 기존 상용 캘린더는 **'당직 근무 후 익일 비번 휴무 자동 생성'**, **'소대원 전역 D-Day 및 복무율 계산'**, **'점호 인원보고 표준 양식 생성'**, **'단독/완전군장 준비물 템플릿'** 등 군 특화 실무를 전혀 지원하지 못합니다.
- 이에 **소위 임관 후 실질적으로 필요한 모든 일정과 지휘 도구를 하나의 통합 웹 앱으로 제공**하고, **클라우드 데이터베이스(Supabase) 및 버전 관리/무료 호스팅(GitHub Pages)**을 적용한 완성도 높은 실무 솔루션을 개발하였습니다.

---

## 🛠️ 2. 기술 스택 및 아키텍처 (Tech Stack)

Node.js 등의 무거운 런타임 종속성 없이, **가볍고 빠른 브라우저 네이티브 기술과 모던 클라우드 BaaS**를 융합하여 구현되었습니다.

| 영역 | 사용 기술 | 선정 사유 |
| :--- | :--- | :--- |
| **Frontend** | HTML5, Modern JavaScript (ES6+) | 설치/빌드 에러 없는 경량성과 빠른 브라우저 렌더링 성능 |
| **Styling** | Tailwind CSS (CDN) | 국방 모던 밀리터리 다크 테마 및 모바일 반응형 UI 구축 |
| **Icons** | Lucide Icons (CDN) | 직관적인 군사/업무 심볼 아이콘 제공 |
| **Database & Auth** | **Supabase (PostgreSQL)** | 관계형 데이터 모델링, 실시간 동기화 및 강력한 보안 |
| **Security** | **Row Level Security (RLS)** | 군사 기밀 및 개인 데이터 격리 보안 정책 적용 |
| **Deployment** | **GitHub Pages** | GitHub 레포지토리 기반 글로벌 무료 CDN 웹 호스팅 |

---

## 🌟 3. 핵심 킬러 기능 (Key Features)

### 1) 👥 소대원 병력 관리 & 상담 일지 (NEW! ⭐)
- **소대원 프로필 등록**: 이름, 계급, 보직, 입대일, 지병/알레르기 특이사항 기록.
- **전역 D-Day 및 복무율(%) 실시간 자동 계산 엔진**: 육군 18개월 복무 기준 전역일과 복무 게이지 바 시각화.
- **소대장 면담 일지 기록**: 신병 적응 관찰, 고민 상담 내용 및 조치사항을 대상자별로 영구 누적 관리.

### 2) 🛡️ 당직 및 근무 관리 (Duty Hub)
- **당직사관 / 당직사령 / 상황실 근무 등록**
- **당직 익일 '비번' 일정 자동 캘린더 생성 엔진**: 당직 등록 시 다음 날 휴식 일정이 자동으로 생성 및 연동.
- **당직사관 순찰 & 교대 체크리스트**: 총기/탄약고 열쇠 수불, 암구호 수령 등 필수 항목을 **직접 추가/삭제/복원** 가능.
- **원클릭 점호 인원보고 양식 생성기**: 총원, 현재원, 환자, 휴가자를 입력하면 국방 표준 점호 보고 텍스트를 즉시 생성 및 클립보드 복사.

### 3) 📊 일정 엑셀(CSV) 내보내기 & 인쇄 최적화 (NEW! ⭐)
- 캘린더에 등록된 모든 군 일정 데이터를 **한글 UTF-8 BOM 인코딩이 적용된 엑셀(CSV) 파일로 원클릭 다운로드**.
- 부대 게시판 부착용 **깔끔한 인쇄 및 PDF 저장(Ctrl + P)** 레이아웃 지원.

### 4) 🎒 훈련 및 준비물 체크리스트 (Gear Checklist)
- **원클릭 훈련 템플릿 로드**:
  - **단독군장 세트**: 방탄모, 요대, 방독면, 무전기, 암구호 수첩, 피아식별띠 등
  - **완전군장 세트**: 배낭, 침낭, 모포, 야전삽, 반합, 전투식량, 세면도구 등
  - **사격훈련 세트**: 귀마개, 총기방청유, 탄피받이, 표적지, 지휘봉 등
  - **초임 장교 지휘세트**: 작전수첩, 나침반, 지휘도판, 호루라기, 야간 플래시 등

### 5) 🔄 반복 일정 자동 등록 엔진 (Recurring Engine)
- 매주 수요일(전투체육), 매월 정기점검, 주기적 당직 로테이션 패턴을 지정된 기간 동안 **수십 개의 캘린더 일정으로 일괄 자동 생성**.

### 6) ✈️ 개인 휴가 플래너 & D-Day 계산기
- 장교 정기 연가(총 21일) 기준 **사용 일수 및 잔여일수 자동 계산 및 프로그레스 바 시각화**.
- 다음 예정 휴가 출발일 기준 **실시간 D-Day 카운트다운**.

---

## 🗄️ 4. 데이터베이스 설계 및 보안 (Supabase Schema & RLS)

### 4.1 ERD 구조 (테이블 명세)

```
[auth.users] (Supabase Auth)
     │ 1
     ├── (1:1) ── [profiles] (군번, 계급, 소속 부대, 임관일)
     ├── (1:N) ── [schedules] (일정 구분, 시작/종료일, 당직 유형, 위치)
     │                 │ 1
     │                 └── (1:N) ── [checklists] (일정별 준비물 및 완료 여부)
     ├── (1:N) ── [duty_logs] (점호 인원 결산, 총원, 현재원, 특이사항)
     ├── (1:N) ── [vacations] (연가/포상/위로, 사용일수, 행선지)
     └── (1:N) ── [platoon_members] (소대원 이름, 입대일, 특이사항, 면담기록)
```

### 4.2 Row Level Security (RLS) 보안 정책 (⭐ 가산점 핵심 포인트)
- 군사 일정 및 병력 정보의 보안성을 극대화하기 위해 Supabase PostgreSQL의 **RLS(행 단위 보안 정책)**을 전면 적용하였습니다.
- 각 사용자는 오직 본인의 `auth.uid()`와 일치하는 레코드만 조회(`SELECT`), 삽입(`INSERT`), 수정(`UPDATE`), 삭제(`DELETE`)할 수 있도록 차단되어 있습니다.

```sql
-- RLS 활성화 예시
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own schedules" 
    ON public.schedules FOR ALL USING (auth.uid() = user_id);
```

---

## 🚀 5. 시작 및 실행 방법 (How to Run)

### 5.1 웹 사이트에서 바로 실행하기 (무설치)
* 배포 URL: [https://jeongyunsig23-tech.github.io/officer-note/](https://jeongyunsig23-tech.github.io/officer-note/)
* 접속 즉시 내장된 로컬 스토리지 엔진을 통해 모든 기능을 100% 체험하실 수 있습니다.

### 5.2 Supabase 클라우드 데이터베이스 연동하기
1. [supabase.com](https://supabase.com)에 로그인 후 프로젝트를 생성합니다.
2. 좌측 메뉴 **SQL Editor**로 이동하여 본 저장소의 `supabase-schema.sql` 내용을 복사해 붙여넣고 **Run**을 실행합니다.
3. **Project Settings -> API Keys**에서 `Project URL`과 `Publishable key`를 복사합니다.
4. 웹 앱 우측 상단의 **[로컬 모드 (설정 클릭)]** 버튼을 눌러 URL과 Key를 입력하고 저장하면 클라우드 DB와 실시간 연동됩니다.

---

## 📝 6. 기말고사 과제 평가 체크포인트

- [x] **주제 적합성**: 소위 임관에 필요한 당직, 훈련, 군장 준비물, 휴가, 소대원 병력 관리 등 완벽 반영
- [x] **Supabase 연동**: PostgreSQL 관계형 DB 정규화 및 RLS 보안 정책 적용
- [x] **반복 일정 및 D-Day 알고리즘**: 주간/격주/월간 스케줄 자동 생성 및 복무율(%) 실시간 계산 엔진
- [x] **실무 데이터 내보내기**: 엑셀(CSV) 다운로드 및 인쇄(PDF) 기능 지원
- [x] **반응형 UX/UI**: 스마트폰 모바일 화면 및 PC 데스크톱 완벽 지원 (다크 테마)
- [x] **GitHub 버전 관리 & 배포**: GitHub Pages를 통한 무중단 글로벌 웹 배포 완료
