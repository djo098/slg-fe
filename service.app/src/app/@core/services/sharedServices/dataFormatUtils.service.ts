
export class dataFormatUtilsService {

    constructor() {
    }

    NUMBER_VALIDATION_REGEX = /^[+]?([1-9]{1}[0-9]{0,2}(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\-?\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))$|^\(\?([1-9]{1}\d+(\.\d{3})*(\,\d+)?|[1-9]{1}\d{0,}(\,\d+)?|0(\,\d+)?|(\,\d{1,2}))\)$/;


    is_string_number(value: string): boolean {
        return this.NUMBER_VALIDATION_REGEX.test(value) == true
    }

    format_to_number(given: any): string {
        return given.toString().replace(/\./g, "").replace(",", ".");
    }

    format_number_notation(given: any): number {
        return given.format("0,0.[0000000000]");
    }

    format_string_date(string_datetime: string): Date {
        const string_date_parsed = string_datetime.split("-");
        const string_time_parsed = string_date_parsed[2].split("T");
        const date_correct_format = new Date(
            Number(string_date_parsed[0]),
            Number(string_date_parsed[1]) - 1,
            Number(string_time_parsed[0]),
            Number(string_time_parsed[1].split(":")[0]),
            Number(string_time_parsed[1].split(":")[1]),
            Number(string_time_parsed[1].split(":")[2].replace("Z", "")
            )
        );
        return date_correct_format;
    }

}