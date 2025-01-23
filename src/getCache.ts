import { App, TFile } from 'obsidian';
import hivePlugin from "./main";

export interface CachedData {
    notePath: string
    frontmatter: any
    tags?: string[]
    imgSrc: string[]
}

const getCache = (
    app: App,
    plugin: hivePlugin,
): CachedData[] => {
    const cachedData: CachedData[] = []

    const markdownFiles = app.vault.getMarkdownFiles();
    markdownFiles.forEach((file: TFile) => {
        const noteCache = app.metadataCache.getFileCache(file)
        if (noteCache?.frontmatter?.[plugin.settings.galleryKey]) {
            const imgSrc: string[] = []

            const embeds = noteCache.embeds || []
            const validExtensions = ["jpeg", "jpg", "gif", "png", "webp", "tiff", "tif"];
            embeds.filter(embed => {
                const extension = embed.link.split('.').pop()?.toLowerCase()
                return extension && validExtensions.includes(extension)
            }).forEach(embed => {
                const imgNote = app.metadataCache.getFirstLinkpathDest(embed.link, file.path);
                if (imgNote) {
                    const imgPath = app.vault.getResourcePath(imgNote)
                    imgSrc.push(imgPath);
                }
            })

            cachedData.push({
                notePath: file.path,
                frontmatter: noteCache.frontmatter,
                tags: noteCache.tags?.map(tag => tag.tag.replace(/^#/, '')) || [],
                imgSrc,
            })
        }
    })

    const orderedData = cachedData.sort((a, b) => {
        const noteA = app.vault.getAbstractFileByPath(a.notePath) as TFile
        const noteB = app.vault.getAbstractFileByPath(b.notePath) as TFile

        const refA = noteA.stat.ctime
        const refB = noteB.stat.ctime
        return refA - refB
    })

    const sortedData = plugin.settings.sortBy === 'asc' ? orderedData : orderedData.reverse()

	if (plugin.settings.shuffle) {
        for (let i = sortedData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sortedData[i], sortedData[j]] = [sortedData[j], sortedData[i]];
        }
    }

    return sortedData
}

export default getCache
