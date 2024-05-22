export default class Accordion extends Plugin {
    static get requires(): (typeof AccordionEditing | typeof AccordionUI)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import AccordionEditing from "./accordion-plugin-editing";
import AccordionUI from "./accordion-plugin-ui";
