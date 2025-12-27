import sqlite3
import os

def migrate():
    # Path to your database file
    db_path = 'billswift.db'
    
    if not os.path.exists(db_path):
        print(f"Error: Could not find {db_path} in the current directory.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        print("--- Starting Database Migration ---")
        
        # 1. Add the new 'is_approved' column
        # SQLite uses 0 for False and 1 for True
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN is_approved BOOLEAN DEFAULT 0 NOT NULL")
            print("[SUCCESS] Added 'is_approved' column.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("[SKIP] Column 'is_approved' already exists.")
            else:
                raise e

        # 2. Sync existing data
        # If a user was already 'is_active', they must have been approved in the past.
        cursor.execute("UPDATE users SET is_approved = 1 WHERE is_active = 1")
        print("[SUCCESS] Updated existing active users to 'approved' status.")

        conn.commit()
        print("--- Migration Finished Successfully ---")
        
    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()