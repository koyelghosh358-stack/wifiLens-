import sqlite3

conn = sqlite3.connect('wifilens.db')
c = conn.cursor()
c.execute("""
    SELECT u.email, s.created_at, s.network_count
    FROM scan_sessions s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.created_at DESC
    LIMIT 5
""")
for row in c.fetchall():
    print(row)