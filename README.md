# klannotation

A lightweight annotation visualisation tool

## run klannotation using `docker-compose`
1. edit `klannotation-compose.yml`
   - replace `PATH_TO_ANNOTATION_FOLDER` with the full path to the folder containing the full texts (`input_docs`) and annotations (`semehr_results`)
   - replace `PATH_TO_KLANNOTATION_REPO` with the full path to the cloned repo of `klannotation`
   
   1.1 (optional) Create mappings. Mappings are basically filters to map UMLS concepts (CUIs) to another vocabulary, for example, HPO (check [this predefined mapping](https://github.com/Honghan/klannotation/blob/master/mappings/hpo-umls-mapping.json)). Mapping can be loaded by adding them into `conf/settings.json`.
   
   1.2 (optional) Add passphrase to protect your project. Edit `conf/settings.json` by adding a line like the following. The UI will ask the user to input the passphrase and all API calls will need it as well.
   ```
   "passphrase": "123"
   ```
2. run it
    ```bash
    docker-compose -f klannotation-compose.yml up -d
    ```

## RESTful API call
Documentation: [here](https://github.com/Honghan/klannotation/wiki/API-Usage)
