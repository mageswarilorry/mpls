document.addEventListener('DOMContentLoaded', () => {
    fetchInfo();
});

async function fetchInfo() {
    try {
        // Fetch static JSON file for GitHub Pages compatibility
        const response = await fetch('data/shipments.json');
        const data = await response.json();

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
            // We can just encode the UPI ID or a full link
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

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function getStatusClass(status) {
    if (!status) return '';
    const s = status.toLowerCase();
    if (s.includes('transit')) return 'in-transit';
    if (s.includes('delivered')) return 'delivered';
    return '';
}
