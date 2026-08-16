from flask import Blueprint, request, jsonify, session
from database import get_db
import requests  

admin_bp = Blueprint('admin', __name__)

def is_admin():
    return session.get('is_admin') == 1

@admin_bp.route('/admin/users', methods=['GET'])
def get_users():
    if not is_admin():
        return jsonify({'error': 'Access denied'}), 403

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, is_admin FROM users")
    users = cursor.fetchall()
    conn.close()
    return jsonify([dict(user) for user in users]), 200

@admin_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if not is_admin():
        return jsonify({'error': 'Access denied'}), 403


    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'User deleted'}), 200

