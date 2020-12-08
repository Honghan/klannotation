import argparse
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
from urllib.parse import urlparse, parse_qs
from webapi import FileBasedDocAnn
import re

CONST_VIS_PREFIX = '/vis/'
CONST_API_PREFIX = '/api/'
_api_mapper = None


class APIMapper(object):
    def __init__(self, doc_ann_inst):
        self._inst = doc_ann_inst

    def map(self, api_call):
        m = re.search('/api/([^/]{1,255})/', api_call)
        if m:
            func = m.group(1)
            if func == 'docs':
                return self._inst.get_doc_list()
            elif func in ['doc_content', 'doc_ann', 'doc_detail']:
                m2 = re.search('/api/([^/]{1,255})/([^/]{1,255})/', api_call)
                if m2:
                    if func == 'doc_content':
                        return self._inst.get_doc_content(m2.group(2))
                    elif func == 'doc_ann':
                        return self._inst.get_doc_ann(m2.group(2))
                    else:
                        return {"anns": self._inst.get_doc_ann(m2.group(2)),
                                "content": self._inst.get_doc_content(m2.group(2))}
                raise Exception('doc id not found in [%s]' % api_call)
        raise Exception('path [%s] not valid' % api_call)

    @staticmethod
    def get_mapper():
        global _api_mapper
        if _api_mapper is not None:
            return _api_mapper
        else:
            docs_path = './data/input_docs'
            ann_path = './data/semehr_results'
            _api_mapper = APIMapper(FileBasedDocAnn(doc_folder=docs_path,
                                                    ann_folder=ann_path))
        return _api_mapper


class S(SimpleHTTPRequestHandler):

    def _send_cors_headers(self):
        """ Sets headers required for CORS """
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "x-api-key,Content-Type")

    def _set_headers(self, type='html'):
        self.send_response(200)
        self._send_cors_headers()
        if type == 'html':
            self.send_header("Content-type", "text/html")
        elif type == 'json':
            self.send_header("Content-type", "application/json")
        self.end_headers()

    def _html(self, message):
        """This just generates an HTML document that includes `message`
        in the body. Override, or re-write this do do more interesting stuff.
        """
        content = f"<html><body><h1>{message}</h1></body></html>"
        return content.encode("utf8")  # NOTE: must return a bytes object!

    def output_json(self, message):
        self._set_headers(type='json')
        self.wfile.write(json.dumps(message).encode("utf8"))

    def output_jsonp(self, message, callback_func):
        self._set_headers(type='json')
        s_response = '%s(%s)' % (callback_func, json.dumps(message))
        self.wfile.write(s_response.encode("utf8"))

    def do_GET(self):
        print('request [%s]' % self.path)
        if self.path.startswith(CONST_VIS_PREFIX):
            super().do_GET()
        elif self.path.startswith(CONST_API_PREFIX):
            # try:
            parsed = urlparse(self.path)
            qs = parse_qs(parsed.query)
            self.output_jsonp(APIMapper.get_mapper().map(self.path), qs['callback'][0])
            # except Exception as err:
            #     print(err)
            #     self._set_headers()
            #     self.wfile.write(self._html('[ERROR] %s' % err))
        else:
            self._set_headers()
            self.wfile.write(self._html("hi!"))

    def do_HEAD(self):
        self._set_headers()

    def do_POST(self):
        # Doesn't do anything with posted data
        self._set_headers()
        self.wfile.write(self._html("POST!"))


def run(server_class=HTTPServer, addr="", port=8000):
    server_address = (addr, port)
    print('listen to [%s]' % addr)
    httpd = server_class(server_address, S)

    print(f"Starting httpd server on {addr}:{port}")
    httpd.serve_forever()


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Run a simple HTTP server")
    parser.add_argument(
        "-l",
        "--listen",
        default="",
        help="Specify the IP address on which the server listens",
    )
    parser.add_argument(
        "-p",
        "--port",
        type=int,
        default=8000,
        help="Specify the port on which the server listens",
    )
    args = parser.parse_args()
    run(addr=args.listen, port=args.port)
