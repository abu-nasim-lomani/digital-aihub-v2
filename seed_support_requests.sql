-- Insert seed support requests with quality data
-- Note: Replace project_id values with actual UUIDs from your projects table

-- Support Request 1: Technical Support for Logic Project
INSERT INTO public.support_requests (
  title, 
  support_type, 
  document_url, 
  duration, 
  impact, 
  status, 
  created_by,
  project_id
)
VALUES (
  'Backend API Performance Optimization Required',
  'Technical Support',
  'https://docs.google.com/document/d/1234567890/edit',
  '3 Months',
  'Current API response time exceeds 2 seconds for complex queries. Optimization will improve user experience by 60% and reduce server costs by 40%. This affects 5000+ daily active users across the Logic enterprise management system.',
  'pending',
  'john.doe@example.com',
  NULL -- Replace with actual project_id UUID for 'Logic' project
);

-- Support Request 2: Infrastructure Upgrade for ISPAT
INSERT INTO public.support_requests (
  title, 
  support_type, 
  document_url, 
  duration, 
  impact, 
  status, 
  created_by,
  project_id
)
VALUES (
  'AI Monitoring System Integration with Legacy Equipment',
  'Infrastructure',
  'https://drive.google.com/file/d/abcdef123456/view',
  '6 Months',
  'Integration of modern AI monitoring systems with existing steel production equipment. Expected to reduce downtime by 35%, improve quality control accuracy to 99.2%, and enable predictive maintenance. Critical for maintaining competitive advantage in steel manufacturing sector.',
  'approved',
  'sarah.engineer@ispat.com',
  NULL -- Replace with actual project_id UUID for 'ISPAT' project
);

-- Support Request 3: Legal Aid Platform Enhancement
INSERT INTO public.support_requests (
  title, 
  support_type, 
  document_url, 
  duration, 
  impact, 
  status, 
  created_by,
  project_id
)
VALUES (
  'Multi-language Support and Voice Interface for Rural Users',
  'Software Development',
  'https://www.dropbox.com/s/xyz789/legal-aid-proposal.pdf',
  '8 Months',
  'Adding Bengali, Hindi, and 5 regional language support with voice-based interface. Will enable 200,000+ rural citizens to access legal aid services without literacy barriers. Includes AI-powered legal document translation and voice-to-text case filing system.',
  'pending',
  'advocate.rahman@legalaid.org',
  NULL -- Replace with actual project_id UUID for 'Legal Aid' project
);

-- Support Request 4: Research Support for ABCV
INSERT INTO public.support_requests (
  title, 
  support_type, 
  document_url, 
  duration, 
  impact, 
  status, 
  created_by,
  project_id
)
VALUES (
  'Advanced Facial Recognition Algorithm Development',
  'Research & Development',
  'https://github.com/abcv-research/facial-recognition-proposal',
  '12 Months',
  'Development of next-generation facial recognition algorithms with 99.8% accuracy in low-light conditions. Research will support national security applications, border control automation, and secure digital identity verification. Expected to process 1M+ verifications daily with sub-second response time.',
  'approved',
  'dr.karim@abcv.research.bd',
  NULL -- Replace with actual project_id UUID for 'ABCV' project
);

-- Support Request 5: Consultancy for Digital Transformation
INSERT INTO public.support_requests (
  title, 
  support_type, 
  document_url, 
  duration, 
  impact, 
  status, 
  created_by,
  project_id
)
VALUES (
  'Enterprise Digital Transformation Strategy and Implementation',
  'Consultancy',
  'https://docs.google.com/presentation/d/consulting-proposal-2026',
  '18 Months',
  'Comprehensive digital transformation roadmap for government agencies. Includes cloud migration strategy, cybersecurity framework, employee training programs, and change management. Will modernize operations for 15+ departments serving 10M+ citizens. Expected ROI of 300% within 3 years.',
  'pending',
  'consultant.ahmed@digitalgov.bd',
  NULL
);

-- Support Request 6: Mobile App Development
INSERT INTO public.support_requests (
  title, 
  support_type, 
  document_url, 
  duration, 
  impact, 
  status, 
  created_by,
  project_id
)
VALUES (
  'Cross-Platform Mobile Application for Field Data Collection',
  'Software Development',
  'https://www.figma.com/file/mobile-app-design-2026',
  '5 Months',
  'Development of offline-capable mobile application for field workers to collect data in remote areas. Features include GPS tracking, photo documentation, digital signatures, and automatic sync when online. Will serve 2000+ field workers across 64 districts, improving data accuracy from 75% to 98%.',
  'declined',
  'project.manager@fieldops.com',
  NULL
);

-- Support Request 7: Cybersecurity Audit
INSERT INTO public.support_requests (
  title, 
  support_type, 
  document_url, 
  duration, 
  impact, 
  status, 
  created_by,
  project_id
)
VALUES (
  'Comprehensive Cybersecurity Audit and Penetration Testing',
  'Consultancy',
  'https://security-audit-scope.pdf',
  '4 Months',
  'Full security assessment of existing infrastructure including penetration testing, vulnerability scanning, code review, and compliance audit (ISO 27001, PCI DSS). Will identify and remediate critical security gaps, implement zero-trust architecture, and establish 24/7 SOC monitoring. Protects sensitive data of 500K+ users.',
  'approved',
  'ciso@securetech.bd',
  NULL
);

-- Support Request 8: Data Analytics Platform
INSERT INTO public.support_requests (
  title, 
  support_type, 
  document_url, 
  duration, 
  impact, 
  status, 
  created_by,
  project_id
)
VALUES (
  'Real-time Business Intelligence and Analytics Dashboard',
  'Software Development',
  'https://analytics-requirements.notion.site',
  '7 Months',
  'Building enterprise-grade analytics platform with real-time data processing, interactive dashboards, predictive analytics using ML models, and automated reporting. Will process 10TB+ data daily, provide insights to 500+ decision-makers, and reduce report generation time from 2 days to 5 minutes.',
  'pending',
  'data.lead@analytics.corp',
  NULL
);

-- Note: To link these support requests to actual projects, run this after inserting:
-- UPDATE public.support_requests 
-- SET project_id = (SELECT id FROM public.projects WHERE title = 'Logic' LIMIT 1)
-- WHERE title = 'Backend API Performance Optimization Required';
-- 
-- (Repeat for other support requests with their corresponding projects)
