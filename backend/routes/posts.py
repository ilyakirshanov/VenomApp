import os
import uuid
import imghdr
from flask import Blueprint, request, jsonify, session
from werkzeug.utils import secure_filename
from database import get_db, make_post

posts_bp = Blueprint('posts', __name__)

#необходимо также обеспечивать безопасную загрузку файла
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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

    # проверка расширения
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    # проверка размера
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > MAX_FILE_SIZE:
        return jsonify({'error': 'File too large'}), 400

    # проверка MIME-типа
    header = file.read(1024)
    file.seek(0)
    if not imghdr.what(None, header):
        return jsonify({'error': 'Invalid image format'}), 400

    # Безопасное уникальное имя файла
    safe_name = secure_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex}_{safe_name}"

    # Сохранение файла
    filepath = os.path.join('uploads', unique_name)
    file.save(filepath)

    caption = request.form.get('caption', '')
    user_id = session.get('user_id')
    make_post(unique_name, caption, user_id)

    return jsonify({'message': 'Post created', 'image_path': unique_name}), 201