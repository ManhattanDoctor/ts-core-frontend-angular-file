# @ts-core/frontend-angular-file

Angular библиотека для загрузки файлов с поддержкой drag-and-drop, конвертации в Base64 и утилитами для работы с файлами.

## Содержание

- [Установка](#установка)
- [Зависимости](#зависимости)
- [Настройка модуля](#настройка-модуля)
- [Загрузка файлов](#загрузка-файлов)
- [Drag & Drop](#drag--drop)
- [Конвертация в Base64](#конвертация-в-base64)
- [API Reference](#api-reference)
- [Примеры использования](#примеры-использования)
- [Связанные пакеты](#связанные-пакеты)

## Установка

```bash
npm install @ts-core/frontend-angular-file
```

```bash
yarn add @ts-core/frontend-angular-file
```

```bash
pnpm add @ts-core/frontend-angular-file
```

## Зависимости

| Пакет | Описание |
|-------|----------|
| `@angular/core` | Angular фреймворк |
| `@ts-core/angular` | Angular утилиты |
| `@ts-core/common` | Базовые классы и интерфейсы |
| `@ts-core/frontend` | Фронтенд утилиты |
| `ng2-file-upload` | Библиотека загрузки файлов |

## Настройка модуля

Импортируйте модуль в вашем Angular приложении:

```typescript
import { VIFileModule } from '@ts-core/frontend-angular-file';

@NgModule({
    imports: [
        VIFileModule
    ]
})
export class AppModule {}
```

Для standalone компонентов:

```typescript
import { VIFileModule } from '@ts-core/frontend-angular-file';

@Component({
    standalone: true,
    imports: [VIFileModule]
})
export class MyComponent {}
```

## Загрузка файлов

### Базовое использование

```typescript
import { Uploader, UploaderFile } from '@ts-core/frontend-angular-file';

// Создание экземпляра загрузчика
const uploader = new Uploader({
    url: '/api/upload',
    maxFileSize: 10 * 1024 * 1024,  // 10 МБ
    allowedMimeType: ['image/jpeg', 'image/png', 'application/pdf']
});

// Обработчик добавления файла
uploader.onAfterAddingFile = (file: UploaderFile) => {
    console.log('Файл добавлен:', file.name);
};

// Обработчик завершения загрузки
uploader.onCompleteItem = (file, response, status) => {
    console.log('Загрузка завершена:', response);
};

// Обработчик ошибки
uploader.onErrorItem = (file, response, status) => {
    console.error('Ошибка загрузки:', response);
};

// Запуск загрузки всех файлов
uploader.uploadAll();
```

### Конфигурация Uploader

```typescript
const uploader = new Uploader({
    url: '/api/upload',                    // URL для загрузки
    method: 'POST',                        // HTTP метод
    maxFileSize: 5 * 1024 * 1024,          // Макс. размер файла (5 МБ)
    allowedMimeType: ['image/*'],          // Разрешённые MIME типы
    headers: [                              // Дополнительные заголовки
        { name: 'Authorization', value: 'Bearer token' }
    ],
    autoUpload: false,                     // Автозагрузка после добавления
    removeAfterUpload: true,               // Удалять из очереди после загрузки
    queueLimit: 10                         // Лимит файлов в очереди
});
```

## Drag & Drop

### Директива viUploaderDrop

```html
<div viUploaderDrop
     [uploader]="uploader"
     [class.active]="hasFileOver"
     (fileOver)="hasFileOver = $event"
     class="drop-zone">
    <p *ngIf="!hasFileOver">Перетащите файлы сюда</p>
    <p *ngIf="hasFileOver">Отпустите для загрузки</p>
</div>
```

```typescript
import { Component } from '@angular/core';
import { Uploader } from '@ts-core/frontend-angular-file';

@Component({
    selector: 'app-upload',
    template: `
        <div viUploaderDrop
             [uploader]="uploader"
             [class.active]="hasFileOver"
             (fileOver)="hasFileOver = $event"
             class="drop-zone">
            Перетащите файлы сюда
        </div>
    `,
    styles: [`
        .drop-zone {
            border: 2px dashed #ccc;
            padding: 40px;
            text-align: center;
        }
        .drop-zone.active {
            border-color: #007bff;
            background: #f0f8ff;
        }
    `]
})
export class UploadComponent {
    uploader = new Uploader({ url: '/api/upload' });
    hasFileOver = false;
}
```

### UploaderDropManager

```typescript
import { UploaderDropDirective, UploaderDropManager } from '@ts-core/frontend-angular-file';

@Component({
    template: `
        <div #dropZone viUploaderDrop [uploader]="uploader">
            Зона загрузки
        </div>
    `
})
export class UploadComponent implements AfterViewInit {
    @ViewChild('dropZone', { read: UploaderDropDirective })
    dropDirective: UploaderDropDirective;

    uploader = new Uploader({ url: '/api/upload' });

    ngAfterViewInit(): void {
        // Доступ к менеджеру
        const manager = this.dropDirective.manager;
    }
}
```

## Конвертация в Base64

### Base64FileLoader

Конвертация File в Base64:

```typescript
import { Base64FileLoader, Base64File } from '@ts-core/frontend-angular-file';

async function convertToBase64(file: File): Promise<Base64File> {
    const loader = new Base64FileLoader();
    return loader.load(file);
}

// Использование
const input = document.querySelector('input[type="file"]') as HTMLInputElement;
input.addEventListener('change', async () => {
    const file = input.files[0];
    const base64 = await convertToBase64(file);

    console.log('Имя:', base64.name);
    console.log('Data URL:', base64.data);
    console.log('MIME тип:', base64.mimeType);
});
```

### Base64UrlLoader

Загрузка изображения по URL и конвертация в Base64:

```typescript
import { Base64UrlLoader } from '@ts-core/frontend-angular-file';

async function loadImageAsBase64(url: string): Promise<Base64File> {
    const loader = new Base64UrlLoader();
    return loader.load(url);
}

// Использование
const imageBase64 = await loadImageAsBase64('https://example.com/image.png');
console.log('Base64:', imageBase64.data);
```

### Класс Base64File

```typescript
import { Base64File, Base64Source } from '@ts-core/frontend-angular-file';

const base64File = new Base64File();
base64File.name = 'image.png';
base64File.data = 'data:image/png;base64,iVBORw0KGgo...';
base64File.source = Base64Source.FILE;

// Получение MIME типа из data URL
console.log(base64File.mimeType);  // 'image/png'

// Получение расширения
console.log(base64File.extension);  // 'png'
```

### Base64Util

Утилиты для работы с Base64:

```typescript
import { Base64Util } from '@ts-core/frontend-angular-file';

// Конвертация File в Base64 строку
const file: File = input.files[0];
const base64String = await Base64Util.toBase64(file);

// Конвертация Base64 в Blob
const blob = Base64Util.toBlob(base64String);

// Получение MIME типа из Data URL
const mimeType = Base64Util.getMimeType('data:image/png;base64,...');
// 'image/png'
```

## API Reference

### Uploader

| Свойство/Метод | Тип | Описание |
|----------------|-----|----------|
| `url` | `string` | URL для загрузки |
| `maxFileSize` | `number` | Максимальный размер файла в байтах |
| `allowedMimeType` | `string[]` | Разрешённые MIME типы |
| `queue` | `UploaderFile[]` | Файлы в очереди |
| `progress` | `number` | Общий прогресс (0-100) |
| `isUploading` | `boolean` | Идёт загрузка |
| `uploadAll()` | `void` | Загрузить все файлы |
| `cancelAll()` | `void` | Отменить все загрузки |
| `clearQueue()` | `void` | Очистить очередь |
| `addToQueue(files)` | `void` | Добавить файлы в очередь |
| `removeFromQueue(file)` | `void` | Удалить файл из очереди |
| `onAfterAddingFile` | `callback` | Файл добавлен |
| `onCompleteItem` | `callback` | Загрузка завершена |
| `onErrorItem` | `callback` | Ошибка загрузки |
| `onProgressItem` | `callback` | Прогресс загрузки |

### UploaderFile

| Свойство | Тип | Описание |
|----------|-----|----------|
| `name` | `string` | Имя файла |
| `size` | `number` | Размер в байтах |
| `type` | `string` | MIME тип |
| `progress` | `number` | Прогресс загрузки (0-100) |
| `isUploading` | `boolean` | Загружается |
| `isSuccess` | `boolean` | Загружен успешно |
| `isError` | `boolean` | Ошибка загрузки |
| `isReady` | `boolean` | Готов к загрузке |
| `_file` | `File` | Оригинальный File объект |

### UploaderDropDirective

| Вход/Выход | Тип | Описание |
|------------|-----|----------|
| `[uploader]` | `Uploader` | Экземпляр загрузчика |
| `(fileOver)` | `EventEmitter<boolean>` | Файл над зоной |

### Base64File

| Свойство | Тип | Описание |
|----------|-----|----------|
| `name` | `string` | Имя файла |
| `data` | `string` | Data URL (data:mime;base64,...) |
| `source` | `Base64Source` | Источник (FILE, URL, CAMERA) |
| `mimeType` | `string` | MIME тип (readonly) |
| `extension` | `string` | Расширение файла (readonly) |

## Примеры использования

### Компонент загрузки изображений

```typescript
import { Component } from '@angular/core';
import { Uploader, Base64FileLoader, UploaderFile } from '@ts-core/frontend-angular-file';

@Component({
    selector: 'app-image-upload',
    template: `
        <div viUploaderDrop
             [uploader]="uploader"
             [class.active]="hasFileOver"
             (fileOver)="hasFileOver = $event"
             class="drop-zone">
            <p>Перетащите изображение сюда или нажмите для выбора</p>
            <input type="file"
                   accept="image/*"
                   (change)="onFileSelected($event)"
                   #fileInput
                   hidden>
            <button (click)="fileInput.click()">Выбрать файл</button>
        </div>

        <div *ngIf="preview" class="preview">
            <img [src]="preview" alt="Превью">
            <button (click)="upload()">Загрузить</button>
            <button (click)="cancel()">Отмена</button>
        </div>

        <div *ngIf="uploader.isUploading" class="progress">
            Загрузка: {{ uploader.progress }}%
        </div>
    `
})
export class ImageUploadComponent {
    uploader: Uploader;
    hasFileOver = false;
    preview: string;

    constructor() {
        this.uploader = new Uploader({
            url: '/api/upload/image',
            maxFileSize: 5 * 1024 * 1024,  // 5 МБ
            allowedMimeType: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        });

        this.uploader.onAfterAddingFile = (file) => this.showPreview(file);
        this.uploader.onCompleteItem = (file, response) => this.onComplete(response);
        this.uploader.onErrorItem = (file, response) => this.onError(response);
    }

    async onFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            this.uploader.addToQueue(input.files);
        }
    }

    async showPreview(file: UploaderFile): Promise<void> {
        const loader = new Base64FileLoader();
        const base64 = await loader.load(file._file);
        this.preview = base64.data;
    }

    upload(): void {
        this.uploader.uploadAll();
    }

    cancel(): void {
        this.uploader.clearQueue();
        this.preview = null;
    }

    onComplete(response: any): void {
        console.log('Загружено:', response);
        this.preview = null;
    }

    onError(response: any): void {
        console.error('Ошибка:', response);
    }
}
```

### Множественная загрузка с прогрессом

```typescript
import { Component } from '@angular/core';
import { Uploader, UploaderFile } from '@ts-core/frontend-angular-file';

@Component({
    selector: 'app-multi-upload',
    template: `
        <div viUploaderDrop [uploader]="uploader" class="drop-zone">
            Перетащите файлы сюда
        </div>

        <div class="queue" *ngIf="uploader.queue.length">
            <h4>Очередь загрузки ({{ uploader.queue.length }} файлов)</h4>

            <div *ngFor="let file of uploader.queue" class="file-item">
                <span class="name">{{ file.name }}</span>
                <span class="size">{{ formatSize(file.size) }}</span>

                <div class="progress-bar" *ngIf="file.isUploading">
                    <div [style.width.%]="file.progress"></div>
                </div>

                <span class="status" [class.success]="file.isSuccess" [class.error]="file.isError">
                    {{ getStatus(file) }}
                </span>

                <button (click)="uploader.removeFromQueue(file)" *ngIf="!file.isUploading">
                    Удалить
                </button>
            </div>

            <div class="actions">
                <button (click)="uploader.uploadAll()" [disabled]="uploader.isUploading">
                    Загрузить всё
                </button>
                <button (click)="uploader.cancelAll()" *ngIf="uploader.isUploading">
                    Отменить
                </button>
                <button (click)="uploader.clearQueue()">
                    Очистить
                </button>
            </div>
        </div>
    `
})
export class MultiUploadComponent {
    uploader = new Uploader({
        url: '/api/upload',
        maxFileSize: 50 * 1024 * 1024,  // 50 МБ
        queueLimit: 10
    });

    formatSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' Б';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
        return (bytes / 1024 / 1024).toFixed(1) + ' МБ';
    }

    getStatus(file: UploaderFile): string {
        if (file.isUploading) return `${file.progress}%`;
        if (file.isSuccess) return 'Загружен';
        if (file.isError) return 'Ошибка';
        return 'Ожидает';
    }
}
```

## Связанные пакеты

| Пакет | Описание |
|-------|----------|
| `@ts-core/frontend-angular` | Angular фронтенд утилиты |

## Автор

**Renat Gubaev** — [renat.gubaev@gmail.com](mailto:renat.gubaev@gmail.com)

- GitHub: [ManhattanDoctor](https://github.com/ManhattanDoctor)
- Репозиторий: [ts-core-frontend-angular-file](https://github.com/ManhattanDoctor/ts-core-frontend-angular-file)

## Лицензия

ISC
