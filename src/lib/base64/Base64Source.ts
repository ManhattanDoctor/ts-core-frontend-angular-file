import * as _ from 'lodash';

export class Base64Source {
    //--------------------------------------------------------------------------
    //
    //	Constants
    //
    //--------------------------------------------------------------------------

    private static PREFIX = 'base64,';

    //--------------------------------------------------------------------------
    //
    //	Static Methods
    //
    //--------------------------------------------------------------------------

    public static isBase64(item: string): boolean {
        return !_.isNil(item) ? item.includes(Base64Source.PREFIX) : false;
    }

    public static getSource(item: string): string {
        return Base64Source.isBase64(item) ? item.substr(item.indexOf(Base64Source.PREFIX) + Base64Source.PREFIX.length) : null;
    }

    //--------------------------------------------------------------------------
    //
    //	Properties
    //
    //--------------------------------------------------------------------------

    public type: string;
    public source: string;

    //--------------------------------------------------------------------------
    //
    //	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(source?: string, type?: string) {
        this.type = !_.isNil(type) ? type : 'image/png';
        if (!_.isNil(source)) {
            this.source = source.indexOf(Base64Source.PREFIX) === -1 ? source : source.substr(source.indexOf(Base64Source.PREFIX) + Base64Source.PREFIX.length);
        }
    }

    //--------------------------------------------------------------------------
    //
    //	Public Properties
    //
    //--------------------------------------------------------------------------

    public get file(): string {
        return `data:${this.type};${Base64Source.PREFIX}${this.source.replace(/(\r\n|\n|\r)/gm, '')}`;
    }
}
