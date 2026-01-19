-- Seed Initiatives Data with Realistic Images, Specific ID, and Detailed Descriptions

-- Optional: TRUNCATE TABLE initiatives;

INSERT INTO initiatives (id, title, description, type, impact, status, created_at, created_by, image_url)
VALUES
(
  '817bcd52-08b4-412c-aa23-fbca20b388f2', -- Hardcoded ID for the user's specific link
  'National AI Strategy Roadmap 2030',
  'A comprehensive strategic framework designed to position the nation as a global leader in Artificial Intelligence. This roadmap outlines key policies for ethical AI adoption, infrastructure development, and talent cultivation across public and private sectors. The strategy envisions a future where AI drives economic growth, enhances public services, and solves critical national challenges.\n\nThe roadmap is built upon three core pillars:\n1. **Talent Development:** A nationwide initiative to upskill 100,000 engineers and data scientists through specialized certification programs and university partnerships. This includes scholarships for underrepresented groups to ensure diversity in the tech workforce.\n2. **Infrastructure Modernization:** Construction of three Tier-4 Data Centers and the establishment of sovereign cloud capabilities to ensure data security and high-performance computing availability for research and startups.\n3. **Ethics & Governance:** The establishment of a National AI Ethics Board responsible for creating guidelines on algorithmic transparency, data privacy, and bias mitigation, ensuring AI is deployed responsibly in critical sectors like healthcare and finance.',
  'AI',
  'Strategic alignment of 20+ government agencies',
  'published',
  NOW(),
  'admin@undp.org',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80'
),
(
  gen_random_uuid(),
  'Smart City Governance Platform',
  'An integrated digital platform enabling real-time urban management. This initiative transforms traditional city administration into a responsive, data-driven ecosystem. Features include traffic optimization, intelligent waste management tracking, and citizen grievance redressal mechanisms powered by IoT sensors deployed across the city.\n\nThe platform integrates data from over 5,000 sensors monitoring air quality, traffic flow, and energy consumption. It provides city administrators with a centralized dashboard for real-time decision-making. Citizens can use the accompanying mobile app to report issues such as potholes or broken streetlights, with automated ticket routing to the relevant department. Early pilots have shown a significant reduction in response times and improved resident satisfaction scores.',
  'Governance',
  'Reduced response time for civic issues by 40%',
  'published',
  NOW() - INTERVAL '2 days',
  'admin@undp.org',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=800&q=80'
),
(
  gen_random_uuid(),
  'Rural Tech-Connectivity Drive',
  'Bridging the digital divide by deploying high-speed broadband infrastructure to 500+ remote villages. This ambitious initiative focuses on enabling telemedicine and e-learning opportunities for underserved communities that have historically been disconnected from the digital economy.\n\nBy laying over 2,000 kilometers of fiber optic cable and establishing Wi-Fi hotspots in community centers, the project ensures reliable internet access. This connectivity acts as a catalyst for local development, allowing farmers to access market prices, students to attend virtual classes, and patients to consult with specialists in urban hospitals via video conferencing. The initiative also includes digital literacy training programs to ensure the local population can effectively utilize these new digital tools.',
  'Tech',
  'Connected 50,000+ rural households to high-speed internet',
  'published',
  NOW() - INTERVAL '5 days',
  'admin@undp.org',
  'https://images.unsplash.com/photo-1534274983118-2174d613cf20?auto=format&fit=crop&w=800&q=80'
),
(
  gen_random_uuid(),
  'Automated Judicial Archive System',
  'Digitizing over 1 million historical judicial records using OCR and machine learning. This project aims to preserve legal heritage and improve case retrieval efficiency for the judicial system. By converting fragile paper documents into searchable digital formats, we are ensuring the longevity of critical legal archives.\n\nThe system utilizes advanced Optical Character Recognition (OCR) tailored for legal terminology and historical fonts. It automatically tags and categorizes documents based on case type, year, and verdict. This digitization effort drastically reduces the time legal clerks spend searching for physical files, allowing the judiciary to focus on case adjudication. The secure digital archive is accessible to authorized legal professionals, fostering transparency and speeding up legal proceedings.',
  'Governance',
  'Digitized 1.2M records, improving retrieval time by 90%',
  'published',
  NOW() - INTERVAL '10 days',
  'admin@undp.org',
  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80'
),
(
  gen_random_uuid(),
  'AI for Climate Resilience',
  'Deploying predictive AI models to analyze weather patterns and optimize agricultural planning. This initiative supports farmers with data-driven insights to mitigate the impact of climate change on crop yields. By analyzing satellite imagery and historical weather data, our AI models provide hyper-local forecasts and advisory services.\n\nFarmers receive SMS and app-based alerts regarding potential pest outbreaks, optimal sowing windows, and irrigation requirements. The system helps in adaptive decision-making, reducing water usage and fertilizer costs while maximizing output. Furthermore, the data collected helps policymakers understand long-term climate trends and develop robust regional agricultural strategies to ensure food security.',
  'AI',
  'Supported 5,000 farmers with actionable climate insights',
  'published',
  NOW() - INTERVAL '15 days',
  'admin@undp.org',
  'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=800&q=80'
),
(
  gen_random_uuid(),
  'Digital Identity Verification API',
  'A secure, scalable API for instant digital identity verification, integrated with national databases. This enables seamless KYC (Know Your Customer) processes for banking, telecom, and government services, significantly reducing fraud and onboarding time.\n\nThe API provides a standardized interface for verified service providers to authenticate user identities in real-time. It supports multi-factor authentication and biometric verification, ensuring a high level of security. This infrastructure is a foundational building block for the digital economy, enabling paperless and presence-less service delivery. It complies with strict data privacy regulations, ensuring user consent is mandatory for every verification request.',
  'Tech',
  'Processed 10M+ verifications with 99.9% uptime',
  'published',
  NOW() - INTERVAL '20 days',
  'admin@undp.org',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'
);
