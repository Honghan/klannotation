# klannotation

A lightweight annotation visualisation tool

## run klannotation using `docker-compose`
1. edit `klannotation-compose.yml`
   - replace `PATH_TO_ANNOTATION_FOLDER` with the full path to the folder containing the full texts (`input_docs`) and annotations (`semehr_results`)
   - replace `PATH_TO_KLANNOTATION_REPO` with the full path to the cloned repo of `klannotation`
2. run it
    ```bash
    docker-compose -f klannotation-compose.yml up -d
    ```

## RESTful API call
Documentation: [here](https://github.com/Honghan/klannotation/wiki/API-Usage)
