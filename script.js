let studentsData = [];

fetch('data.csv')
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể tải file data.csv');
        }
        return response.text();
    })
    .then(csvText => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                studentsData = results.data;
                console.log('Đã tải thành công ' + studentsData.length + ' học viên');
            }
        });
    })
    .catch(error => {
        console.error('Lỗi khi tải file CSV:', error);
        document.getElementById('resultContainer').innerHTML =
            '<div class="no-result">⚠️ Lỗi hệ thống: Không thể tải dữ liệu. Vui lòng kiểm tra kết nối.</div>';
    });

function searchStudents() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultContainer = document.getElementById('resultContainer');

    resultContainer.innerHTML = '';

    if (!searchTerm) {
        resultContainer.innerHTML = '<div class="empty-state">Vui lòng nhập tên để bắt đầu tìm kiếm</div>';
        return;
    }

    const results = studentsData.filter(student => {
        const fullName = (student['Họ đệm tên khai sinh'] || '').toLowerCase();
        return fullName.includes(searchTerm);
    });

    if (results.length === 0) {
        resultContainer.innerHTML = `<div class="no-result">Không tìm thấy học viên nào có tên: "<strong>${document.getElementById('searchInput').value}</strong>"</div>`;
        return;
    }

    let html = '';
    results.forEach(student => {
        html += `
            <div class="student-card">
                <h3>👤 ${student['Họ đệm tên khai sinh'] || 'Không rõ tên'}</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Ngày sinh:</span>
                        <span class="info-value">${student['Ngày tháng năm sinh'] || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cấp bậc:</span>
                        <span class="info-value">${student['Cấp bậc'] || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Chức vụ:</span>
                        <span class="info-value">${student['Chức vụ'] || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Ngày nhập ngũ:</span>
                        <span class="info-value">${student['Ngày nhập ngũ'] || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Quê quán:</span>
                        <span class="info-value">${student['Nguyên quán'] || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Đơn vị:</span>
                        <span class="info-value">${student['Đơn vị'] || 'Học viên'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cha:</span>
                        <span class="info-value">${student['Họ đệm tên cha'] || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Mẹ:</span>
                        <span class="info-value">${student['Họ đệm tên mẹ'] || 'N/A'}</span>
                    </div>
                </div>
                ${student['Ghi chú'] ? `
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ccc;">
                        <span class="info-label">Ghi chú:</span>
                        <span class="info-value" style="color: red;">${student['Ghi chú']}</span>
                    </div>
                ` : ''}
            </div>
        `;
    });

    resultContainer.innerHTML = html;
}

document.getElementById('searchBtn').addEventListener('click', searchStudents);
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchStudents();
    }
});