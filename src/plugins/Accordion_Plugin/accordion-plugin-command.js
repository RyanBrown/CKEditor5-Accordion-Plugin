import Command from '@ckeditor/ckeditor5-core/src/command';

export default class AccordionCommand extends Command {
    execute() {
        this.editor.model.change((writer) => {
            this.editor.model.insertContent(createAccordion(writer));
        });
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;
        this.isEnabled = model.schema.checkChild(selection.focus.parent, 'accordion');
    }
}
