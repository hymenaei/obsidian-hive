import { Plugin, WorkspaceLeaf } from 'obsidian'
import { hiveView, HIVE_VIEW_TYPE } from './view'
import { hiveSettingTab } from "./settings"
import getCache, { CachedData } from './getCache'

interface hivePluginSettings {
    columns: number
    galleryKey: string
	propertySeparator: string
	propertyTreeKey: string
    sortBy: string
    gutter: number
    radius: number
	shuffle: boolean
	searchQuery: string
    cache: CachedData[]
	filteredCache: CachedData[]
}

const DEFAULT_SETTINGS: Partial<hivePluginSettings> = {
    columns: 7,
    galleryKey: 'isGallery',
	propertySeparator: '/',
	propertyTreeKey: 'category',
    sortBy: 'desc',
    gutter: 5,
    radius: 5,
	shuffle: false,
	searchQuery: '',
    cache: [],
	filteredCache: []
}

export default class hivePlugin extends Plugin {
    settings: hivePluginSettings
    hiveView: hiveView

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        )
    }

    async saveSettings() {
        await this.saveData(this.settings)
    }

    async onload() {
        await this.loadSettings()

        this.addSettingTab(new hiveSettingTab(this.app, this))

        this.registerView(HIVE_VIEW_TYPE, (leaf) => {
            this.hiveView = new hiveView(leaf, this)
            return this.hiveView
        });

        this.addRibbonIcon('camera', 'Open hive view', (evt: MouseEvent) => {
            this.activateView()
        });

        this.app.workspace.onLayoutReady(() => {
            this.updateCache()
        });

		this.registerEvent(this.app.vault.on('delete', this.updateCache.bind(this)));
        this.registerEvent(this.app.metadataCache.on('changed', this.updateCache.bind(this)));
    }

    onunload() {
    }

    updateCache() {
		const newCache = getCache(this.app, this)
		if (JSON.stringify(this.settings.cache) !== JSON.stringify(newCache)) {
			this.settings.cache = newCache
			this.saveSettings()
			this.hiveView.layout()
		}
	}

	updateLayout() {
		this.hiveView.layout()
	}

    async activateView() {
        const { workspace } = this.app
    
        let leaf: WorkspaceLeaf | null = null
        const leaves = workspace.getLeavesOfType(HIVE_VIEW_TYPE)
    
        if (leaves.length > 0) {
          leaf = leaves[0]
        } else {
          leaf = workspace.getLeaf(false)
          await leaf.setViewState({ type: HIVE_VIEW_TYPE, active: true })
        }
        
        workspace.revealLeaf(leaf)
    }
}
