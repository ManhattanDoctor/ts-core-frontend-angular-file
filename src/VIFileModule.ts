import { NgModule } from '@angular/core';
import { VIModule } from '@ts-core/angular';
import { CommonModule } from '@angular/common';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
import { FileUploadModule } from 'ng2-file-upload';
import { UploaderDropDirective } from './directive';
// import { FileSelectButtonComponent } from './component';
// import { ImageCropperModule } from 'ngx-image-cropper';

import * as _ from 'lodash';

const IMPORTS = [VIModule, CommonModule, FileUploadModule];

const DECLARATIONS = [UploaderDropDirective];
const PROVIDERS = [];
const EXPORTS = [...IMPORTS, ...DECLARATIONS];

@NgModule({
    imports: IMPORTS,
    declarations: DECLARATIONS,
    providers: PROVIDERS,
    exports: EXPORTS
})
export class VIFileModule {}
