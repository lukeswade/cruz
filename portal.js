// ── State ──
        let currentParentId = null;
        let players = [];
        let currentPlayer = null;
        let currentSession = null;
        let currentView = 'weekly';
        
        // Use today's actual date
        const now = new Date();
        let activeDate = now.toISOString().split('T')[0];
        let activeMonth = now.getMonth();  // 0-indexed
        let activeYear = now.getFullYear();

        // ── Date Utils ──
        function formatDateStr(y, m, d) {
            return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        }
        function getWeekDates(dateStr) {
            const d = new Date(dateStr + 'T12:00:00');
            const day = d.getDay();
            const sun = new Date(d);
            sun.setDate(d.getDate() - day);
            const dates = [];
            for (let i = 0; i < 7; i++) {
                const cur = new Date(sun);
                cur.setDate(sun.getDate() + i);
                dates.push(formatDateStr(cur.getFullYear(), cur.getMonth(), cur.getDate()));
            }
            return dates;
        }

        function prevPeriod() {
            if (currentView === 'weekly') {
                let d = new Date(activeDate + 'T12:00:00');
                d.setDate(d.getDate() - 7);
                activeDate = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
                activeMonth = d.getMonth();
                activeYear = d.getFullYear();
            } else {
                activeMonth--;
                if(activeMonth < 0) { activeMonth = 11; activeYear--; }
                let maxDays = new Date(activeYear, activeMonth + 1, 0).getDate();
                let day = parseInt(activeDate.split('-')[2]);
                if (day > maxDays) day = maxDays;
                activeDate = formatDateStr(activeYear, activeMonth, day);
            }
            buildWeeklyGrid();
            buildMonthlyGrid();
            loadDashboard();
        }

        function nextPeriod() {
            if (currentView === 'weekly') {
                let d = new Date(activeDate + 'T12:00:00');
                d.setDate(d.getDate() + 7);
                activeDate = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate());
                activeMonth = d.getMonth();
                activeYear = d.getFullYear();
            } else {
                activeMonth++;
                if(activeMonth > 11) { activeMonth = 0; activeYear++; }
                let maxDays = new Date(activeYear, activeMonth + 1, 0).getDate();
                let day = parseInt(activeDate.split('-')[2]);
                if (day > maxDays) day = maxDays;
                activeDate = formatDateStr(activeYear, activeMonth, day);
            }
            buildWeeklyGrid();
            buildMonthlyGrid();
            loadDashboard();
        }

        // ── Calendar Builders ──
        let scheduledDates = [];

        function buildWeeklyGrid() {
            const grid = document.getElementById('weekly-grid');
            grid.innerHTML = '';
            const weekDates = getWeekDates(activeDate);
            const todayStr = now.toISOString().split('T')[0];
            
            weekDates.forEach(dateStr => {
                const dayNum = parseInt(dateStr.split('-')[2]);
                const month = parseInt(dateStr.split('-')[1]);
                let cls = 'cal-date';
                if (dateStr === activeDate) cls += ' active';
                if (dateStr === todayStr) cls += ' today';
                if (scheduledDates.includes(dateStr)) cls += ' has-session';
                
                grid.innerHTML += `<div class="cal-date-container"><div class="${cls}" data-date="${dateStr}" onclick="selectDate(this)">${dayNum}</div></div>`;
            });
        }

        function buildMonthlyGrid() {
            const grid = document.getElementById('monthly-grid');
            grid.innerHTML = '';
            const firstDay = new Date(activeYear, activeMonth, 1).getDay();
            const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
            const todayStr = now.toISOString().split('T')[0];

            for (let i = 0; i < firstDay; i++) {
                grid.innerHTML += '<div class="cal-date-container"></div>';
            }
            for (let i = 1; i <= daysInMonth; i++) {
                const dateStr = formatDateStr(activeYear, activeMonth, i);
                let cls = 'cal-date';
                if (dateStr === activeDate) cls += ' active';
                if (dateStr === todayStr) cls += ' today';
                if (scheduledDates.includes(dateStr)) cls += ' has-session';
                grid.innerHTML += `<div class="cal-date-container"><div class="${cls}" data-date="${dateStr}" onclick="selectDate(this)">${i}</div></div>`;
            }
            
            // Update month label
            const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            document.getElementById('calendarMonthLabel').textContent = `${monthNames[activeMonth]} ${activeYear}`;
        }

        // ── Auth ──
        function showLoading() { document.getElementById('loadingOverlay').classList.add('show'); }
        function hideLoading() { document.getElementById('loadingOverlay').classList.remove('show'); }

        async function doLogin() {
            const email = document.getElementById('email').value.trim();
            const pass = document.getElementById('pass').value;
            const errEl = document.getElementById('loginError');
            errEl.style.display = 'none';

            if (!email || !pass) {
                errEl.textContent = 'Please enter email and password.';
                errEl.style.display = 'block';
                return;
            }

            showLoading();
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password: pass })
                });
                const data = await res.json();

                if (data.success) {
                    // Persist session
                    localStorage.setItem('cruz_session', JSON.stringify({
                        parent_id: data.parent_id,
                        players: data.players,
                        email: email
                    }));
                    initDashboard(data.parent_id, data.players, email);
                } else {
                    errEl.textContent = 'Invalid email or password.';
                    errEl.style.display = 'block';
                }
            } catch (e) {
                errEl.textContent = 'Network error. Please try again.';
                errEl.style.display = 'block';
            }
            hideLoading();
        }

        function doLogout() {
            localStorage.removeItem('cruz_session');
            currentParentId = null;
            players = [];
            currentPlayer = null;
            currentSession = null;
            
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('dashboardScreen').style.display = 'none';
            document.getElementById('logoutBtn').style.display = 'none';
            document.getElementById('headerSpacer').style.display = 'block';
            document.getElementById('email').value = '';
            document.getElementById('pass').value = '';
        }

        let currentUserEmail = null;

        function initDashboard(parentId, playersList, email) {
            currentParentId = parentId;
            players = playersList;
            currentUserEmail = email;

            // Show Coach Box if email is Cruz, Lee, or Luke
            const coachEmails = ['cruz@lukewade.net', 'lee@lukewade.net', 'luke@lukewade.net'];
            if (coachEmails.includes(currentUserEmail)) {
                document.getElementById('coach-tools-section').style.display = 'block';
            } else {
                document.getElementById('coach-tools-section').style.display = 'none';
            }

            // Populate dropdown
            const select = document.getElementById('groupSelect');
            select.innerHTML = '';
            players.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.firstname} ${p.lastname} – ${p.group_name}`;
                select.appendChild(opt);
            });
            
            currentPlayer = players[0];
            updateAvatarUI();

            // Welcome text
            document.getElementById('welcomeText').textContent = `Welcome, ${players[0].lastname} family`;

            // Show dashboard
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('dashboardScreen').style.display = 'block';
            document.getElementById('logoutBtn').style.display = 'block';
            document.getElementById('headerSpacer').style.display = 'none';

            buildWeeklyGrid();
            buildMonthlyGrid();
            loadDashboard();
        }
        
        // ── Player and Date Switching ──
        async function changePlayer() {
            const p_id = parseInt(document.getElementById('groupSelect').value);
            currentPlayer = players.find(p => p.id === p_id);
            updateAvatarUI();
            await loadDashboard();
        }

        function updateAvatarUI() {
            const avatarBox = document.getElementById('ui-current-avatar');
            if (currentPlayer && currentPlayer.photo_b64) {
                avatarBox.innerHTML = `<img src="${currentPlayer.photo_b64}" style="width: 100%; height: 100%; object-fit: cover;">`;
            } else if (currentPlayer) {
                avatarBox.innerHTML = currentPlayer.initials;
            }
        }

        async function handleAvatarUpload(event) {
            const file = event.target.files[0];
            if (!file || !currentPlayer) return;

            showLoading();
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = async function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Box Crop 150x150
                    const size = 150;
                    canvas.width = size;
                    canvas.height = size;
                    
                    const ratio = Math.max(size / img.width, size / img.height);
                    const drawW = img.width * ratio;
                    const drawH = img.height * ratio;
                    const drawX = (size - drawW) / 2;
                    const drawY = (size - drawH) / 2;
                    
                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                    const base64Str = canvas.toDataURL('image/jpeg', 0.8);
                    
                    currentPlayer.photo_b64 = base64Str;
                    updateAvatarUI();
                    
                    try {
                        await fetch('/api/upload_avatar', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ player_id: currentPlayer.id, b64: base64Str })
                        });
                        // Also persist to local session so it doesn't revert on reload before server sync
                        let sessionJSON = localStorage.getItem('cruz_session');
                        if (sessionJSON) {
                            let session = JSON.parse(sessionJSON);
                            let targetP = session.players.find(p => p.id === currentPlayer.id);
                            if (targetP) { targetP.photo_b64 = base64Str; }
                            localStorage.setItem('cruz_session', JSON.stringify(session));
                        }
                    } catch(err) {
                        console.error('Avatar upload failed', err);
                    }
                    hideLoading();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        let mediaRecorder = null;
        let audioChunks = [];
        let isRecording = false;

        async function toggleVoiceRecording() {
            const btn = document.getElementById('recordVoiceBtn');
            
            if (isRecording) {
                // Stop Recording
                mediaRecorder.stop();
                btn.innerHTML = 'Tap to Record Audio';
                btn.style.background = 'var(--bg-primary)';
                btn.style.color = 'var(--text-primary)';
                btn.classList.remove('recording-active');
                isRecording = false;
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
                    const ext = mediaRecorder.mimeType.includes("mp4") ? "m4a" : "webm";
                    const fileObj = new File([audioBlob], "recording." + ext, { type: mediaRecorder.mimeType });
                    processVoiceFeedback(fileObj);
                    
                    // Cleanup tracks
                    stream.getTracks().forEach(track => track.stop());
                });

                mediaRecorder.start();
                isRecording = true;
                btn.innerHTML = '🛑 Stop Recording...';
                btn.style.background = 'rgba(244,67,54,0.1)';
                btn.style.color = '#f44336';
                btn.classList.add('recording-active');
                
            } catch (err) {
                console.error("Microphone access denied", err);
                alert("Microphone access is required to use this feature. Please allow access in your browser settings.");
            }
        }

        async function processVoiceFeedback(blob) {
            showLoading();
            const outputBox = document.getElementById('ai-plan-output');
            outputBox.style.display = 'block';
            outputBox.innerHTML = '<i>Transcribing and Generating Plan...</i>';

            try {
                const formData = new FormData();
                formData.append('audio', blob);
                formData.append('player_id', currentPlayer.id);

                const res = await fetch('/api/feedback', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                
                if (data.success) {
                    let formattedPlan = data.plan
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: var(--accent); text-decoration: underline;">$1</a>');
                    outputBox.innerHTML = '<strong>Transcript:</strong><br>' + data.transcript + '<br><br><strong>Practice Plan Saved to Session:</strong><br>' + formattedPlan;
                    // Auto-refresh dashboard to show the new plan 
                    await loadDashboard();
                } else {
                    outputBox.innerHTML = '<span style="color: #f44336;">Error generating feedback: ' + (data.error || 'Server error') + '</span>';
                }
            } catch (err) {
                outputBox.innerHTML = '<span style="color: #f44336;">Network error generating feedback: ' + err.message + '</span>';
            }
            hideLoading();
        }

        async function selectDate(el) {
            document.querySelectorAll('.cal-date').forEach(d => d.classList.remove('active'));
            const clickedDate = el.getAttribute('data-date');
            document.querySelectorAll(`.cal-date[data-date="${clickedDate}"]`).forEach(d => d.classList.add('active'));
            activeDate = clickedDate;
            await loadDashboard();
        }

        // ── Dashboard Data ──
        async function loadDashboard() {
            try {
                const res = await fetch(`/api/dashboard/${currentPlayer.id}?date=${activeDate}&_t=${Date.now()}`);
                const data = await res.json();
                currentSession = data.session;
                scheduledDates = data.scheduled_dates || [];

                // Sync player info from live DB (fixes stale localStorage names)
                if (data.player) {
                    const fresh = data.player;
                    currentPlayer.firstname = fresh.firstname;
                    currentPlayer.lastname = fresh.lastname;
                    currentPlayer.initials = fresh.initials;
                    currentPlayer.group_name = fresh.group_name;
                    currentPlayer.photo_b64 = fresh.photo_b64;

                    // Update the dropdown option text
                    const opt = document.querySelector(`#groupSelect option[value="${currentPlayer.id}"]`);
                    if (opt) opt.textContent = `${fresh.firstname} ${fresh.lastname} – ${fresh.group_name}`;

                    // Update welcome text with the first player's live name
                    document.getElementById('welcomeText').textContent = `Welcome, ${players[0].lastname} family`;

                    updateAvatarUI();
                    updateAttendanceText(data.my_attendance);
                }
                
                // Rebuild grids with new scheduledDates
                buildWeeklyGrid();
                buildMonthlyGrid();
                
                if (data.session) {
                    document.getElementById('sessionContentWrapper').style.display = 'block';
                    document.getElementById('noSessionMessage').style.display = 'none';
                    
                    // Format date nicely
                    const d = new Date(data.session.date + 'T12:00:00');
                    const opts = { weekday: 'long', month: 'long', day: 'numeric' };
                    document.getElementById('ui-session-date').textContent = d.toLocaleDateString('en-US', opts);
                    document.getElementById('ui-session-time').textContent = data.session.time_str;

                    document.getElementById('attendanceToggle').checked = data.my_attendance;
                    updateAttendanceText(data.my_attendance);
                    
                    document.getElementById('ui-roster-count').textContent = `${data.attending_count} Attending`;
                    
                    const list = document.getElementById('rosterList');
                    list.innerHTML = '';
                    
                    data.roster.forEach(p => {
                        if (!p.is_attending) return;
                        const li = document.createElement('li');
                        li.className = 'roster-item';
                        
                        const avatarColor = !p.is_attending ? 'style="color: #f44336; background: rgba(244,67,54,0.1); border-color: rgba(244,67,54,0.2);"' : '';
                        const nameStyle = !p.is_attending ? 'style="color: var(--text-secondary);"' : '';
                        const indClass = p.is_attending ? 'status-indicator' : 'status-indicator status-out';
                        const nameStr = `${p.firstname} ${p.lastname.charAt(0)}.`;
                        
                        let avatarContent = p.photo_b64 ? `<img src="${p.photo_b64}" style="width: 100%; height: 100%; object-fit: cover;">` : p.initials;
                        
                        
                        li.innerHTML = `
                            <div class="avatar" ${avatarColor} style="overflow: hidden;">${avatarContent}</div>
                            <div class="roster-name" ${nameStyle}>${nameStr}</div>
                            <div class="${indClass}"></div>
                        `;
                        list.appendChild(li);
                    });
                    
                    // Display latest player feedback block for parents
                    const feedbackSection = document.getElementById('parent-feedback-section');
                    const planOutput = document.getElementById('ui-latest-plan');
                    if (data.player.latest_plan) {
                        feedbackSection.style.display = 'block';
                        let parsedPlan = data.player.latest_plan
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color: var(--accent); text-decoration: underline;">$1</a>');
                        planOutput.innerHTML = parsedPlan;
                    } else {
                        feedbackSection.style.display = 'none';
                    }

                } else {
                    document.getElementById('sessionContentWrapper').style.display = 'none';
                    document.getElementById('noSessionMessage').style.display = 'block';
                }
            } catch (e) {
                console.error('Dashboard load error:', e);
            }
        }

        function updateAttendanceText(isAttending) {
            const text = document.getElementById('attendance-status-text');
            text.textContent = isAttending 
                ? `${currentPlayer.firstname} is attending.`
                : `${currentPlayer.firstname} is NOT attending.`;
        }

        async function toggleAttendance() {
            const isChecked = document.getElementById('attendanceToggle').checked;
            updateAttendanceText(isChecked);
            
            if (currentSession && currentPlayer) {
                try {
                    await fetch('/api/attendance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            player_id: currentPlayer.id,
                            session_id: currentSession.id,
                            is_attending: isChecked ? 1 : 0
                        })
                    });
                    await loadDashboard();
                } catch (e) {
                    console.error('Attendance toggle error:', e);
                }
            }
        }

        function toggleCalendar(view) {
            currentView = view;
            const btnWeekly = document.getElementById('btn-weekly');
            const btnMonthly = document.getElementById('btn-monthly');
            const viewWeekly = document.getElementById('weekly-view');
            const viewMonthly = document.getElementById('monthly-view');

            if (view === 'weekly') {
                btnWeekly.classList.add('active');
                btnMonthly.classList.remove('active');
                viewWeekly.style.display = 'block';
                viewMonthly.style.display = 'none';
            } else {
                btnMonthly.classList.add('active');
                btnWeekly.classList.remove('active');
                viewMonthly.style.display = 'block';
                viewWeekly.style.display = 'none';
            }
        }

        // ── Restore Session on Load ──
        window.addEventListener('DOMContentLoaded', () => {
            const saved = localStorage.getItem('cruz_session');
            if (saved) {
                try {
                    const session = JSON.parse(saved);
                    if (session.parent_id && session.players && session.players.length > 0) {
                        initDashboard(session.parent_id, session.players, session.email);
                        return;
                    }
                } catch (e) {}
            }
            // Not logged in—show login form
            document.getElementById('loginScreen').style.display = 'flex';
        });
        
        // ── PWA Service Worker ──
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('SW registered', reg.scope))
                    .catch(err => console.log('SW failed', err));
            });
        }
