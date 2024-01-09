import { DestroyableContainer, PromiseHandler } from '@ts-core/common';
import { Base64Source } from './Base64Source';
import { UploaderFile } from '../UploaderFile';
import * as _ from 'lodash';

export class Base64FileLoader extends DestroyableContainer {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    protected type: string;
    protected reader: FileReader;
    protected promise: PromiseHandler<Base64Source, ProgressEvent<FileReader>>;

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

    protected getSource(): Base64Source {
        return new Base64Source(this.reader.result.toString(), this.type);
    }

    protected clear(): void {
        if (!_.isNil(this.reader)) {
            this.reader.onerror = null;
            this.reader.onerror = null;
            this.reader.abort();
            this.reader = null;
        }
        if (!_.isNil(this.promise)) {
            this.promise = null;
        }
    }
    //--------------------------------------------------------------------------
    //
    // 	Event Handlers
    //
    //--------------------------------------------------------------------------

    protected readerLoaded = (): void => {
        if (_.isNil(this.promise)) {
            return;
        }
        this.promise.resolve(this.getSource());
        this.promise = null;
    };

    protected readerError = (error: ProgressEvent<FileReader>): void => {
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

    public async load<T>(file: UploaderFile<T>, type?: string): Promise<Base64Source> {
        if (!_.isNil(this.promise)) {
            return this.promise.promise;
        }

        this.clear();

        this.type = !_.isNil(type) ? type : file.file.file.rawFile.type;
        this.promise = PromiseHandler.create();

        this.reader = new FileReader();
        this.reader.onload = this.readerLoaded;
        this.reader.onerror = this.readerError;
        this.reader.readAsDataURL(file.file.file.rawFile as File);

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
