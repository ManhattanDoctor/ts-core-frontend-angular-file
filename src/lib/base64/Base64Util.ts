import { Base64Source } from './Base64Source';
import { Base64File } from './Base64File';
import { Uploader } from '../Uploader';
import { ViewUtil } from '@ts-core/angular';
import { PromiseHandler } from '@ts-core/common';
import { FileItem } from 'ng2-file-upload';
import * as _ from 'lodash';

export class Base64Util {
    //--------------------------------------------------------------------------
    //
    //	Static Methods
    //
    //--------------------------------------------------------------------------

    public static addBase64File(uploader: Uploader, base64?: string | Base64Source): FileItem {
        let file = new Base64File();

        let loader = uploader.uploader;
        loader.addToQueue([file]);

        let item = loader.queue[loader.queue.length - 1];
        if (!Base64Util.isBase64File(item)) {
            return null;
        }
        if (base64 instanceof Base64Source) {
            base64 = base64.source;
        }
        Base64Util.setBase64ToFile(item, base64);
        return item;
    }

    public static setBase64ToFile(item: FileItem, base64: string): void {
        if (!Base64Util.isBase64File(item)) {
            return;
        }
        let base64file = item._file as Base64File;
        base64file.base64 = base64;
    }

    public static getBase64FromFile(item: FileItem): string {
        if (!Base64Util.isBase64File(item)) {
            return null;
        }
        let base64file = item._file as Base64File;
        return base64file.base64;
    }

    public static isBase64File(item: FileItem): boolean {
        return !_.isNil(item) ? item._file instanceof Base64File : false;
    }

    public static async resizeBase64(base64: string, width: number, height: number): Promise<string> {
        let promise = PromiseHandler.create<string>();
        let image = ViewUtil.document.createElement('img');
        image.src = new Base64Source(base64).file;
        image.onload = () => {
            let canvas = ViewUtil.document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
            promise.resolve(new Base64Source(canvas.toDataURL()).source);
        };
        image.onerror = () => promise.reject();
        return promise.promise;
    }
}
