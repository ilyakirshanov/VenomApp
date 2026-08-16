from flask import Flask, render_template, jsonify
from database import init_db
from routes.auth import auth_bp
from routes.posts import posts_bp
from routes.upload import upload_bp
from routes.admin import admin_bp
import os
import shutil


app = Flask(__name__, 
            static_folder='../frontend', 
            static_url_path='/', 
            template_folder='../frontend')


app.secret_key = 'supersecretkey'

# создаёт таблицы и админа admin:admin
init_db()


app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(posts_bp, url_prefix='/api')
app.register_blueprint(upload_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api')


@app.route('/')
def main_page():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/admin')
def admin_page():
    return render_template('admin.html')

@app.route('/profile')
def profile_page():
    return render_template('profile.html')

@app.route('/api/reinit', methods=['POST'])
def reinit_db():
    try:
        if os.path.exists('instance'):
            shutil.rmtree('instance')
        init_db()
        return jsonify({'message': 'Database reinitialized. Admin: admin:admin'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)