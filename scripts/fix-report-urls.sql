-- Fix every report_url so links go directly to the source report
-- Run in Neon SQL editor at https://console.neon.tech

-- ── GALLUP ──────────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx'
WHERE source_firm = 'Gallup'
  AND report_name ILIKE '%State of the Global Workplace 2026%';

UPDATE research_entries
SET report_url = 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx'
WHERE source_firm = 'Gallup'
  AND report_name ILIKE '%State of the Global Workplace%'
  AND (report_url IS NULL OR report_url NOT ILIKE '%gallup%');

UPDATE research_entries
SET report_url = 'https://www.gallup.com/workplace/356063/gallup-q12-meta-analysis.aspx'
WHERE source_firm = 'Gallup'
  AND report_name ILIKE '%Q12%';

UPDATE research_entries
SET report_url = 'https://www.gallup.com/workplace/236927/employee-engagement-drives-growth.aspx'
WHERE source_firm = 'Gallup'
  AND report_name ILIKE '%Manager%';

-- ── TALENT STRATEGY GROUP ───────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://talentstrategist.com/research/2026-performance-management-report/'
WHERE source_firm = 'Talent Strategy Group'
  AND report_name ILIKE '%2026 Performance Management%';

-- ── DELOITTE ─────────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www2.deloitte.com/us/en/insights/focus/human-capital-trends.html'
WHERE source_firm = 'Deloitte'
  AND (report_url IS NULL OR report_url NOT ILIKE '%deloitte%');

-- ── GARTNER ──────────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www.gartner.com/en/human-resources/trends/future-of-work'
WHERE source_firm ILIKE 'Gartner%'
  AND report_name ILIKE '%Future of Work Trends for CHROs%';

UPDATE research_entries
SET report_url = 'https://www.gartner.com/en/human-resources/topics/artificial-intelligence-in-hr'
WHERE source_firm ILIKE 'Gartner%'
  AND report_name ILIKE '%People-Centric AI%';

UPDATE research_entries
SET report_url = 'https://www.gartner.com/en/human-resources/insights/performance-management'
WHERE source_firm ILIKE 'Gartner%'
  AND (report_url IS NULL OR report_url = 'https://www.gartner.com/en/human-resources');

-- ── MERCER ───────────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www.mercer.com/insights/talent-and-transformation/global-talent-trends/'
WHERE source_firm = 'Mercer'
  AND report_name ILIKE '%Global Talent Trends%';

-- ── MCKINSEY ─────────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-organization-blog/organizational-health-a-fast-track-to-performance-improvement'
WHERE source_firm ILIKE 'McKinsey%'
  AND report_name ILIKE '%Organizational Health%';

UPDATE research_entries
SET report_url = 'https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/attracting-and-retaining-the-right-talent'
WHERE source_firm ILIKE 'McKinsey%'
  AND report_name ILIKE '%Attracting and Retaining%';

UPDATE research_entries
SET report_url = 'https://www.mckinsey.com/industries/private-equity-and-principal-investors/our-insights'
WHERE source_firm ILIKE 'McKinsey%'
  AND report_name ILIKE '%Private Markets%';

UPDATE research_entries
SET report_url = 'https://www.mckinsey.com/featured-insights/diversity-and-inclusion/women-in-the-workplace'
WHERE source_firm ILIKE 'McKinsey%'
  AND report_name ILIKE '%Women in the Workplace%';

-- ── BEECHER REAGAN / HUNT SCANLON PE ────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://huntscanlon.com/reports/'
WHERE (source_firm ILIKE '%Beecher Reagan%' OR source_firm ILIKE '%Hunt Scanlon%')
  AND report_url IS NULL;

-- ── HEIDRICK & STRUGGLES ────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www.heidrick.com/en/insights/talent-management'
WHERE source_firm ILIKE '%Heidrick%'
  AND report_url IS NULL;

-- ── KORN FERRY ───────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www.kornferry.com/insights/private-equity'
WHERE source_firm ILIKE '%Korn Ferry%'
  AND report_name ILIKE '%Private Equity%'
  AND (report_url IS NULL OR report_url NOT ILIKE '%kornferry%');

UPDATE research_entries
SET report_url = 'https://www.kornferry.com/insights/articles/validity-of-assessments'
WHERE source_firm ILIKE '%Korn Ferry%'
  AND report_name ILIKE '%Assessment%'
  AND (report_url IS NULL OR report_url NOT ILIKE '%kornferry%');

-- ── EY ───────────────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www.ey.com/en_gl/insights/private-equity'
WHERE source_firm = 'EY'
  AND (report_url IS NULL OR report_url NOT ILIKE '%ey.com%');

-- ── DDI ──────────────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www.ddiworld.com/global-leadership-forecast'
WHERE source_firm ILIKE '%DDI%' OR source_firm ILIKE '%Development Dimensions%';

-- ── HARVARD BUSINESS REVIEW ──────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://hbr.org/2016/01/what-having-a-growth-mindset-actually-means'
WHERE source_firm ILIKE '%Harvard Business Review%'
  AND report_name ILIKE '%New Leaders Fail%';

-- Catch any remaining HBR entries pointing to just the topic page
UPDATE research_entries
SET report_url = 'https://hbr.org/topic/subject/leadership-development'
WHERE source_firm ILIKE '%Harvard Business Review%'
  AND report_url = 'https://hbr.org/topic/subject/leadership';

-- ── PWC ──────────────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www.pwc.com/gx/en/services/workforce/workforce-of-the-future.html'
WHERE source_firm = 'PwC'
  AND (report_url IS NULL OR report_url NOT ILIKE '%pwc%');

-- ── BCG ──────────────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www.bcg.com/capabilities/people-strategy/overview'
WHERE source_firm ILIKE '%Boston Consulting Group%'
  AND (report_url IS NULL OR report_url NOT ILIKE '%bcg%');

-- ── LINKEDIN ─────────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://learning.linkedin.com/resources/workplace-learning-report'
WHERE source_firm = 'LinkedIn'
  AND (report_url IS NULL OR report_url NOT ILIKE '%linkedin%');

-- ── BAIN ─────────────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www.bain.com/insights/topics/private-equity/'
WHERE source_firm ILIKE '%Bain%'
  AND (report_url IS NULL OR report_url NOT ILIKE '%bain%');

-- ── SHRM ─────────────────────────────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://www.shrm.org/topics-tools/research/talent-retention'
WHERE source_firm = 'SHRM'
  AND (report_url IS NULL OR report_url NOT ILIKE '%shrm%');

-- ── JOURNAL OF APPLIED PSYCHOLOGY ────────────────────────────────────────────

UPDATE research_entries
SET report_url = 'https://psycnet.apa.org/record/2000-13854-009'
WHERE source_firm ILIKE '%Journal of Applied Psychology%';

-- ── VERIFY — review all entries and their URLs ────────────────────────────────

SELECT
  source_firm,
  LEFT(report_name, 60) AS report_name,
  CASE WHEN report_url IS NULL THEN 'MISSING' ELSE LEFT(report_url, 70) END AS url_status
FROM research_entries
ORDER BY source_firm, report_name;
