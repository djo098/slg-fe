import { environment } from "./../environments/environment";
export const BASE_PATH = environment.API_URL;
export const COLLECTION_FORMATS = {
    'csv': ',',
    'tsv': '   ',
    'ssv': ' ',
    'pipes': '|',
};

