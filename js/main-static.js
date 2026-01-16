document.addEventListener('DOMContentLoaded', () => {
    loadStaticInfo();
});

function loadStaticInfo() {
    // Embedded Data from data/shipments.json
    const data = {
        "transporterName": "MAGESWARI PARCEL LORRY SERVICE",
        "experience": "15 Years of Experiances",
        "contactPhone": "7299544742, 7373320202",
        "gstn": "33EBTPM4034G1ZJ",
        "upiId": "gpay-12190017958@okbizaxis",
        "gpsLocation": "https://maps.app.goo.gl/u8mp5Gj5fEkhn2Ge7",
        "transits": [
            {
                "from": "CHENNAI",
                "to": "CHEYYAR",
                "intermediate": "Ayyangarkulam, Dusi, Maamandoor, Dharmapuram, Cheyyar SIPCOT all Phase, Mankal Koot Road, Akkur Koot Road, Koozhamandhal",
                "status": "On Time",
                "id": "TRN-549508"
            }
        ]
    };

    renderData(data);
}

function renderData(data) {
    document.getElementById('transporterName').textContent = data.transporterName || 'N/A';
    document.getElementById('headerTitle').textContent = data.transporterName || 'LogisticsHub';
    document.getElementById('experience').textContent = data.experience || 'N/A';
    document.getElementById('contactPhone').textContent = data.contactPhone || 'N/A';
    document.getElementById('gstn').textContent = data.gstn || 'N/A';
    document.getElementById('upiId').textContent = data.upiId || 'N/A';

    const gpsLink = document.getElementById('gpsLink');
    if (data.gpsLocation) {
        gpsLink.href = data.gpsLocation;
        gpsLink.style.display = 'inline';
    } else {
        gpsLink.style.display = 'none';
    }

    // Generate QR Code
    const qrContainer = document.getElementById('qrContainer');
    if (data.upiId) {
        // UPI URL Format: upi://pay?pa=ADDRESS&pn=NAME
        const upiUrl = `upi://pay?pa=${data.upiId}&pn=${encodeURIComponent(data.transporterName)}`;
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiUrl)}" alt="UPI QR">`;
    } else {
        qrContainer.innerHTML = '';
    }

    // Update Transits Table
    const tbody = document.querySelector('#transitsTable tbody');
    tbody.innerHTML = '';

    if (data.transits && data.transits.length > 0) {
        data.transits.forEach(transit => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                    <td>${transit.from}</td>
                    <td>${transit.to}</td>
                    <td>${transit.intermediate || '-'}</td>
                    <td><span class="status ${getStatusClass(transit.status)}">${transit.status}</span></td>
                `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No active transit routes.</td></tr>';
    }
}

function getStatusClass(status) {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s.includes('transit')) return 'in-transit';
    if (s.includes('delivered')) return 'delivered';
    return '';
}
