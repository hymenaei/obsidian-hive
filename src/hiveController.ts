import { ButtonComponent, Setting } from 'obsidian'
import { createButton, createTree, createPropertyTree } from './controllerCreator'
import { filterHive } from './search'
import hivePlugin from './main'

const hiveController = (
    container: HTMLElement,
	plugin: hivePlugin,
) => {
    const hiveController = container.createEl('div', { cls: 'hive-controller is-close' })
	loadButtons(hiveController)
	loadTrees(hiveController, plugin)
    return hiveController
}

export default hiveController

const loadButtons = (
	container: HTMLElement,
) => {
	createButton(
		container,
		'mod-close',
		'x',
		'Close',
		() => container.toggleClass('is-close', true)
	)

	createButton(
        container,
        'mod-open',
        'gear',
        'Open hive settings',
        () => container.toggleClass('is-close', false)
    )
}

const loadTrees = (
	container: HTMLElement,
	plugin: hivePlugin,
) => {
	createTree(
		container,
		'mod-filter',
		'Filters',
		(tree) => {
			new Setting(tree)
                .setClass("mod-search-setting")
                .addSearch((search) => {
                    search
						.setValue(plugin.settings.searchQuery)
                        .setPlaceholder('Search...')
                        .onChange(async (value) => {
							plugin.settings.searchQuery = value
							await plugin.saveSettings()
							await filterHive(plugin)
							await plugin.updateLayout()
                        });
                })

			loadPropertyTree(tree, plugin)

			const buttonContainer = tree.createDiv({ cls: 'hive-controller-button-container' })
			new ButtonComponent(buttonContainer)
				.setCta()
				.setButtonText('Shuffle hive')
				.onClick(async () => {
					plugin.settings.shuffle = true
					await plugin.saveSettings()
					await plugin.updateCache()
				})
			
			new ButtonComponent(buttonContainer)
				.setClass('clickable-icon')
				.setClass('hive-controller-button')
				.setClass('mod-reset')
				.setIcon('reset')
				.setTooltip('Unshuffle hive')
				.onClick(async () => {
					plugin.settings.shuffle = false
					await plugin.saveSettings()
					await plugin.updateCache()
				})
		}
	)

	createTree(
		container,
		'mod-display',
		'Display',
		(tree) => {
			new Setting(tree)
                .setClass('setting-item')
                .setClass('mod-slider')
                .setName("Column amount")
                .addSlider((slider) =>
                    slider
                        .setLimits(4, 12, 1)
                        .setValue(plugin.settings.columns)
                        .setDynamicTooltip()
                        .onChange(async (value) => {
                            plugin.settings.columns = value
                            await plugin.saveSettings()
                            await plugin.updateLayout()
                        })
                )
		}
	)
}

const loadPropertyTree = (
    container: HTMLElement,
    plugin: hivePlugin,
) => {
    const propertyTreeKey = plugin.settings.propertyTreeKey;
    const cachedData = plugin.settings.cache;

    const propertyTree = cachedData.reduce((tree: { [key: string]: any }, data) => {
        const properties = data.frontmatter[propertyTreeKey];
        if (properties) {
            properties.forEach((property: string) => {
                const parts = property.split(plugin.settings.propertySeparator);
                let currentLevel = tree;
                parts.forEach((part, index) => {
                    if (!currentLevel[part]) {
                        currentLevel[part] = { __count: 0 };
                    }
                    currentLevel[part].__count += 1;
                    currentLevel = currentLevel[part];
                });
            });
        }
        return tree;
    }, {});

    Object.keys(propertyTree).forEach((property) => {
        createPropertyTree(container, property, propertyTree[property], 0, '', plugin);
    });
}
