from flask import Blueprint, request, jsonify, session
from database import get_db, make_post
import os

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/posts', methods=['GET'])
def get_posts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM posts ORDER BY created_at DESC")
    posts = cursor.fetchall()
    conn.close()
    
    return jsonify([dict(post) for post in posts]), 200

@posts_bp.route('/posts', methods=['POST'])
def create_post():
    if session.get('is_admin') != 1:
        return jsonify({'error': 'Access denied'}), 403

    if 'image' not in request.files:
        return jsonify({'error': 'No image file'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    caption = request.form.get('caption', '')

    os.makedirs('uploads', exist_ok=True)
    
    upload_path = os.path.join('uploads', file.filename)
    file.save(upload_path)

    user_id = session.get('user_id')
    make_post(file.filename, caption, user_id)

    return jsonify({'message': 'Post created', 'image_path': file.filename}), 201