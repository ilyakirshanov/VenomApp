
'''
В этой версии SQL запросы обрабатываются корректно и не подставляются напрямую в запрос, 
что позволяет избежать иньекций
'''

from flask import Blueprint, request, jsonify, session
from database import get_db, add_user, update_password, update_email


auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    try:
        add_user(username, password, email)
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(" SELECT * FROM users WHERE username = ? AND password = ?", (username, password,))
    user = cursor.fetchone()
    if user:
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['is_admin'] = user['is_admin']
        conn.close()
        return jsonify({'message': 'Login successful', 'user': {'id': user['id'], 'username': user['username'], 'is_admin': user['is_admin']}}), 200
    else:
        conn.close()
        return jsonify({'error': 'Invalid username or password'}), 401
    

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/me', methods=['GET'])
def me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, is_admin FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify(dict(user))
    else:
        return jsonify({'error': 'User not found'}), 404

@auth_bp.route('/update_password', methods=['POST'])
def update_profile():   
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    new_password = data.get('new_password')
    new_email = data.get('new_email')

    if not new_password and not new_email:
        return jsonify({'error': 'No new password or email provided'}), 400

    try:
        if new_password:
            update_password(user_id, new_password)
        if new_email:
            update_email(user_id, new_email)
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
