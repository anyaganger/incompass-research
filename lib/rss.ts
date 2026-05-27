import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'Incompass Research Bot/1.0' },
})

export interface RSSItem {
  title: string
  url: string
  published_at: Date
  content: string
}

export async function fetchFeed(url: string): Promise<RSSItem[]> {
  try {
    const feed = await parser.parseURL(url)
    return feed.items.map((item) => ({
      title: item.title ?? 'Untitled',
      url: item.link ?? item.guid ?? '',
      published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
      content: [
        item['content:encoded'],
        item.content,
        item.contentSnippet,
        item.summary,
        item.title,
      ]
        .filter(Boolean)
        .join('\n\n')
        .slice(0, 8000),
    }))
  } catch {
    return []
  }
}

export function itemMatchesKeywords(item: RSSItem, keywords: string[]): boolean {
  if (!keywords.length) return true
  const text = `${item.title} ${item.content}`.toLowerCase()
  return keywords.some((k) => text.includes(k.toLowerCase()))
}
