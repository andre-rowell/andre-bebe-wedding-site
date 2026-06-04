const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const weddingDate = new Date("2027-05-30T22:00:00.000Z");

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.rSVP.deleteMany();
  await prisma.eventInvitation.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.household.deleteMany();
  await prisma.event.deleteMany();
  await prisma.registryLink.deleteMany();
  await prisma.fAQItem.deleteMany();
  await prisma.travelSection.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.guestbookEntry.deleteMany();
  await prisma.adminUser.deleteMany();

  const admin = await prisma.adminUser.create({
    data: {
      name: "Andre Rowell",
      email: "andrerowell@outlook.com",
      passwordHash: await bcrypt.hash("AndreBebe2026!", 12),
      role: "OWNER",
    },
  });

  await prisma.siteSetting.createMany({
    data: [
      { key: "coupleNames", value: "Andre & Bebe" },
      { key: "weddingDate", value: "2027-05-30" },
      { key: "weddingLocation", value: "Urban Daisy, Minneapolis, MN" },
      { key: "rsvpDeadline", value: "2027-04-30" },
      { key: "homepageIntro", value: "We cannot wait to gather the people we love most for a weekend of joy, music, food, and the beginning of our marriage." },
      { key: "contactEmail", value: "andrerowell@outlook.com" },
      { key: "heroImageUrl", value: "/photos/andre-bebe-portrait.jpg" },
      { key: "storyCopy", value: "Our story has been built in the ordinary magic: long walks, shared playlists, late dinners, family tables, and the steady decision to choose each other every day." },
      { key: "andreBio", value: "Andre brings calm energy, a generous laugh, and a love for bringing people together. He is most excited to see every chapter of their lives in one room." },
      { key: "bebeBio", value: "Bebe is thoughtful, stylish, brilliant, and full of heart. She is most excited for the vows, the dance floor, and a weekend surrounded by family and friends." },
      { key: "proposalStory", value: "The proposal was intimate, intentional, and very them: a quiet moment, a beautiful view, and the easiest yes." },
      { key: "siteMode", value: "wedding" },
      { key: "dayOfContact", value: "andrerowell@outlook.com" },
      { key: "sharedAlbumUrl", value: "https://example.com/shared-album" },
      { key: "afterWeddingMessage", value: "Thank you for surrounding us with so much love. We are grateful for every hug, toast, dance, prayer, and memory from our wedding weekend." },
    ],
  });

  const events = {};
  for (const event of [
    {
      key: "dowry",
      title: "Dowry",
      slug: "dowry",
      type: "Dowry",
      description: "A meaningful pre-wedding gathering. Location and exact timing will be shared once confirmed.",
      date: new Date("2027-05-22T17:00:00.000Z"),
      startTime: "TBD",
      endTime: null,
      venueName: "Location TBD",
      addressLine1: "Address TBD",
      city: "TBD",
      state: "MN",
      postalCode: null,
      mapUrl: null,
      dressCode: "Details to come",
      parkingInfo: "Parking details to come.",
      transportationInfo: "Transportation details to come.",
      visibility: "PUBLIC",
      rsvpRequired: true,
      mealSelectionRequired: false,
      sortOrder: 1,
    },
    {
      key: "ceremony",
      title: "Ceremony",
      slug: "ceremony",
      type: "Ceremony",
      description: "Our wedding ceremony at Urban Daisy. Please arrive early so everyone can be seated before the processional.",
      date: weddingDate,
      startTime: "5:00 PM",
      endTime: "5:30 PM",
      venueName: "Urban Daisy",
      addressLine1: "1621 E Hennepin Ave",
      city: "Minneapolis",
      state: "MN",
      postalCode: "55414",
      mapUrl: "https://maps.google.com/?q=Urban+Daisy+Minneapolis",
      dressCode: "Elegant cocktail attire",
      parkingInfo: "Venue lot and overflow street parking available.",
      transportationInfo: "A shuttle will run from the hotel block beginning at 4:15 PM.",
      visibility: "PUBLIC",
      rsvpRequired: true,
      mealSelectionRequired: false,
      sortOrder: 2,
    },
    {
      key: "reception",
      title: "Cocktail Hour & Reception",
      slug: "reception",
      type: "Reception",
      description: "Cocktails, dinner, toasts, and dancing immediately following the ceremony.",
      date: weddingDate,
      startTime: "5:30 PM",
      endTime: "11:30 PM",
      venueName: "Urban Daisy",
      addressLine1: "1621 E Hennepin Ave",
      city: "Minneapolis",
      state: "MN",
      postalCode: "55414",
      mapUrl: "https://maps.google.com/?q=Urban+Daisy+Minneapolis",
      dressCode: "Elegant cocktail attire",
      parkingInfo: "Venue lot and overflow street parking available.",
      transportationInfo: "Return shuttles begin at 10:00 PM.",
      visibility: "PUBLIC",
      rsvpRequired: true,
      mealSelectionRequired: true,
      mealOptions: "Herb-roasted chicken|Braised short rib|Vegetarian pasta|Kids meal",
      sortOrder: 3,
    },
    {
      key: "cookout",
      title: "After Party Cookout",
      slug: "after-party-cookout",
      type: "After Party Cookout",
      description: "A relaxed post-wedding cookout to keep the celebration going. Location and exact timing will be shared once confirmed.",
      date: new Date("2027-05-31T17:00:00.000Z"),
      startTime: "TBD",
      endTime: null,
      venueName: "Location TBD",
      addressLine1: "Address TBD",
      city: "TBD",
      state: "MN",
      postalCode: null,
      mapUrl: null,
      dressCode: "Casual cookout attire",
      parkingInfo: "Parking details to come.",
      transportationInfo: "Transportation details to come.",
      visibility: "PUBLIC",
      rsvpRequired: true,
      mealSelectionRequired: false,
      sortOrder: 4,
    },
  ]) {
    const { key, ...data } = event;
    events[key] = await prisma.event.create({ data });
  }

  const households = [
    {
      key: "rowell",
      name: "The Rowell Household",
      inviteCode: "ROWELL2026",
      inviteLinkToken: "rowell-7Lk29aQm2026",
      primaryEmail: "family@example.com",
      primaryPhone: "612-555-0101",
      mailingAddressLine1: "100 Lake Street",
      city: "Minneapolis",
      state: "MN",
      postalCode: "55408",
      invitationStatus: "RSVP_COMPLETE",
      guests: [
        { firstName: "Marcus", lastName: "Rowell", email: "marcus@example.com", relationshipGroup: "Family", tags: "family,out-of-town" },
        { firstName: "Denise", lastName: "Rowell", email: "denise@example.com", relationshipGroup: "Family", tags: "family,out-of-town" },
        { firstName: "Maya", lastName: "Rowell", isAdult: false, isChild: true, relationshipGroup: "Family", tags: "family,child" },
      ],
    },
    {
      key: "johnson",
      name: "The Johnson Household",
      inviteCode: "JOHNSON2026",
      inviteLinkToken: "johnson-Mp84szV2026",
      primaryEmail: "tanya@example.com",
      primaryPhone: "651-555-0102",
      mailingAddressLine1: "225 River Pkwy",
      city: "Saint Paul",
      state: "MN",
      postalCode: "55102",
      invitationStatus: "SENT",
      guests: [
        { firstName: "Tanya", lastName: "Johnson", email: "tanya@example.com", plusOneAllowed: true, relationshipGroup: "Friends", tags: "friends,wedding-party" },
        { firstName: "Chris", lastName: "Johnson", email: "chris@example.com", relationshipGroup: "Friends", tags: "friends" },
      ],
    },
    {
      key: "chen",
      name: "The Chen Household",
      inviteCode: "CHEN2026",
      inviteLinkToken: "chen-Rx52nlD2026",
      primaryEmail: "amelia@example.com",
      primaryPhone: "952-555-0103",
      mailingAddressLine1: "804 Market Ave",
      city: "Bloomington",
      state: "MN",
      postalCode: "55425",
      invitationStatus: "OPENED",
      guests: [
        { firstName: "Amelia", lastName: "Chen", email: "amelia@example.com", relationshipGroup: "Work", tags: "work" },
        { firstName: "Jordan", lastName: "Lee", email: "jordan@example.com", relationshipGroup: "Friends", tags: "friends,out-of-town" },
        { firstName: "Sam", lastName: "Lee", isAdult: false, isChild: true, relationshipGroup: "Friends", tags: "friends,child" },
      ],
    },
  ];

  const guestsByKey = {};
  for (const householdSeed of households) {
    const { key, guests, ...householdData } = householdSeed;
    const household = await prisma.household.create({ data: householdData });
    guestsByKey[key] = [];
    for (const guestData of guests) {
      guestsByKey[key].push(await prisma.guest.create({ data: { ...guestData, householdId: household.id } }));
    }
  }

  const inviteGuests = async (eventKey, householdKey, guestIndexes, plusOneInvited = false) => {
    for (const guestIndex of guestIndexes) {
      const guest = guestsByKey[householdKey][guestIndex];
      await prisma.eventInvitation.create({
        data: {
          eventId: events[eventKey].id,
          guestId: guest.id,
          householdId: guest.householdId,
          invited: true,
          plusOneInvited,
        },
      });
    }
  };

  for (const key of ["rowell", "johnson", "chen"]) {
    await inviteGuests("ceremony", key, guestsByKey[key].map((_, index) => index));
    await inviteGuests("reception", key, guestsByKey[key].map((_, index) => index), key === "johnson");
  }
  for (const key of ["rowell", "johnson", "chen"]) {
    await inviteGuests("dowry", key, guestsByKey[key].map((_, index) => index));
    await inviteGuests("cookout", key, guestsByKey[key].map((_, index) => index), key === "johnson");
  }

  for (const guest of guestsByKey.rowell) {
    for (const eventKey of ["ceremony", "reception"]) {
      await prisma.rSVP.create({
        data: {
          eventId: events[eventKey].id,
          guestId: guest.id,
          householdId: guest.householdId,
          attending: "YES",
          mealChoice: eventKey === "reception" ? (guest.isChild ? "Kids meal" : "Herb-roasted chicken") : null,
          dietaryRestrictions: guest.firstName === "Denise" ? "Gluten-free preferred" : null,
          submittedAt: new Date(),
        },
      });
    }
  }

  await prisma.registryLink.createMany({
    data: [
      {
        title: "Honeymoon Fund",
        description: "Help us make memories on our first trip as a married couple.",
        url: "https://example.com/honeymoon",
        buttonText: "Contribute",
        sortOrder: 1,
      },
      {
        title: "Home Registry",
        description: "A few pieces we would love as we build our home together.",
        url: "https://example.com/registry",
        buttonText: "View registry",
        sortOrder: 2,
      },
    ],
  });

  await prisma.fAQItem.createMany({
    data: [
      { question: "What should I wear?", answer: "Elegant cocktail attire is perfect. We recommend comfortable shoes for dancing.", category: "Attire", sortOrder: 1 },
      { question: "Can I bring a plus-one?", answer: "Please check your RSVP. Plus-ones are listed only where included on the invitation.", category: "RSVP", sortOrder: 2 },
      { question: "Are children invited?", answer: "Children listed in your household on the RSVP page are warmly invited.", category: "RSVP", sortOrder: 3 },
      { question: "Where should I park?", answer: "Urban Daisy has a venue lot with overflow street parking nearby.", category: "Logistics", sortOrder: 4 },
      { question: "What time should I arrive?", answer: "Please arrive by 4:40 PM so the ceremony can begin promptly at 5:00 PM.", category: "Schedule", sortOrder: 5 },
      { question: "Is the ceremony indoors or outdoors?", answer: "The ceremony and reception are planned indoors at Urban Daisy.", category: "Venue", sortOrder: 6 },
      { question: "Will transportation be provided?", answer: "A shuttle will run from the hotel block to Urban Daisy and back after the reception.", category: "Travel", sortOrder: 7 },
      { question: "Can I take photos during the ceremony?", answer: "We invite you to be fully present during the ceremony. Photos are welcome during cocktail hour and the reception.", category: "Ceremony", sortOrder: 8 },
      { question: "What is the RSVP deadline?", answer: "Please RSVP by April 30, 2027.", category: "RSVP", sortOrder: 9 },
      { question: "Who should I contact with questions?", answer: "Please email andrerowell@outlook.com after checking the FAQ.", category: "Contact", sortOrder: 10 },
    ],
  });

  await prisma.travelSection.createMany({
    data: [
      { title: "Hotel Block", content: "The Hewing Hotel has a courtesy block for wedding guests. Use group code ROWELLBEBE by April 29, 2027.", category: "Hotel", url: "https://example.com/hotel", sortOrder: 1 },
      { title: "Airport", content: "Minneapolis-Saint Paul International Airport is the best airport for out-of-town guests, about 20 minutes from downtown.", category: "Travel", sortOrder: 2 },
      { title: "Wedding Shuttle", content: "Shuttles depart the hotel block at 4:15 PM and 4:35 PM. Return service begins at 10:00 PM.", category: "Transportation", sortOrder: 3 },
      { title: "Things To Do", content: "Explore the North Loop, walk the Stone Arch Bridge, visit the Walker Art Center, or grab coffee near the Mississippi riverfront.", category: "Local", sortOrder: 4 },
      { title: "Packing Notes", content: "Late May in Minneapolis is usually mild, but a light jacket is useful for evening plans.", category: "Weather", sortOrder: 5 },
    ],
  });

  await prisma.photo.createMany({
    data: [
      { title: "A classic frame", caption: "A quiet moment with the car.", imageUrl: "/photos/andre-bebe-car.jpg", sortOrder: 1 },
      { title: "Close", caption: "The kind of portrait we will keep forever.", imageUrl: "/photos/andre-bebe-close.jpg", sortOrder: 2 },
      { title: "The veil", caption: "Soft drama in black and white.", imageUrl: "/photos/bebe-veil-car-bw.jpg", sortOrder: 3 },
      { title: "Golden calm", caption: "Andre and Bebe in the city.", imageUrl: "/photos/andre-bebe-portrait.jpg", sortOrder: 4 },
      { title: "The laugh", caption: "A favorite in-between moment.", imageUrl: "/photos/andre-bebe-car-laugh.jpg", sortOrder: 5 },
      { title: "The look", caption: "Bebe, with Andre just behind.", imageUrl: "/photos/bebe-foreground.jpg", sortOrder: 6 },
      { title: "Embrace", caption: "A tender favorite.", imageUrl: "/photos/andre-bebe-car-embrace.jpg", sortOrder: 7 },
    ],
  });

  await prisma.guestbookEntry.createMany({
    data: [
      { name: "The Rowell Family", message: "We are so grateful to witness this love story. Wishing you a marriage full of grace, joy, and laughter." },
      { name: "Tanya", message: "Cheers to forever. Save me a song on the dance floor." },
      { name: "Amelia", message: "Your day is going to be beautiful because the love already is." },
    ],
  });

  await prisma.auditLog.create({
    data: {
      adminUserId: admin.id,
      action: "SEED_DATABASE",
      entityType: "System",
      metadata: "Initial local development seed",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
