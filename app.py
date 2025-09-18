from flask import Flask, render_template, request, session, redirect, url_for, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room, send
import uuid
from datetime import datetime
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
socketio = SocketIO(app, cors_allowed_origins="*")

# Mock database
advocates = {
    'adv1': {
        'id': 'adv1',
        'name': 'Rajesh Kumar',
        'specialty': 'Criminal Law',
        'experience': '10 years',
        'rating': 4.8,
        'available': True
    },
    'adv2': {
        'id': 'adv2', 
        'name': 'Priya Sharma',
        'specialty': 'Family Law',
        'experience': '8 years',
        'rating': 4.9,
        'available': True
    },
    'adv3': {
        'id': 'adv3',
        'name': 'Amit Singh',
        'specialty': 'Corporate Law', 
        'experience': '12 years',
        'rating': 4.7,
        'available': True
    },
    'adv4': {
        'id': 'adv4',
        'name': 'Sunita Patel',
        'specialty': 'Property Law',
        'experience': '6 years', 
        'rating': 4.6,
        'available': True
    }
}

chat_rooms = {}
meetings = {}

@app.route('/')
def index():
    return render_template('index.html', advocates=advocates.values())

@app.route('/chat/<advocate_id>')
def chat(advocate_id):
    if advocate_id not in advocates:
        return redirect(url_for('index'))
    
    client_name = request.args.get('client_name')
    if not client_name:
        return redirect(url_for('index'))
    
    # Create or get chat room
    room_id = f"{client_name}_{advocate_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    session['client_name'] = client_name
    session['advocate_id'] = advocate_id
    session['room_id'] = room_id
    
    advocate = advocates[advocate_id]
    
    return render_template('chat.html', 
                         advocate=advocate, 
                         client_name=client_name,
                         room_id=room_id)

@app.route('/schedule_meeting', methods=['POST'])
def schedule_meeting():
    data = request.get_json()
    
    meeting_id = str(uuid.uuid4())
    meeting_room_name = f"meeting_{meeting_id}"
    
    meeting_data = {
        'id': meeting_id,
        'client_name': data['client_name'],
        'advocate_id': data['advocate_id'],
        'date': data['date'],
        'time': data['time'],
        'description': data['description'],
        'room_name': meeting_room_name,
        'meeting_url': f"https://meet.jit.si/{meeting_room_name}",
        'created_at': datetime.now().isoformat()
    }
    
    meetings[meeting_id] = meeting_data
    
    return jsonify({
        'success': True,
        'meeting_id': meeting_id,
        'meeting_url': meeting_data['meeting_url'],
        'message': 'Meeting scheduled successfully!'
    })

@app.route('/meeting/<meeting_id>')
def meeting(meeting_id):
    if meeting_id not in meetings:
        return redirect(url_for('index'))
    
    meeting_data = meetings[meeting_id]
    advocate = advocates[meeting_data['advocate_id']]
    
    return render_template('meeting.html', 
                         meeting=meeting_data, 
                         advocate=advocate)

# Socket.IO Events
@socketio.on('connect')
def on_connect():
    print('Client connected')

@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)
    
    if room not in chat_rooms:
        chat_rooms[room] = []
    
    emit('status', {
        'msg': f"{data['client_name']} has joined the chat."
    }, room=room)

@socketio.on('leave')
def on_leave(data):
    room = data['room']
    leave_room(room)
    emit('status', {
        'msg': f"{data['client_name']} has left the chat."
    }, room=room)

@socketio.on('message')
def handle_message(data):
    room = data['room']
    
    message_data = {
        'sender': data['sender'],
        'message': data['message'],
        'timestamp': datetime.now().strftime('%H:%M')
    }
    
    if room in chat_rooms:
        chat_rooms[room].append(message_data)
    
    emit('message', message_data, room=room)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
