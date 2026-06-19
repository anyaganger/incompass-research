import { getDb } from '@/lib/db'

const DEFAULT_SOURCES = [
  { name: 'Harvard Business Review', url: 'https://feeds.hbr.org/harvardbusiness', keywords: ['leadership', 'talent', 'performance', 'management', 'workforce'] },
  { name: 'McKinsey Insights', url: 'https://www.mckinsey.com/insights/rss', keywords: ['talent', 'leadership', 'workforce', 'private equity', 'performance management'] },
  { name: 'Gallup Workplace', url: 'https://www.gallup.com/rss/224422/workplace.aspx', keywords: ['engagement', 'performance', 'leadership', 'workforce', 'talent'] },
  { name: 'The PE Operator Letter', url: 'https://peoperator.substack.com/feed', keywords: ['private equity', 'portfolio company', 'PE', 'operating partner', 'value creation'] },
  { name: 'Talent Sherpa', url: 'https://talentsherpa.substack.com/feed', keywords: ['talent', 'leadership', 'hiring', 'workforce', 'performance'] },
  { name: 'The Talent Code', url: 'https://thetalentcode.substack.com/feed', keywords: ['talent', 'performance management', 'HR', 'leadership effectiveness'] },
  { name: 'Mark Farrer-Brown', url: 'https://markfarrerbrown.substack.com/feed', keywords: ['private equity', 'talent', 'leadership', 'portfolio', 'PE'] },
  { name: 'Make Work Better', url: 'https://makewo.substack.com/feed', keywords: ['engagement', 'workplace', 'performance', 'employee experience'] },
  { name: 'Korn Ferry Insights', url: 'https://www.kornferry.com/insights/rss', keywords: ['leadership', 'talent', 'CEO', 'executive', 'PE', 'succession'] },
  { name: 'Bain Private Equity', url: 'https://www.bain.com/industry-expertise/private-equity/rss/', keywords: ['private equity', 'portfolio', 'value creation', 'operating partner', 'talent diligence'] },
]

export async function GET() {
  const pool = getDb()
  try {
    const { rows } = await pool.query('SELECT * FROM feed_sources ORDER BY name')
    if (rows.length === 0) {
      await Promise.all(
        DEFAULT_SOURCES.map((s) =>
          pool.query(
            'INSERT INTO feed_sources (name, url, active, keywords) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',
            [s.name, s.url, true, s.keywords]
          )
        )
      )
      const { rows: seeded } = await pool.query('SELECT * FROM feed_sources ORDER BY name')
      return Response.json({ data: seeded })
    }
    return Response.json({ data: rows })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const b = await req.json()
  const pool = getDb()
  try {
    const { rows } = await pool.query(
      'INSERT INTO feed_sources (name, url, active, keywords) VALUES ($1,$2,$3,$4) RETURNING *',
      [b.name, b.url, b.active ?? true, b.keywords ?? []]
    )
    return Response.json({ data: rows[0] }, { status: 201 })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
