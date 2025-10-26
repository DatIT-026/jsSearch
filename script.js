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
            '<div class="no-result">⚠️ Không thể tải file data.csv. Vui lòng kiểm tra file có tồn tại cùng thư mục với index.html</div>';
    });

function searchStudents() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultContainer = document.getElementById('resultContainer');

    if (!searchTerm) {
        resultContainer.innerHTML = '<div class="no-result">Vui lòng nhập tên để tìm kiếm</div>';
        return;
    }

    const results = studentsData.filter(student => {
        const fullName = (student['Họ đệm tên khai sinh'] || '').toLowerCase();
        return fullName.includes(searchTerm);
    });

    if (results.length === 0) {
        resultContainer.innerHTML = '<div class="no-result">Không tìm thấy kết quả nào</div>';
        return;
    }

    let html = `<div class="total-count">Tìm thấy ${results.length} kết quả</div>`;

    results.forEach(student => {
        html += `
                    <div class="student-card">
                        <h3>${student['Họ đệm tên khai sinh'] || 'N/A'}</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">STT:</span>
                                <span class="info-value">${student['STT'] || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Ngày sinh:</span>
                                <span class="info-value">${student['Ngày tháng năm sinh'] || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Cấp bậc:</span>
                                <span class="info-value">${student['Cấp bậc'] || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Ngày nhận cấp:</span>
                                <span class="info-value">${student['Ngày nhận cấp'] || 'N/A'}</span>
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
                                <span class="info-label">Ngày vào Đoàn:</span>
                                <span class="info-value">${student['Ngày vào Đoàn'] || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Ngày vào Đảng:</span>
                                <span class="info-value">${student['Ngày vào Đảng'] || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Dân tộc:</span>
                                <span class="info-value">${student['D.tộc'] || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Tôn giáo:</span>
                                <span class="info-value">${student['T.giáo'] || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Văn hóa:</span>
                                <span class="info-value">${student['1.V.hóa'] || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Sức khỏe:</span>
                                <span class="info-value">${student['2.S.khỏe'] || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Nguyên quán:</span>
                                <span class="info-value">${student['Nguyên quán'] || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Thông tin cha:</span>
                                <span class="info-value">${student['Họ đệm tên cha'] || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Thông tin mẹ:</span>
                                <span class="info-value">${student['Họ đệm tên mẹ'] || 'N/A'}</span>
                            </div>
                            ${student['Ghi chú'] ? `
                            <div class="info-item">
                                <span class="info-label">Ghi chú:</span>
                                <span class="info-value">${student['Ghi chú']}</span>
                            </div>
                            ` : ''}
                        </div>
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