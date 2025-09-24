from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import os
from datetime import datetime
import database as db
import json
import uuid
from functools import wraps

app = Flask(__name__)
app.secret_key = 'advocate-chat-secret-2025-updated-secure-admin'

# ===== ADMIN AUTHENTICATION SETTINGS =====
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "easelaw@admin"

# Global variables
webrtc_rooms = {}
chat_rooms = {}

# Enhanced advocates data with more details
advocates_data = [
    {
        "id": "adv1",
        "name": "Adv. Rajesh Kumar",
        "specialty": "Criminal Law",
        "experience": "12 years",
        "rating": "4.8",
        "available": True,
        "description": "Specialized in criminal defense, white-collar crimes, and legal consultations",
        "location": "New Delhi",
        "languages": ["Hindi", "English", "Punjabi"],
        "consultation_fee": "₹2000/hour",
        "education": "LLB from Delhi University, LLM in Criminal Law"
    },
    {
        "id": "adv2", 
        "name": "Adv. Priya Sharma",
        "specialty": "Family Law",
        "experience": "8 years",
        "rating": "4.9",
        "available": True,
        "description": "Expert in divorce, child custody, domestic disputes, and matrimonial cases",
        "location": "Mumbai",
        "languages": ["Hindi", "English", "Marathi"],
        "consultation_fee": "₹1500/hour",
        "education": "LLB from Mumbai University, specialization in Family Law"
    },
    {
        "id": "adv3",
        "name": "Adv. Amit Singh",
        "specialty": "Corporate Law", 
        "experience": "15 years",
        "rating": "4.7",
        "available": True,
        "description": "Corporate legal advisor, business contracts, mergers & acquisitions",
        "location": "Gurugram",
        "languages": ["Hindi", "English"],
        "consultation_fee": "₹3000/hour",
        "education": "LLB from National Law University, MBA in Corporate Finance"
    },
    {
        "id": "adv4",
        "name": "Adv. Kavya Reddy",
        "specialty": "Property Law",
        "experience": "10 years", 
        "rating": "4.6",
        "available": False,
        "description": "Real estate disputes, property transactions, land acquisition cases",
        "location": "Hyderabad",
        "languages": ["Telugu", "Hindi", "English"],
        "consultation_fee": "₹1800/hour",
        "education": "LLB from Osmania University, specialization in Property Law"
    }
]

print("🚀 Flask Legal Chat System Starting...")

# Get database path
db_path = os.path.join(os.getcwd(), 'chat.db')
print(f"📊 Database path: {db_path}")

# Initialize database
try:
    db.init_database()
    conn = db.get_connection()
    conn.close()
    print("✅ Database connection successful!")
except Exception as e:
    print(f"❌ Database initialization failed: {e}")

print("="*70)
print("🚀 Legal Chat System - Complete & Production Ready")
print("📱 Frontend: http://localhost:5000")
print("💾 Database: SQLite with full CRUD operations")
print("📹 Video Call: Multi-user WebRTC signaling")
print("💬 Chat: Real-time messaging via polling")
print("📊 Admin: Dashboard available at /admin (Login Required)")
print("🔒 Health Check: /health")
print("🔐 Admin Login: /admin/login")
print("="*70)

# ===== ADMIN AUTHENTICATION DECORATOR =====
def admin_required(f):
    """Decorator for admin authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if admin is logged in
        if not session.get('admin_logged_in'):
            print("⚠️ Unauthorized admin access attempt")
            return redirect(url_for('admin_login'))
        
        # Check session timeout (2 hours)
        if 'admin_login_time' in session:
            login_time = datetime.fromisoformat(session['admin_login_time'])
            if (datetime.now() - login_time).total_seconds() > 7200:  # 2 hours
                session.clear()
                print("⏰ Admin session expired")
                return redirect(url_for('admin_login'))
        
        return f(*args, **kwargs)
    return decorated_function

# ===== ADMIN AUTHENTICATION ROUTES =====
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login page"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            session['admin_username'] = username
            session['admin_login_time'] = datetime.now().isoformat()
            print(f"✅ Admin logged in successfully: {username} at {datetime.now()}")
            return redirect(url_for('admin_dashboard'))
        else:
            print(f"❌ Failed admin login attempt: username='{username}' from IP={request.remote_addr}")
            error_message = "Invalid username or password. Please try again."
            return render_template('admin_login.html', error=error_message)
    
    # If already logged in, redirect to dashboard
    if session.get('admin_logged_in'):
        return redirect(url_for('admin_dashboard'))
    
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    """Admin logout"""
    username = session.get('admin_username', 'Unknown')
    session.clear()
    print(f"👋 Admin logged out: {username} at {datetime.now()}")
    return redirect(url_for('admin_login'))

# ===== MAIN ROUTES =====

@app.route('/')
def index():
    """Enhanced landing page"""
    return render_template('index.html')

@app.route('/chat')
def chat():
    """Enhanced chat interface"""
    advocate_id = request.args.get('advocate', 'adv1')
    advocate = next((adv for adv in advocates_data if adv['id'] == advocate_id), advocates_data[0])
    
    return render_template('chat.html', advocate=advocate)

@app.route('/video-call/<room_id>')
def video_call(room_id):
    """Enhanced video call interface"""
    user_id = request.args.get('user_id', str(uuid.uuid4()))
    
    return render_template('video_call.html', 
                         room_id=room_id, 
                         user_id=user_id)

@app.route('/meeting')
def meeting():
    """Enhanced meeting booking"""
    advocate_id = request.args.get('advocate', 'adv1')
    advocate = next((adv for adv in advocates_data if adv['id'] == advocate_id), advocates_data[0])
    
    return render_template('meeting.html', advocate=advocate)

# ===== SECURED ADMIN ROUTES =====

@app.route('/admin')
@admin_required
def admin_dashboard():
    """Secured admin dashboard"""
    admin_username = session.get('admin_username', 'Admin')
    print(f"📊 Admin dashboard accessed by: {admin_username}")
    return render_template('admin_dashboard.html', admin_username=admin_username)

@app.route('/health')
def health_check():
    """Enhanced health check endpoint"""
    try:
        # Test database connection
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM clients")
        client_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM meeting_bookings") 
        meeting_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM chat_messages")
        message_count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "database": "connected",
            "stats": {
                "clients": client_count,
                "meetings": meeting_count,
                "messages": message_count,
                "webrtc_rooms": len(webrtc_rooms),
                "chat_rooms": len(chat_rooms)
            },
            "version": "2.0.0",
            "features": [
                "Real-time Chat",
                "Video Consultation", 
                "Meeting Booking",
                "Admin Dashboard",
                "WebRTC Signaling",
                "Database CRUD",
                "Admin Authentication"
            ]
        })
        
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# ===== API ROUTES =====

@app.route('/api/advocates')
def get_advocates():
    """Get all advocates data"""
    try:
        print("📋 Fetching advocates data...")
        
        # Add dynamic availability (simulate some logic)
        for advocate in advocates_data:
            # Simulate dynamic availability based on time
            import random
            if random.random() > 0.2:  # 80% chance of being available
                advocate['available'] = True
            else:
                advocate['available'] = False
        
        return jsonify({
            "status": "success",
            "advocates": advocates_data,
            "count": len(advocates_data)
        })
        
    except Exception as e:
        print(f"❌ Error fetching advocates: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/register-client', methods=['POST'])
def register_client():
    """Enhanced client registration"""
    try:
        data = request.get_json()
        print(f"👤 Client registration: {data}")
        
        if not data or not data.get('name'):
            return jsonify({"status": "error", "message": "Name is required"}), 400
        
        # Validate name
        name = data['name'].strip()
        if len(name) < 2:
            return jsonify({"status": "error", "message": "Name must be at least 2 characters"}), 400
        
        # Clean and validate optional fields
        phone = data.get('phone', '').strip()
        city = data.get('city', '').strip()
        email = data.get('email', '').strip()
        
        # Phone validation if provided
        if phone and len(phone) < 10:
            return jsonify({"status": "error", "message": "Please enter a valid phone number"}), 400
        
        # Register client in database
        client_id = db.register_client(name, phone, city, email)
        
        if client_id:
            print(f"✅ Client registered: {name} (ID: {client_id})")
            return jsonify({
                "status": "success",
                "client_id": client_id,
                "message": "Registration successful",
                "client_data": {
                    "name": name,
                    "phone": phone,
                    "city": city,
                    "email": email
                }
            })
        else:
            return jsonify({"status": "error", "message": "Registration failed"}), 500
            
    except Exception as e:
        print(f"❌ Registration error: {e}")
        return jsonify({"status": "error", "message": "Internal server error"}), 500

@app.route('/api/book-meeting', methods=['POST'])
def book_meeting():
    """Enhanced meeting booking with comprehensive validation"""
    print("📝 Meeting booking request received")
    
    try:
        data = request.get_json()
        print(f"📊 Form data received: {data}")
        
        if not data:
            print("❌ No data provided")
            return jsonify({"status": "error", "message": "No data provided"}), 400
        
        # Enhanced validation
        required_fields = ['clientName', 'clientEmail', 'clientPhone', 'meetingDate', 'meetingTime', 'meetingType']
        missing_fields = []
        
        for field in required_fields:
            if not data.get(field) or not str(data.get(field)).strip():
                missing_fields.append(field)
        
        if missing_fields:
            print(f"❌ Missing fields: {missing_fields}")
            return jsonify({
                "status": "error", 
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
        
        # Email validation
        email = data['clientEmail'].strip()
        if '@' not in email or '.' not in email:
            return jsonify({"status": "error", "message": "Please enter a valid email address"}), 400
        
        # Phone validation
        phone = data['clientPhone'].strip()
        if len(phone) < 10:
            return jsonify({"status": "error", "message": "Please enter a valid phone number"}), 400
        
        # Date validation
        try:
            meeting_date = datetime.strptime(data['meetingDate'], '%Y-%m-%d')
            if meeting_date.date() < datetime.now().date():
                return jsonify({"status": "error", "message": "Meeting date cannot be in the past"}), 400
        except ValueError:
            return jsonify({"status": "error", "message": "Invalid date format"}), 400
        
        # Add advocate information
        advocate_id = data.get('advocateId', 'adv1')
        advocate = next((adv for adv in advocates_data if adv['id'] == advocate_id), advocates_data[0])
        data['advocateName'] = advocate['name']
        data['advocateSpecialty'] = advocate['specialty']
        
        print(f"📅 Booking for advocate: {advocate['name']}")
        
        # Enhanced database insertion
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Insert with comprehensive data
        cursor.execute('''
            INSERT INTO meeting_bookings (
                client_name, client_email, client_phone, client_city,
                advocate_name, meeting_date, meeting_time, meeting_type, meeting_duration,
                case_type, case_description, urgency_level, previous_legal_action, special_requirements,
                status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['clientName'].strip(),
            data['clientEmail'].strip(), 
            data['clientPhone'].strip(),
            data.get('clientCity', '').strip(),
            data['advocateName'],
            data['meetingDate'],
            data['meetingTime'],
            data['meetingType'],
            data.get('meetingDuration', '45'),
            data.get('caseType', ''),
            data.get('caseDescription', '').strip(),
            data.get('urgency', 'medium'),
            data.get('previousLegalAction', 'no'),
            data.get('specialRequirements', '').strip(),
            'pending',
            datetime.now().isoformat()
        ))
        
        booking_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        if booking_id:
            print(f"✅ Meeting booked successfully: ID {booking_id}")
            
            # Generate confirmation number
            confirmation_number = f"LEGAL{booking_id:06d}"
            
            return jsonify({
                "status": "success",
                "booking_id": booking_id,
                "confirmation_number": confirmation_number,
                "message": "Meeting booked successfully! Confirmation details sent.",
                "meeting_details": {
                    "client_name": data['clientName'],
                    "advocate_name": data['advocateName'],
                    "advocate_specialty": data['advocateSpecialty'],
                    "date": data['meetingDate'],
                    "time": data['meetingTime'],
                    "type": data['meetingType'],
                    "duration": data.get('meetingDuration', '45')
                }
            })
        else:
            print("❌ Database booking failed - no ID returned")
            return jsonify({"status": "error", "message": "Database insertion failed"}), 500
            
    except Exception as e:
        print(f"❌ Booking error: {e}")
        import traceback
        print(f"Full error traceback: {traceback.format_exc()}")
        return jsonify({"status": "error", "message": f"Internal server error: {str(e)[:100]}"}), 500

# ===== CHAT SYSTEM ROUTES =====

@app.route('/api/chat/send', methods=['POST'])
def send_message():
    """Enhanced chat message sending"""
    try:
        data = request.get_json()
        print(f"💬 Chat message: {data}")
        
        room = data.get('room', 'general')
        sender = data.get('sender', 'Anonymous')
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({"status": "error", "message": "Message cannot be empty"}), 400
        
        if len(message) > 1000:
            return jsonify({"status": "error", "message": "Message too long (max 1000 characters)"}), 400
        
        # Initialize chat room if not exists
        if room not in chat_rooms:
            chat_rooms[room] = []
        
        # Create message object
        message_obj = {
            'id': str(uuid.uuid4()),
            'sender': sender,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'room': room
        }
        
        # Add to memory (keep last 100 messages per room)
        chat_rooms[room].append(message_obj)
        if len(chat_rooms[room]) > 100:
            chat_rooms[room] = chat_rooms[room][-100:]
        
        # Save to database
        message_id = db.save_chat_message(room, sender, message)
        
        if message_id:
            message_obj['db_id'] = message_id
            print(f"💾 Message saved: {sender} in {room}")
            
            return jsonify({
                "status": "success",
                "message_id": message_id,
                "timestamp": message_obj['timestamp']
            })
        else:
            return jsonify({"status": "error", "message": "Failed to save message"}), 500
            
    except Exception as e:
        print(f"❌ Chat send error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/chat/messages/<room_id>')
def get_messages(room_id):
    """Enhanced chat message retrieval"""
    try:
        # Get from memory first (faster)
        if room_id in chat_rooms:
            messages = chat_rooms[room_id][-50:]  # Last 50 messages
        else:
            messages = []
        
        # If no messages in memory, try database
        if not messages:
            try:
                db_messages = db.get_chat_messages(room_id, limit=50)
                messages = []
                
                for msg in db_messages:
                    messages.append({
                        'id': msg[0],
                        'sender': msg[2],
                        'message': msg[3],
                        'timestamp': msg[4],
                        'room': msg[1]
                    })
                
                # Update memory
                if room_id not in chat_rooms:
                    chat_rooms[room_id] = []
                chat_rooms[room_id] = messages
                
            except Exception as db_e:
                print(f"⚠️ Database message fetch failed: {db_e}")
        
        return jsonify({
            "status": "success",
            "messages": messages,
            "count": len(messages)
        })
        
    except Exception as e:
        print(f"❌ Get messages error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# ===== WEBRTC SIGNALING ROUTES =====

@app.route('/api/webrtc/join/<room_id>', methods=['POST'])
def join_webrtc_room(room_id):
    """Enhanced WebRTC room joining"""
    try:
        data = request.get_json()
        username = data.get('username', 'Anonymous')
        
        print(f"🎥 WebRTC join request: {username} -> {room_id}")
        
        # Initialize room if not exists
        if room_id not in webrtc_rooms:
            webrtc_rooms[room_id] = {
                'users': [],
                'signals': [],
                'created_at': datetime.now().isoformat()
            }
        
        # Check if user already in room
        existing_user = next((u for u in webrtc_rooms[room_id]['users'] if u['username'] == username), None)
        
        if existing_user:
            print(f"🔄 User {username} already in room, updating...")
            existing_user['last_seen'] = datetime.now().isoformat()
            user_id = existing_user['id']
        else:
            # Add new user to room
            user_data = {
                'id': str(uuid.uuid4()),
                'username': username,
                'joined_at': datetime.now().isoformat(),
                'last_seen': datetime.now().isoformat(),
                'status': 'connected'
            }
            
            webrtc_rooms[room_id]['users'].append(user_data)
            user_id = user_data['id']
            
            print(f"✅ New user {username} joined WebRTC room {room_id}")
        
        return jsonify({
            "status": "success",
            "user_id": user_id,
            "room_id": room_id,
            "users": webrtc_rooms[room_id]['users'],
            "user_count": len(webrtc_rooms[room_id]['users'])
        })
        
    except Exception as e:
        print(f"❌ WebRTC join error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/webrtc/signals/<room_id>')
def get_webrtc_signals(room_id):
    """Enhanced WebRTC signaling message retrieval"""
    try:
        if room_id not in webrtc_rooms:
            return jsonify({
                "status": "success",
                "signals": [],
                "users": [],
                "user_count": 0
            })
        
        room = webrtc_rooms[room_id]
        signals = room.get('signals', [])
        
        # Clean old signals (keep only last 20)
        if len(signals) > 20:
            room['signals'] = signals[-20:]
            signals = room['signals']
        
        # Clean old users (remove inactive users after 30 seconds)
        current_time = datetime.now()
        active_users = []
        
        for user in room.get('users', []):
            try:
                last_seen = datetime.fromisoformat(user.get('last_seen', user.get('joined_at')))
                if (current_time - last_seen).total_seconds() < 30:
                    active_users.append(user)
                else:
                    print(f"🚶 Removing inactive user: {user['username']}")
            except:
                active_users.append(user)  # Keep if timestamp parsing fails
        
        room['users'] = active_users
        
        return jsonify({
            "status": "success",
            "signals": signals,
            "users": active_users,
            "user_count": len(active_users)
        })
        
    except Exception as e:
        print(f"❌ WebRTC signals error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/webrtc/signal/<room_id>', methods=['POST'])
def send_webrtc_signal(room_id):
    """Enhanced WebRTC signaling message sending"""
    try:
        data = request.get_json()
        print(f"📡 WebRTC signal received: {data.get('type')} in room {room_id}")
        
        if room_id not in webrtc_rooms:
            webrtc_rooms[room_id] = {
                'users': [],
                'signals': [],
                'created_at': datetime.now().isoformat()
            }
        
        # Create signal object
        signal = {
            'id': str(uuid.uuid4()),
            'from': data.get('from', 'anonymous'),
            'to': data.get('to'),
            'type': data.get('type'),
            'data': data.get('data'),
            'timestamp': datetime.now().isoformat()
        }
        
        # Add signal to room
        webrtc_rooms[room_id]['signals'].append(signal)
        
        print(f"✅ WebRTC signal stored: {signal['type']} from {signal['from']}")
        
        return jsonify({"status": "success", "signal_id": signal['id']})
        
    except Exception as e:
        print(f"❌ WebRTC signal error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/webrtc/leave/<room_id>', methods=['POST'])
def leave_webrtc_room(room_id):
    """Enhanced WebRTC room leaving"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        if room_id in webrtc_rooms and user_id:
            users = webrtc_rooms[room_id]['users']
            webrtc_rooms[room_id]['users'] = [u for u in users if u['id'] != user_id]
            
            print(f"👋 User {user_id} left WebRTC room {room_id}")
            
            # Add leave signal for other users
            leave_signal = {
                'id': str(uuid.uuid4()),
                'from': user_id,
                'to': None,
                'type': 'user-left',
                'data': {'user_id': user_id},
                'timestamp': datetime.now().isoformat()
            }
            
            webrtc_rooms[room_id]['signals'].append(leave_signal)
        
        return jsonify({"status": "success"})
        
    except Exception as e:
        print(f"❌ WebRTC leave error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# ===== SECURED ADMIN API ROUTES =====

@app.route('/api/admin/meetings')
@admin_required
def get_all_meetings():
    """Enhanced admin meetings retrieval"""
    try:
        print("📊 Admin: Fetching all meetings...")
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, client_name, client_email, client_phone, client_city,
                   advocate_name, meeting_date, meeting_time, meeting_type, meeting_duration,
                   case_type, case_description, urgency_level, status, created_at
            FROM meeting_bookings 
            ORDER BY created_at DESC
        ''')
        
        meetings = []
        for row in cursor.fetchall():
            meetings.append({
                'id': row[0],
                'client_name': row[1],
                'client_email': row[2], 
                'client_phone': row[3],
                'client_city': row[4],
                'advocate_name': row[5],
                'meeting_date': row[6],
                'meeting_time': row[7],
                'meeting_type': row[8],
                'meeting_duration': row[9],
                'case_type': row[10],
                'case_description': row[11],
                'urgency_level': row[12],
                'status': row[13],
                'created_at': row[14]
            })
        
        conn.close()
        print(f"✅ Admin: Retrieved {len(meetings)} meetings")
        
        return jsonify({
            "status": "success",
            "meetings": meetings,
            "count": len(meetings)
        })
        
    except Exception as e:
        print(f"❌ Admin meetings error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/clients')
@admin_required
def get_all_clients():
    """Enhanced admin clients retrieval"""
    try:
        print("📊 Admin: Fetching all clients...")
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, phone, city, email, registered_at
            FROM clients 
            ORDER BY registered_at DESC
        ''')
        
        clients = []
        for row in cursor.fetchall():
            clients.append({
                'id': row[0],
                'name': row[1],
                'phone': row[2],
                'city': row[3], 
                'email': row[4],
                'registered_at': row[5]
            })
        
        conn.close()
        print(f"✅ Admin: Retrieved {len(clients)} clients")
        
        return jsonify({
            "status": "success",
            "clients": clients,
            "count": len(clients)
        })
        
    except Exception as e:
        print(f"❌ Admin clients error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/stats')
@admin_required
def get_admin_stats():
    """Enhanced admin statistics"""
    try:
        print("📈 Admin: Fetching statistics...")
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        # Get comprehensive stats
        cursor.execute("SELECT COUNT(*) FROM clients")
        total_clients = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM meeting_bookings")
        total_meetings = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM meeting_bookings WHERE status = 'pending'")
        pending_meetings = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM meeting_bookings WHERE status = 'confirmed'")  
        confirmed_meetings = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM meeting_bookings WHERE date(meeting_date) = date('now')")
        today_meetings = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM chat_messages")
        total_messages = cursor.fetchone()[0]
        
        # Get recent activity counts
        cursor.execute("SELECT COUNT(*) FROM clients WHERE date(registered_at) = date('now')")
        today_clients = cursor.fetchone()[0]
        
        conn.close()
        
        stats = {
            'total_clients': total_clients,
            'total_meetings': total_meetings,
            'pending_meetings': pending_meetings,
            'confirmed_meetings': confirmed_meetings,
            'today_meetings': today_meetings,
            'total_messages': total_messages,
            'today_clients': today_clients,
            'active_webrtc_rooms': len(webrtc_rooms),
            'active_chat_rooms': len(chat_rooms)
        }
        
        print(f"✅ Admin: Statistics compiled - {total_meetings} meetings, {total_clients} clients")
        
        return jsonify({
            "status": "success",
            "stats": stats
        })
        
    except Exception as e:
        print(f"❌ Admin stats error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/meetings/<int:meeting_id>/confirm', methods=['POST'])
@admin_required
def confirm_meeting(meeting_id):
    """Enhanced meeting confirmation"""
    try:
        print(f"✅ Admin: Confirming meeting {meeting_id}")
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE meeting_bookings SET status = 'confirmed' WHERE id = ?",
            (meeting_id,)
        )
        
        if cursor.rowcount > 0:
            conn.commit()
            conn.close()
            
            print(f"✅ Meeting {meeting_id} confirmed successfully")
            
            return jsonify({
                "status": "success", 
                "message": "Meeting confirmed successfully"
            })
        else:
            conn.close()
            return jsonify({"status": "error", "message": "Meeting not found"}), 404
            
    except Exception as e:
        print(f"❌ Confirm meeting error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/admin/meetings/<int:meeting_id>/cancel', methods=['POST'])
@admin_required
def cancel_meeting(meeting_id):
    """Enhanced meeting cancellation"""
    try:
        print(f"❌ Admin: Cancelling meeting {meeting_id}")
        
        conn = db.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "UPDATE meeting_bookings SET status = 'cancelled' WHERE id = ?",
            (meeting_id,)
        )
        
        if cursor.rowcount > 0:
            conn.commit()
            conn.close()
            
            print(f"❌ Meeting {meeting_id} cancelled successfully")
            
            return jsonify({
                "status": "success",
                "message": "Meeting cancelled successfully"
            })
        else:
            conn.close()
            return jsonify({"status": "error", "message": "Meeting not found"}), 404
            
    except Exception as e:
        print(f"❌ Cancel meeting error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# ===== ERROR HANDLERS =====

@app.errorhandler(404)
def not_found(error):
    """Enhanced 404 error handler"""
    return jsonify({
        "status": "error",
        "code": 404,
        "message": "Endpoint not found",
        "timestamp": datetime.now().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Enhanced 500 error handler"""
    print(f"❌ Internal server error: {error}")
    return jsonify({
        "status": "error", 
        "code": 500,
        "message": "Internal server error",
        "timestamp": datetime.now().isoformat()
    }), 500

@app.errorhandler(403)
def forbidden(error):
    """Enhanced 403 error handler"""
    return jsonify({
        "status": "error",
        "code": 403,
        "message": "Access forbidden",
        "timestamp": datetime.now().isoformat()  
    }), 403

# ===== MAIN APPLICATION RUNNER =====

if __name__ == '__main__':
    # Development server configuration
    app.run(
        debug=True,
        host='127.0.0.1', 
        port=5000,
        threaded=True
    )
