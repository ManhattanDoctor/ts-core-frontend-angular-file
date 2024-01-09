import { DestroyableContainer, ExtendedError, PromiseHandler, parseAxiosError } from '@ts-core/common';
import { Base64Source } from './Base64Source';
import * as _ from 'lodash';
import axios from 'axios';

export class Base64UrlLoader extends DestroyableContainer {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    protected type: string;
    protected promise: PromiseHandler<Base64Source, ExtendedError>;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor() {
        super();
    }

    //--------------------------------------------------------------------------
    //
    // 	Protected Methods
    //
    //--------------------------------------------------------------------------

    protected getSource(data: Buffer): Base64Source {
        return new Base64Source(data.toString('base64'), this.type);
    }

    protected clear(): void {
        if (!_.isNil(this.promise)) {
            this.promise = null;
        }
    }
    //--------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    //--------------------------------------------------------------------------

    protected readerLoaded = (data: Buffer): void => {
        if (_.isNil(this.promise)) {
            return;
        }
        this.promise.resolve(this.getSource(data));
        this.promise = null;
    };

    protected readerError = (error: ExtendedError): void => {
        if (_.isNil(this.promise)) {
            return;
        }
        this.promise.reject(error);
        this.promise = null;
    };

    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public async load<T>(url: string, type?: string): Promise<Base64Source> {
        if (!_.isNil(this.promise)) {
            return this.promise.promise;
        }

        this.clear();

        this.type = type;
        this.promise = PromiseHandler.create();
        axios
            .get(url, { responseType: 'arraybuffer' })
            .then(response => this.readerLoaded(Buffer.from(response.data, 'binary')))
            .catch(error => this.readerError(parseAxiosError(error)));

        return this.promise.promise;
    }

    public destroy(): void {
        if (this.isDestroyed) {
            return;
        }
        super.destroy();
        this.clear();
    }
}
