import { ItemView, WorkspaceLeaf } from 'obsidian'
import buildLayout from './buildLayout'
import hiveController from './hiveController'
import hivePlugin from "./main"

export const HIVE_VIEW_TYPE = 'hive-view'

export class hiveView extends ItemView {
    plugin: hivePlugin
    contentEl: HTMLElement
	hiveView: hiveView

    constructor(leaf: WorkspaceLeaf, plugin: hivePlugin) {
        super(leaf)
        this.plugin = plugin
        this.contentEl = this.containerEl.children[1] as HTMLElement
		this.hiveView = this
    }

    getViewType() {
        return HIVE_VIEW_TYPE
    }

    getDisplayText() {
        return 'Hive view'
    }

    getIcon(): string {
        return 'camera'
    }

    async onOpen() {
        this.layout()
        hiveController(this.contentEl, this.plugin)
    }

    async onClose() {
    }

    layout() {
        buildLayout(this.contentEl, this.plugin)
    }
}
