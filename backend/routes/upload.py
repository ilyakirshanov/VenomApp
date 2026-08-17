from flask import Blueprint, jsonify, request
import os
import requests
import re

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/download', methods=['GET'])
@upload_bp.route('/download/<path:filepath>', methods=['GET'])
def download_file(filepath=None):
    try:
        if filepath is not None:
            target = filepath
        else:
            target = request.args.get('file', '')

        if not target:
            return jsonify({'error': 'file required'}), 400
        # защита от path traversal - проверка, что запрашиваемый файл действительно лежит в нужной директории.
        # хотя, конечно, лучше вообще не показывать пользователю путь до файла
        base_dir = os.path.realpath('uploads')
        full_path = os.path.realpath(os.path.join(base_dir, target))
        if not full_path.startswith(base_dir):
            return jsonify({'error': 'wrong file'}), 403

        with open(full_path, 'rb') as f:
            content = f.read()

        mime_type = 'application/octet-stream'
        if full_path.endswith('.jpg') or full_path.endswith('.jpeg'):
            mime_type = 'image/jpeg'
        elif full_path.endswith('.png'):
            mime_type = 'image/png'
        elif full_path.endswith('.gif'):
            mime_type = 'image/gif'
        elif full_path.endswith('.pdf'):
            mime_type = 'application/pdf'
        elif full_path.endswith('.txt'):
            mime_type = 'text/plain'

        return content, 200, {'Content-Type': mime_type}

    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#защита от SSRF - белый список доменов(у меня пока один), к которым можно обращаться.
allowed_domain_pattern = r'^https?://(www\.)?api\.github\.com/.*$'

@upload_bp.route('/fetch', methods=['POST'])
def fetch_url():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL required'}), 400
    
    if not(re.match(allowed_domain_pattern , url)):
            return jsonify({'error': 'URL not allowed'}), 403
    try:
        response = requests.get(url, timeout=5)
        return jsonify({'content': response.text[:1000]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@upload_bp.route('/parse-xml', methods=['POST'])
def parse_xml():
    import xml.etree.ElementTree as ET #защита от XXE
    xml_data = request.data
    try:
        parse = ET.XMLParser(resolve_entities=False)
        root = ET.fromstring(xml_data, parser=parse)
        return jsonify({'root': root.tag, 'text': root.text}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500