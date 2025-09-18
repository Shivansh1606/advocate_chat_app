from flask import Flask, render_template, jsonify, send_from_directory
import json
import os

app = Flask(__name__)

# Load static data from JSON
def load_advocates():
    with open('data/advocates.json', 'r') as f:
        return json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat')
def chat():
    return render_template('chat.html') 

@app.route('/video-call/<room_id>')
def video_call(room_id):
    return render_template('video-call.html', room_id=room_id)

@app.route('/api/advocates')
def get_advocates():
    return jsonify(load_advocates())

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
