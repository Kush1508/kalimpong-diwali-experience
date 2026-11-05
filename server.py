"""
A lightweight, zero-dependency HTTP server with full HTTP 206 Partial Content (Range) support.
This ensures smooth video scrubbing and instant seeking in Chrome, Edge, Safari, and Firefox.
"""
import os
import sys
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 8000
DIRECTORY = os.path.abspath(os.path.dirname(__file__))

class RangeRequestHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_HEAD(self):
        path = self.translate_path(self.path)
        if not path or not os.path.exists(path):
            self.send_error(404, 'File Not Found')
            return
        if os.path.isdir(path):
            index_file = os.path.join(path, 'index.html')
            if os.path.exists(index_file):
                path = index_file
            else:
                self.send_error(403, 'Directory Listing Forbidden')
                return
        size = os.path.getsize(path)
        mime, _ = mimetypes.guess_type(path)
        self.send_response(200)
        self.send_header('Content-Type', mime or 'application/octet-stream')
        self.send_header('Content-Length', str(size))
        self.end_headers()

    def do_GET(self):
        path = self.translate_path(self.path)
        if not path or not os.path.exists(path):
            self.send_error(404, 'File Not Found')
            return

        if os.path.isdir(path):
            index_file = os.path.join(path, 'index.html')
            if os.path.exists(index_file):
                path = index_file
            else:
                self.send_error(403, 'Directory Listing Forbidden')
                return

        size = os.path.getsize(path)
        mime, _ = mimetypes.guess_type(path)
        mime = mime or 'application/octet-stream'

        range_header = self.headers.get('Range')
        if not range_header:
            self.send_response(200)
            self.send_header('Content-Type', mime)
            self.send_header('Content-Length', str(size))
            self.end_headers()
            with open(path, 'rb') as f:
                self.copy_file(f, self.wfile)
            return

        # Parse range header: e.g. "bytes=0-1024" or "bytes=1024-"
        try:
            range_val = range_header.strip().replace('bytes=', '')
            parts = range_val.split('-')
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if parts[1] else size - 1
            if start >= size or end >= size or start > end:
                self.send_error(416, 'Requested Range Not Satisfiable')
                return
        except Exception:
            self.send_error(400, 'Bad Request Range')
            return

        chunk_size = end - start + 1
        self.send_response(206)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(chunk_size))
        self.end_headers()

        with open(path, 'rb') as f:
            f.seek(start)
            remaining = chunk_size
            while remaining > 0:
                read_len = min(64 * 1024, remaining)
                buf = f.read(read_len)
                if not buf:
                    break
                try:
                    self.wfile.write(buf)
                except (ConnectionResetError, BrokenPipeError):
                    break
                remaining -= len(buf)

    def translate_path(self, path):
        # normalize path
        path = path.split('?', 1)[0].split('#', 1)[0]
        parts = [p for p in path.split('/') if p and p != '..']
        return os.path.join(DIRECTORY, *parts)

    def copy_file(self, source, outputfile):
        bufsize = 64 * 1024
        while True:
            buf = source.read(bufsize)
            if not buf:
                break
            try:
                outputfile.write(buf)
            except (ConnectionResetError, BrokenPipeError):
                break

if __name__ == '__main__':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    port = PORT
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    server_address = ('127.0.0.1', port)
    print("=====================================================")
    print(f"* Kalimpong Diwali Experience Server Running *")
    print(f"* Local URL: http://localhost:{port}/")
    print(f"* Supports 4K Video Range Streaming & Fast Scrubbing")
    print("=====================================================")
    httpd = HTTPServer(server_address, RangeRequestHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
