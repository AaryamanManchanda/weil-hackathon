from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)


def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/")
def home():
    return "Store backend running"


# LOGIN (VULNERABLE)
@app.route("/login", methods=["POST"])
def login():

    data = request.json
    username = data["username"]
    password = data["password"]

    conn = get_db()
    cursor = conn.cursor()

    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"

    result = cursor.execute(query).fetchone()

    if result:
        return jsonify({"message": "Welcome user"})
    else:
        return jsonify({"message": "Invalid credentials"})


# PRODUCTS
@app.route("/products", methods=["GET"])
def products():

    conn = get_db()
    cursor = conn.cursor()

    products = cursor.execute("SELECT * FROM products").fetchall()

    return jsonify([dict(p) for p in products])


# ADD TO CART
@app.route("/add-to-cart", methods=["POST"])
def add_to_cart():

    data = request.json

    product_id = data["product_id"]
    quantity = data["quantity"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO cart (product_id, quantity) VALUES (?, ?)",
        (product_id, quantity),
    )

    conn.commit()

    return jsonify({"message": "Item added to cart"})


# CHECKOUT
@app.route("/checkout", methods=["POST"])
def checkout():

    data = request.json

    price = data["price"]
    payment = data["payment"]

    return jsonify({
        "status": "Payment request created",
        "currency": payment,
        "amount": price
    })


if __name__ == "__main__":
    app.run(debug=True)