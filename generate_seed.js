const fs = require('fs');

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

// All players in the Development group (ages 6-11, Mon-Thu 6pm)
// Colt & Charlie Wade belong to Luke (parent 1)
// The rest are other families' kids to fill out the roster
const players = [
    { id: 1,  parent_id: 1, first: 'Colt',    last: 'Wade',      group: 'Development', img: 1 },
    { id: 2,  parent_id: 1, first: 'Charlie',  last: 'Wade',      group: 'Development', img: 2 },
    { id: 3,  parent_id: 2, first: 'Mateo',    last: 'Reyes',     group: 'Development', img: 3 },
    { id: 4,  parent_id: 2, first: 'Sofia',    last: 'Reyes',     group: 'Development', img: 4 },
    { id: 5,  parent_id: 3, first: 'Jayden',   last: 'Okafor',    group: 'Development', img: 1 },
    { id: 6,  parent_id: 4, first: 'Emma',     last: 'Chen',      group: 'Development', img: 2 },
    { id: 7,  parent_id: 4, first: 'Noah',     last: 'Patel',     group: 'Development', img: 3 },
    { id: 8,  parent_id: 4, first: 'Ava',      last: 'Brooks',    group: 'Development', img: 4 },
    { id: 9,  parent_id: 4, first: 'Lucas',    last: 'Martinez',  group: 'Development', img: 1 },
    { id: 10, parent_id: 4, first: 'Isla',     last: 'Thompson',  group: 'Development', img: 2 },
];

for (const p of players) {
    const url = `/assets/player${p.img}.png`;
    const initials = `${p.first[0]}${p.last[0]}`;
    sql += `INSERT INTO players (id, parent_id, firstname, lastname, initials, group_name, photo_b64, latest_plan) VALUES (${p.id}, ${p.parent_id}, '${p.first}', '${p.last}', '${initials}', '${p.group}', '${url}', NULL);\n`;
}

// Generate sessions Mon-Thu from late April through end of July
let current = new Date('2026-04-27T12:00:00');
const end = new Date('2026-07-31T12:00:00');
let session_id = 1;

while (current <= end) {
    const day = current.getDay();
    if (day >= 1 && day <= 4) { // Mon - Thu
        const dateStr = current.toISOString().split('T')[0];
        sql += `INSERT INTO sessions (id, group_name, date, time_str) VALUES (${session_id}, 'Development', '${dateStr}', '6:00 PM');\n`;

        for (const p of players) {
            // Colt & Charlie: 40% attendance, everyone else: 9%
            const rate = (p.id <= 2) ? 0.4 : 0.09;
            const is_att = Math.random() < rate ? 1 : 0;
            sql += `INSERT INTO attendance (session_id, player_id, is_attending) VALUES (${session_id}, ${p.id}, ${is_att});\n`;
        }
        session_id++;
    }
    current.setDate(current.getDate() + 1);
}

fs.writeFileSync('seed.sql', sql);
console.log(`seed.sql created — ${session_id - 1} sessions, ${players.length} players`);
