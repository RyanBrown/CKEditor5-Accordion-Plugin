export default class AccordionEditing extends Plugin {
    static get requires(): (typeof Widget)[];
    init(): void;
    _defineSchema(): void;
    _defineConverters(): void;
    _registerEventListenersForEditingView(): void;
    _registerEventListenersForDataView(): void;
    _attachTitlePlaceholderEvents(viewElement: any, writer: any): void;
}
import { Plugin } from '@ckeditor/ckeditor5-core';
import { Widget } from '@ckeditor/ckeditor5-widget';
