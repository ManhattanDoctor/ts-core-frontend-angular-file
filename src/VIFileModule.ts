import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
import { FileUploadModule } from 'ng2-file-upload';
import { UploaderDropDirective } from './directive';
// import { FileSelectButtonComponent } from './component';
// import { ImageCropperModule } from 'ngx-image-cropper';

import * as _ from 'lodash';

const imports = [CommonModule, FileUploadModule];
const declarations = [UploaderDropDirective];
const exports = [...imports, ...declarations];

@NgModule({
    // Директива стала самостоятельной, поэтому модуль её импортирует и отдаёт дальше:
    // тем, кто собирает приложение на модулях, менять ничего не нужно
    imports: [...imports, ...declarations],
    exports
})
export class VIFileModule {}
