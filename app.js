// ==============================================================================
// [오피서노트 (OfficerNote)] Core Application Engine
// 소위(초임 장교) 맞춤형 군 생활 통합 일정 관리 솔루션
// ==============================================================================

// 1. 전역 상태 관리
let state = {
    currentDate: new Date(2026, 10, 18), // 2026년 11월 기준
    selectedDate: '2026-11-18',
    activeTab: 'calendar',
    supabase: null,
    isSupabaseConnected: false,
    schedules: [],
    checklists: [],
    vacations: [],
    soldiers: [],
    dutySteps: [],
    dutyChecklistStatus: {},
};

// 2. 초기 기본 목데이터 (Supabase 연동 전에도 100% 정상 작동하도록 보장)
const DEFAULT_SCHEDULES = [
    {
        id: 'mock-1',
        title: '신임 소위 부대 전입 및 보직 신고',
        category: 'routine',
        start_date: '2026-11-02',
        end_date: '2026-11-02',
        location: '대대 본청 지휘통제실',
        duty_type: null,
        color: '#8b5cf6'
    },
    {
        id: 'mock-2',
        title: '[정기] 전투체육 및 체력단련',
        category: 'routine',
        start_date: '2026-11-04',
        end_date: '2026-11-04',
        location: '대연병장',
        is_recurring: true,
        recurrence_type: 'weekly',
        color: '#8b5cf6'
    },
    {
        id: 'mock-3',
        title: '대대 야간 사격 및 축사탄 사격 훈련',
        category: 'training',
        start_date: '2026-11-10',
        end_date: '2026-11-10',
        location: '제1사격장',
        color: '#ef4444'
    },
    {
        id: 'mock-4',
        title: '초임 장교 첫 당직사관 근무',
        category: 'duty',
        start_date: '2026-11-18',
        end_date: '2026-11-18',
        duty_type: '당직사관',
        location: '1중대 지휘실',
        color: '#f59e0b'
    },
    {
        id: 'mock-5',
        title: '[비번] 당직 휴무',
        category: 'routine',
        start_date: '2026-11-19',
        end_date: '2026-11-19',
        location: 'BOQ(독신자숙소)',
        color: '#10b981'
    },
    {
        id: 'mock-6',
        title: '소대전술훈련 (야외 기동)',
        category: 'training',
        start_date: '2026-11-24',
        end_date: '2026-11-26',
        location: '전술 훈련장',
        color: '#ef4444'
    }
];

const DEFAULT_DUTY_STEPS = [
    { id: 'step-1', text: '총기 및 탄약고 열쇠 수불 & 봉인 상태 확인' },
    { id: 'step-2', text: '지휘통제실 비밀 및 일일 암구호 수령' },
    { id: 'step-3', text: '일석점호 인원 결산 (총원/현재원/환자/외진)' },
    { id: 'step-4', text: '소대별 생활관 온도/환기/청결 및 화재 점검' },
    { id: 'step-5', text: '외곽 울타리 및 거수자 침투로 순찰 (야간 1차)' },
    { id: 'step-6', text: '탄약고 및 유류고 이상 유무 점검' },
    { id: 'step-7', text: '사이버지식정보방 및 취사실 소등/잠금 확인' },
    { id: 'step-8', text: '불침번 및 초병 교대 근무 상태 점검' },
    { id: 'step-9', text: '당직사령/지휘관 야간 중간보고 (22:00)' },
    { id: 'step-10', text: '심야 취약시간대 순찰 (02:00~03:00)' },
    { id: 'step-11', text: '조식 취사 지원 및 온수 공급 상태 확인' },
    { id: 'step-12', text: '일조점호 및 아침 도수체조 인원 보고' },
    { id: 'step-13', text: '총기함 열쇠 인수인계 및 당직일지 서명' }
];

const DEFAULT_SOLDIERS = [
    {
        id: 'sol-1',
        name: '김철수',
        rank: '일병',
        enlist_date: '2026-03-02',
        role: '1분대 1소총수',
        attention: '환절기 비염 증상, 관찰 요망',
        notes: [
            { date: '2026-10-15', text: '소대전입 후 성실히 적응 중. 동기들과 사이 원만함.' }
        ]
    },
    {
        id: 'sol-2',
        name: '이영희',
        rank: '이병',
        enlist_date: '2026-08-10',
        role: '2분대 유탄수',
        attention: '신병 전입 관찰 대상 (체력 관리 필요)',
        notes: [
            { date: '2026-11-05', text: '사격 훈련 전 긴장 완화 면담 진행. 자신감 북돋아 줌.' }
        ]
    },
    {
        id: 'sol-3',
        name: '박민수',
        rank: '상병',
        enlist_date: '2025-10-15',
        role: '1분대장',
        attention: '체력 특급전사, 포상휴가 2회 추천',
        notes: [
            { date: '2026-09-20', text: '분대장 임명 후 후임 지도 우수. 장교 지휘 방침 잘 따름.' }
        ]
    }
];

const PRESET_GEAR_TEMPLATES = {
    single: [
        '방탄모 (턱끈 결속 확인)',
        '전투조끼 / 탄대',
        '방독면 (필터 및 가방)',
        'K2 소총 및 탄알집',
        '수통 (식수 충용)',
        '무전기(PRC-96K) 및 예비 배터리',
        '암구호 수첩 & 작전 지도',
        '피아식별띠'
    ],
    full: [
        '완전군장 배낭',
        '모포 (모포말이)',
        '침낭 (압축 결속)',
        '야전삽 및 피켈',
        '반합 및 수저',
        '전투식량 (1일분)',
        '여벌 전투복 및 속옷/양말 세트',
        '방한도구 (방한두건, 장갑)',
        '세면도구 및 판초우의'
    ],
    shooting: [
        '사격용 귀마개',
        '총기 방청유 & 손질도구',
        '탄피받이',
        '표적지 세트',
        '안전 깃발 (적색/백색)',
        '지휘봉 및 호루라기',
        '통신 무전기'
    ],
    officer: [
        '장교 작전수첩 및 모나미볼펜',
        '나침반 (도북/자북 확인)',
        '방수 지휘도판',
        '지휘관 호루라기',
        '야간 플래시 (적색 필터 장착)',
        '손목시계 (초단위 동기화)'
    ]
};

// 3. 앱 초기화 (DOM Content Loaded)
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    loadLocalData();
    setupDefaultDates();
    renderCalendar();
    renderSelectedDateEvents();
    renderDutyChecklist();
    renderDutyScheduleList();
    renderSoldierTab();
    renderGeneralChecklist();
    renderRecurringList();
    renderVacationTab();
    updateWidgets();
    lucide.createIcons();
});

// 4. Supabase 연동 초기화
function initSupabase() {
    const savedUrl = localStorage.getItem('officer_supabase_url');
    const savedKey = localStorage.getItem('officer_supabase_key');

    const badge = document.getElementById('supabaseStatusBadge');
    const badgeText = document.getElementById('supabaseStatusText');

    if (savedUrl && savedKey && window.supabase) {
        try {
            state.supabase = window.supabase.createClient(savedUrl, savedKey);
            state.isSupabaseConnected = true;

            badge.className = "flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition";
            badgeText.textContent = "Supabase DB 연결됨";

            syncWithSupabase();
        } catch (e) {
            console.error('Supabase 연결 오류:', e);
            badgeText.textContent = "연결 오류 (재설정)";
        }
    } else {
        state.isSupabaseConnected = false;
        badge.className = "flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition";
        badgeText.textContent = "로컬 모드 (설정 클릭)";
    }
}

async function syncWithSupabase() {
    if (!state.supabase) return;
    try {
        const { data: schedules, error: schedErr } = await state.supabase.from('schedules').select('*');
        if (!schedErr && schedules && schedules.length > 0) {
            state.schedules = schedules;
            saveLocalSchedules();
            renderCalendar();
            renderSelectedDateEvents();
            renderDutyScheduleList();
            renderRecurringList();
            updateWidgets();
        }
    } catch (err) {
        console.warn('Supabase 동기화 건너뜀 (로컬 데이터 유지)', err);
    }
}

// 로컬 스토리지 데이터 로드 & 저장
function loadLocalData() {
    const savedSchedules = localStorage.getItem('officer_schedules');
    if (savedSchedules) {
        state.schedules = JSON.parse(savedSchedules);
    } else {
        state.schedules = [...DEFAULT_SCHEDULES];
        saveLocalSchedules();
    }

    const savedDutySteps = localStorage.getItem('officer_duty_steps');
    if (savedDutySteps) {
        state.dutySteps = JSON.parse(savedDutySteps);
    } else {
        state.dutySteps = JSON.parse(JSON.stringify(DEFAULT_DUTY_STEPS));
        saveLocalDutySteps();
    }

    const savedDutyStatus = localStorage.getItem('officer_duty_status');
    if (savedDutyStatus) {
        state.dutyChecklistStatus = JSON.parse(savedDutyStatus);
    }

    const savedSoldiers = localStorage.getItem('officer_soldiers');
    if (savedSoldiers) {
        state.soldiers = JSON.parse(savedSoldiers);
    } else {
        state.soldiers = JSON.parse(JSON.stringify(DEFAULT_SOLDIERS));
        saveLocalSoldiers();
    }

    const savedChecklists = localStorage.getItem('officer_checklists');
    if (savedChecklists) {
        state.checklists = JSON.parse(savedChecklists);
    } else {
        state.checklists = PRESET_GEAR_TEMPLATES.single.map((item, idx) => ({
            id: 'chk-' + idx,
            item_name: item,
            is_completed: false
        }));
        saveLocalChecklists();
    }

    const savedVacations = localStorage.getItem('officer_vacations');
    if (savedVacations) {
        state.vacations = JSON.parse(savedVacations);
    } else {
        state.vacations = [
            {
                id: 'vac-1',
                vacation_type: '연가',
                days_used: 3,
                start_date: '2026-12-24',
                end_date: '2026-12-27',
                destination: '본가(서울)',
                status: '승인완료'
            }
        ];
        saveLocalVacations();
    }
}

function saveLocalSchedules() {
    localStorage.setItem('officer_schedules', JSON.stringify(state.schedules));
}

function saveLocalDutySteps() {
    localStorage.setItem('officer_duty_steps', JSON.stringify(state.dutySteps));
}

function saveLocalSoldiers() {
    localStorage.setItem('officer_soldiers', JSON.stringify(state.soldiers));
}

function saveLocalChecklists() {
    localStorage.setItem('officer_checklists', JSON.stringify(state.checklists));
}

function saveLocalVacations() {
    localStorage.setItem('officer_vacations', JSON.stringify(state.vacations));
}

function setupDefaultDates() {
    const todayStr = '2026-11-18';
    state.selectedDate = todayStr;

    const schedStart = document.getElementById('schedStartDate');
    const schedEnd = document.getElementById('schedEndDate');
    if (schedStart && schedEnd) {
        schedStart.value = todayStr;
        schedEnd.value = todayStr;
    }

    const recStart = document.getElementById('recStartDate');
    const recEnd = document.getElementById('recEndDate');
    if (recStart && recEnd) {
        recStart.value = todayStr;
        recEnd.value = '2026-12-31';
    }

    const vacStart = document.getElementById('vacStartDate');
    const vacEnd = document.getElementById('vacEndDate');
    if (vacStart && vacEnd) {
        vacStart.value = '2026-12-24';
        vacEnd.value = '2026-12-27';
    }
}

// 5. 탭 전환 제어
function switchTab(tabId) {
    state.activeTab = tabId;
    const tabSections = ['calendar', 'duty', 'soldiers', 'checklist', 'recurring', 'vacation', 'guide'];

    tabSections.forEach(id => {
        const sec = document.getElementById(`tab-${id}`);
        const btn = document.getElementById(`tabBtn-${id}`);
        if (sec && btn) {
            if (id === tabId) {
                sec.classList.remove('hidden');
                btn.className = "tab-btn flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 border-emerald-500 text-emerald-400 whitespace-nowrap transition";
            } else {
                sec.classList.add('hidden');
                btn.className = "tab-btn flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 whitespace-nowrap transition";
            }
        }
    });

    if (tabId === 'soldiers') renderSoldierTab();
    lucide.createIcons();
}

// 6. 캘린더 엔진 로직
function renderCalendar() {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();

    const titleElem = document.getElementById('calendarTitle');
    if (titleElem) {
        titleElem.textContent = `${year}년 ${month + 1}월`;
    }

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let x = firstDayIndex; x > 0; x--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = "min-h-[70px] sm:min-h-[85px] p-1.5 rounded-xl bg-slate-900/30 border border-slate-800/40 opacity-30 select-none text-slate-500 text-xs";
        dayDiv.innerHTML = `<span>${prevLastDay - x + 1}</span>`;
        grid.appendChild(dayDiv);
    }

    for (let day = 1; day <= lastDay; day++) {
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;

        const isToday = (dateStr === '2026-11-18');
        const isSelected = (dateStr === state.selectedDate);

        const dayEvents = state.schedules.filter(s => {
            return s.start_date <= dateStr && s.end_date >= dateStr;
        });

        const dayDiv = document.createElement('div');
        let borderClass = isSelected ? 'border-emerald-500 bg-slate-800/90 ring-1 ring-emerald-500' : 'border-slate-800/80 bg-slate-900/90 hover:border-slate-700';
        if (isToday && !isSelected) borderClass += ' border-amber-500/50';

        dayDiv.className = `min-h-[70px] sm:min-h-[85px] p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition ${borderClass}`;
        dayDiv.onclick = () => selectDate(dateStr);

        let dayNumBadge = `<span class="text-xs font-semibold ${isToday ? 'px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}">${day}</span>`;

        let eventBadgesHtml = '<div class="space-y-1 mt-1 overflow-hidden">';
        dayEvents.slice(0, 2).forEach(ev => {
            let badgeBg = 'bg-slate-700 text-slate-200';
            if (ev.category === 'duty') badgeBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
            else if (ev.title.includes('비번')) badgeBg = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
            else if (ev.category === 'training') badgeBg = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
            else if (ev.category === 'vacation') badgeBg = 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
            else if (ev.category === 'routine') badgeBg = 'bg-purple-500/20 text-purple-300 border border-purple-500/40';

            eventBadgesHtml += `
                <div class="text-[10px] sm:text-[11px] truncate px-1.5 py-0.5 rounded font-medium ${badgeBg}">
                    ${escapeHtml(ev.title)}
                </div>
            `;
        });

        if (dayEvents.length > 2) {
            eventBadgesHtml += `<div class="text-[9px] text-slate-400 font-bold">+${dayEvents.length - 2}건 더보기</div>`;
        }
        eventBadgesHtml += '</div>';

        dayDiv.innerHTML = `
            <div class="flex items-center justify-between">
                ${dayNumBadge}
                ${dayEvents.length > 0 ? `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>` : ''}
            </div>
            ${eventBadgesHtml}
        `;

        grid.appendChild(dayDiv);
    }
}

function prevMonth() {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
}

function goToToday() {
    state.currentDate = new Date(2026, 10, 18);
    state.selectedDate = '2026-11-18';
    renderCalendar();
    renderSelectedDateEvents();
}

function selectDate(dateStr) {
    state.selectedDate = dateStr;
    renderCalendar();
    renderSelectedDateEvents();
}

// 7. 선택 날짜 일정 렌더링
function renderSelectedDateEvents() {
    const title = document.getElementById('selectedDateTitle');
    const subtitle = document.getElementById('selectedDateSubtitle');
    const container = document.getElementById('selectedDateEventsList');

    if (!container) return;

    if (title) title.textContent = `${state.selectedDate} 일정`;

    const dayEvents = state.schedules.filter(s => {
        return s.start_date <= state.selectedDate && s.end_date >= state.selectedDate;
    });

    if (subtitle) {
        subtitle.textContent = dayEvents.length > 0 ? `총 ${dayEvents.length}건의 일정이 있습니다.` : '등록된 일정이 없습니다.';
    }

    if (dayEvents.length === 0) {
        container.innerHTML = `
            <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
                <i data-lucide="calendar-x" class="w-8 h-8 mx-auto text-slate-600"></i>
                <p>이 날에는 예정된 일정이 없습니다.</p>
                <button onclick="openScheduleModalWithDate()" class="text-emerald-400 hover:underline font-semibold">+ 일정 추가하기</button>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    let html = '';
    dayEvents.forEach(ev => {
        let badgeColor = 'border-slate-700 bg-slate-800/80';
        let badgeText = '부대일과';

        if (ev.category === 'duty') {
            badgeColor = 'border-amber-500/40 bg-amber-500/10 text-amber-400';
            badgeText = ev.duty_type || '당직근무';
        } else if (ev.title.includes('비번')) {
            badgeColor = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
            badgeText = '당직비번';
        } else if (ev.category === 'training') {
            badgeColor = 'border-rose-500/40 bg-rose-500/10 text-rose-400';
            badgeText = '훈련/교육';
        } else if (ev.category === 'vacation') {
            badgeColor = 'border-blue-500/40 bg-blue-500/10 text-blue-400';
            badgeText = '휴가';
        }

        html += `
            <div class="p-3 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 transition flex items-start justify-between group">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] px-2 py-0.5 rounded font-bold border ${badgeColor}">
                            ${badgeText}
                        </span>
                        <h4 class="font-bold text-xs text-white">${escapeHtml(ev.title)}</h4>
                    </div>
                    ${ev.location ? `<p class="text-[11px] text-slate-400 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 text-slate-500"></i> ${escapeHtml(ev.location)}</p>` : ''}
                    <p class="text-[10px] text-slate-500">${ev.start_date} ~ ${ev.end_date}</p>
                </div>
                <button onclick="deleteSchedule('${ev.id}')" class="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 transition" title="일정 삭제">
                    <i data-lucide="trash" class="w-4 h-4"></i>
                </button>
            </div>
        `;
    });

    container.innerHTML = html;
    lucide.createIcons();
}

// 8. 일정 추가 및 당직 비번 자동 생성 로직
async function handleCreateSchedule(e) {
    e.preventDefault();

    const title = document.getElementById('schedTitle').value.trim();
    const category = document.querySelector('input[name="catRadio"]:checked')?.value || 'training';
    const startDate = document.getElementById('schedStartDate').value;
    const endDate = document.getElementById('schedEndDate').value;
    const location = document.getElementById('schedLocation').value.trim();
    const dutyType = document.getElementById('schedDutyType').value;
    const autoOffDuty = document.getElementById('schedAutoOffDuty').checked;
    const presetGear = document.getElementById('schedPresetGear').value;

    if (!title || !startDate || !endDate) {
        alert('필수 입력 항목을 모두 작성해주세요.');
        return;
    }

    const newId = 'sched-' + Date.now();
    const newSchedule = {
        id: newId,
        title: title,
        category: category,
        start_date: startDate,
        end_date: endDate,
        location: location || null,
        duty_type: category === 'duty' ? dutyType : null,
        is_recurring: false
    };

    state.schedules.push(newSchedule);

    if (category === 'duty' && autoOffDuty) {
        const nextDate = new Date(startDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextDateStr = nextDate.toISOString().split('T')[0];

        const offDutySchedule = {
            id: 'sched-off-' + Date.now(),
            title: `[비번] ${dutyType} 휴무`,
            category: 'routine',
            start_date: nextDateStr,
            end_date: nextDateStr,
            location: 'BOQ(독신자숙소)',
            duty_type: null,
            is_recurring: false
        };
        state.schedules.push(offDutySchedule);
    }

    if (presetGear && presetGear !== 'none' && PRESET_GEAR_TEMPLATES[presetGear]) {
        PRESET_GEAR_TEMPLATES[presetGear].forEach(item => {
            state.checklists.push({
                id: 'chk-' + Date.now() + Math.random(),
                item_name: `[${title}] ${item}`,
                is_completed: false
            });
        });
        saveLocalChecklists();
        renderGeneralChecklist();
    }

    if (state.isSupabaseConnected && state.supabase) {
        try {
            await state.supabase.from('schedules').insert([
                {
                    title: newSchedule.title,
                    category: newSchedule.category,
                    start_date: newSchedule.start_date,
                    end_date: newSchedule.end_date,
                    location: newSchedule.location,
                    duty_type: newSchedule.duty_type
                }
            ]);
        } catch (err) {
            console.error('Supabase 삽입 오류:', err);
        }
    }

    saveLocalSchedules();
    closeScheduleModal();
    renderCalendar();
    renderSelectedDateEvents();
    renderDutyScheduleList();
    updateWidgets();

    alert('일정이 성공적으로 등록되었습니다!' + (category === 'duty' && autoOffDuty ? '\n(익일 당직 비번 일정이 자동 생성되었습니다)' : ''));
}

async function deleteSchedule(id) {
    if (!confirm('이 일정을 삭제하시겠습니까?')) return;

    state.schedules = state.schedules.filter(s => s.id !== id);
    saveLocalSchedules();

    if (state.isSupabaseConnected && state.supabase) {
        try {
            await state.supabase.from('schedules').delete().eq('id', id);
        } catch (err) {
            console.error('Supabase 삭제 오류:', err);
        }
    }

    renderCalendar();
    renderSelectedDateEvents();
    renderDutyScheduleList();
    renderRecurringList();
    updateWidgets();
}

// 9. 당직사관 실무 HUB 로직 (체크리스트 추가/삭제/복원)
function renderDutyChecklist() {
    const container = document.getElementById('dutyChecklistContainer');
    if (!container) return;

    if (!state.dutySteps || state.dutySteps.length === 0) {
        container.innerHTML = `
            <div class="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl space-y-1">
                <p>등록된 당직 체크리스트 항목이 없습니다.</p>
                <button onclick="resetDutyChecklist()" class="text-amber-400 hover:underline font-semibold">+ 기본 13개 항목 불러오기</button>
            </div>
        `;
        return;
    }

    let html = '';
    state.dutySteps.forEach((step, idx) => {
        const isChecked = !!state.dutyChecklistStatus[step.id];
        html += `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-800 transition group">
                <label class="flex items-center gap-3 cursor-pointer select-none flex-1 truncate pr-2">
                    <input type="checkbox" onchange="toggleDutyCheck('${step.id}')" ${isChecked ? 'checked' : ''} class="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-700 border-slate-600 shrink-0">
                    <span class="${isChecked ? 'line-through text-slate-500' : 'text-slate-200'} font-medium truncate">
                        <strong class="text-amber-400 mr-1">${idx + 1}.</strong> ${escapeHtml(step.text)}
                    </span>
                </label>
                <button onclick="removeDutyStepItem('${step.id}')" class="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition shrink-0" title="항목 삭제">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        `;
    });
    container.innerHTML = html;
    lucide.createIcons();
}

function toggleDutyCheck(id) {
    state.dutyChecklistStatus[id] = !state.dutyChecklistStatus[id];
    localStorage.setItem('officer_duty_status', JSON.stringify(state.dutyChecklistStatus));
    renderDutyChecklist();
}

function addDutyStepItem() {
    const input = document.getElementById('newDutyStepInput');
    const text = input ? input.value.trim() : '';
    if (!text) return;

    if (!state.dutySteps) state.dutySteps = [];
    state.dutySteps.push({
        id: 'step-' + Date.now(),
        text: text
    });

    saveLocalDutySteps();
    input.value = '';
    renderDutyChecklist();
}

function removeDutyStepItem(id) {
    state.dutySteps = state.dutySteps.filter(s => String(s.id) !== String(id));
    delete state.dutyChecklistStatus[id];
    localStorage.setItem('officer_duty_status', JSON.stringify(state.dutyChecklistStatus));
    saveLocalDutySteps();
    renderDutyChecklist();
}

function resetDutyChecklist() {
    if (!confirm('당직사관 체크리스트를 기본 13개 필수 점검 항목으로 복원하시겠습니까?')) return;
    state.dutySteps = JSON.parse(JSON.stringify(DEFAULT_DUTY_STEPS));
    state.dutyChecklistStatus = {};
    localStorage.removeItem('officer_duty_status');
    saveLocalDutySteps();
    renderDutyChecklist();
}

function renderDutyScheduleList() {
    const container = document.getElementById('dutyScheduleList');
    const badgeCount = document.getElementById('dutyBadgeCount');
    if (!container) return;

    const dutyEvents = state.schedules.filter(s => s.category === 'duty' || s.title.includes('비번'));
    if (badgeCount) badgeCount.textContent = dutyEvents.filter(s => s.category === 'duty').length;

    if (dutyEvents.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-slate-500 text-xs">등록된 당직 일정이 없습니다.</div>`;
        return;
    }

    let html = '';
    dutyEvents.forEach(ev => {
        const isOff = ev.title.includes('비번');
        html += `
            <div class="p-3 rounded-xl border ${isOff ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-amber-500/30 bg-amber-950/20'} flex items-center justify-between">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] px-2 py-0.5 rounded font-bold ${isOff ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">
                            ${isOff ? '당직비번' : (ev.duty_type || '당직사관')}
                        </span>
                        <h4 class="font-bold text-xs text-white">${escapeHtml(ev.title)}</h4>
                    </div>
                    <p class="text-[11px] text-slate-400 mt-1">${ev.start_date} | 장소: ${escapeHtml(ev.location || '지휘통제실')}</p>
                </div>
                <button onclick="deleteSchedule('${ev.id}')" class="text-slate-500 hover:text-rose-400 p-1">
                    <i data-lucide="trash" class="w-4 h-4"></i>
                </button>
            </div>
        `;
    });
    container.innerHTML = html;
    lucide.createIcons();
}

// 10. 점호 인원보고 양식 생성기
function openDutyReportModal() {
    document.getElementById('dutyReportModal').classList.remove('hidden');
    updateReportPreview();
    lucide.createIcons();
}

function closeDutyReportModal() {
    document.getElementById('dutyReportModal').classList.add('hidden');
}

function updateReportPreview() {
    const total = document.getElementById('reportTotal').value;
    const present = document.getElementById('reportPresent').value;
    const vacation = document.getElementById('reportVacation').value;
    const sick = document.getElementById('reportSick').value;
    const details = document.getElementById('reportDetails').value;

    const preview = `[당직사관 일일 점호 인원보고]
■ 보고일시: ${state.selectedDate} 21:30 기준
■ 보고관: 당직사관 소위 김대한
-----------------------------------
- 총  원: ${total}명
- 현재원: ${present}명
- 사고(열외): ${Number(total) - Number(present)}명
  * 휴  가: ${vacation}명
  * 환  자(외진/입원): ${sick}명
  * 특이사항: ${details || '특이사항 없음'}
-----------------------------------
이상 점호 준비 끝! 충성!`;

    document.getElementById('reportPreviewArea').value = preview;
}

function copyReportText() {
    const textarea = document.getElementById('reportPreviewArea');
    textarea.select();
    navigator.clipboard.writeText(textarea.value).then(() => {
        alert('점호 인원보고 양식이 클립보드에 복사되었습니다!\n(카카오톡 또는 온나라 메신저에 바로 붙여넣기 하세요)');
    });
}

// ==============================================================================
// 11. ⭐ 소대원 병력 관리 & 상담 노트 로직 (NEW!)
// ==============================================================================

// 육군 복무 18개월(548일) 기준 전역 D-Day 및 복무율 계산
function calculateDischargeInfo(enlistDateStr) {
    const enlist = new Date(enlistDateStr);
    const discharge = new Date(enlist);
    discharge.setMonth(discharge.getMonth() + 18);
    discharge.setDate(discharge.getDate() - 1); // 18개월 - 1일

    const dischargeStr = discharge.toISOString().split('T')[0];
    const today = new Date('2026-11-18');

    const totalDays = Math.ceil((discharge - enlist) / (1000 * 60 * 60 * 24));
    const servedDays = Math.ceil((today - enlist) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.ceil((discharge - today) / (1000 * 60 * 60 * 24));

    let percent = Math.round((servedDays / totalDays) * 100);
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    return {
        dischargeStr,
        remainingDays,
        percent,
        isDischarged: remainingDays <= 0
    };
}

function renderSoldierTab() {
    const container = document.getElementById('soldierGridContainer');
    const totalCountElem = document.getElementById('soldierTotalCount');
    const attentionCountElem = document.getElementById('soldierAttentionCount');
    const dischargeSoonElem = document.getElementById('soldierDischargeSoonCount');
    const badgeCount = document.getElementById('soldierBadgeCount');

    if (!container) return;

    if (totalCountElem) totalCountElem.textContent = `${state.soldiers.length}명`;
    if (badgeCount) badgeCount.textContent = state.soldiers.length;

    let attentionCount = 0;
    let dischargeSoonCount = 0;

    state.soldiers.forEach(sol => {
        if (sol.attention && sol.attention.trim() !== '') attentionCount++;
        const info = calculateDischargeInfo(sol.enlist_date);
        if (info.remainingDays > 0 && info.remainingDays <= 60) dischargeSoonCount++;
    });

    if (attentionCountElem) attentionCountElem.textContent = `${attentionCount}명`;
    if (dischargeSoonElem) dischargeSoonElem.textContent = `${dischargeSoonCount}명`;

    if (state.soldiers.length === 0) {
        container.innerHTML = `
            <div class="col-span-full p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl space-y-2">
                <i data-lucide="users" class="w-10 h-10 mx-auto text-slate-600"></i>
                <p>등록된 소대원이 없습니다.</p>
                <button onclick="openSoldierModal()" class="text-emerald-400 hover:underline font-semibold">+ 첫 소대원 등록하기</button>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    let html = '';
    state.soldiers.forEach(sol => {
        const info = calculateDischargeInfo(sol.enlist_date);

        let rankBg = 'bg-slate-700 text-slate-200 border-slate-600';
        if (sol.rank === '이병') rankBg = 'bg-slate-700 text-slate-200 border-slate-600';
        else if (sol.rank === '일병') rankBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
        else if (sol.rank === '상병') rankBg = 'bg-blue-500/20 text-blue-400 border-blue-500/40';
        else if (sol.rank === '병장') rankBg = 'bg-amber-500/20 text-amber-400 border-amber-500/40';

        const lastNote = sol.notes && sol.notes.length > 0 ? sol.notes[sol.notes.length - 1] : null;

        html += `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 hover:border-slate-700 transition">
                <div class="flex items-start justify-between">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] px-2 py-0.5 rounded font-bold border ${rankBg}">${sol.rank}</span>
                            <h4 class="font-bold text-sm text-white">${escapeHtml(sol.name)}</h4>
                            <span class="text-xs text-slate-400 font-medium">${escapeHtml(sol.role || '소총수')}</span>
                        </div>
                        <p class="text-[11px] text-slate-500 mt-1">입대: ${sol.enlist_date} ➔ 전역: ${info.dischargeStr}</p>
                    </div>
                    <span class="text-xs font-bold px-2 py-1 rounded-lg ${info.isDischarged ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'}">
                        ${info.isDischarged ? '전역완료' : `D-${info.remainingDays}`}
                    </span>
                </div>

                <!-- 복무율 프로그레스 바 -->
                <div class="space-y-1">
                    <div class="flex justify-between text-[11px] text-slate-400">
                        <span>복무 진척도</span>
                        <span class="font-bold text-white">${info.percent}%</span>
                    </div>
                    <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div class="bg-emerald-500 h-full rounded-full transition-all" style="width: ${info.percent}%"></div>
                    </div>
                </div>

                <!-- 특이사항 태그 -->
                ${sol.attention ? `
                    <div class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-1.5">
                        <i data-lucide="alert-triangle" class="w-3.5 h-3.5 shrink-0 text-amber-400"></i>
                        <span class="truncate">${escapeHtml(sol.attention)}</span>
                    </div>
                ` : ''}

                <!-- 최근 면담 메모 프리뷰 -->
                <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
                    <div class="flex items-center justify-between text-slate-400">
                        <span class="font-semibold flex items-center gap-1"><i data-lucide="message-square" class="w-3 h-3 text-emerald-400"></i> 최근 면담 메모</span>
                        <span>${lastNote ? lastNote.date : '기록 없음'}</span>
                    </div>
                    <p class="text-slate-300 italic truncate">${lastNote ? escapeHtml(lastNote.text) : '면담 기록이 없습니다.'}</p>
                </div>

                <!-- 버튼 액션 -->
                <div class="pt-1 flex items-center justify-between border-t border-slate-800">
                    <button onclick="openCounselModal('${sol.id}')" class="text-xs px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium transition flex items-center gap-1">
                        <i data-lucide="edit-3" class="w-3 h-3"></i>
                        <span>면담 기록</span>
                    </button>
                    <button onclick="deleteSoldier('${sol.id}')" class="text-xs text-slate-500 hover:text-rose-400 p-1.5 transition" title="소대원 삭제">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    lucide.createIcons();
}

function openSoldierModal() {
    document.getElementById('soldierModal').classList.remove('hidden');
    lucide.createIcons();
}

function closeSoldierModal() {
    document.getElementById('soldierModal').classList.add('hidden');
}

function handleCreateSoldier(e) {
    e.preventDefault();

    const name = document.getElementById('soldierName').value.trim();
    const rank = document.getElementById('soldierRank').value;
    const enlistDate = document.getElementById('soldierEnlistDate').value;
    const role = document.getElementById('soldierRole').value.trim();
    const attention = document.getElementById('soldierAttention').value.trim();
    const noteText = document.getElementById('soldierInitialNote').value.trim();

    if (!name || !enlistDate) {
        alert('이름과 입대일을 모두 입력해주세요.');
        return;
    }

    const newSoldier = {
        id: 'sol-' + Date.now(),
        name,
        rank,
        enlist_date: enlistDate,
        role: role || '소총수',
        attention: attention || null,
        notes: noteText ? [{ date: '2026-11-18', text: noteText }] : []
    };

    state.soldiers.unshift(newSoldier);
    saveLocalSoldiers();
    closeSoldierModal();
    renderSoldierTab();

    document.getElementById('soldierForm').reset();
    alert(`${rank} ${name} 소대원이 성공적으로 등록되었습니다!`);
}

function deleteSoldier(id) {
    if (!confirm('이 소대원 정보를 삭제하시겠습니까?')) return;
    state.soldiers = state.soldiers.filter(s => s.id !== id);
    saveLocalSoldiers();
    renderSoldierTab();
}

function openCounselModal(soldierId) {
    const sol = state.soldiers.find(s => s.id === soldierId);
    if (!sol) return;

    document.getElementById('counselSoldierId').value = sol.id;
    document.getElementById('counselSoldierName').value = `${sol.rank} ${sol.name} (${sol.role || '소총수'})`;
    document.getElementById('counselText').value = '';
    document.getElementById('counselModal').classList.remove('hidden');
    lucide.createIcons();
}

function closeCounselModal() {
    document.getElementById('counselModal').classList.add('hidden');
}

function handleSaveCounselNote(e) {
    e.preventDefault();

    const soldierId = document.getElementById('counselSoldierId').value;
    const date = document.getElementById('counselDate').value;
    const text = document.getElementById('counselText').value.trim();

    const sol = state.soldiers.find(s => s.id === soldierId);
    if (sol && text) {
        if (!sol.notes) sol.notes = [];
        sol.notes.push({ date, text });
        saveLocalSoldiers();
        closeCounselModal();
        renderSoldierTab();
        alert('면담 일지가 기록되었습니다.');
    }
}

// ==============================================================================
// 12. ⭐ 엑셀(CSV) 내보내기 & 인쇄 최적화 (NEW!)
// ==============================================================================
function exportSchedulesToCSV() {
    if (!state.schedules || state.schedules.length === 0) {
        alert('내보낼 일정이 없습니다.');
        return;
    }

    let csvContent = '\uFEFF'; // Excel 한글 깨짐 방지 UTF-8 BOM
    csvContent += '구분,일정명,시작일,종료일,장소,당직구분\n';

    state.schedules.forEach(ev => {
        let catText = '부대일과';
        if (ev.category === 'duty') catText = '당직/근무';
        else if (ev.title.includes('비번')) catText = '당직비번';
        else if (ev.category === 'training') catText = '훈련/교육';
        else if (ev.category === 'vacation') catText = '휴가';

        const row = [
            `"${catText}"`,
            `"${(ev.title || '').replace(/"/g, '""')}"`,
            `"${ev.start_date || ''}"`,
            `"${ev.end_date || ''}"`,
            `"${(ev.location || '').replace(/"/g, '""')}"`,
            `"${ev.duty_type || ''}"`
        ];
        csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `오피서노트_군생활일정_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 13. 준비물 및 훈련 체크리스트
function renderGeneralChecklist() {
    const container = document.getElementById('generalChecklistContainer');
    if (!container) return;

    if (state.checklists.length === 0) {
        container.innerHTML = `<div class="col-span-full p-6 text-center text-slate-500 text-xs">준비물 목록이 비어있습니다. 위의 추천 세트를 클릭해보세요!</div>`;
        return;
    }

    let html = '';
    state.checklists.forEach((item) => {
        html += `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:bg-slate-800 transition">
                <label class="flex items-center gap-2 cursor-pointer flex-1 truncate select-none">
                    <input type="checkbox" onchange="toggleChecklistItem('${item.id}')" ${item.is_completed ? 'checked' : ''} class="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-700 border-slate-600">
                    <span class="text-xs ${item.is_completed ? 'line-through text-slate-500' : 'text-slate-200'} truncate">
                        ${escapeHtml(item.item_name)}
                    </span>
                </label>
                <button onclick="removeChecklistItem('${item.id}')" class="text-slate-500 hover:text-rose-400 p-1 shrink-0">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
            </div>
        `;
    });
    container.innerHTML = html;
    lucide.createIcons();
}

function toggleChecklistItem(id) {
    const item = state.checklists.find(c => c.id === id);
    if (item) {
        item.is_completed = !item.is_completed;
        saveLocalChecklists();
        renderGeneralChecklist();
    }
}

function removeChecklistItem(id) {
    state.checklists = state.checklists.filter(c => c.id !== id);
    saveLocalChecklists();
    renderGeneralChecklist();
}

function addCustomChecklistItem() {
    const input = document.getElementById('newChecklistItemInput');
    const val = input.value.trim();
    if (!val) return;

    state.checklists.unshift({
        id: 'chk-' + Date.now(),
        item_name: val,
        is_completed: false
    });
    saveLocalChecklists();
    input.value = '';
    renderGeneralChecklist();
}

function clearCompletedChecklist() {
    state.checklists = state.checklists.filter(c => !c.is_completed);
    saveLocalChecklists();
    renderGeneralChecklist();
}

function applyPresetTemplate(type) {
    const items = PRESET_GEAR_TEMPLATES[type];
    if (!items) return;

    items.forEach(name => {
        state.checklists.push({
            id: 'chk-' + Date.now() + Math.random(),
            item_name: name,
            is_completed: false
        });
    });
    saveLocalChecklists();
    renderGeneralChecklist();
    alert(`[${type.toUpperCase()}] 세트 준비물 ${items.length}개가 추가되었습니다.`);
}

// 14. 반복 일정 자동 생성 엔진
function handleCreateRecurring(e) {
    e.preventDefault();

    const title = document.getElementById('recTitle').value.trim();
    const category = document.getElementById('recCategory').value;
    const recType = document.getElementById('recType').value;
    const dayOfWeek = parseInt(document.getElementById('recDayOfWeek').value);
    const startDate = new Date(document.getElementById('recStartDate').value);
    const endDate = new Date(document.getElementById('recEndDate').value);

    if (startDate > endDate) {
        alert('종료일은 시작일보다 이후여야 합니다.');
        return;
    }

    let createdCount = 0;
    let curr = new Date(startDate);

    while (curr <= endDate) {
        if (curr.getDay() === dayOfWeek) {
            const dateStr = curr.toISOString().split('T')[0];
            state.schedules.push({
                id: 'rec-' + Date.now() + '-' + createdCount,
                title: title,
                category: category,
                start_date: dateStr,
                end_date: dateStr,
                location: '영내',
                is_recurring: true,
                recurrence_type: recType
            });
            createdCount++;

            if (recType === 'biweekly') {
                curr.setDate(curr.getDate() + 7);
            }
        }
        curr.setDate(curr.getDate() + 1);
    }

    saveLocalSchedules();
    renderCalendar();
    renderSelectedDateEvents();
    renderRecurringList();
    updateWidgets();

    alert(`반복 일정 규칙에 따라 총 ${createdCount}개의 일정이 캘린더에 자동 등록되었습니다!`);
    document.getElementById('recTitle').value = '';
}

function renderRecurringList() {
    const container = document.getElementById('recurringListContainer');
    const badge = document.getElementById('recurringCountBadge');
    if (!container) return;

    const recurringEvents = state.schedules.filter(s => s.is_recurring);
    if (badge) badge.textContent = `총 ${recurringEvents.length}건`;

    if (recurringEvents.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-slate-500 text-xs">등록된 반복 일정이 없습니다. 좌측에서 생성해보세요!</div>`;
        return;
    }

    let html = '';
    recurringEvents.slice(0, 15).forEach(ev => {
        html += `
            <div class="p-3 rounded-xl border border-purple-800/40 bg-purple-950/20 flex items-center justify-between">
                <div>
                    <h4 class="font-bold text-xs text-purple-300">${escapeHtml(ev.title)}</h4>
                    <p class="text-[11px] text-slate-400 mt-0.5">일자: ${ev.start_date} | 유형: ${ev.recurrence_type || 'weekly'}</p>
                </div>
                <button onclick="deleteSchedule('${ev.id}')" class="text-slate-500 hover:text-rose-400 p-1">
                    <i data-lucide="trash" class="w-4 h-4"></i>
                </button>
            </div>
        `;
    });
    container.innerHTML = html;
    lucide.createIcons();
}

// 15. 휴가 및 D-Day 플래너
function renderVacationTab() {
    let usedAnnual = 0;
    let usedReward = 0;

    state.vacations.forEach(v => {
        if (v.vacation_type === '연가') usedAnnual += parseFloat(v.days_used || 0);
        else usedReward += parseFloat(v.days_used || 0);
    });

    const remainingAnnual = Math.max(0, 21 - usedAnnual);

    const elemRem = document.getElementById('vacationAnnualRemaining');
    const elemUsed = document.getElementById('vacationAnnualUsed');
    const elemRew = document.getElementById('vacationRewardTotal');
    const elemBar = document.getElementById('vacationProgressBar');
    const widgetVac = document.getElementById('widgetVacationDays');

    if (elemRem) elemRem.textContent = remainingAnnual;
    if (elemUsed) elemUsed.textContent = usedAnnual;
    if (elemRew) elemRew.textContent = usedReward;
    if (widgetVac) widgetVac.textContent = `${remainingAnnual}일`;
    if (elemBar) elemBar.style.width = `${Math.min(100, (usedAnnual / 21) * 100)}%`;

    const upcoming = state.vacations
        .filter(v => v.start_date >= '2026-11-18')
        .sort((a, b) => a.start_date.localeCompare(b.start_date))[0];

    const dDayText = document.getElementById('vacationDDayText');
    const nextName = document.getElementById('vacationNextName');

    if (upcoming && dDayText && nextName) {
        const diffMs = new Date(upcoming.start_date) - new Date('2026-11-18');
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        dDayText.textContent = diffDays === 0 ? 'D-Day' : `D-${diffDays}`;
        nextName.textContent = `${upcoming.vacation_type} (${upcoming.start_date})`;
    } else if (dDayText && nextName) {
        dDayText.textContent = 'D-??';
        nextName.textContent = '예정 없음';
    }

    const container = document.getElementById('vacationListContainer');
    const listCount = document.getElementById('vacationListCount');
    if (!container) return;

    if (listCount) listCount.textContent = `${state.vacations.length}건`;

    if (state.vacations.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-slate-500 text-xs">등록된 휴가 내역이 없습니다.</div>`;
        return;
    }

    let html = '';
    state.vacations.forEach(v => {
        html += `
            <div class="p-3 rounded-xl border border-blue-800/40 bg-blue-950/20 flex items-center justify-between">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-500/20 text-blue-400">
                            ${v.vacation_type} (${v.days_used}일)
                        </span>
                        <h4 class="font-bold text-xs text-white">${escapeHtml(v.destination || '행선지 미정')}</h4>
                    </div>
                    <p class="text-[11px] text-slate-400 mt-1">${v.start_date} ~ ${v.end_date} (상태: ${v.status || '승인'})</p>
                </div>
                <button onclick="deleteVacation('${v.id}')" class="text-slate-500 hover:text-rose-400 p-1">
                    <i data-lucide="trash" class="w-4 h-4"></i>
                </button>
            </div>
        `;
    });
    container.innerHTML = html;
    lucide.createIcons();
}

function handleCreateVacation(e) {
    e.preventDefault();

    const type = document.getElementById('vacType').value;
    const start = document.getElementById('vacStartDate').value;
    const end = document.getElementById('vacEndDate').value;
    const days = parseFloat(document.getElementById('vacDays').value);
    const dest = document.getElementById('vacDest').value.trim();

    const newVac = {
        id: 'vac-' + Date.now(),
        vacation_type: type,
        start_date: start,
        end_date: end,
        days_used: days,
        destination: dest,
        status: '승인완료'
    };

    state.vacations.push(newVac);
    saveLocalVacations();

    state.schedules.push({
        id: 'sched-vac-' + Date.now(),
        title: `[휴가] ${type} (${dest || '출타'})`,
        category: 'vacation',
        start_date: start,
        end_date: end,
        location: dest
    });
    saveLocalSchedules();

    closeVacationModal();
    renderVacationTab();
    renderCalendar();
    renderSelectedDateEvents();
    updateWidgets();

    alert('휴가 일정이 등록되고 잔여일수가 계산되었습니다!');
}

function deleteVacation(id) {
    if (!confirm('이 휴가 내역을 삭제하시겠습니까?')) return;
    state.vacations = state.vacations.filter(v => v.id !== id);
    saveLocalVacations();
    renderVacationTab();
    renderCalendar();
    renderSelectedDateEvents();
    updateWidgets();
}

function openVacationModal() {
    document.getElementById('vacationModal').classList.remove('hidden');
    lucide.createIcons();
}

function closeVacationModal() {
    document.getElementById('vacationModal').classList.add('hidden');
}

// 16. 위젯 카운터 갱신
function updateWidgets() {
    const dutyCountElem = document.getElementById('widgetDutyCount');
    const trainCountElem = document.getElementById('widgetTrainingCount');
    const offDutyElem = document.getElementById('widgetNextOffDuty');

    const duties = state.schedules.filter(s => s.category === 'duty');
    const trainings = state.schedules.filter(s => s.category === 'training');
    const offDuties = state.schedules.filter(s => s.title.includes('비번') && s.start_date >= '2026-11-18');

    if (dutyCountElem) dutyCountElem.textContent = `${duties.length}회`;
    if (trainCountElem) trainCountElem.textContent = `${trainings.length}건`;
    if (offDutyElem) {
        if (offDuties.length > 0) {
            offDutyElem.textContent = `${offDuties[0].start_date}`;
        } else {
            offDutyElem.textContent = '예정 없음';
        }
    }
}

// 17. 모달 및 유틸리티
function openScheduleModal() {
    document.getElementById('schedStartDate').value = state.selectedDate;
    document.getElementById('schedEndDate').value = state.selectedDate;
    document.getElementById('scheduleModal').classList.remove('hidden');
    lucide.createIcons();
}

function openScheduleModalWithDate() {
    openScheduleModal();
}

function openScheduleModalCategory(cat) {
    openScheduleModal();
    const radio = document.querySelector(`input[name="catRadio"][value="${cat}"]`);
    if (radio) {
        radio.checked = true;
        toggleDutyOption(cat === 'duty');
    }
}

function closeScheduleModal() {
    document.getElementById('scheduleModal').classList.add('hidden');
}

function toggleDutyOption(isDuty) {
    const box = document.getElementById('dutyOptionBox');
    const gearBox = document.getElementById('gearOptionBox');
    if (box) {
        if (isDuty) {
            box.classList.remove('hidden');
            if (gearBox) gearBox.classList.add('hidden');
        } else {
            box.classList.add('hidden');
            if (gearBox) gearBox.classList.remove('hidden');
        }
    }
}

function openConfigModal() {
    document.getElementById('cfgSupabaseUrl').value = localStorage.getItem('officer_supabase_url') || '';
    document.getElementById('cfgSupabaseKey').value = localStorage.getItem('officer_supabase_key') || '';
    document.getElementById('configModal').classList.remove('hidden');
    lucide.createIcons();
}

function closeConfigModal() {
    document.getElementById('configModal').classList.add('hidden');
}

function saveSupabaseConfig() {
    const url = document.getElementById('cfgSupabaseUrl').value.trim();
    const key = document.getElementById('cfgSupabaseKey').value.trim();

    if (!url || !key) {
        alert('Supabase URL과 Key를 모두 입력해주세요.');
        return;
    }

    localStorage.setItem('officer_supabase_url', url);
    localStorage.setItem('officer_supabase_key', key);
    closeConfigModal();
    initSupabase();
    alert('Supabase 연동 정보가 저장되었습니다! 클라우드와 연결을 시도합니다.');
}

function clearSupabaseConfig() {
    if (!confirm('Supabase 연동을 해제하고 로컬 모드로 전환하시겠습니까?')) return;
    localStorage.removeItem('officer_supabase_url');
    localStorage.removeItem('officer_supabase_key');
    closeConfigModal();
    initSupabase();
    alert('로컬 모드로 전환되었습니다.');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
