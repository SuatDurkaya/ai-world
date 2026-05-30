import sqlite3
import json
from models import Human

def init_db():
    with sqlite3.connect("database.db") as conn:
        cursor = conn.cursor()

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            tick        INTEGER,
            from_id     INTEGER,
            to_id       INTEGER,
            message     TEXT
            )
        """)

        create_table = """
        CREATE TABLE IF NOT EXISTS human (
        id              INTEGER PRIMARY KEY,
        name            TEXT,
        personality     TEXT,
        job             TEXT,
        genes           TEXT,
        health          INTEGER,
        energy          INTEGER,
        age             INTEGER,
        alive           INTEGER,
        last_thought    TEXT,
        x               REAL DEFAULT 50.0,
        y               REAL DEFAULT 50.0
        )
        """

        cursor.execute(create_table)

def save_human(human):
    with sqlite3.connect("database.db") as conn:
        cursor = conn.cursor()

        cursor.execute("""
            INSERT OR REPLACE INTO human VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        """,(
            human.id,
            human.name,
            human.personality,
            human.job,
            json.dumps(human.genes),
            human.health,
            human.energy,
            human.age,
            1 if human.alive else 0,  # True / False
            human.last_thought,
            human.x,
            human.y
        ))

def load_all_humans():
    with sqlite3.connect("database.db") as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM human")
        rows = cursor.fetchall()

        humans = []
        for row in rows:
            human = Human(
                id=row[0],
                name=row[1],
                personality=row[2],
                job=row[3],
                genes=json.loads(row[4]),
                health=row[5],
                energy=row[6],
                age=row[7],
                alive=bool(row[8]),        # False/True
                last_thought=row[9],
                x=row[10],
                y=row[11]
            )
            humans.append(human)
        
        return humans   
    
def reset_world():
    with sqlite3.connect("database.db") as conn:
        conn.execute("DELETE FROM human")

def save_conversation(tick, from_id, to_id, message):
    with sqlite3.connect("database.db") as conn:
        conn.execute("""
            INSERT INTO conversations (tick, from_id, to_id, message)
            VALUES (?, ?, ?, ?)
        """, (tick, from_id, to_id, message))

def get_recent_conversations(limit=10):
    with sqlite3.connect("database.db") as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("""
            SELECT * FROM conversations ORDER BY id DESC LIMIT ?
        """, (limit,)).fetchall()
        return [dict(r) for r in rows]