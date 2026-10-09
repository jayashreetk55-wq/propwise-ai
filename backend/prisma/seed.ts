import { PrismaClient, UserRole, PropertyType, ListingType, PropertyStatus, FurnishingStatus, AmenityCategory, AnalysisType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Core Master Amenities
  const amenitiesData = [
    { name: 'Swimming Pool', slug: 'swimming-pool', category: AmenityCategory.FITNESS, icon: 'waves' },
    { name: 'Gymnasium & Fitness Center', slug: 'gymnasium', category: AmenityCategory.FITNESS, icon: 'dumbbell' },
    { name: '24/7 Gated Security', slug: 'gated-security', category: AmenityCategory.SECURITY, icon: 'shield-check' },
    { name: 'Power Backup', slug: 'power-backup', category: AmenityCategory.INFRASTRUCTURE, icon: 'zap' },
    { name: 'EV Charging Station', slug: 'ev-charging', category: AmenityCategory.INFRASTRUCTURE, icon: 'battery-charging' },
    { name: 'Clubhouse & Lounge', slug: 'clubhouse', category: AmenityCategory.LIFESTYLE, icon: 'users' },
    { name: 'Covered Dedicated Parking', slug: 'covered-parking', category: AmenityCategory.CONVENIENCE, icon: 'car' },
    { name: 'High-Speed Fiber Internet', slug: 'high-speed-internet', category: AmenityCategory.INFRASTRUCTURE, icon: 'wifi' },
    { name: 'Children Play Area & Park', slug: 'children-play-area', category: AmenityCategory.LIFESTYLE, icon: 'smile' },
  ];

  console.log('  -> Upserting master amenities catalog...');
  const seededAmenities = [];
  for (const item of amenitiesData) {
    const amenity = await prisma.amenity.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
    seededAmenities.push(amenity);
  }

  // 2. Seed Sample Users
  console.log('  -> Upserting demo users...');
  const demoInvestor = await prisma.user.upsert({
    where: { email: 'investor.demo@propwise.ai' },
    update: {},
    create: {
      email: 'investor.demo@propwise.ai',
      name: 'Alex Morgan',
      firstName: 'Alex',
      lastName: 'Morgan',
      password: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', // Password123!
      phone: '+1-415-555-0199',
      role: UserRole.INVESTOR,
      preferences: {
        create: {
          listingType: ListingType.SALE,
          budgetMin: 800000,
          budgetMax: 2000000,
          preferredCities: ['San Francisco', 'Austin', 'Seattle'],
          preferredLocalities: ['SoMa', 'Downtown', 'Capitol Hill'],
          bedrooms: [2, 3],
          propertyTypes: [PropertyType.CONDO, PropertyType.APARTMENT],
          minAreaSqFt: 1100,
          lifestylePreferences: {
            walkScoreMin: 85,
            transitPriority: 'high',
            parksProximity: true,
          },
          investmentPreferences: {
            targetCapRateMin: 5.5,
            targetCashOnCashReturn: 7.0,
            riskTolerance: 'MODERATE',
            investmentHorizonYears: 5,
          },
        },
      },
    },
  });

  const demoAgent = await prisma.user.upsert({
    where: { email: 'agent.sarah@propwise.ai' },
    update: {},
    create: {
      email: 'agent.sarah@propwise.ai',
      name: 'Sarah Chen',
      firstName: 'Sarah',
      lastName: 'Chen',
      password: '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', // Password123!
      phone: '+1-415-555-0142',
      role: UserRole.AGENT,
    },
  });

  // 3. Seed Sample Property Listing
  console.log('  -> Seeding showcase real estate listing...');
  const sampleProperty = await prisma.property.create({
    data: {
      title: 'Lumina Tower Modern High-Rise Residence with Panoramic Views',
      description: 'Sophisticated 2-bedroom luxury residence featuring floor-to-ceiling glass windows, hardwood flooring, Gaggenau appliances, and deeded garage parking.',
      propertyType: PropertyType.CONDO,
      listingType: ListingType.SALE,
      status: PropertyStatus.AVAILABLE,
      price: 1350000.00,
      currency: 'USD',
      areaSqFt: 1280.00,
      bedrooms: 2,
      bathrooms: 2.0,
      furnishing: FurnishingStatus.FULLY_FURNISHED,
      city: 'San Francisco',
      locality: 'South Beach / Rincon Hill',
      address: '201 Folsom St, Unit 24A',
      zipCode: '94105',
      latitude: 37.7891200,
      longitude: -122.3926800,
      yearBuilt: 2016,
      createdById: demoAgent.id,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
            caption: 'Main Living Room with Bay Bridge Cityscape Views',
            isPrimary: true,
            displayOrder: 1,
          },
          {
            url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            caption: 'Gourmet Chef Kitchen with Marble Island',
            isPrimary: false,
            displayOrder: 2,
          },
        ],
      },
      priceHistory: {
        create: [
          {
            previousPrice: 1395000.00,
            newPrice: 1350000.00,
            changePercentage: -3.23,
            reason: 'Spring market adjustment',
          },
        ],
      },
      analyses: {
        create: [
          {
            analysisType: AnalysisType.INVESTMENT_YIELD,
            score: 78.50,
            confidenceScore: 0.9200,
            isAiEstimated: true,
            isVerified: false,
            modelVersion: 'yield-regressor-v1.4',
            structuredExplanation: {
              metric: 'Projected Net Cap Rate: 5.12%',
              estimatedMonthlyRent: 5800,
              grossRentMultiplier: 19.4,
              keyStrengths: [
                'High tenant demand in South Beach tech corridor',
                'HOA includes luxury amenities reducing tenant turnover',
              ],
              keyRisks: [
                'Higher HOA dues ($1,150/mo)',
                'Property tax reassessment upon transfer',
              ],
            },
          },
          {
            analysisType: AnalysisType.ANOMALY_DETECTION,
            score: 95.00,
            confidenceScore: 0.9850,
            isAiEstimated: true,
            isVerified: false,
            modelVersion: 'listing-isolationforest-v2.1',
            structuredExplanation: {
              verdict: 'Normal / Consistent Pricing',
              anomalyScore: 0.05,
              factorsEvaluated: [
                'Price per sqft ($1,054.68/sqft) is within 1.2% of Rincon Hill 90-day moving median',
                'Square footage, bedroom ratio, and age conform to neighborhood distributions',
              ],
            },
          },
        ],
      },
      amenities: {
        create: seededAmenities.slice(0, 5).map((a) => ({
          amenityId: a.id,
        })),
      },
    },
  });

  // 4. Add to favorites
  await prisma.favorite.create({
    data: {
      userId: demoInvestor.id,
      propertyId: sampleProperty.id,
      notes: 'Strong candidate for rental portfolio, monitor upcoming neighborhood comps.',
    },
  });

  console.log(`✅ Database seeding finished successfully!`);
  console.log(`   - Seeded ${seededAmenities.length} master amenities.`);
  console.log(`   - Seeded 2 users (1 investor with preferences, 1 agent).`);
  console.log(`   - Seeded showcase property: "${sampleProperty.title}" (${sampleProperty.id}).`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
