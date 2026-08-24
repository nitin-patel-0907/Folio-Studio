import { SampleResume } from '../types';

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    id: 'senior-engineer',
    title: 'Senior Full Stack Engineer',
    category: 'Valid Resume',
    expectedResult: 'pass',
    badge: 'Passes Layers 1-3',
    filename: 'Alex_Chen_Senior_Engineer_Resume.txt',
    description: 'Comprehensive software engineer resume with rich experience, tech stack, and projects.',
    content: `ALEX CHEN
San Francisco, CA | alex.chen@example.com | (555) 234-5678 | linkedin.com/in/alexchen-dev | github.com/alexchen-dev

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 7+ years of experience architecting high-throughput distributed web systems and microservices. Expert in TypeScript, React, Node.js, Python, PostgreSQL, and AWS cloud infrastructure. Led cross-functional engineering pods that reduced latency by 42% and delivered enterprise platforms serving over 3 million monthly active users.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript (ES6+), Python, Go, SQL, HTML5, CSS3
Frameworks & Libraries: React, Next.js, Node.js, Express, FastAPI, Tailwind CSS, GraphQL, Redux Toolkit
Databases & Cloud: PostgreSQL, MongoDB, Redis, AWS (ECS, S3, RDS, CloudFront), Docker, Kubernetes, CI/CD
Architecture & Tools: Microservices, REST APIs, System Design, Git, Jest, Playwright, Terraform

PROFESSIONAL EXPERIENCE

Staff / Senior Software Engineer | CloudScale Technologies
Jan 2021 – Present | San Francisco, CA
- Architected and spearheaded the migration of legacy monolithic architecture into distributed Node.js/Go microservices, reducing p99 API latency from 450ms to 75ms.
- Built a real-time analytics streaming engine using React, TypeScript, and WebSockets processing 15,000 events/sec with zero packet loss.
- Mentored a pod of 8 mid-level and junior software engineers, instituting rigorous TypeScript strictness, code review rubrics, and automated integration tests.
- Designed multi-tenant role-based access control (RBAC) and OAuth2 security flow protecting 500,000+ enterprise accounts.

Full Stack Software Engineer | Horizon Fintech
Aug 2018 – Dec 2020 | New York, NY
- Engineered core payments ledger and transactional checkout flows integrating Stripe and Plaid APIs with automated idempotency checks.
- Developed scalable customer dashboard in React and Tailwind CSS resulting in a 35% improvement in daily user engagement metrics.
- Optimized slow SQL queries and PostgreSQL index partitioning to speed up transaction history searches by 4.2x.

SELECTED PROJECTS

AutoDeploy CLI & Cloud Platform | github.com/alexchen-dev/autodeploy
- Built an open-source container deployment pipeline in Go and React allowing developers to push microservices to Kubernetes clusters in under 60 seconds.
- Featured on GitHub Trending with 1,800+ stars and 120+ contributors.

OmniSearch Vector Engine | github.com/alexchen-dev/omnisearch
- Designed a hybrid lexical and semantic search engine powered by FastAPI, pgvector, and React web interface with sub-50ms query responses.

EDUCATION

Bachelor of Science in Computer Science
University of California, Berkeley | 2014 – 2018 | GPA: 3.84 / 4.0
Dean's Honors List (All semesters), Head TA for Data Structures & Algorithms

KEY ACHIEVEMENTS
- Awarded "Engineer of the Year 2023" at CloudScale Technologies among 240+ global engineering staff.
- Published technical whitepaper on zero-downtime database migrations presented at NodeSummit 2022.
`
  },
  {
    id: 'product-designer',
    title: 'Lead UI/UX Product Designer',
    category: 'Valid Resume',
    expectedResult: 'pass',
    badge: 'Passes Layers 1-3',
    filename: 'Elena_Rostova_Design_Resume.txt',
    description: 'Design resume with Figma design systems, usability research, and web application UI.',
    content: `ELENA ROSTOVA
Austin, TX | elena.rostova@example.com | (555) 789-0123 | elenadesigns.io | linkedin.com/in/elenarostova

PROFESSIONAL SUMMARY
Lead Product Designer with 6+ years specializing in design systems, interaction architecture, and accessible user experiences for enterprise SaaS and consumer mobile apps. Passionate about marrying aesthetic craftsmanship with measurable business conversions.

CORE SKILLS
Design & Prototyping: Figma, FigJam, Sketch, Adobe Creative Suite (Illustrator, Photoshop, After Effects), Principle, ProtoPie
UX Research & Testing: User Interviews, Usability Testing, Heuristic Evaluation, Journey Mapping, A/B Testing, Hotjar
Frontend Foundations: HTML5, CSS3, Tailwind CSS, Responsive Design, Design Tokens, WCAG 2.1 AA Accessibility Standards

EXPERIENCE

Lead Product Designer | Lumina Health Tech
Mar 2022 – Present | Austin, TX
- Spearheaded the end-to-end redesign of the core clinical patient portal, increasing task completion rate from 68% to 94% across 450,000 active patients.
- Created and maintained "Prism Design System" containing 120+ accessible Figma components, tokenized for seamless engineering handoff in React.
- Conducted 40+ user testing sessions with healthcare providers to streamline electronic health record (EHR) charting workflows.

Senior UI/UX Designer | Orbit Mobility
Jun 2019 – Feb 2022 | San Francisco, CA
- Led design for iOS and Android rider application with over 1.2M downloads; earned 4.8-star App Store rating.
- Partnered with product managers and data scientists to run multivariate onboarding funnels that boosted sign-up conversions by 28%.

PROJECTS

Aura Meditation iOS App | elenadesigns.io/aura
- Designed holistic mindfulness application focusing on tactile haptic feedback and dynamic ambient color palette.

Prism Design Tokens Generator | github.com/elenarostova/prism-tokens
- Open-source Figma plugin that automatically exports CSS/Tailwind tokens directly to engineering repositories.

EDUCATION

Bachelor of Fine Arts in Interaction Design
Rhode Island School of Design (RISD) | 2015 – 2019 | Magna Cum Laude

ACHIEVEMENTS
- Red Dot Design Award Winner (2023) for Medical Interface UX
- Keynote Speaker at DesignOps Global Conference 2023
`
  },
  {
    id: 'recent-grad',
    title: 'Data Analyst (Omitted Achievements)',
    category: 'Valid Resume (Sparse)',
    expectedResult: 'pass',
    badge: 'Tests Empty Section Omission',
    filename: 'Jordan_Taylor_Data_Analyst.txt',
    description: 'Valid entry-level resume without achievements or links, verifying empty section DOM omission.',
    content: `JORDAN TAYLOR
Chicago, IL | jordan.taylor@example.com | (555) 345-6789 | linkedin.com/in/jordantaylor-data

PROFESSIONAL SUMMARY
Detail-oriented Data Analyst with expertise in Python, SQL, Tableau, and predictive statistical modeling. Experienced in extracting actionable business insights from unstructured datasets and automating recurring executive KPI dashboards.

TECHNICAL SKILLS
Python (Pandas, NumPy, Scikit-learn), SQL (PostgreSQL, BigQuery), Tableau, PowerBI, Excel (VBA, PowerQuery), R, Git, Statistics

PROFESSIONAL EXPERIENCE

Junior Data Analyst | Apex Retail Analytics
Jul 2023 – Present | Chicago, IL
- Built automated ETL pipelines in Python to extract daily inventory and sales figures across 120 regional retail stores.
- Developed interactive Tableau executive dashboards tracking $45M in annual customer sales and churn metrics.
- Identified product stocking inefficiencies that decreased supply chain turnaround time by 14 days.

Data Analytics Intern | Midwest Logistics Group
Jun 2022 – Aug 2022 | Chicago, IL
- Cleaned and prepared 500,000+ logistics shipment records using SQL queries and Python scripts.
- Created visualizations for warehouse throughput and truck route optimization models.

FEATURED PROJECTS

Predictive Customer Churn Model
- Developed a Random Forest classification algorithm in Python achieving 87% accuracy in predicting subscription cancellations.

COVID-19 Economic Trend Visualizer
- Created open-source data dashboard visualizing post-pandemic consumer spending trends using Pandas and Tableau.

EDUCATION

Bachelor of Science in Statistics & Data Science
University of Illinois Urbana-Champaign | 2019 – 2023 | GPA: 3.72 / 4.0
`
  },
  {
    id: 'fake-invoice',
    title: 'Fake Document: Commercial Invoice',
    category: 'Fake Document',
    expectedResult: 'fail_layer2',
    badge: 'Fails Layer 2 (Heuristics)',
    filename: 'Invoice_INV-98234.txt',
    description: 'Commercial invoice lacking career history, education, or skills sections.',
    content: `ACME CORPORATION - INVOICE #98234
Invoice Date: August 14, 2024
Due Date: September 14, 2024
Customer ID: CUST-88219

Billed To:
Global Solutions LLC
100 Industrial Parkway, Suite 400
Dallas, TX 75201
Accounts Payable: ap@globalsolutions.com

ITEMS ORDERED:
1. Enterprise Cloud Server Node (SKU: SRV-882) - Qty: 4 @ $1,200.00 = $4,800.00
2. Managed Firewall Hardware (SKU: FW-100) - Qty: 1 @ $850.00 = $850.00
3. Fiber Patch Cables 10Gbps (SKU: CAB-10G) - Qty: 20 @ $15.00 = $300.00
4. On-site Technician Installation Service - Hours: 8 @ $150.00 = $1,200.00

Subtotal: $7,150.00
Sales Tax (8.25%): $589.88
Shipping & Handling: $120.00
TOTAL DUE: $7,859.88

Payment Terms: Net 30. Please remit payments via ACH/Wire Transfer to Account #992834710, Routing #021000021.
Thank you for your business!`
  },
  {
    id: 'stub-incomplete',
    title: 'Incomplete Stub (< 150 chars)',
    category: 'Junk / Stub',
    expectedResult: 'fail_layer1',
    badge: 'Fails Layer 1 (Length/Bytes)',
    filename: 'notes.txt',
    description: 'Very short note that fails Layer 1 minimum text threshold (< 150 chars).',
    content: `John Doe
Developer
I know Python and Javascript.
Email: john@test.com`
  },
  {
    id: 'fake-recipe-story',
    title: 'Fake Resume: Story disguised with keywords',
    category: 'Fake Document',
    expectedResult: 'fail_layer3',
    badge: 'Fails Layer 3 (AI Classifier)',
    filename: 'Story_Disguised_As_Resume.txt',
    description: 'Fictional tale carefully stuffed with section headings to fool heuristics, but caught by Gemini AI classification.',
    content: `THE ADVENTURES OF CAPTAIN BLACKBEARD
Pirate Cove, Caribbean Ocean | pirate@blackbeard.ocean | (555) 000-0000 | linkedin.com/in/blackbeard-pirate

SUMMARY
A brave swashbuckler who sailed the seven seas in search of sunken Spanish galleons and mystical treasure chests. Once upon a time, my crew and I found a map leading to the Lost City of Atlantis.

SKILLS
Sword fighting, Cannon loading, Treasure hunting, Drinking rum, Parrott talking, Map reading

EXPERIENCE
Pirate Captain | The Flying Dutchman Ship
1715 – 1720
- Led 50 pirates into epic sea battles against ghost ships in the Bermuda Triangle.
- Buried 400 gold doubloons on a secret desert island guarded by giant crabs.
- Defeated the legendary Kraken using a magical enchanted trident.

EDUCATION
Pirate Academy of Tortuga | Master of Navigation | 1712

ACHIEVEMENTS
- Captured 100 royal navy galleons without losing a single wooden leg.`
  }
];
