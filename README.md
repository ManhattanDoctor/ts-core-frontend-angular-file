# @ts-core/angular-file

> Загрузка файлов экосистемы ts-core: очередь, ход отправки, перетаскивание и работа с Base64

[![npm version](https://img.shields.io/npm/v/@ts-core/angular-file.svg)](https://www.npmjs.com/package/@ts-core/angular-file)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

Надстройка над `ng2-file-upload`, приводящая загрузку файлов к принятой в экосистеме модели: `Uploader` — наблюдаемый источник событий, каждый файл — `Loadable` со своим состоянием, отменой и результатом разбора ответа сервера.

## Содержание

- [Описание](#описание)
  - [Основные возможности](#основные-возможности)
- [Установка](#установка)
  - [Зависимости](#зависимости)
  - [Ограничение peer-зависимости](#ограничение-peer-зависимости)
  - [Требования к серверу](#требования-к-серверу)
- [Быстрый старт](#быстрый-старт)
- [Загрузчик](#загрузчик)
  - [Создание и очередь](#создание-и-очередь)
  - [События](#события)
  - [Разбор ответа сервера](#разбор-ответа-сервера)
  - [Дополнительные поля формы](#дополнительные-поля-формы)
- [Перетаскивание](#перетаскивание)
- [Работа с Base64](#работа-с-base64)
- [API](#api)
- [Структура проекта](#структура-проекта)
- [История изменений](#история-изменений)
- [Лицензия](#лицензия)

## Описание

### Основные возможности

- **Очередь файлов** — добавление, отправка, отмена и удаление по одному или всей очередью
- **Ход отправки** — общий процент и процент по каждому файлу через наблюдаемые события
- **Разбор ответа** — сервер возвращает данные, они попадают в `file.data` типизированными
- **Перетаскивание** — директива `[vi-file-drop]` с подсветкой зоны при наведении
- **Base64** — добавление изображения в очередь строкой, чтение и изменение размера

## Установка

```bash
npm install @ts-core/angular-file
```

### Зависимости

```json
{
    "@ts-core/angular": "~22.0.1",
    "ng2-file-upload": "^10.0.0"
}
```

### Ограничение peer-зависимости

`ng2-file-upload` объявляет совместимость с Angular 20, хотя работает и на 22. Пока это не исправлено в самом пакете, приложение обязано снять ограничение:

```json
// package.json приложения
{
    "overrides": {
        "ng2-file-upload": {
            "@angular/common": "^22.0.0",
            "@angular/core": "^22.0.0"
        }
    }
}
```

Без этого `npm install` завершается ошибкой разрешения зависимостей.

### Требования к серверу

Загрузка выполняется с признаком `withCredentials`, поэтому при отправке на другой источник сервер не может отвечать `Access-Control-Allow-Origin: *` — нужен конкретный источник и разрешение учётных данных:

```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
```

Иначе браузер отклоняет запрос, а загрузчик сообщает об ошибке без подробностей.

## Быстрый старт

```ts
import { Component, inject, signal } from '@angular/core';
import { Uploader, UploaderDropDirective } from '@ts-core/angular-file';
import { takeUntil } from 'rxjs';

@Component({
    selector: 'file-upload',
    imports: [UploaderDropDirective],
    template: `
        <div [vi-file-drop]="uploader" className="border-primary" class="border rounded p-4">
            Перетащите файл сюда или выберите:
            <input type="file" multiple (change)="selected($event)" />
        </div>
        <p>Отправлено: {{ progress() }}%</p>
    `
})
export class FileUploadComponent {
    public readonly uploader = new Uploader<IFile>('/api/file/upload');
    public progress = signal(0);

    constructor() {
        this.uploader.progress.pipe(takeUntil(this.uploader.destroyed)).subscribe(value => this.progress.set(value));
    }

    public selected(event: Event): void {
        let items = (event.target as HTMLInputElement).files;
        if (items != null) {
            this.uploader.uploader.addToQueue(Array.from(items));
        }
    }
}
```

## Загрузчик

### Создание и очередь

```ts
let uploader = new Uploader<IFile>(url, isAutoUpload, maxFiles);
```

| Параметр | По умолчанию | Назначение |
|---|---|---|
| `url` | — | адрес приёмника |
| `isAutoUpload` | `true` | отправлять сразу после добавления |
| `maxFiles` | без ограничения | предельный размер очереди |

```ts
uploader.uploadAll();
uploader.cancelAll();
uploader.removeAll();

uploader.upload(file);
uploader.cancel(file);
uploader.remove(file);

uploader.files;        // Array<UploaderFile>
uploader.hasFiles;     // есть ли что отправлять
uploader.isUploading;  // идёт ли отправка
```

### События

```ts
uploader.fileAdded.subscribe(file => { /* файл в очереди */ });
uploader.fileProgress.subscribe(item => item.progress);
uploader.fileComplete.subscribe(item => item.response);
uploader.fileError.subscribe(item => item.error);
uploader.fileCanceled.subscribe(item => { /* отмена */ });
uploader.fileRemoved.subscribe(file => { /* удалён из очереди */ });

uploader.added.subscribe(files => { /* добавлена группа файлов */ });
uploader.progress.subscribe(value => { /* общий процент */ });
uploader.fileAddingError.subscribe(item => item.filter);
```

Каждый `UploaderFile` сам является `Loadable`: у него есть `status`, `destroyed` и собственные события — удобно, когда строка списка подписывается только на свой файл.

### Разбор ответа сервера

```ts
uploader.fileUploadedData = (file, response, status, headers) => TransformUtil.toClass(File, JSON.parse(response));

uploader.fileComplete.subscribe(item => {
    let value = item.file.data;   // разобранный ответ нужного типа
});
```

### Дополнительные поля формы

```ts
uploader.fileBuildForm = (file, form) => {
    form.append('folderId', this.folder.id);
    form.append('isPublic', 'true');
};

uploader.fileBeforeUpload = file => this.logger.log(`отправка ${file.file.file.name}`);
```

## Перетаскивание

```html
<div [vi-file-drop]="uploader" className="drop-active" class="drop-zone">
    Перетащите файлы сюда
</div>
```

| Вход | Назначение |
|---|---|
| `[vi-file-drop]` | загрузчик, в очередь которого попадут файлы |
| `className` | класс, добавляемый элементу, пока над ним удерживают файл |

Директива сама подавляет стандартное поведение браузера — без этого страница просто открыла бы перетащенный файл.

## Работа с Base64

```ts
import { Base64Util } from '@ts-core/angular-file';

// добавить изображение в очередь как файл
let item = Base64Util.addBase64File(uploader, base64);

// прочитать и заменить содержимое
let value = Base64Util.getBase64FromFile(item);
Base64Util.setBase64ToFile(item, другоеЗначение);

// уменьшить перед отправкой
let small = await Base64Util.resizeBase64(base64, 256, 256);
```

Загрузка изображения по адресу или из файла:

```ts
let loader = new Base64UrlLoader();
let base64 = await loader.load('https://example.com/image.jpg');

let fileLoader = new Base64FileLoader();
let value = await fileLoader.load(file);
```

`Base64File` — реализация `File` поверх строки Base64, поэтому такой файл проходит по обычному пути отправки.

## API

| Класс | Назначение |
|---|---|
| `Uploader<T>` | очередь, отправка, события |
| `UploaderFile<T>` | один файл: состояние, ход отправки, результат |
| `UploaderDropDirective` | зона перетаскивания `[vi-file-drop]` |
| `UploaderDropManager` | та же логика без Angular — для своих компонентов |
| `Base64Util` | добавление, чтение и изменение размера Base64 |
| `Base64File`, `Base64Source` | файл и источник поверх строки Base64 |
| `Base64UrlLoader`, `Base64FileLoader` | загрузка Base64 по адресу и из файла |
| `VIFileModule` | вариант для приложений на `NgModule` |

## Структура проекта

```
src/
├── VIFileModule.ts               модуль для приложений на NgModule
├── directive/
│   ├── UploaderDropDirective.ts  зона перетаскивания
│   └── UploaderDropManager.ts    обработка событий перетаскивания
└── lib/
    ├── Uploader.ts               очередь и отправка
    ├── UploaderFile.ts           состояние одного файла
    └── base64/                   работа с Base64
```

## История изменений

### 22.0.1

- Поддержка Angular 22 и TypeScript 6
- `UploaderDropDirective` стала самостоятельной, `standalone: false` снят
- `ng2-file-upload` обновлён до 10-й версии
- Сборка переведена на `@angular/build:ng-packagr`

Публичный API не менялся: `VIFileModule` работает по-прежнему, селектор директивы и события загрузчика совпадают с предыдущими версиями.

## Лицензия

ISC © Renat Gubaev
