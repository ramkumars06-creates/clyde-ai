import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"==================================================")
        print(f"   Clyde AI Chatbot Server Running")
        print(f"   Local URL: http://localhost:{PORT}")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
