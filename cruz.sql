
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS parents;

CREATE TABLE parents (
                        id INTEGER PRIMARY KEY,
                        email TEXT UNIQUE,
                        password TEXT);
INSERT INTO parents VALUES(1,'parent@example.com','password123');
INSERT INTO parents VALUES(2,'luke@lukewade.net','lukewade');
INSERT INTO parents VALUES(3,'cruz@lukewade.net','cruz');
INSERT INTO parents VALUES(4,'lee@lukewade.net','lee');
CREATE TABLE players (
                        id INTEGER PRIMARY KEY,
                        parent_id INTEGER,
                        firstname TEXT,
                        lastname TEXT,
                        initials TEXT,
                        group_name TEXT,
                        FOREIGN KEY(parent_id) REFERENCES parents(id));
INSERT INTO players VALUES(1,2,'Liam','Smith','LS','U11-U12 Elite');
INSERT INTO players VALUES(2,2,'Jackson','C','JC','U11-U12 Elite');
INSERT INTO players VALUES(3,3,'Mateo','R','MR','U11-U12 Elite');
INSERT INTO players VALUES(4,4,'Ethan','W','EW','U11-U12 Elite');
INSERT INTO players VALUES(5,3,'Noah','Smith','NS','U13 Mastery Clinic');
CREATE TABLE sessions (
                        id INTEGER PRIMARY KEY,
                        group_name TEXT,
                        date TEXT,
                        time_str TEXT);
INSERT INTO sessions VALUES(101,'U11-U12 Elite','2026-04-20','Spirit Park • 5:00 PM - 6:00 PM');
INSERT INTO sessions VALUES(102,'U11-U12 Elite','2026-04-22','Spirit Park • 5:00 PM - 6:00 PM');
INSERT INTO sessions VALUES(103,'U13 Mastery Clinic','2026-04-20','Spirit Park • 7:00 PM - 8:30 PM');
INSERT INTO sessions VALUES(104,'U13 Mastery Clinic','2026-04-24','Spirit Park • 7:00 PM - 8:30 PM');
CREATE TABLE attendance (
                        id INTEGER PRIMARY KEY,
                        session_id INTEGER,
                        player_id INTEGER,
                        is_attending INTEGER,
                        UNIQUE(session_id, player_id),
                        FOREIGN KEY(session_id) REFERENCES sessions(id),
                        FOREIGN KEY(player_id) REFERENCES players(id));
INSERT INTO attendance VALUES(1,101,1,1);
INSERT INTO attendance VALUES(2,101,2,1);
INSERT INTO attendance VALUES(3,101,3,1);
INSERT INTO attendance VALUES(4,101,4,0);
