import hivePlugin from './main'

export async function filterHive(plugin: hivePlugin) {
    const query = plugin.settings.searchQuery.trim()
    console.log('Search Query:', query)
    
    plugin.settings.filteredCache = []

    if (!query) {
        await plugin.saveSettings() 
        return plugin.settings.filteredCache
    }

    const queries = query.match(/\[.*?:.*?\]/g)
    if (!queries) {
        await plugin.saveSettings()
        return plugin.settings.filteredCache
    }

    const filters = queries.map(q => {
        const match = q.match(/^\[(.*):(.*)\]$/)
        if (!match) return null
        return {
            property: match[1].toLowerCase().trim(),
            valueHierarchy: match[2].trim().split(plugin.settings.propertySeparator).map(v => v.toLowerCase().trim())
        }
    }).filter(f => f !== null)

    const filteredCache = plugin.settings.cache.filter(item => {
        return filters.every(filter => {
            const propValue = item.frontmatter[filter.property]
            if (Array.isArray(propValue)) {
                return propValue.some(v => {
                    const propValueHierarchy = v.split(plugin.settings.propertySeparator).map(pv => pv.toLowerCase().trim())
                    return filter.valueHierarchy.every((val, index) => propValueHierarchy[index] === val)
                })
            }
            if (propValue) {
                const propValueHierarchy = propValue.split(plugin.settings.propertySeparator).map(pv => pv.toLowerCase().trim())
                return filter.valueHierarchy.every((val, index) => propValueHierarchy[index] === val)
            }
            return false
        })
    })

    console.log('Filtered Cache:', filteredCache)
    plugin.settings.filteredCache = filteredCache
    await plugin.saveSettings()
    return filteredCache
}
