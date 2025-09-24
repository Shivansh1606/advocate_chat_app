import sqlite3
import os
from datetime import datetime

# Database configuration
DB_PATH = os.path.join(os.path.dirname(__file__), 'chat.db')

def get_connection():
    """Get database connection with proper configuration"""
    try:
        conn = sqlite3.connect(DB_PATH, timeout=30.0)  # Add timeout
        conn.row_factory = sqlite3.Row
        # Enable WAL mode for better concurrent access
        conn.execute('PRAGMA journal_mode=WAL')
        conn.execute('PRAGMA synchronous=NORMAL')
        conn.execute('PRAGMA cache_size=1000')
        conn.execute('PRAGMA temp_store=MEMORY')
        return conn
    except sqlite3.Error as e:
        print(f"❌ Database connection error: {e}")
        raise

def init_database():
    """Initialize database with all required tables"""
    print("🗄️ Database path:", DB_PATH)
    print("🔧 Creating database tables...")
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Drop existing table if structure needs to change
        cursor.execute('DROP TABLE IF EXISTS meeting_bookings')
        
        # Clients table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                city TEXT,
                email TEXT,
                registered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Fixed Meeting bookings table (removed advocate_id)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS meeting_bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_name TEXT NOT NULL,
                client_email TEXT NOT NULL,
                client_phone TEXT NOT NULL,
                client_city TEXT,
                advocate_name TEXT NOT NULL,
                meeting_date TEXT NOT NULL,
                meeting_time TEXT NOT NULL,
                meeting_type TEXT NOT NULL,
                meeting_duration TEXT DEFAULT '45',
                case_type TEXT,
                case_description TEXT,
                urgency_level TEXT DEFAULT 'medium',
                previous_legal_action TEXT DEFAULT 'no',
                special_requirements TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Chat messages table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room TEXT NOT NULL,
                sender TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create indexes for better performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_meetings_date ON meeting_bookings(meeting_date)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_meetings_status ON meeting_bookings(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_chat_room ON chat_messages(room)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_messages(timestamp)')
        
        conn.commit()
        conn.close()
        
        print("✅ Database initialized successfully!")
        print("🎯 Database ready for use!")
        
    except sqlite3.Error as e:
        print(f"❌ Database initialization error: {e}")
        raise

def register_client(name, phone=None, city=None, email=None):
    """Register a new client with proper connection handling"""
    conn = None
    try:
        print(f"📝 Registering client: {name}")
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Check if client already exists by name and phone
        if phone:
            cursor.execute(
                "SELECT id FROM clients WHERE name = ? AND phone = ?",
                (name, phone)
            )
            existing = cursor.fetchone()
            
            if existing:
                print(f"⚠️ Client already exists: {name} - {phone}")
                return existing[0]
        
        # Insert new client
        cursor.execute('''
            INSERT INTO clients (name, phone, city, email, registered_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            name,
            phone or '',
            city or '',
            email or '',
            datetime.now().isoformat()
        ))
        
        client_id = cursor.lastrowid
        conn.commit()
        
        print(f"✅ Client registered successfully: ID {client_id}")
        return client_id
        
    except sqlite3.Error as e:
        print(f"❌ Client registration error: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn:
            conn.close()

def save_chat_message(room, sender, message):
    """Save chat message with proper connection handling"""
    conn = None
    try:
        print(f"💾 Saving message: {sender} in {room}")
        
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO chat_messages (room, sender, message, timestamp)
            VALUES (?, ?, ?, ?)
        ''', (
            room,
            sender,
            message,
            datetime.now().isoformat()
        ))
        
        message_id = cursor.lastrowid
        conn.commit()
        
        print(f"✅ Message saved: ID {message_id}")
        return message_id
        
    except sqlite3.Error as e:
        print(f"❌ Save message error: {e}")
        if conn:
            conn.rollback()
        return None
    finally:
        if conn:
            conn.close()

def get_chat_messages(room, limit=50):
    """Get chat messages with proper connection handling"""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, room, sender, message, timestamp
            FROM chat_messages 
            WHERE room = ?
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (room, limit))
        
        messages = cursor.fetchall()
        return list(reversed(messages))
        
    except sqlite3.Error as e:
        print(f"❌ Get messages error: {e}")
        return []
    finally:
        if conn:
            conn.close()

def get_all_clients():
    """Get all clients with proper connection handling"""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, phone, city, email, registered_at
            FROM clients
            ORDER BY registered_at DESC
        ''')
        
        clients = cursor.fetchall()
        return clients
        
    except sqlite3.Error as e:
        print(f"❌ Get clients error: {e}")
        return []
    finally:
        if conn:
            conn.close()

def get_all_meetings():
    """Get all meetings with proper connection handling"""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, client_name, client_email, client_phone, client_city,
                   advocate_name, meeting_date, meeting_time, meeting_type,
                   meeting_duration, case_type, case_description,
                   urgency_level, status, created_at
            FROM meeting_bookings
            ORDER BY created_at DESC
        ''')
        
        meetings = cursor.fetchall()
        return meetings
        
    except sqlite3.Error as e:
        print(f"❌ Get meetings error: {e}")
        return []
    finally:
        if conn:
            conn.close()

def update_meeting_status(meeting_id, status):
    """Update meeting status with proper connection handling"""
    conn = None
    try:
        print(f"📅 Updating meeting {meeting_id} status to: {status}")
        
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE meeting_bookings 
            SET status = ?, updated_at = ?
            WHERE id = ?
        ''', (status, datetime.now().isoformat(), meeting_id))
        
        rows_affected = cursor.rowcount
        conn.commit()
        
        if rows_affected > 0:
            print(f"✅ Meeting status updated successfully")
            return True
        else:
            print(f"⚠️ No meeting found with ID {meeting_id}")
            return False
        
    except sqlite3.Error as e:
        print(f"❌ Update meeting status error: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()

def get_database_stats():
    """Get database statistics with proper connection handling"""
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get counts
        cursor.execute("SELECT COUNT(*) FROM clients")
        clients_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM meeting_bookings")
        meetings_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM meeting_bookings WHERE status = 'pending'")
        pending_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM meeting_bookings WHERE status = 'confirmed'")
        confirmed_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM chat_messages")
        messages_count = cursor.fetchone()[0]
        
        # Get today's stats
        today = datetime.now().date().isoformat()
        cursor.execute("SELECT COUNT(*) FROM meeting_bookings WHERE date(meeting_date) = ?", (today,))
        today_meetings = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM clients WHERE date(registered_at) = ?", (today,))
        today_clients = cursor.fetchone()[0]
        
        return {
            'total_clients': clients_count,
            'total_meetings': meetings_count,
            'pending_meetings': pending_count,
            'confirmed_meetings': confirmed_count,
            'total_messages': messages_count,
            'today_meetings': today_meetings,
            'today_clients': today_clients
        }
        
    except sqlite3.Error as e:
        print(f"❌ Get stats error: {e}")
        return {
            'total_clients': 0,
            'total_meetings': 0,
            'pending_meetings': 0,
            'confirmed_meetings': 0,
            'total_messages': 0,
            'today_meetings': 0,
            'today_clients': 0
        }
    finally:
        if conn:
            conn.close()

# Test connection
if __name__ == "__main__":
    print("🧪 Testing database...")
    init_database()
    print("✅ Database test completed!")
