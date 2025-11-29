let studentsData = [];
let coursesData = [];
let gpaList = [];

// load data
document.addEventListener('DOMContentLoaded', () => {
    // load students
    fetch('data.csv')
        .then(res => res.ok ? res.text() : Promise.reject('Không tìm thấy data.csv'))
        .then(text => Papa.parse(text, {
            header: true, skipEmptyLines: true,
            complete: r => studentsData = r.data
        }))
        .catch(err => console.error(err));

    // load courses
    fetch('courses.csv')
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
    ['home-view', 'battalion-view', 'company-list-view', 'grade-view'].forEach(id => {
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
}

function showCompanyList(id) {
    hideAllViews();
    document.getElementById('company-list-view').style.display = 'block';
    if (id === 'c4') renderTable(studentsData, 'tableContainer', 'total-count');
}

function showGradeView() {
    hideAllViews();
    document.getElementById('grade-view').style.display = 'block';
    setActiveNav('nav-grade');
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
    
    if(gpaList.length === 0) return;

    gpaList.forEach((item, idx) => {
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td class="text-center" style="color:#014282; font-weight:500">${item.code || '-'}</td> 
                <td class="text-center">${item.credit}</td>
                <td class="text-center">${item.score}</td>
                <td class="text-center" style="cursor:pointer;color:red;font-weight:bold" onclick="removeGpa(${idx})" title="Xóa">❌</td>
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