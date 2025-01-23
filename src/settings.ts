import { App, PluginSettingTab, Setting } from 'obsidian'
import hivePlugin from './main'

export class hiveSettingTab extends PluginSettingTab {
	plugin: hivePlugin

	constructor(app: App, plugin: hivePlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this
		containerEl.empty()

		new Setting(containerEl)
			.setName('Sort by')
			.setDesc('Select the order to list your gallery.')
			.addDropdown((dropdown) => 
				dropdown
					.addOptions({
						'desc': 'Descending',
						'asc': 'Ascending'
					})
					.setValue(this.plugin.settings.sortBy)
					.onChange(async (value) => {
						this.plugin.settings.sortBy = value
						await this.plugin.saveSettings()
						await this.plugin.updateCache()
					})
			)

		new Setting(containerEl)
			.setName("Gallery key")
			.setDesc("The property used to identify gallery notes.")
			.addText((text) =>
				text
					.setPlaceholder("isGallery")
					.setValue(this.plugin.settings.galleryKey)
					.onChange(async (value) => {
						this.plugin.settings.galleryKey = value
						await this.plugin.saveSettings()
						await this.plugin.updateCache()
					})
			)

		new Setting(containerEl)
			.setName("Nesting symbol")
			.setDesc("Symbol used to do nests (e.g. '/', '.', '|').")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.propertySeparator)
					.onChange(async (value) => {
						this.plugin.settings.propertySeparator = value
						await this.plugin.saveSettings()
					})
			)
	}
}
