import sqlite3
import os

DB_PATH = "cruz.db"

def init_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''CREATE TABLE IF NOT EXISTS parents (
                        id INTEGER PRIMARY KEY,
                        email TEXT UNIQUE,
                        password TEXT)''')
                        
    cursor.execute('''CREATE TABLE IF NOT EXISTS players (
                        id INTEGER PRIMARY KEY,
                        parent_id INTEGER,
                        firstname TEXT,
                        lastname TEXT,
                        initials TEXT,
                        group_name TEXT,
                        FOREIGN KEY(parent_id) REFERENCES parents(id))''')
                        
    cursor.execute('''CREATE TABLE IF NOT EXISTS sessions (
                        id INTEGER PRIMARY KEY,
                        group_name TEXT,
                        date TEXT,
                        time_str TEXT)''')
                        
    cursor.execute('''CREATE TABLE IF NOT EXISTS attendance (
                        id INTEGER PRIMARY KEY,
                        session_id INTEGER,
                        player_id INTEGER,
                        is_attending INTEGER,
                        UNIQUE(session_id, player_id),
                        FOREIGN KEY(session_id) REFERENCES sessions(id),
                        FOREIGN KEY(player_id) REFERENCES players(id))''')

    # Seed Data
    cursor.execute("INSERT INTO parents (id, email, password) VALUES (1, 'parent@example.com', 'password123')")
    
    # Players (Now Parent 1 has TWO kids to test dropdown)
    cursor.execute("INSERT INTO players (id, parent_id, firstname, lastname, initials, group_name) VALUES (1, 1, 'Liam', 'Smith', 'LS', 'U11-U12 Elite')")
    cursor.execute("INSERT INTO players (id, parent_id, firstname, lastname, initials, group_name) VALUES (5, 1, 'Noah', 'Smith', 'NS', 'U13 Mastery Clinic')")
    
    cursor.execute("INSERT INTO players (id, parent_id, firstname, lastname, initials, group_name) VALUES (2, NULL, 'Jackson', 'C', 'JC', 'U11-U12 Elite')")
    cursor.execute("INSERT INTO players (id, parent_id, firstname, lastname, initials, group_name) VALUES (3, NULL, 'Mateo', 'R', 'MR', 'U11-U12 Elite')")
    cursor.execute("INSERT INTO players (id, parent_id, firstname, lastname, initials, group_name) VALUES (4, NULL, 'Ethan', 'W', 'EW', 'U11-U12 Elite')")
    
    # Sessions
    cursor.execute("INSERT INTO sessions (id, group_name, date, time_str) VALUES (101, 'U11-U12 Elite', '2026-04-20', 'Spirit Park • 5:00 PM - 6:00 PM')")
    cursor.execute("INSERT INTO sessions (id, group_name, date, time_str) VALUES (102, 'U11-U12 Elite', '2026-04-22', 'Spirit Park • 5:00 PM - 6:00 PM')")
    cursor.execute("INSERT INTO sessions (id, group_name, date, time_str) VALUES (103, 'U13 Mastery Clinic', '2026-04-20', 'Spirit Park • 7:00 PM - 8:30 PM')")
    cursor.execute("INSERT INTO sessions (id, group_name, date, time_str) VALUES (104, 'U13 Mastery Clinic', '2026-04-24', 'Spirit Park • 7:00 PM - 8:30 PM')")
    
    # Attendance for session 101 (20th)
    cursor.execute("INSERT INTO attendance (session_id, player_id, is_attending) VALUES (101, 1, 1)") # Liam Attending
    cursor.execute("INSERT INTO attendance (session_id, player_id, is_attending) VALUES (101, 2, 1)")
    cursor.execute("INSERT INTO attendance (session_id, player_id, is_attending) VALUES (101, 3, 1)")
    cursor.execute("INSERT INTO attendance (session_id, player_id, is_attending) VALUES (101, 4, 0)") # Ethan Not Attending

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("DB Reset & Seeded with Multi-Child logic!")
