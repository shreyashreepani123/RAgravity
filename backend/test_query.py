import urllib.request
import json
import urllib.error

req = urllib.request.Request(
    'http://127.0.0.1:8000/query', 
    data=json.dumps({'query': 'CPU Usage at 100% Constantly'}).encode('utf-8'), 
    headers={'Content-Type': 'application/json'}
)

try:
    res = urllib.request.urlopen(req)
    print(res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(e.read().decode('utf-8'))
