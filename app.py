from flask import Flask, send_from_directory, request, jsonify
import sqlite3
import os

app = Flask(__name__, static_folder=".", static_url_path="")
DB_PATH = "cruz.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

@app.route('/portal.html')
def portal():
    return send_from_directory('.', 'portal.html')

@app.route('/style.css')
def style():
    return send_from_directory('.', 'style.css')

@app.route('/assets/<path:path>')
def assets(path):
    return send_from_directory('./assets', path)

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    conn = get_db()
    parent = conn.execute("SELECT * FROM parents WHERE email = ?", (data.get('email'),)).fetchone()
    if parent and parent['password'] == data.get('password'):
        players = conn.execute("SELECT * FROM players WHERE parent_id = ?", (parent['id'],)).fetchall()
        conn.close()
        players_list = [dict(p) for p in players]
        return jsonify({"success": True, "parent_id": parent['id'], "players": players_list})
    conn.close()
    return jsonify({"success": False, "error": "Invalid credentials"}), 401

@app.route('/api/dashboard/<int:player_id>', methods=['GET'])
def api_dashboard(player_id):
    date = request.args.get('date', '2026-04-20')
    conn = get_db()
    player = conn.execute("SELECT * FROM players WHERE id=?", (player_id,)).fetchone()
    
    # Get today's session for the player's group
    session = conn.execute("SELECT * FROM sessions WHERE group_name=? AND date=?", (player['group_name'], date)).fetchone()
    
    if not session:
        conn.close()
        return jsonify({"player": dict(player), "session": None})
        
    session_id = session['id']
    
    # Get roster and attendance
    all_players = conn.execute("SELECT * FROM players WHERE group_name=?", (player['group_name'],)).fetchall()
    
    roster = []
    attending_count = 0
    my_attendance = False
    
    for p in all_players:
        att_record = conn.execute("SELECT is_attending FROM attendance WHERE session_id=? AND player_id=?", (session_id, p['id'])).fetchone()
        is_attending = bool(att_record['is_attending']) if att_record else False
        
        roster.append({
            "id": p['id'],
            "firstname": p['firstname'],
            "lastname": p['lastname'],
            "initials": p['initials'],
            "is_attending": is_attending,
            "is_me": p['id'] == player_id
        })
        
        if is_attending:
            attending_count += 1
            if p['id'] == player_id:
                my_attendance = True
                
    conn.close()
    
    return jsonify({
        "player": dict(player),
        "session": dict(session),
        "roster": roster,
        "attending_count": attending_count,
        "total_count": len(all_players),
        "my_attendance": my_attendance
    })

@app.route('/api/attendance', methods=['POST'])
def api_attendance():
    data = request.json
    player_id = data.get('player_id')
    session_id = data.get('session_id')
    is_attending = data.get('is_attending')
    
    conn = get_db()
    # Upsert attendance
    conn.execute('''INSERT INTO attendance(session_id, player_id, is_attending) 
                    VALUES(?, ?, ?) 
                    ON CONFLICT(session_id, player_id) 
                    DO UPDATE SET is_attending=excluded.is_attending''', 
                 (session_id, player_id, int(is_attending)))
    conn.commit()
    conn.close()
    
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5555, debug=True)
