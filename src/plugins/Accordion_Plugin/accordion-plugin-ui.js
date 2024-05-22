import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { insertAccordionElement } from './accordion-plugin-utils';
import './styles/accordion-plugin.css';

export default class AccordionUI extends Plugin {
    init() {
        const editor = this.editor;
        // Add the accordion button to the editor UI
        editor.ui.componentFactory.add('accordionPlugin', (locale) => {
            const buttonView = new ButtonView(locale);

            buttonView.set({
                icon: '<svg enable-background="new 0 0 24 24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#333333" d="m0 3h6l-3 4z"/><path fill="#333333" d="m23 6h-14c-.6 0-1-.4-1-1 0-.6.4-1 1-1h14c.6 0 1 .4 1 1 0 .6-.4 1-1 1z"/><path fill="#333333" d="m0 17h6l-3 4z"/><path fill="#333333" d="m23 20h-14c-.6 0-1-.4-1-1 0-.6.4-1 1-1h14c.6 0 1 .4 1 1 0 .6-.4 1-1 1z"/><path fill="#333333" d="m0 10h6l-3 4z"/><path fill="#333333" d="m23 13h-14c-.6 0-1-.4-1-1 0-.6.4-1 1-1h14c.6 0 1 .4 1 1 0 .6-.4 1-1 1z"/></svg>',
                label: 'Insert Accordion',
                tooltip: true,
            });
            // Bind the button state to the command state
            buttonView.on('execute', () => {
                this.insertAccordion(); // Ensure this method is correctly defined
            });

            return buttonView;
        });
    }

    insertAccordion() {
        const editor = this.editor;
        editor.model.change((writer) => {
            const accordionElement = insertAccordionElement(writer); // Updated utility function
            editor.model.insertContent(accordionElement);
        });
        editor.editing.view.focus();
    }
}
