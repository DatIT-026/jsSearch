let studentsData = [];
let coursesData = [];
let gpaList = [];
let departmentsData = [];
let leadershipData = [];
let officeData = [];
let rankingData = [];

// load data
document.addEventListener('DOMContentLoaded', () => {
    // load students
    fetch('data/students_data.csv')
        .then(res => res.ok ? res.text() : Promise.reject('Không tìm thấy dữ liệu của Student'))
        .then(text => Papa.parse(text, {
            header: true, skipEmptyLines: true,
            complete: r => studentsData = r.data
        }))
        .catch(err => console.error(err));

    // load leader
    fetch('data/leadership_data.csv')
        .then(res => res.ok ? res.text() : Promise.reject('Không tìm thấy dữ liệu của Ban Giám Hiệu'))
        .then(text => Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: function (r) {
                leadershipData = r.data;
            }
        }))
        .catch(err => console.warn(err));

    // load co quan
    fetch('data/office_data.csv')
        .then(res => res.ok ? res.text() : Promise.reject('Không tìm thấy dữ liệu Cơ quan'))
        .then(text => Papa.parse(text, {
            header: false,
            skipEmptyLines: true,
            complete: function (r) {
                parseOfficeData(r.data);
            }
        }))
        .catch(err => console.warn(err));

    // load rank
    fetch('data/ranking_data.csv')
    .then(res => res.ok ? res.text() : Promise.reject('Không tìm thấy dữ liệu của Bảng xếp hạng'))
    .then(text => Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: function (r) {
            rankingData = r.data;
            rankingData.sort((a, b) => parseFloat(b['Điểm TB']) - parseFloat(a['Điểm TB']));
        }
    }))
    .catch(err => console.warn(err));

    // load teachers
    fetch('data/teacher_data.csv')
        .then(res => res.ok ? res.text() : Promise.reject('Không tìm thấy teacher_data.csv'))
        .then(text => Papa.parse(text, {
            header: false,
            skipEmptyLines: true,
            complete: function (r) {
                departmentsData = r.data.map(row => row[0]);
            }
        }))
        .catch(err => console.warn(err));

    // load courses
    fetch('data/courses.csv')
        .then(res => res.ok ? res.text() : Promise.reject('Không tìm thấy course.csv'))
        .then(text => Papa.parse(text, {
            header: true, skipEmptyLines: true,
            complete: function (r) {
                coursesData = r.data;
                initCourseSelect();
            }
        }))
        .catch(err => console.warn(err));
});

// navigation
function hideAllViews() {
    ['home-view', 'battalion-view', 'company-list-view', 'grade-view', 'teacher-view', 'leadership-view', 'office-view', 'ranking-view'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// focus menu
function setActiveNav(selectedId) {
    const links = document.querySelectorAll('.nav-list > li > a');

    links.forEach(link => link.classList.remove('active'));

    const activeLink = document.getElementById(selectedId);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function goHome() {
    hideAllViews();
    document.getElementById('home-view').style.display = 'block';
    const resultContainer = document.getElementById('searchResultContainer');
    if (resultContainer) resultContainer.innerHTML = '';
    setActiveNav('nav-home');

    // close menu with delay to allow smooth transition
    setTimeout(() => closeMenu(), 150);
}

function showBattalion(id) {
    hideAllViews();
    if (id === 'd1') {
        document.getElementById('battalion-view').style.display = 'block';
    } else {
        alert("Dữ liệu tiểu đoàn này đang cập nhật...");
        goHome();
        return;
    }
    setActiveNav('nav-battalion');

    // close menu with delay to allow smooth transition
    setTimeout(() => closeMenu(), 150);
}

function showCompanyList(id) {
    hideAllViews();
    document.getElementById('company-list-view').style.display = 'block';
    if (id === 'c4') renderTable(studentsData, 'tableContainer', 'total-count');

    // close menu with delay to allow smooth transition
    setTimeout(() => closeMenu(), 150);
}

// leader
function showLeadershipView() {
    hideAllViews();
    setActiveNav('nav-leadership');
    document.getElementById('leadership-view').style.display = 'block';
    renderLeadership();
}

function renderLeadership() {
    const container = document.getElementById('leadership-list');
    container.innerHTML = '';

    if (leadershipData.length === 0) {
        container.innerHTML = '<p class="text-center">Đang cập nhật dữ liệu lãnh đạo...</p>';
        return;
    }

    leadershipData.sort((a, b) => parseInt(a.STT) - parseInt(b.STT));

    leadershipData.forEach(leader => {
        const card = document.createElement('div');
        card.className = 'leader-card';
        const avatarSrc = 'img/default_avatar.webp';

        card.innerHTML = `
            <div class="leader-avatar-box">
                <img src="${avatarSrc}" class="leader-avatar" alt="${leader['Họ và tên']}">
            </div>
            <div class="leader-info">
                <span class="leader-rank">${leader['Cấp bậc']}</span>
                <h3 class="leader-name">${leader['Họ và tên']}</h3>
                <div class="leader-position">${leader['Chức vụ']}</div>
            </div>
        `;

        card.onclick = () => showLeaderDetail(leader);

        container.appendChild(card);
    });
}

function showLeaderDetail(leader) {
    const modal = document.getElementById('studentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.innerText = "LÝ LỊCH TRÍCH NGANG";

    modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #b71c1c; text-transform: uppercase;">${leader['Họ và tên']}</h2>
            <p style="font-weight: bold; font-size: 16px;">${leader['Cấp bậc']} - ${leader['Chức vụ']}</p>
        </div>

        <table class="detail-table">
            <tbody>
                <tr>
                    <td class="detail-label">Ngày sinh:</td>
                    <td>${leader['Ngày sinh'] || '...'}</td>
                </tr>
                <tr>
                    <td class="detail-label">Dân tộc / Tôn giáo:</td>
                    <td>${leader['Dân tộc']} / ${leader['Tôn giáo']}</td>
                </tr>
                <tr>
                    <td class="detail-label">Trình độ:</td>
                    <td>${leader['Trình độ']}</td>
                </tr>
                <tr>
                    <td class="detail-label">Năm bổ nhiệm:</td>
                    <td>${leader['Năm nhận chức vụ']}</td>
                </tr>
                <tr>
                    <td class="detail-label">Ngày vào Đảng:</td>
                    <td>${leader['Ngày vào Đảng']} (${leader['Chức vụ Đảng']})</td>
                </tr>
                <tr>
                    <td class="detail-label">Nguyên quán:</td>
                    <td>${leader['Nguyên quán']}</td>
                </tr>
                <tr>
                    <td class="detail-label">Quê quán:</td>
                    <td>${leader['Quê quán']}</td>
                </tr>
                <tr>
                    <td class="detail-label">Trú quán:</td>
                    <td>${leader['Trú quán']}</td>
                </tr>
            </tbody>
        </table>
    `;

    modal.style.display = "block";
}

// office
function parseOfficeData(rows) {
    officeData = [];
    let currentOffice = null;
    let currentUnit = null;

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const col0 = (row[0] || '').trim();

        if (col0.toUpperCase().startsWith('PHÒNG')) {
            currentOffice = {
                name: col0,
                commanders: [],
                units: []
            };
            officeData.push(currentOffice);
            currentUnit = null;
            continue;
        }

        if (col0.startsWith('Ban') && !row[2] && !row[3]) {
            currentUnit = {
                name: col0,
                staff: []
            };
            if (currentOffice) {
                currentOffice.units.push(currentUnit);
            }
            continue;
        }

        if (row[1] || row[2] || row[3]) {
            const staff = {
                name: row[1] || '',
                rank: row[2] || '',
                position: row[3] || '',
                fullInfo: row
            };

            if (currentUnit) {
                currentUnit.staff.push(staff);
            } 
            else if (currentOffice) {
                currentOffice.commanders.push(staff);
            }
        }
    }
}

function showOfficeView() {
    hideAllViews();
    setActiveNav('nav-office');
    document.getElementById('office-view').style.display = 'block';
    renderOffice();
}

function renderOffice() {
    const container = document.getElementById('office-container');
    container.innerHTML = '';

    if (officeData.length === 0) {
        container.innerHTML = '<p class="text-center">Đang cập nhật dữ liệu cơ quan...</p>';
        return;
    }

    officeData.forEach(office => {
        const card = document.createElement('div');
        card.className = 'office-card';

        let html = `
            <div class="office-header">
                <h3 class="office-title">${office.name}</h3>
            </div>
            <div class="office-body">
        `;

        if (office.commanders.length > 0) {
            html += `<div class="command-list"><div class="sub-title">Chỉ huy phòng</div>`;
            html += `<table class="staff-mini-table">`;
            office.commanders.forEach(cmd => {
                html += `
                    <tr onclick='showLeaderDetail(${JSON.stringify(mapStaffToLeader(cmd.fullInfo))})' style="cursor:pointer">
                        <td class="staff-role">${cmd.position}</td>
                        <td class="staff-name">${cmd.rank} ${cmd.name}</td>
                    </tr>`;
            });
            html += `</table></div>`;
        }

        if (office.units.length > 0) {
            html += `<div class="unit-grid">`;
            office.units.forEach(unit => {
                html += `
                    <div class="unit-box">
                        <div class="unit-name">${unit.name}</div>
                        <table class="staff-mini-table">
                `;
                unit.staff.forEach(s => {
                    html += `
                        <tr onclick='showLeaderDetail(${JSON.stringify(mapStaffToLeader(s.fullInfo))})' style="cursor:pointer">
                            <td class="staff-role">${s.position}</td>
                            <td class="staff-name">${s.rank} ${s.name}</td>
                        </tr>`;
                });
                html += `</table></div>`;
            });
            html += `</div>`;
        }

        html += `</div>`; // close office-body
        card.innerHTML = html;
        container.appendChild(card);
    });
}


function mapStaffToLeader(row) {
    return {
        'Họ và tên': row[1],
        'Cấp bậc': row[2],
        'Chức vụ': row[3],
        'Dân tộc': row[4],
        'Tôn giáo': row[5],
        'Trình độ': row[6],
        'Ngày vào Đảng': row[7],
        'Chức vụ Đảng': '',
        'Ngày sinh': row[8],
        'Nguyên quán': row[9],
        'Quê quán': row[10],
        'Trú quán': row[11],
        'Năm nhận chức vụ': row[12]
    };
}

// ranking
function showRankingView() {
    hideAllViews();
    setActiveNav('nav-ranking');
    document.getElementById('ranking-view').style.display = 'block';
    renderRankingTable();
}

function renderRankingTable() {
    const tbody = document.getElementById('ranking-body');
    tbody.innerHTML = '';

    if (rankingData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Đang tải dữ liệu...</td></tr>';
        return;
    }

    let cstdCount = 0;
    let csttCount = 0;
    let warnCount = 0;

    rankingData.forEach((student, index) => {
        const tr = document.createElement('tr');
        
        const rank = index + 1;
        
        if (rank === 1) tr.classList.add('top-1');
        else if (rank === 2) tr.classList.add('top-2');
        else if (rank === 3) tr.classList.add('top-3');

        let violationHtml = '';
        if (student['Vi Phạm'] && student['Vi Phạm'].toLowerCase().includes('x')) {
            violationHtml = '<span class="status-bad">Kỷ luật</span>';
            warnCount++;
        } else {
            violationHtml = '<span class="status-good">✓</span>';
        }

        let titleHtml = '<span class="badge-none">-</span>';
        const title = student['Xếp Loại'] ? student['Xếp Loại'].trim() : '';
        
        if (title === 'CSTĐ') {
            titleHtml = '<span class="badge badge-cstd">Chiến sĩ thi đua</span>';
            cstdCount++;
        } else if (title === 'CSTT') {
            titleHtml = '<span class="badge badge-cstt">Chiến sĩ tiên tiến</span>';
            csttCount++;
        }

        tr.innerHTML = `
            <td class="text-center"><span class="rank-num">${rank}</span></td>
            <td style="font-weight: 500;">${student['Họ và tên']}</td>
            <td class="text-center" style="font-weight: bold; color:#b71c1c">${student['Điểm TB']}</td>
            <td class="text-center">${violationHtml}</td>
            <td class="text-center">${titleHtml}</td>
        `;

        tbody.appendChild(tr);
    });

    document.getElementById('count-cstd').innerText = cstdCount;
    document.getElementById('count-cstt').innerText = csttCount;
    document.getElementById('count-warn').innerText = warnCount;
}

function showTeacherView() {
    hideAllViews();
    setActiveNav('nav-teacher');

    document.getElementById('teacher-view').style.display = 'block';
    renderDepartments();
}

function renderDepartments() {
    const container = document.getElementById('department-list');
    container.innerHTML = '';

    if (departmentsData.length === 0) {
        container.innerHTML = '<p class="text-center">Đang cập nhật dữ liệu khoa...</p>';
        return;
    }

    departmentsData.forEach(deptName => {
        if (!deptName) return;

        let displayName = deptName;

        if (displayName.includes("Tham Mưu Phương Pháp")) {
            displayName = displayName.replace("Tham Mưu", "Tham Mưu<br>");
        }

        const card = document.createElement('div');
        card.className = 'department-card';
        card.innerHTML = `
            <div class="dept-info">
                <span class="dept-name">${displayName}</span>
            </div>
            <div class="dept-icon">
                🏛️
            </div> 
        `;

        card.onclick = () => {
            alert(`Đang truy cập: ${deptName}`);
        };

        container.appendChild(card);
    });
}

function showGradeView(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    hideAllViews();
    document.getElementById('grade-view').style.display = 'block';
    setActiveNav('nav-grade');

    document.querySelectorAll('.dropdown').forEach(d => {
        d.classList.remove('active');
    });

    closeMenu();
}

// render data table
function renderTable(data, containerId, countId) {
    const container = document.getElementById(containerId);
    if (countId && document.getElementById(countId)) {
        document.getElementById(countId).innerText = `Tổng số: ${data.length} đ/c`;
    }

    if (!data || data.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:red">Không tìm thấy dữ liệu</div>';
        return;
    }

    let html = `
        <table class="military-table">
            <thead>
                <tr>
                    <th style="width:50px">STT</th>
                    <th>Họ và tên</th>
                    <th>Ngày sinh</th>
                    <th>Cấp bậc</th>
                    <th>Chức vụ</th>
                    <th>Quê quán</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach((st, i) => {
        // encoding
        const safeData = encodeURIComponent(JSON.stringify(st));
        html += `
            <tr onclick="openModal('${safeData}')">
                <td style="text-align:center">${i + 1}</td>
                <td style="font-weight:bold; color:#b71c1c">${st['Họ đệm tên khai sinh'] || ''}</td>
                <td>${st['Ngày tháng năm sinh'] || ''}</td>
                <td>${st['Cấp bậc'] || ''}</td>
                <td>${st['Chức vụ'] || ''}</td>
                <td>${st['Nguyên quán'] || ''}</td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

// search
const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const input = document.getElementById('searchInput');
        const key = input ? input.value.trim().toLowerCase() : '';

        if (!key) {
            alert("Vui lòng nhập tên cần tìm!");
            return;
        }

        const results = studentsData.filter(s =>
            (s['Họ đệm tên khai sinh'] || '').toLowerCase().includes(key)
        );
        renderTable(results, 'searchResultContainer', null);
    });
}

// modal
function openModal(dataStr) {
    try {
        const s = JSON.parse(decodeURIComponent(dataStr));
        const mBody = document.getElementById('modalBody');

        mBody.innerHTML = `
            <div class="detail-grid">
                <div class="d-item fw"><span class="d-label">HỌ TÊN:</span><span class="d-value" style="color:#b71c1c; text-transform:uppercase">${s['Họ đệm tên khai sinh']}</span></div>
                <div class="d-item"><span class="d-label">Ngày sinh:</span><span class="d-value">${s['Ngày tháng năm sinh']}</span></div>
                <div class="d-item"><span class="d-label">Cấp bậc:</span><span class="d-value">${s['Cấp bậc']}</span></div>
                <div class="d-item"><span class="d-label">Chức vụ:</span><span class="d-value">${s['Chức vụ']}</span></div>
                <div class="d-item"><span class="d-label">Đơn vị:</span><span class="d-value">${s['Đơn vị'] || '-'}</span></div>
                <div class="d-item"><span class="d-label">Ngày nhập ngũ:</span><span class="d-value">${s['Ngày nhập ngũ']}</span></div>
                <div class="d-item"><span class="d-label">Ngày vào Đảng:</span><span class="d-value">${s['Ngày vào Đảng'] || 'Chưa'}</span></div>
                <div class="d-item fw"><span class="d-label">Nguyên quán:</span><span class="d-value">${s['Nguyên quán']}</span></div>
                <div class="d-item fw"><span class="d-label">Trú quán:</span><span class="d-value">${s['Trú quán']}</span></div>
                <div class="d-item"><span class="d-label">Cha:</span><span class="d-value">${s['Họ đệm tên cha']}</span></div>
                <div class="d-item"><span class="d-label">Mẹ:</span><span class="d-value">${s['Họ đệm tên mẹ']}</span></div>
                ${s['Ghi chú'] ? `<div class="note-box"><span class="d-label" style="color:red">GHI CHÚ:</span> ${s['Ghi chú']}</div>` : ''}
            </div>
        `;
        document.getElementById('studentModal').style.display = 'block';
    } catch (e) {
        console.error("Lỗi hiển thị modal", e);
    }
}

function closeModal() { document.getElementById('studentModal').style.display = 'none'; }
window.onclick = (e) => { if (e.target == document.getElementById('studentModal')) closeModal(); }

function isValidScore(value) {
    if (value === '' || value === null) return false;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 10;
}

function calcSubjectScore() {
    const el10 = document.getElementById('s10');
    const el20 = document.getElementById('s20');
    const el70 = document.getElementById('s70');

    if (!isValidScore(el10.value) || !isValidScore(el20.value) || !isValidScore(el70.value)) {
        alert("Dữ liệu điểm không hợp lệ! Vui lòng kiểm tra lại.");
        return;
    }

    const s10 = parseFloat(el10.value);
    const s20 = parseFloat(el20.value);
    const s70 = parseFloat(el70.value);

    const kq = (s10 * 0.1) + (s20 * 0.2) + (s70 * 0.7);

    document.getElementById('subjectResult').style.display = 'block';

    const resultSpan = document.getElementById('finalScore');
    resultSpan.innerText = kq.toFixed(2);
    if (kq >= 8) resultSpan.style.color = '#2e7d32';
    else if (kq >= 5 && kq < 8) resultSpan.style.color = '#ff9800';
    else {
        resultSpan.style.color = 'red';
    }
}

// gpa
function initCourseSelect() {
    const sel = document.getElementById('courseSelect');
    if (!sel) return;

    coursesData.forEach(c => {
        if (c['Môn học']) {
            const opt = document.createElement('option');
            const code = c['Mã môn'] || '';
            opt.value = `${c['Môn học']}|${c['Số tín chỉ']}|${code}`;

            const displayCode = code ? ` [${code}]` : '';
            opt.text = `${displayCode} ${c['Môn học']} (${c['Số tín chỉ']} tín)`;

            sel.appendChild(opt);
        }
    });
}

function addToGPATable() {
    const select = document.getElementById('courseSelect');
    const scoreInput = document.getElementById('gpaScore');

    const val = select.value;
    const scoreVal = scoreInput.value;

    if (!val) {
        alert("Vui lòng chọn một môn học!");
        select.focus(); return;
    }

    if (!isValidScore(scoreVal)) {
        alert("Điểm không hợp lệ! Vui lòng kiểm tra lại.");
        scoreInput.focus(); return;
    }

    const [name, cred, code] = val.split('|');
    const credit = parseInt(cred);
    const score = parseFloat(scoreVal);

    // is this course available in the list?
    const index = gpaList.findIndex(item => item.name === name);

    if (index !== -1) {
        if (gpaList[index].score !== score) gpaList[index].score = score;
    } else gpaList.push({ name: name, credit: credit, score: score, code: code });

    // re-render table & reset form
    renderGPATable();

    // select.value = '';
    scoreInput.value = '';
    scoreInput.focus();
}

function renderGPATable() {
    const tbody = document.getElementById('gpaListBody');
    tbody.innerHTML = '';

    if (gpaList.length === 0) return;

    gpaList.forEach((item, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td class="text-center" style="color:#014282; font-weight:500">${item.code || '-'}</td> 
                <td class="text-center">${item.credit}</td>
                <td class="text-center">${item.score}</td>
                <td class="text-center" style="cursor:pointer;color:red;font-weight:bold" onclick="removeGpa(${idx})" title="Xóa">✖</td>
            </tr>
        `;
    });
}

function removeGpa(idx) {
    if (confirm("Bạn có chắc muốn xóa môn học này?")) {
        gpaList.splice(idx, 1);
        renderGPATable();
        // an kq cu neu thay doi list
        document.getElementById('gpaResult').style.display = 'none';
    }
}

function calcGPA() {
    if (gpaList.length === 0) {
        alert("Danh sách môn học đang trống! Vui lòng thêm môn học.");
        return;
    }

    let totalS = 0, totalC = 0;
    gpaList.forEach(i => {
        totalS += i.score * i.credit;
        totalC += i.credit;
    });

    // Validate chia cho 0
    if (totalC === 0) {
        alert("Tổng số tín chỉ bằng 0, không thể tính trung bình!");
        return;
    }

    const gpa = totalS / totalC;

    document.getElementById('gpaResult').style.display = 'block';

    const gpaSpan = document.getElementById('gpaValue');
    gpaSpan.innerText = gpa.toFixed(2);

    if (gpa >= 8.0) gpaSpan.style.color = '#2e7d32';
    else if (gpa >= 5.0) gpaSpan.style.color = '#ff9800';
    else gpaSpan.style.color = '#b71c1c';
}

// mobile menu function

function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');

    const mainContainer = document.querySelector('.main-container');
    if (navMenu.classList.contains('active')) {
        if (mainContainer) mainContainer.style.pointerEvents = 'none';
    } else {
        if (mainContainer) mainContainer.style.pointerEvents = 'auto';
    }
}

function closeMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.remove('active');

    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) mainContainer.style.pointerEvents = 'auto';
}
