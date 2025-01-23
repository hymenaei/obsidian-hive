import hivePlugin from "./main"
import getCache from "./getCache"

const buildLayout = (
    container: HTMLElement,
    plugin: hivePlugin,
) => {
    const { columns, gutter, radius, cache, filteredCache } = plugin.settings
    let grid = container.querySelector('.hive-grid') as HTMLElement

    if (!grid) {
        grid = container.createDiv({ cls: 'hive-grid' })
    }
    grid.empty()

    const cachedData = filteredCache.length > 0 ? filteredCache : (cache.length > 0 ? cache : getCache(plugin.app, plugin))

    const columnElements = Array.from({ length: columns }, (_, index) => {
        const column = grid.createDiv({ cls: 'hive-grid-column' })
        column.style.width = `${100 / columns}%`
        if (index !== 0) {
            column.style.marginLeft = `${gutter}px`
        }
        return column
    });

    let columnIndex = 0

    cachedData.forEach((data) => {
        if (data.imgSrc.length > 0) {
            const gridItem = columnElements[columnIndex].createDiv({ cls: 'hive-grid-item' })
            gridItem.style.marginBottom = `${gutter}px`

            const img = gridItem.createEl('img', {
                attr: {
                    src: data.imgSrc[0],
                    loading: 'lazy'
                },
                cls: 'hive-grid-img'
            });
            img.style.borderRadius = `${radius}px`

            columnIndex = (columnIndex + 1) % columns
        }
    });

    return grid
}

export default buildLayout
