const fs = require('fs');

const images = [
    '/Users/LukeW/.gemini/antigravity/brain/1d5f645f-06ed-4dd7-a2d6-ec9be982e456/boy_phenom_1_1777445029673.png',
    '/Users/LukeW/.gemini/antigravity/brain/1d5f645f-06ed-4dd7-a2d6-ec9be982e456/girl_phenom_1_1777445042737.png',
    '/Users/LukeW/.gemini/antigravity/brain/1d5f645f-06ed-4dd7-a2d6-ec9be982e456/boy_phenom_2_1777445056684.png',
    '/Users/LukeW/.gemini/antigravity/brain/1d5f645f-06ed-4dd7-a2d6-ec9be982e456/girl_phenom_2_1777445068875.png'
];

let sql = `
DELETE FROM attendance;
DELETE FROM sessions;
DELETE FROM players;
DELETE FROM parents;

INSERT INTO parents (id, email, password) VALUES (1, 'parent@email.com', 'password');
`;

const players = [
    { id: 1, first: 'Liam', last: 'Smith', group: 'Development' },
    { id: 2, first: 'Mia', last: 'Johnson', group: 'Master Class' },
    { id: 3, first: 'Noah', last: 'Williams', group: 'Foundation' },
    { id: 4, first: 'Sophia', last: 'Brown', group: 'Development' },
];

for(let i=0; i<4; i++) {
    const p = players[i];
    let b64 = "";
    if (fs.existsSync(images[i])) {
        const buf = fs.readFileSync(images[i]);
        b64 = "data:image/png;base64," + buf.toString('base64');
    }
    sql += `INSERT INTO players (id, parent_id, firstname, lastname, initials, group_name, photo_b64, latest_plan) VALUES (${p.id}, 1, '${p.first}', '${p.last}', '${p.first[0]}${p.last[0]}', '${p.group}', '${b64}', NULL);\n`;
}

let current = new Date('2026-04-27T12:00:00'); // starting earlier in the week to ensure Monday
const end = new Date('2026-07-31T12:00:00');

let session_id = 1;
const groups = ['Foundation', 'Development', 'Master Class'];

while(current <= end) {
    const day = current.getDay();
    if (day >= 1 && day <= 4) { // Mon - Thu
        const dateStr = current.toISOString().split('T')[0];
        
        for (const g of groups) {
            const timeStr = g === 'Foundation' ? '4:00 PM' : g === 'Development' ? '5:30 PM' : '7:00 PM';
            sql += `INSERT INTO sessions (id, group_name, date, time_str) VALUES (${session_id}, '${g}', '${dateStr}', '${timeStr}');\n`;
            
            for (const p of players) {
                if (p.group === g) {
                    const is_att = Math.random() > 0.2 ? 1 : 0; // 80% chance attending
                    sql += `INSERT INTO attendance (session_id, player_id, is_attending) VALUES (${session_id}, ${p.id}, ${is_att});\n`;
                }
            }
            session_id++;
        }
    }
    current.setDate(current.getDate() + 1);
}

fs.writeFileSync('seed.sql', sql);
console.log('seed.sql created successfully');
