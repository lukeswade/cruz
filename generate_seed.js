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

INSERT INTO parents (id, email, password) VALUES (1, 'luke@lukewade.net', 'lukewade');
INSERT INTO parents (id, email, password) VALUES (2, 'cruz@lukewade.net', 'cruz');
INSERT INTO parents (id, email, password) VALUES (3, 'lee@lukewade.net', 'lee');
INSERT INTO parents (id, email, password) VALUES (4, 'parent@email.com', 'password');
`;

const players = [
    { id: 1, first: 'Colt', last: 'Smith', group: 'Development' },
    { id: 2, first: 'Char', last: 'Johnson', group: 'Development' },
    { id: 3, first: 'Noah', last: 'Williams', group: 'Foundation' },
    { id: 4, first: 'Sophia', last: 'Brown', group: 'Master Class' },
];

for(let i=0; i<4; i++) {
    const p = players[i];
    const url = `/assets/player${i+1}.png`;
    let parent_id = 1; // Default to Luke
    if (i === 2) parent_id = 2; // Noah to Cruz
    if (i === 3) parent_id = 3; // Sophia to Lee
    sql += `INSERT INTO players (id, parent_id, firstname, lastname, initials, group_name, photo_b64, latest_plan) VALUES (${p.id}, ${parent_id}, '${p.first}', '${p.last}', '${p.first[0]}${p.last[0]}', '${p.group}', '${url}', NULL);\n`;
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
            const timeStr = '6:00 PM';
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
