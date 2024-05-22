import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import AccordionEditing from './accordion-plugin-editing';
import AccordionUI from './accordion-plugin-ui';

export default class Accordion extends Plugin {
    static get requires() {
        // Specify the required plugins for the Accordion plugin
        return [AccordionEditing, AccordionUI];
    }
}
