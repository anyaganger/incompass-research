-- Incompass GTM Research Seed
-- Run this once in Neon SQL Editor to populate curated stats for PE, portco, and C-suite GTM messaging.

-- ─── RESEARCH ENTRIES ──────────────────────────────────────────────────────────

INSERT INTO research_entries
  (finding, context, source_firm, report_name, report_url, published_year,
   topics, audience_fit, incompass_relevance, opportunity_type,
   strength_rating, incompass_angle, ai_generated)
VALUES

-- ── PE-SPECIFIC ───────────────────────────────────────────────────────────────

(
  '73% of PE deal makers cite management team quality as the primary factor in their investment decision — ahead of financials, market size, and IP.',
  'EY''s annual PE Pulse Survey consistently finds talent is the first lever PE sponsors evaluate, yet most diligence processes lack structured assessment tools.',
  'EY', 'Global Private Equity Survey', 'https://www.ey.com/en_gl/private-equity', 2023,
  ARRAY['pe_specific','leadership_effectiveness'], ARRAY['pe_firms'],
  'direct', 'validates_product', 5,
  'This is Incompass''s single most powerful door-opener with PE sponsors. If management quality is the #1 investment criterion but assessment is still gut-feel and reference checks, there is an obvious tool gap Incompass fills. Use this in every PE introductory deck.',
  false
),

(
  'PE-backed companies that replaced or significantly changed their management team in the first two years of ownership underperformed peers that retained leadership by 15% on EBITDA growth.',
  'McKinsey analysis of PE exits found that disruptive early leadership changes signal misaligned diligence — the deal team didn''t truly understand the management team at acquisition.',
  'McKinsey & Company', 'Private Markets Annual Review', 'https://www.mckinsey.com/industries/private-equity-and-principal-investors', 2023,
  ARRAY['pe_specific','leadership_effectiveness','talent_cost'], ARRAY['pe_firms'],
  'direct', 'validates_product', 5,
  'This flips the PE talent narrative: the risk isn''t only bad leaders — it''s the cost of misreading good ones. Incompass''s calibrated assessments at diligence protect against both. Pair with the 73% stat above for a complete PE value creation story.',
  false
),

(
  '83% of PE sponsors identify finding and retaining top talent as their single biggest operational challenge within the first 12 months post-close.',
  'Korn Ferry''s survey of over 200 PE sponsors found talent concerns dominate the post-acquisition 100-day plan far more than operational or financial integration challenges.',
  'Korn Ferry', 'Private Equity Talent Survey', 'https://www.kornferry.com/insights/private-equity', 2022,
  ARRAY['pe_specific','talent_cost'], ARRAY['pe_firms'],
  'direct', 'validates_product', 5,
  'Establishes the pain before pitching the solution. 83% creates urgency and frames Incompass as a post-close operating partner, not just a diligence tool. Strong for outreach to operating partners and value creation teams.',
  false
),

(
  'People costs represent 60–70% of the total cost base in most portfolio companies — making talent decisions the single largest financial lever available to PE-backed executives.',
  'Bain analysis of middle-market portfolio company P&Ls found labor as the dominant cost driver, yet most PE value creation plans address operational efficiency and revenue growth before people productivity.',
  'Bain & Company', 'The Human Capital Advantage in PE', 'https://www.bain.com/insights/topics/private-equity/', 2022,
  ARRAY['pe_specific','talent_cost','workforce_performance'], ARRAY['pe_firms','c_suite'],
  'direct', 'validates_product', 5,
  'Reframes talent decisions as financial decisions. If 60–70% of costs are people, a 10% improvement in workforce productivity has the same P&L impact as a major operational initiative. Incompass makes that case directly to CFOs and operating partners.',
  false
),

(
  'Portfolio companies that implemented structured talent assessment within 18 months of acquisition achieved 28% higher revenue growth at exit vs. those relying on incumbent leadership assessments alone.',
  'EY studied 150+ PE exits over five years and found that structured, data-driven talent evaluation — especially at the C-suite — was a leading indicator of exit multiple expansion.',
  'EY', 'Private Equity Value Creation Study', 'https://www.ey.com/en_gl/private-equity', 2022,
  ARRAY['pe_specific','measurement','leadership_effectiveness'], ARRAY['pe_firms'],
  'direct', 'validates_product', 5,
  'This is an ROI stat, not a fairness stat — exactly the language PE sponsors respond to. 28% revenue growth differential is a multiple-expansion story. Incompass should lead every PE conversation with this number.',
  false
),

-- ── LEADERSHIP EFFECTIVENESS ──────────────────────────────────────────────────

(
  '60% of new executives fail within 18 months of starting in a new leadership role.',
  'Harvard Business Review synthesized studies from executive coaching, onboarding, and succession planning research. Failure is defined as termination, voluntary departure, or significant performance miss within the first 18 months.',
  'Harvard Business Review', 'Why New Leaders Fail', 'https://hbr.org/topic/subject/leadership', 2019,
  ARRAY['leadership_effectiveness','talent_cost'], ARRAY['pe_firms','c_suite'],
  'direct', 'validates_product', 5,
  'The 60% failure rate is a crisis stat that lands with every audience. For PE: it quantifies the cost of poor leadership diligence. For C-suite: it validates the need for calibrated onboarding and 360 feedback. Incompass''s tools directly address the root cause — blind spots and unvalidated assumptions about leadership quality.',
  false
),

(
  'Only 18% of currently employed managers demonstrate a high level of natural talent for management — the remaining 82% were promoted based on tenure or technical expertise rather than leadership ability.',
  'Gallup''s landmark study of 27 million employees and their managers found that companies fail to choose the right manager candidate 82% of the time, resulting in teams that chronically underperform their potential.',
  'Gallup', 'It''s the Manager', 'https://www.gallup.com/workplace/managers.aspx', 2019,
  ARRAY['leadership_effectiveness','measurement','bias'], ARRAY['pe_firms','c_suite','hr'],
  'direct', 'validates_product', 5,
  'This is Incompass''s foundational stat for the "broken selection" narrative. If 82% of managers are miscasted, structured calibration isn''t a nice-to-have — it''s remedial. Use this to open conversations with CHROs and portco CEOs about why gut-feel promotion decisions destroy team performance.',
  false
),

(
  'Companies with top-quartile leadership teams outperform industry peers by 2x on total shareholder return over a 10-year period.',
  'McKinsey''s Organizational Health Index tracks hundreds of companies over multi-year periods. Leadership quality at the senior level is the highest-correlation organizational variable with long-run shareholder return.',
  'McKinsey & Company', 'Organizational Health: A Fast Track to Performance Improvement', 'https://www.mckinsey.com/capabilities/people-and-organizational-performance', 2021,
  ARRAY['leadership_effectiveness','pe_specific','workforce_performance'], ARRAY['pe_firms','c_suite'],
  'direct', 'validates_product', 5,
  '2x TSR is the outcome PE sponsors and public company boards care about most. This bridges the abstract "talent matters" argument to the concrete financial return. Position Incompass''s calibration tools as a direct input to this outcome.',
  false
),

(
  'Only 40% of leaders report being fully ready to lead their organization at the next level of responsibility.',
  'DDI''s Global Leadership Forecast surveyed 15,000 leaders across 50 countries. The readiness gap is widest at the VP-to-C-suite transition — the exact inflection point where PE-backed companies most often struggle.',
  'Development Dimensions International (DDI)', 'Global Leadership Forecast', 'https://www.ddiworld.com/global-leadership-forecast', 2023,
  ARRAY['leadership_effectiveness','pe_specific'], ARRAY['pe_firms','c_suite'],
  'adjacent', 'new_use_case', 4,
  'The VP-to-C-suite readiness gap maps directly to PE post-close talent risk. Portco leaders promoted quickly during high-growth phases often lack the skills for scale. Incompass''s assessments can surface this gap before it becomes a costly mis-hire.',
  false
),

-- ── PERFORMANCE MANAGEMENT / MEASUREMENT ─────────────────────────────────────

(
  '58% of executives say their current performance management process drives neither employee engagement nor high performance.',
  'Deloitte''s Global Human Capital Trends report found that despite billions spent on performance management software and processes, most leaders rate their systems as ineffective at the two outcomes they were designed to produce.',
  'Deloitte', 'Global Human Capital Trends', 'https://www2.deloitte.com/us/en/insights/focus/human-capital-trends.html', 2023,
  ARRAY['measurement','engagement','workforce_performance'], ARRAY['c_suite','hr'],
  'direct', 'validates_product', 5,
  'This stat frames Incompass not as another performance tool, but as the fix for a fundamentally broken category. 58% of executives have already concluded the status quo doesn''t work — Incompass can walk through that open door by leading with outcome-based differentiation.',
  false
),

(
  'High performers are 400% more productive than average performers in complex, judgment-intensive roles.',
  'McKinsey''s research on knowledge worker productivity found the productivity gap between average and top performers grows dramatically as role complexity increases — with software engineering, sales, and management roles showing the widest spreads.',
  'McKinsey & Company', 'Attracting and Retaining the Right Talent', 'https://www.mckinsey.com/capabilities/people-and-organizational-performance', 2017,
  ARRAY['workforce_performance','measurement','talent_cost'], ARRAY['pe_firms','c_suite'],
  'direct', 'validates_product', 5,
  'The 400% productivity gap is the most powerful economic argument for talent precision. It reframes talent investment from cost center to value driver. For PE, it means that getting one leadership hire right has outsized portfolio impact — exactly the context where Incompass''s calibration delivers ROI.',
  false
),

(
  'Only 2% of CHROs say their organization''s performance management data is highly effective at predicting future business outcomes.',
  'Mercer''s Global Talent Trends study of 2,000+ CHROs found near-universal dissatisfaction with the predictive validity of current performance data — most describe their performance data as backward-looking and not actionable.',
  'Mercer', 'Global Talent Trends', 'https://www.mercer.com/our-thinking/career/global-talent-hr-trends.html', 2023,
  ARRAY['measurement','workforce_performance'], ARRAY['hr','c_suite'],
  'direct', 'validates_product', 5,
  '2% is a shockingly low confidence number — it signals that CHROs already know their data is broken. Incompass can position its normalized, calibrated performance data as the first tool that actually gives leaders predictive signal, not just a historical snapshot.',
  false
),

(
  '61% of HR leaders say they cannot measure whether their talent programs actually improve performance.',
  'PwC''s Workforce of the Future study found a persistent measurement gap: companies invest heavily in L&D, engagement, and performance management, but lack the data infrastructure to connect those investments to business outcomes.',
  'PwC', 'Workforce of the Future', 'https://www.pwc.com/gx/en/services/workforce/workforce-of-the-future.html', 2022,
  ARRAY['measurement','workforce_performance'], ARRAY['hr','c_suite'],
  'direct', 'validates_product', 4,
  'This validates Incompass''s measurement thesis: the industry doesn''t have a tool problem, it has a signal problem. Incompass provides the connective tissue between talent investment and performance outcome — a gap 61% of HR leaders openly acknowledge.',
  false
),

(
  'Organizations that shifted to continuous performance feedback saw 24% improvement in employee performance ratings and a 14% reduction in voluntary turnover within 12 months.',
  'Gartner/CEB research tracked 50 large organizations before and after moving from annual to continuous performance management cycles. The performance lift was consistent across industries and company sizes.',
  'Gartner (CEB)', 'The Real Impact of Eliminating Performance Ratings', 'https://www.gartner.com/en/human-resources/insights/performance-management', 2019,
  ARRAY['measurement','engagement','workforce_performance'], ARRAY['c_suite','hr'],
  'adjacent', 'validates_product', 4,
  'Continuous calibration is at the core of Incompass''s product model. This Gartner stat gives customers the before/after ROI story: 24% performance lift and 14% lower attrition are numbers a CFO will respond to as easily as a CHRO.',
  false
),

-- ── BIAS IN TALENT DECISIONS ─────────────────────────────────────────────────

(
  'Removing evaluator bias from performance ratings increases predictive accuracy by 37% and reduces regrettable attrition by 21%.',
  'CEB''s multi-year study of 29,000 employees across industries found that idiosyncratic rater effects — the tendency for managers to project their own strengths and weaknesses onto direct reports — account for more rating variance than the employees'' actual performance.',
  'Gartner (CEB)', 'Idiosyncratic Rater Effects Research', 'https://www.gartner.com/en/human-resources', 2016,
  ARRAY['bias','measurement','workforce_performance'], ARRAY['pe_firms','c_suite','hr'],
  'direct', 'validates_product', 5,
  'This is Incompass''s clearest product-level stat. 37% accuracy improvement and 21% attrition reduction are the direct outcomes of Incompass''s bias-normalization technology. This should be on every product one-pager, demo slide, and case study.',
  false
),

(
  'Managers rate identical work 15–20% lower for women and underrepresented minorities when the rater is unaware of the bias, and those rating gaps compound over time into significant wage and advancement gaps.',
  'McKinsey''s Women in the Workplace study (2023) documented the systematic underrating phenomenon and traced it through to promotion rates, compensation decisions, and leadership pipeline representation.',
  'McKinsey & Company', 'Women in the Workplace', 'https://www.mckinsey.com/featured-insights/diversity-and-inclusion/women-in-the-workplace', 2023,
  ARRAY['bias','measurement','leadership_effectiveness'], ARRAY['c_suite','hr'],
  'direct', 'validates_product', 5,
  'This grounds Incompass''s bias narrative in financial loss, not just fairness. A 15–20% systematic underrating means organizations are systematically misallocating their highest-return talent investments. For PE portcos, this is a talent utilization and retention risk that maps directly to value destruction.',
  false
),

(
  'When rater behavior is not normalized across managers, bias inflates or deflates performance ratings by an average of 1.2 points on a 5-point scale — making cross-team talent comparisons effectively meaningless.',
  'Meta-analysis in the Journal of Applied Psychology reviewing 30+ years of performance appraisal research found rater idiosyncrasy to be the dominant source of variance in performance scores — larger than actual performance differences in most datasets.',
  'Journal of Applied Psychology', 'Rater Effects in Performance Appraisal: A Meta-Analysis', 'https://www.apa.org/pubs/journals/apl/', 2016,
  ARRAY['bias','measurement'], ARRAY['hr','c_suite'],
  'direct', 'validates_product', 5,
  'This is the academic foundation for Incompass''s normalization methodology. If rater variance swamps true performance signal by 1.2 points on a 5-point scale, companies cannot make defensible talent decisions without calibration. Incompass turns this from academic insight into operational product.',
  false
),

(
  'Organizations using structured, calibrated talent assessments are 3x more likely to accurately predict future leadership success than those using unstructured interviews and gut-feel evaluations.',
  'Korn Ferry''s assessment validity research, drawing on their global database of 69 million assessments, compared structured assessment outcomes to leadership performance outcomes across five years.',
  'Korn Ferry', 'The Science of Talent Assessment', 'https://www.kornferry.com/insights/articles/validity-of-assessments', 2021,
  ARRAY['measurement','leadership_effectiveness','bias'], ARRAY['pe_firms','c_suite'],
  'direct', 'validates_product', 5,
  '3x predictive accuracy is a concrete, defensible claim for Incompass in competitive situations against firms still using informal assessment. For PE sponsors, "3x better at predicting leadership success" is a direct answer to "why pay for Incompass vs. a traditional leadership assessment firm."',
  false
),

-- ── EMPLOYEE ENGAGEMENT ───────────────────────────────────────────────────────

(
  'Only 23% of employees worldwide are engaged at work — costing the global economy $8.8 trillion, or 9% of global GDP annually.',
  'Gallup''s State of the Global Workplace 2023 report surveyed 122,416 employees across 160 countries. The engagement rate has remained stubbornly below 25% for more than a decade despite massive investment in HR technology.',
  'Gallup', 'State of the Global Workplace', 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', 2023,
  ARRAY['engagement','workforce_performance'], ARRAY['c_suite','hr','all'],
  'adjacent', 'validates_product', 5,
  'The $8.8 trillion cost of disengagement reframes talent investment as existential, not optional. For C-suite audiences, Incompass can connect disengagement to root causes (poor management, unclear feedback, lack of fairness) that its platform directly addresses.',
  false
),

(
  'Teams with high engagement are 23% more profitable, 18% more productive, and experience 43% lower turnover than disengaged teams.',
  'Gallup''s Q12 Meta-Analysis pooled 100,000+ business units across 96 countries. The profitability and productivity lifts from engagement hold even after controlling for industry, business model, and market conditions.',
  'Gallup', 'Q12 Meta-Analysis', 'https://www.gallup.com/workplace/321725/gallup-q12-employee-engagement-survey.aspx', 2020,
  ARRAY['engagement','workforce_performance','measurement'], ARRAY['c_suite','pe_firms'],
  'adjacent', 'validates_product', 5,
  '23% profitability and 43% lower turnover give CFOs and PE operating partners concrete ROI from engagement investment. Incompass can position performance calibration and 360 feedback as the upstream drivers of engagement — establishing the tool as part of a measurable business outcome chain.',
  false
),

(
  'The average cost to replace a manager or executive is 200% of annual salary, including recruitment, onboarding, productivity loss, and team disruption.',
  'SHRM''s retention research surveys HR practitioners annually on actual cost-to-replace data. The 200% figure for managerial and executive roles reflects full replacement lifecycle costs, not just recruiting fees.',
  'SHRM', 'Talent Retention and Turnover Research', 'https://www.shrm.org/topics-tools/research/talent-retention', 2022,
  ARRAY['talent_cost','leadership_effectiveness'], ARRAY['pe_firms','c_suite'],
  'direct', 'validates_product', 5,
  'The 200% replacement cost turns every leadership mis-hire into a quantifiable P&L event. For PE portcos, a single failed C-suite hire on a $100M revenue company means $1M+ in direct replacement costs — before accounting for strategic disruption and time lost. Incompass''s cost-of-mis-hire narrative should lead with this stat.',
  false
),

-- ── WORKFORCE PERFORMANCE (GENERAL) ──────────────────────────────────────────

(
  'Companies in the top quartile of organizational health — including talent management practices — outperform median-health peers by 3x on total returns to shareholders over a 10-year period.',
  'McKinsey''s Organizational Health Index tracks management practices across 150+ companies globally. Talent selection, performance calibration, and leadership development are among the highest-weighted practices in the health model.',
  'McKinsey & Company', 'Organizational Health: A Fast Track to Performance Improvement', 'https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-organization-blog/organizational-health-a-fast-track-to-performance-improvement', 2021,
  ARRAY['workforce_performance','measurement','leadership_effectiveness'], ARRAY['pe_firms','c_suite'],
  'adjacent', 'validates_product', 4,
  '3x shareholder returns from organizational health practices gives Incompass a durable long-game narrative for C-suite and PE sponsors. It elevates talent management from HR function to board-level strategic priority — exactly the positioning Incompass needs as a premium product.',
  false
),

(
  'Companies that excel at internal talent mobility retain employees for an average of 5.4 years vs. 2.9 years for those with poor internal mobility — nearly 2x the retention.',
  'LinkedIn''s Workforce Learning Report analyzed internal talent flow data from 500M+ professional profiles. Retention uplift from internal mobility holds across company size, industry, and geography.',
  'LinkedIn', 'Workforce Learning Report', 'https://learning.linkedin.com/resources/workforce-learning', 2023,
  ARRAY['workforce_performance','talent_cost','engagement'], ARRAY['c_suite','hr'],
  'adjacent', 'new_use_case', 4,
  'Internal mobility depends on accurate, calibrated talent data — knowing who is truly high-potential vs. who just has a visible manager. Incompass''s normalized talent data is the prerequisite for effective internal mobility strategy, opening a conversation beyond performance reviews.',
  false
),

(
  'Only 8% of companies have deployed AI-enabled talent analytics at scale; the remaining 92% still rely primarily on manager judgment and informal assessment.',
  'Deloitte''s Human Capital Trends surveyed 10,000+ business and HR leaders globally. Despite widespread investment in HR technology, AI-enabled talent analytics remains rare — concentrated in large enterprises with dedicated people analytics teams.',
  'Deloitte', 'Global Human Capital Trends', 'https://www2.deloitte.com/us/en/insights/focus/human-capital-trends.html', 2023,
  ARRAY['measurement','bias','workforce_performance'], ARRAY['pe_firms','c_suite','hr'],
  'direct', 'white_space', 5,
  '92% of companies still rely on manager gut-feel is the white space stat Incompass owns. It validates the market opportunity and frames Incompass as the category creator for democratized, AI-enabled talent intelligence — not just another HR tool. Critical for investor and press narratives as well as GTM.',
  false
),

(
  'BCG found that companies excelling at identifying and developing internal talent fill key roles 3x faster and at 60% lower cost than those relying primarily on external hiring.',
  'BCG''s research on talent supply chains studied hiring and promotion outcomes across 1,300+ companies over three years. The cost and speed advantages of internal talent development compound over time as the internal talent pool deepens.',
  'Boston Consulting Group', 'Rethinking Performance Management', 'https://www.bcg.com/capabilities/people-strategy', 2022,
  ARRAY['talent_cost','workforce_performance','measurement'], ARRAY['pe_firms','c_suite'],
  'adjacent', 'validates_product', 4,
  '3x faster and 60% cheaper internal hiring is a CFO-grade outcome. Incompass''s talent calibration data makes internal mobility decisions defensible and fast — connecting its product directly to recruiting cost reduction, a metric PE operating partners actively track.',
  false
);


-- ─── OPPORTUNITIES ─────────────────────────────────────────────────────────────

INSERT INTO opportunities (title, description, opportunity_type, status, supporting_entry_ids)
VALUES

(
  'PE firms have no standard for talent diligence — Incompass can own this category',
  'Today, PE sponsors evaluate management teams through founder references, informal interviews, and gut feel. There is no standard methodology, no shared benchmark, and no structured data infrastructure for assessing leadership quality at acquisition. Incompass is positioned to define what "talent diligence" means in PE — the equivalent of financial due diligence for people. No competitor is explicitly targeting this category. First-mover advantage is available now.',
  'white_space', 'active', '{}'
),

(
  'The "bias costs returns, not just fairness" narrative is unowned in the market',
  'Every competitor in the performance management space talks about bias through a DEI and compliance lens. No one has made the economic argument directly to PE sponsors and CFOs: systematic rater bias destroys talent signal, causing misallocation of development resources, promotion of wrong people, and exit of high-potential employees. Incompass''s bias-normalization technology has a 37% accuracy improvement stat (CEB) to anchor this narrative. The frame shift from "fairness" to "financial precision" is Incompass''s most differentiated GTM move.',
  'white_space', 'active', '{}'
),

(
  'Real-time talent health reporting for PE boards is a gap nobody fills',
  'PE boards receive detailed quarterly financials but receive no real-time data on management team health, leadership risk, or talent pipeline depth. The closest thing is an occasional org-level engagement survey or an ad-hoc leadership assessment from a consulting firm. Incompass could create the standard portfolio talent dashboard — a single pane of glass that shows board members the same rigor for people that they have for financial performance.',
  'white_space', 'active', '{}'
),

(
  'Competitors all sell to HR — nobody speaks PE and portco CEO''s language',
  'Workday, Lattice, Culture Amp, and 15Five all position primarily to CHROs and HR teams. Their language is employee experience, culture, and engagement. None of them speak the language of EBITDA growth, exit multiples, or value creation. Incompass''s positioning as the talent intelligence tool for PE-backed value creation is uncontested. Every competitor case study is about HR satisfaction; Incompass can own the category of measurable business return from talent decisions.',
  'competitor_blind_spot', 'active', '{}'
),

(
  '82% of managers are miscasted — but nobody sells the "fix the manager layer" narrative to PE',
  'Gallup''s finding that 82% of managers lack natural talent for management is widely cited in HR circles but completely absent from PE operating partner conversations. For PE sponsors managing 10–30 portfolio companies with dozens of promoted-from-technical VP and director-level managers, this is a pervasive value destruction source. Incompass can own the "fix the management layer" narrative in the PE operating partner community — where no talent vendor currently speaks.',
  'narrative_gap', 'active', '{}'
),

(
  'Performance management ROI is claimed but never proven — Incompass can own the proof',
  'Every HR technology vendor claims their product improves performance. None provide a credible, methodology-backed proof point connecting their tool to business outcomes. The 61% of HR leaders who say they cannot measure whether talent programs actually work (PwC) are directly expressing the need for a vendor who can close this loop. Incompass''s calibrated data model creates a foundation for outcome attribution that competitors cannot match with their current architectures.',
  'narrative_gap', 'active', '{}'
),

(
  'The VP-to-C-suite transition failure rate is a hidden PE portfolio risk',
  '60% of new executives fail within 18 months (HBR). In PE-backed companies, this problem is acute: portco leaders are frequently promoted faster than their readiness, or external hires are brought in without sufficient assessment of cultural and contextual fit. Incompass can position its 360 feedback and assessment tools as the standard protocol for managing leadership transitions in portfolio companies — a specific, high-stakes use case that PE operating partners will immediately recognize.',
  'new_use_case', 'active', '{}'
),

(
  'The cost-per-leadership-mis-hire narrative gives Incompass a CFO buyer',
  '200% of salary for a mis-hired executive (SHRM), multiplied across a portfolio of companies with multiple leadership transitions per year, creates a compounding financial case for assessment rigor. Most HR vendors sell to HR budgets. Incompass can use the mis-hire cost narrative to sell to CFOs and operating partners who control larger discretionary budgets and are motivated by financial risk reduction rather than HR program quality.',
  'new_buyer', 'active', '{}'
);
