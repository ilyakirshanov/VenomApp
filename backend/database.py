import sqlite3
import os

DATABASE_PATH = os.getenv('DATABASE_PATH', 'instance/app.db')

def get_db():
    db_dir = os.path.dirname(DATABASE_PATH)
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
    
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  
    return conn

def create_default_admin():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        # default admin:admin 
        cursor.execute("INSERT INTO users (username, password, email, is_admin) VALUES ('admin', 'admin', 'admin@localhost', 1)")
        conn.commit()
    conn.close()

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT,
            is_admin INTEGER DEFAULT 0
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_path TEXT NOT NULL,
            caption TEXT,
            user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    create_default_admin()
    conn.commit()
    conn.close()

def add_user(username, password, email=None, is_admin=0):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f''' 
                   INSERT INTO users (username, password, email, is_admin) \
                            VALUES ('{username}', '{password}', '{email}', {is_admin});               
                   ''')
    conn.commit()
    conn.close()
def make_post(image_path, caption, user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f''' 
                   INSERT INTO posts (image_path, caption, user_id) \
                            VALUES ('{image_path}', '{caption}', {user_id});               
                   ''')
    conn.commit()
    conn.close()
def update_password(username, new_password):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f'''
                   UPDATE users SET password = '{new_password}' WHERE username = '{username}';
                   ''')
    conn.commit()
    conn.close()
def update_email(username, new_email):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f'''
                   UPDATE users SET email = '{new_email}' WHERE username = '{username}';
                   ''')
    conn.commit()
    conn.close()