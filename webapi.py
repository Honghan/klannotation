from os import listdir
from os.path import isfile, join
import codecs
import json


class DocAnn(object):
    def __init__(self):
        pass

    def get_doc_list(self):
        pass

    def get_doc_content(self, doc_id):
        pass

    def get_doc_ann(self, doc_id):
        pass


class FileBasedDocAnn(DocAnn):
    def __init__(self, doc_folder, ann_folder):
        super().__init__()
        self._doc_folder = doc_folder
        self._ann_folder = ann_folder
        self._file_list = None

    def get_doc_list(self):
        if self._file_list is not None:
            return self._file_list
        self._file_list = [f for f in listdir(self._doc_folder) if isfile(join(self._doc_folder, f))]
        return self._file_list

    def get_doc_content(self, doc_id):
        return FileBasedDocAnn.read_text_file(join(self._doc_folder, doc_id))

    def get_doc_ann(self, doc_id, ptn='se_ann_%s.json'):
        return FileBasedDocAnn.load_json(join(self._ann_folder, ptn % doc_id[:doc_id.rfind('.')]))

    @staticmethod
    def read_text_file(path):
        s = None
        with codecs.open(path) as rf:
            s = rf.read()
        return s

    @staticmethod
    def load_json(file_path):
        data = None
        with codecs.open(file_path, encoding='utf-8') as rf:
            data = json.load(rf)
        return data


if __name__ == '__main__':
    pass
