import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
)
""")

cursor.execute("""
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price INTEGER
)
""")

cursor.execute("""
CREATE TABLE cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity INTEGER
)
""")

# Insert demo user
cursor.execute(
    "INSERT INTO users (username, password) VALUES ('admin', 'admin123')"
)

# Insert demo products
cursor.execute(
    "INSERT INTO products (name, price) VALUES ('Laptop',1000)"
)

cursor.execute(
    "INSERT INTO products (name, price) VALUES ('Phone',500)"
)

cursor.execute(
    "INSERT INTO products (name, price) VALUES ('Headphones',100)"
)

conn.commit()
conn.close()

print("Database initialized")