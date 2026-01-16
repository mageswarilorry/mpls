// Basic Auth Check for Admin Page
function checkAuth() {
    // Simple client-side check
}

document.addEventListener('DOMContentLoaded', () => {

    /* --- LOGIN PAGE LOGIC --- */
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const msg = document.getElementById('message');

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const data = await res.json();

                if (data.success) {
                    window.location.href = '/admin.html';
                } else {
                    msg.style.display = 'block';
                    msg.textContent = 'Invalid Password';
                }
            } catch (err) {
                console.error(err);
                msg.style.display = 'block';
                msg.textContent = 'Error logging in';
            }
        });
    }

    /* --- DASHBOARD LOGIC --- */
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/login.html';
        });
    }

    // Load Initial Data
    if (document.getElementById('updateInfoForm')) {
        loadDashboardData();
    }

    // Update Global Info
    const updateInfoForm = document.getElementById('updateInfoForm');
    if (updateInfoForm) {
        updateInfoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const payload = {
                transporterName: document.getElementById('transporterName').value,
                experience: document.getElementById('experience').value,
                contactPhone: document.getElementById('contactPhone').value,
                gstn: document.getElementById('gstn').value,
                upiId: document.getElementById('upiId').value,
                gpsLocation: document.getElementById('gpsLocation').value
            };

            try {
                const res = await fetch('/api/update-info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    alert('Information Updated Successfully!');
                } else {
                    alert('Failed to update. Are you logged in?');
                }
            } catch (err) {
                console.error(err);
            }
        });
    }

    // Add / Edit Transit
    const addTransitForm = document.getElementById('addTransitForm');
    const cancelBtn = document.getElementById('cancelBtn');

    if (addTransitForm) {
        addTransitForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const editId = document.getElementById('editId').value;
            const isEdit = !!editId;

            const payload = {
                from: document.getElementById('from').value,
                to: document.getElementById('to').value,
                intermediate: document.getElementById('intermediate').value,
                status: document.getElementById('status').value
            };

            const endpoint = isEdit ? '/api/update-transit' : '/api/add-transit';
            if (isEdit) payload.id = editId;

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert(isEdit ? 'Transit Updated!' : 'Transit Route Added!');
                    resetForm();
                    loadDashboardData(); // Refresh list
                } else {
                    alert('Failed to save. Are you logged in?');
                }
            } catch (err) {
                console.error(err);
            }
        });

        if (cancelBtn) {
            cancelBtn.addEventListener('click', resetForm);
        }
    }
});

async function loadDashboardData() {
    try {
        const res = await fetch('/api/info');
        const data = await res.json();

        // Populate Info Form
        if (data.transporterName) document.getElementById('transporterName').value = data.transporterName;
        if (data.experience) document.getElementById('experience').value = data.experience;
        if (data.contactPhone) document.getElementById('contactPhone').value = data.contactPhone;
        if (data.gstn) document.getElementById('gstn').value = data.gstn;
        if (data.upiId) document.getElementById('upiId').value = data.upiId;
        if (data.gpsLocation) document.getElementById('gpsLocation').value = data.gpsLocation;

        // Populate Routes Table
        const tbody = document.querySelector('#adminRoutesTable tbody');
        tbody.innerHTML = '';
        if (data.transits && data.transits.length > 0) {
            data.transits.forEach(t => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${t.from}</td>
                    <td>${t.to}</td>
                    <td><span class="status">${t.status}</span></td>
                    <td>
                        <button class="btn-sm edit-btn" data-id="${t.id}" data-obj='${JSON.stringify(t)}'>Edit</button>
                        <button class="btn-sm delete-btn" data-id="${t.id}" style="background:#ef4444; margin-left:5px;">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Attach Event Listeners to dynamic buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const t = JSON.parse(e.target.dataset.obj);
                    editTransit(t);
                    // scroll to form
                    document.getElementById('addTransitForm').scrollIntoView({ behavior: 'smooth' });
                });
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    if (confirm('Are you sure you want to delete this route?')) {
                        deleteTransit(id);
                    }
                });
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No active routes.</td></tr>';
        }

    } catch (err) {
        console.error(err);
    }
}

function editTransit(t) {
    document.getElementById('editId').value = t.id;
    document.getElementById('from').value = t.from;
    document.getElementById('to').value = t.to;
    document.getElementById('intermediate').value = t.intermediate || '';
    document.getElementById('status').value = t.status;

    document.getElementById('saveBtn').textContent = 'Update Transit';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    document.querySelector('#addTransitForm h2').textContent = 'Edit Transit Route'; // A bit hacky but works since h2 is previous sibling often, or we just rely on button text
}

function resetForm() {
    document.getElementById('addTransitForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('saveBtn').textContent = 'Add Transit Route';
    document.getElementById('cancelBtn').style.display = 'none';
}

async function deleteTransit(id) {
    try {
        const res = await fetch('/api/delete-transit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (res.ok) {
            loadDashboardData();
        } else {
            alert('Failed to delete');
        }
    } catch (err) {
        console.error(err);
    }
}
