import { Plugin } from '@ckeditor/ckeditor5-core';
import { Widget, toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget';
import AccordionCommand from './accordion-plugin-command';
import { PLACEHOLDER_TEXTS, toggleAccordionOpenState } from './accordion-plugin-utils';

export default class AccordionEditing extends Plugin {
    // Specifies the dependencies needed by this plugin, specifically the Widget plugin.
    static get requires() {
        return [Widget];
    }

    // Initialization function for setting up the plugin's schema and converters.
    init() {
        const editor = this.editor;
        editor.commands.add('accordion', new AccordionCommand(editor));
        this._defineSchema();
        this._defineConverters();
        this._registerEventListenersForEditingView();
        this._registerEventListenersForDataView();
    }

    // Defines the schema for the custom accordion elements.
    _defineSchema() {
        const schema = this.editor.model.schema;

        // Registering the main accordion container element.
        schema.register('accordion', {
            isObject: true,
            allowWhere: '$block',
            allowContentOf: '$block',
            isLimit: true,
            allowAttributes: ['isOpen'],
        });
        // Registering the header element of the accordion which can contain the title and button.
        schema.register('accordionHeader', {
            allowIn: 'accordion',
            isLimit: true,
            allowContentOf: '$block',
        });
        // Registering the button element used for toggling the accordion's visibility.
        schema.register('accordionButton', {
            allowIn: 'accordionHeader',
        });
        // Registering the title element inside the accordion header.
        schema.register('accordionTitle', {
            allowIn: 'accordionHeader',
            isLimit: true,
            allowContentOf: '$block',
        });
        // Registering the content panel of the accordion which can contain text or other elements.
        schema.register('accordionPanel', {
            allowIn: 'accordion',
            isLimit: true,
            allowContentOf: '$block',
        });
        // Extending the model to allow text and block elements inside the accordion panel.
        schema.extend('$text', { allowIn: 'accordionPanel' });
        schema.extend('$block', { allowIn: 'accordionPanel' });
        schema.extend('$clipboardHolder', { allowIn: 'accordionPanel' });

        // Adding a rule to prevent the accordion from being nested within itself.
        schema.addChildCheck((context, childDefinition) => {
            if (context.endsWith('accordionPanel') && childDefinition.name === 'accordion') {
                return false; // Disallow nesting accordions within other accordions.
            }
        });
    }

    // Defines the conversion rules for upcasting (view-to-model) and downcasting (model-to-view).
    _defineConverters() {
        const conversion = this.editor.conversion;

        // Conversions for accordion
        conversion.for('upcast').elementToElement({
            view: { name: 'div', classes: 'accordion' },
            model: (viewElement, { writer: modelWriter }) =>
                modelWriter.createElement('accordion', {
                    isOpen: viewElement.hasClass('open'),
                }),
        });
        // Downcasting conversion for saving and editing: defines how model elements are represented in the view.
        conversion.for('dataDowncast').elementToElement({
            model: 'accordion',
            view: (modelElement, { writer: viewWriter }) => {
                const div = viewWriter.createContainerElement('div', {
                    class: 'accordion' + (modelElement.getAttribute('isOpen') ? ' open' : ''),
                });
                const header = viewWriter.createContainerElement('div', {
                    class: 'accordion-header',
                });
                const button = viewWriter.createContainerElement('button', {
                    class: 'accordion-button',
                });
                const title = viewWriter.createContainerElement('div', {
                    class: 'accordion-title',
                    'data-placeholder': PLACEHOLDER_TEXTS.TITLE,
                });
                const panel = viewWriter.createContainerElement('div', {
                    class: 'accordion-panel',
                });
                viewWriter.insert(viewWriter.createPositionAt(div, 0), header);
                viewWriter.insert(viewWriter.createPositionAt(header, 0), button);
                viewWriter.insert(viewWriter.createPositionAt(header, 'end'), title);
                viewWriter.insert(viewWriter.createPositionAt(div, 'end'), panel);

                return div;
            },
        });
        conversion.for('editingDowncast').elementToElement({
            model: 'accordion',
            view: (modelElement, { writer }) => {
                // Prevent the mapper error
                if (!modelElement) {
                    console.error("Model element for 'accordion' is undefined.");
                    return;
                }
                const div = writer.createContainerElement('div', {
                    class: 'accordion-plugin',
                });
                writer.setAttribute(
                    'class',
                    modelElement.getAttribute('isOpen') ? 'open accordion-plugin' : 'accordion-plugin',
                    div
                );
                // Make this editable and widgetized to be a functional part of the editor.
                return toWidget(div, writer, { draggable: true });
            },
        });

        // Conversions for accordion header
        conversion.for('upcast').elementToElement({
            model: 'accordionHeader',
            view: { name: 'div', classes: 'accordion-header' },
        });
        conversion.for('dataDowncast').elementToElement({
            model: 'accordionHeader',
            view: { name: 'div', classes: 'accordion-header' },
        });
        conversion.for('editingDowncast').elementToElement({
            model: 'accordionHeader',
            view: (modelElement, { writer }) => {
                // Prevent the mapper error
                if (!modelElement) {
                    console.error("Model element for 'accordionHeader' is undefined.");
                    return;
                }
                const header = writer.createContainerElement('div', {
                    class: 'accordion-header',
                    draggable: 'false',
                });
                // Make this editable and widgetized to be a functional part of the editor.
                return toWidget(header, writer, { draggable: false });
            },
        });

        // Conversions for accordion button
        conversion.for('upcast').elementToElement({
            model: 'accordionButton',
            view: { name: 'button', classes: 'accordion-button' },
        });
        conversion.for('dataDowncast').elementToElement({
            model: 'accordionButton',
            view: { name: 'button', classes: 'accordion-button' },
        });
        conversion.for('editingDowncast').elementToElement({
            model: 'accordionButton',
            view: (modelElement, { writer }) => {
                // Prevent the mapper error
                if (!modelElement) {
                    console.error('accordionButton model element is undefined.');
                    return;
                }
                const button = writer.createEditableElement('button', {
                    class: 'accordion-button',
                });
                // Make this editable and widgetized to be a functional part of the editor.
                return toWidget(button, writer, {
                    draggable: false,
                    keyboardFocusable: false,
                });
            },
        });

        // Conversions for accordion title
        conversion.for('upcast').elementToElement({
            model: 'accordionTitle',
            view: { name: 'div', classes: 'accordion-title' },
        });
        conversion.for('dataDowncast').elementToElement({
            model: 'accordionTitle',
            view: { name: 'div', classes: 'accordion-title' },
        });
        conversion.for('editingDowncast').elementToElement({
            model: 'accordionTitle',
            view: (modelElement, { writer }) => {
                // Prevent the mapper error
                if (!modelElement) {
                    console.error("Model element for 'accordionTitle' is undefined.");
                    return;
                }
                const title = writer.createEditableElement('div', {
                    class: 'accordion-title',
                    'data-placeholder': PLACEHOLDER_TEXTS.TITLE,
                });
                this._attachTitlePlaceholderEvents(title, writer);
                // Make the panel editable and widgetized to be a functional part of the editor.
                return toWidgetEditable(title, writer, { draggable: false });
            },
        });

        // Conversions for accordion panel
        conversion.for('upcast').elementToElement({
            model: 'accordionPanel',
            view: { name: 'div', classes: 'accordion-panel' },
        });
        conversion.for('dataDowncast').elementToElement({
            model: 'accordionPanel',
            view: { name: 'div', classes: 'accordion-panel' },
        });
        conversion.for('editingDowncast').elementToElement({
            model: 'accordionPanel',
            view: (modelElement, { writer }) => {
                // Prevent the mapper error
                if (!modelElement) {
                    console.error("Model element for 'accordionPanel' is undefined.");
                    return;
                }
                const panel = writer.createEditableElement('div', {
                    class: 'accordion-panel',
                });
                // Make the panel editable and widgetized to be a functional part of the editor.
                return toWidgetEditable(panel, writer, { draggable: false });
            },
        });
    }

    // Registers event listeners to handle interactions in the editing view.
    _registerEventListenersForEditingView() {
        const editor = this.editor;

        // Listen for click events in the editing view
        editor.editing.view.document.on(
            'click',
            (evt, data) => {
                evt.stop();
                data.preventDefault();

                const viewElement = data.target;

                // Check if the clicked element is an accordion button
                const accordionButton = viewElement.findAncestor('button');
                if (accordionButton) {
                    // Get the corresponding view element for the accordion
                    const accordionViewElement = accordionButton.findAncestor('div');
                    if (accordionViewElement) {
                        // Toggle the "open" class on the accordion view element
                        accordionViewElement.classList.toggle('open');
                    }
                    // Get the corresponding model element for the accordion
                    const accordionModelElement = editor.editing.mapper.toModelElement(accordionViewElement);
                    if (accordionModelElement) {
                        // Toggle the "isOpen" attribute on the accordion model element
                        editor.model.change((writer) => {
                            const isOpen = accordionModelElement.getAttribute('isOpen');
                            writer.setAttribute('isOpen', !isOpen, accordionModelElement);
                        });
                    }
                }
            },
            { priority: 'low' }
        );
    }

    // Registers event listeners to handle interactions in the data view.
    _registerEventListenersForDataView() {
        const editor = this.editor;

        // Listen for the 'ready' event to ensure the editor is fully initialized
        editor.once('ready', () => {
            const editableElement = editor.ui.getEditableElement();

            // Listen for click events in the data view (preview and view modes)
            editableElement.addEventListener('click', (event) => {
                const target = event.target;

                // Check if the clicked element is an accordion button
                if (target.classList.contains('accordion-button')) {
                    const accordionElement = target.closest('.accordion-plugin');
                    if (accordionElement) {
                        // Toggle the "open" class on the accordion element
                        accordionElement.classList.toggle('open');
                    }
                }
            });
        });
    }

    // Attaches focus and blur event listeners to the accordion title to manage placeholder texts.
    _attachTitlePlaceholderEvents(viewElement, writer) {
        // Focus and blur event logic to manage placeholder texts, ensuring user-friendly interactions.
        const editor = this.editor;

        // Focus event listener for the accordion title
        editor.editing.view.document.on(
            'focus',
            (evt, data) => {
                if (data.target === viewElement) {
                    const modelElement = editor.editing.mapper.toModelElement(viewElement);
                    if (modelElement) {
                        const isEmpty = !modelElement.getChild(0);
                        if (isEmpty) {
                            // Logic to remove the placeholder text
                            writer.setAttribute('data-placeholder', '', viewElement);
                        }
                    }
                }
            },
            { useCapture: true }
        );

        // Blur event listener for the accordion title
        editor.editing.view.document.on(
            'blur',
            (evt, data) => {
                if (data.target === viewElement) {
                    const modelElement = editor.editing.mapper.toModelElement(viewElement);
                    const isEmpty = !modelElement.getChild(0);
                    if (isEmpty) {
                        writer.setAttribute('data-placeholder', PLACEHOLDER_TEXTS.TITLE, viewElement);
                    }
                }
            },
            { useCapture: true }
        );

        // Additional event listener for the accordion title
        editor.editing.view.document.on(
            'change:isFocused',
            (evt, data) => {
                if (!data.isFocused && data.domTarget === viewElement) {
                    const modelElement = editor.editing.mapper.toModelElement(viewElement);
                    const isEmpty = !modelElement.getChild(0);
                    if (isEmpty) {
                        writer.setAttribute('data-placeholder', PLACEHOLDER_TEXTS.TITLE, viewElement);
                    }
                }
            },
            { useCapture: true }
        );
    }
}
