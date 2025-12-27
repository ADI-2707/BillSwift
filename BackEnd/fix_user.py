import sqlite3

def check_and_fix():
    conn = sqlite3.connect('billswift.db')
    cursor = conn.cursor()
    
    email = "test1user@billswift.com"
    
    # 1. Check current status
    cursor.execute("SELECT email, is_approved, is_active FROM users WHERE email=?", (email,))
    row = cursor.fetchone()
    
    if row:
        print(f"Current Status in DB: Email={row[0]}, Approved={row[1]}, Active={row[2]}")
        
        # 2. Force update to True (1)
        cursor.execute("UPDATE users SET is_approved = 1, is_active = 1 WHERE email = ?", (email,))
        conn.commit()
        print(f"--- SUCCESS: {email} has been forced to Approved and Active ---")
    else:
        print(f"User {email} not found in database.")
    
    conn.close()

if __name__ == "__main__":
    check_and_fix()