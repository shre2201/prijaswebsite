-- Run in Supabase SQL Editor to seed the 7 Prijas services

INSERT INTO "Service" ("id", "name", "description", "price", "duration", "isActive", "createdAt", "updatedAt") VALUES
(
  'svc_001',
  'Customised Facial with Organic Ingredients',
  'A fully personalised facial using 100% organic ingredients tailored to your skin type, concerns, and goals. Includes deep cleansing, exfoliation, and a custom masque.',
  1800, 60, true, NOW(), NOW()
),
(
  'svc_002',
  'Customised Organic Skin-Tightening Facial',
  'Targeted facial treatment using organic actives that firm and lift the skin. Ideal for loss of elasticity, fine lines, and early signs of ageing.',
  2200, 75, true, NOW(), NOW()
),
(
  'svc_003',
  'HydraFacial with Organic-infused Ingredients',
  'A multi-step HydraFacial enhanced with organic botanical serums. Deeply cleanses, exfoliates, extracts, and hydrates in one session for an instant glow.',
  2800, 60, true, NOW(), NOW()
),
(
  'svc_004',
  'Chemical Peel',
  'Professional-grade chemical peel customised to your skin tone and concern — targets pigmentation, acne scars, uneven texture, and dullness.',
  1500, 45, true, NOW(), NOW()
),
(
  'svc_005',
  'Glutathione Whitening Treatment',
  'A brightening treatment that delivers a high concentration of Glutathione to reduce melanin production, fade dark spots, and even out skin tone.',
  2500, 60, true, NOW(), NOW()
),
(
  'svc_006',
  'Party Glow Facial',
  'A quick, intensive facial designed to give you radiant, camera-ready skin before a big event. Results are immediate and last up to 5 days.',
  1200, 45, true, NOW(), NOW()
),
(
  'svc_007',
  'Customised Organic Hair & Scalp Treatment',
  'A nourishing scalp analysis and treatment using organic oils and botanicals. Addresses hair fall, dandruff, dryness, and scalp sensitivity.',
  1600, 60, true, NOW(), NOW()
);
