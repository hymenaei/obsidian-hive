import { AbstractInputSuggest } from 'obsidian'

interface Suggestion {
    value: string;
    value_info?: string;
    header?: string;
    type?: string;
}

export class searchSuggest extends AbstractInputSuggest<Suggestion> {

}
