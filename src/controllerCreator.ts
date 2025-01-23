import { setIcon, setTooltip } from 'obsidian'
import hivePlugin from './main'

const createButton = (
	parent: HTMLElement,
	cls: string,
	icon: string,
	tooltip: string,
	onClick: () => void
) => {
	const button = parent.createEl('div', { cls: `clickable-icon hive-controller-button ${cls}` })
	setIcon(button, icon)
	setTooltip(button, tooltip)
	button.onClickEvent(onClick)

	return button
}

const createTree = (
	parent: HTMLElement,
	cls: string,
	headerText: string,
	setupCallback?: (tree: HTMLElement) => void
) => {
	const tree = parent.createEl('div', { cls: `tree-item hive-controller-section ${cls} is-collapsed` })
	const treeSelf = tree.createEl('div', { cls: 'tree-item-self mod-collapsible' })
	const treeIcon = treeSelf.createEl('div', { cls: 'tree-item-icon collapse-icon is-collapsed' })
	setIcon(treeIcon, "right-triangle")
	const treeInner = treeSelf.createEl('div', { cls: 'tree-item-inner' })
	treeInner.createEl('header', { cls: 'hive-controller-section-header', text: headerText })

	let treeChildren: HTMLElement | null = null
	if (setupCallback) {
		treeChildren = tree.createEl('div', { cls: 'tree-item-children' })
		treeChildren.hide()
		setupCallback(treeChildren)
	}

	treeSelf.onClickEvent(() => {
		const isCollapsed = tree.classList.toggle('is-collapsed')
		treeIcon.classList.toggle('is-collapsed', isCollapsed)
		if (treeChildren) {
			treeChildren.toggle(!isCollapsed)
		}
	});

	return tree
}

const createPropertyTree = (
    parentEl: HTMLElement,
    property: string,
    subproperties: any,
    depth: number,
    parentProperty: string,
    plugin: hivePlugin
) => {
    const separator = plugin.settings.propertySeparator
	const propertyKey = plugin.settings.propertyTreeKey
    const treeItem = parentEl.createEl('div', { cls: 'tree-item is-collapsed' })
    const treeItemSelf = treeItem.createEl('div', { cls: 'tree-item-self tag-pane-tag is-clickable mod-collapsible' })

    const indentation = 24 + depth * 17
    treeItemSelf.style.setProperty('margin-inline-start', `${depth * -17}px`, 'important')
    treeItemSelf.style.setProperty('padding-inline-start', `${indentation}px`, 'important')

    const treeChildren = treeItem.createEl('div', { cls: 'tree-item-children-property' })
    treeChildren.hide()

    if (Object.keys(subproperties).length > 1) {
        const treeIcon = treeItemSelf.createEl('div', { cls: 'tree-item-icon collapse-icon is-collapsed' })
        setIcon(treeIcon, "right-triangle")

        treeIcon.onClickEvent((event) => {
            event.stopPropagation()
            const isCollapsed = treeItem.classList.toggle('is-collapsed')
            treeIcon.classList.toggle('is-collapsed', isCollapsed)
            if (treeChildren) {
                treeChildren.toggle(!isCollapsed)
            }
        })
    }

    const treeInner = treeItemSelf.createEl('div', { cls: 'tree-item-inner' })
    const treeInnerText = treeInner.createEl('div', { cls: 'tree-item-inner-text' })
    treeInnerText.createEl('span', { cls: 'tag-pane-tag-parent', text: '' })
    treeInnerText.createEl('span', { cls: 'tree-item-inner-text', text: property })
    const treeFlairOuter = treeItemSelf.createEl('div', { cls: 'tree-item-flair-outer' })
    treeFlairOuter.createEl('span', { cls: 'tag-pane-tag-count tree-item-flair', text: (subproperties.__count || 0).toString() })

    treeItemSelf.onClickEvent(() => {
        const searchValue = parentProperty ? `[${propertyKey}:${parentProperty}${separator}${property}]` : `[${propertyKey}:${property}]`
        const searchInput = document.querySelector('.mod-search-setting input[type="search"]')
        if (searchInput) {
            (searchInput as HTMLInputElement).value = searchValue
            searchInput.dispatchEvent(new Event('input'))
        }
    })

    Object.keys(subproperties).forEach((subproperty) => {
        if (subproperty !== '__count') {
            createPropertyTree(treeChildren, subproperty, subproperties[subproperty], depth + 1, parentProperty ? `${parentProperty}${separator}${property}` : property, plugin)
        }
    })
}

export { createButton, createTree, createPropertyTree }
