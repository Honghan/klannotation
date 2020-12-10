from os import listdir
from os.path import isfile, join
import codecs
import json
import re
import utils
from multiprocessing import Manager


def save_json_array(lst, file_path, encoding='utf-8'):
    with codecs.open(file_path, 'w', encoding=encoding) as wf:
        json.dump(lst, wf)


def load_json_data(file_path):
    data = None
    with codecs.open(file_path, encoding='utf-8') as rf:
        data = json.load(rf)
    return data


class DocAnn(object):
    def __init__(self):
        self._map_name = ''
        self._mappings = {}

    def get_doc_list(self):
        pass

    def get_doc_content(self, doc_id):
        pass

    def get_doc_ann(self, doc_id):
        pass

    def load_mappings(self, mappings):
        for m in mappings:
            mm = {}
            term2umls = load_json_data(m['file'])
            for t in term2umls:
                for c in term2umls[t]:
                    mm[c] = t
            self._mappings[m['name']] = mm

    def get_doc_ann_by_mapping(self, doc_id, map_name):
        doc_anns = self.get_doc_ann(doc_id)
        umls2term = None if map_name not in self._mappings else self._mappings[map_name]
        if umls2term is None:
            print('mapping %s not found' % map_name)
            return doc_anns
        anns = doc_anns['annotations']
        mapped = []
        for ann in anns:
            if ann['cui'] in umls2term:
                ann['mapped'] = umls2term[ann['cui']]
                mapped.append(ann)
        doc_anns['annotations'] = mapped
        doc_anns['mapping_name'] = map_name
        return doc_anns

    def get_available_mappings(self):
        return list(self._mappings.keys())

    def search_docs(self, query):
        query = '\\b%s\\b' % query
        matched_docs = Manager().list()
        utils.multi_process_tasking(self.get_doc_list(), DocAnn.do_search_doc, args=[self, query, matched_docs])
        return list(matched_docs)

    def search_anns(self, query, map_name=None):
        matched_docs = Manager().list()
        utils.multi_process_tasking(self.get_doc_list(), DocAnn.do_search_anns,
                                   args=[self, query, map_name, matched_docs])
        return list(matched_docs)

    @staticmethod
    def do_search_doc(d, inst, query, container):
        content = inst.get_doc_content(d)
        if re.search(query, content):
            container.append(d)

    @staticmethod
    def do_search_anns(d, inst, query, map_name, container):
        ann_obj = inst.get_doc_ann(d) if map_name is None else inst.get_doc_ann_by_mapping(d, map_name)
        matched = False
        for ann in ann_obj['annotations']:
            if re.search(query, ' | '.join([str(ann['str']), str(ann['pref']), ann['cui'], ann['sty']])):
                container.append(d)
                matched = True
                break
        if not matched:
            for ann in ann_obj['phenotypes']:
                if re.search(query, ' | '.join([str(ann['str']), ann['minor_type']])):
                    container.append(d)
                break


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
