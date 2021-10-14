import Papa, {ParseConfig, UnparseObject} from 'papaparse';

type Datum = string | number | boolean | null;
type Data = Array<Array<Datum> | Record<string, Datum>>;

function parse(csv: string, cfg?: ParseConfig): Data {
    if (!cfg)
        cfg = {
            header: true,
            dynamicTyping: true,
        };
    return Papa.parse(csv, cfg).data;
}

function stringify(data: Data | UnparseObject<Data>): string {
    return Papa.unparse<Datum>(data as unknown as Datum[]);
}

export default {parse, stringify};