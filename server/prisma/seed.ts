import "../src/lib/loadEnv.ts";
import bcrypt from "bcryptjs";
import { PrismaClient, ProductStatus, SellerStatus, LeadChannel } from "@prisma/client";

const prisma = new PrismaClient();
const COUNT = 100;

const CMS = [
  {
    slug: "about",
    title: "About ApnaMart",
    body: "ApnaMart is India’s B2B marketplace connecting bulk buyers with manufacturers, traders, and distributors.\n\nSearch products, view supplier profiles, and send Get Best Price inquiries. The platform does not process payments or list selling prices — buyers and sellers close deals directly.",
  },
  {
    slug: "contact",
    title: "Contact",
    body: "Buyer and seller support: support@apnamart.example\n\nFor partnership or onboarding, email partners@apnamart.example.\nBuyers contact suppliers using the phone and email shown on verified company profiles.",
  },
  {
    slug: "terms",
    title: "Terms of use",
    body: "ApnaMart is a lead-generation marketplace. We are not a party to purchase contracts between buyers and sellers.\n\nThe platform is not responsible for payment collection, pricing disputes, product quality, delivery, or fraud between parties. Always verify GST and credentials before transacting.",
  },
  {
    slug: "privacy",
    title: "Privacy",
    body: "We store account, product, and inquiry data to operate ApnaMart.\n\nWhen you send an inquiry, your name, email, and phone are shared with the supplier so they can respond. We do not sell contact lists.",
  },
];

const CATEGORY_NAMES = [
  "Industrial supplies",
  "Electronics",
  "Textiles",
  "Machinery",
  "Packaging",
  "Construction",
  "Chemicals",
  "Agriculture",
  "Automotive",
  "Electrical",
  "Plastics",
  "Hardware",
];

const CITIES: [string, string][] = [
  ["Peenya Industrial Area", "Bengaluru"],
  ["Andheri East", "Mumbai"],
  ["Ring Road", "Surat"],
  ["Okhla Industrial Estate", "New Delhi"],
  ["HITEC City", "Hyderabad"],
  ["Bhosari MIDC", "Pune"],
  ["SIDCO Industrial Estate", "Chennai"],
  ["Sitapura Industrial Area", "Jaipur"],
  ["Focal Point", "Ludhiana"],
  ["GIDC Vatva", "Ahmedabad"],
  ["Kinfra Park", "Kochi"],
  ["Export Promotion Park", "Noida"],
];

const FIRST = ["Asha", "Mehul", "Kavita", "Rajiv", "Srinivas", "Neha", "Imran", "Pooja", "Vikram", "Anita"];
const LAST = ["Rao", "Shah", "Desai", "Khanna", "Reddy", "Iyer", "Khan", "Patel", "Singh", "Nair"];

const PRODUCT_TITLES: Record<string, string[]> = {
  "Industrial supplies": [
    "Precision bearing kit",
    "High-tensile hex bolt set",
    "Industrial grease nipples",
    "Workshop C-clamp assortment",
    "Taper roller bearing 6205",
    "SS hose clamp pack",
    "Pneumatic push-fit fittings",
    "Machine leveling pads",
  ],
  Electronics: [
    "Industrial SMPS 24V 10A",
    "PCB assembly service kit",
    "Control panel enclosure",
    "DIN rail terminal blocks",
    "Proximity sensor M18",
    "HMI 7-inch touch panel",
    "Servo motor cable set",
    "PLC relay output module",
  ],
  Textiles: [
    "Cotton mill greige fabric",
    "Polyester suiting rolls",
    "Industrial filter cloth",
    "Canvas dryer fabric",
    "Nonwoven geotextile roll",
    "Terry towel greige",
    "Denim selvedge fabric",
    "PP leno bag fabric",
  ],
  Machinery: [
    "Bench drilling machine",
    "Hydraulic pallet truck",
    "Pillar drill 25mm",
    "Air compressor 3HP",
    "Surface grinder wheel set",
    "CNC turning inserts",
    "Lathe chuck 200mm",
    "Workshop hydraulic press",
  ],
  Packaging: [
    "Corrugated shipper cartons",
    "Machine stretch wrap film",
    "HDPE jerry cans 20L",
    "BOPP tape jumbo roll",
    "EPE foam sheet pack",
    "IBC liner bags",
    "Kraft paper mailers",
    "Wooden pallet collars",
  ],
  Construction: [
    "Cuplock scaffolding set",
    "Ready-mix additive pack",
    "TMT binding wire coil",
    "AAC block adhesive",
    "Waterproofing membrane",
    "Concrete vibrator needle",
    "GI cable tray 100mm",
    "Aluminium formwork panel",
  ],
  Chemicals: [
    "Industrial cleaning solvent",
    "Degreaser concentrate",
    "Water treatment flocculant",
    "Epoxy floor primer",
    "Cutting oil soluble",
    "Boiler descalant",
    "IPA 99% drum",
    "Silicone defoamer",
  ],
  Agriculture: [
    "Drip irrigation fittings pack",
    "HDPE sprinkler pipe",
    "Shade net 75 percent",
    "Power weeder blades",
    "Mulch film 30 micron",
    "Fertilizer injector venturi",
    "Greenhouse UV film",
    "Soil moisture sensor kit",
  ],
  Automotive: [
    "Disc brake pad set",
    "Engine oil filter pack",
    "Radiator coolant hose",
    "Clutch plate assembly",
    "LED headlamp housing",
    "Control arm bush kit",
    "Fuel injector nozzle",
    "Wheel hub bearing",
  ],
  Electrical: [
    "XLPE aluminium cable 4 core",
    "MCB distribution board",
    "LED highbay 150W",
    "Copper lugs assortment",
    "Servo stabilizer 10 kVA",
    "Cable gland PG21 pack",
    "Industrial plug 63A",
    "Earthing electrode kit",
  ],
  Plastics: [
    "PP granule raffia grade",
    "Injection moulded crates",
    "PVC rigid sheet 3mm",
    "HDPE blow moulded drum",
    "ABS sheet for thermoform",
    "Nylon 6 rod 40mm",
    "Polycarbonate corrugated sheet",
    "Plastic pallet 1200x1000",
  ],
  Hardware: [
    "Mortise lock body set",
    "SS tower bolt 8 inch",
    "Furniture connector pack",
    "Door closer hydraulic",
    "Hinge 4 inch stainless",
    "Padlock laminated 50mm",
    "Drawer slide 45mm",
    "Cabinet handle brushed",
  ],
};

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1581094794329-adc0f0252d0d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1558617981-dac3880eac6e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1445205170230-053f8306fed6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80",
];

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

function sellerEmail(i: number): string {
  return i === 1 ? "seller@marketplace.local" : `dealer${pad(i)}@apnamart.demo`;
}

function buyerEmail(i: number): string {
  return i === 1 ? "buyer@marketplace.local" : `buyer${pad(i)}@apnamart.demo`;
}

function phoneFor(i: number, base: number): string {
  return `+91 98${String(base + i).padStart(8, "0")}`;
}

async function upsertProduct(
  sellerId: string,
  categoryId: string,
  title: string,
  description: string,
  images: string[],
): Promise<string> {
  const existing = await prisma.product.findFirst({ where: { sellerId, title } });
  if (existing) {
    await prisma.product.update({
      where: { id: existing.id },
      data: { description, categoryId, status: ProductStatus.APPROVED },
    });
    await prisma.productImage.deleteMany({ where: { productId: existing.id } });
    await prisma.productImage.createMany({
      data: images.map((url, sortOrder) => ({ productId: existing.id, url, sortOrder })),
    });
    return existing.id;
  }
  const created = await prisma.product.create({
    data: {
      sellerId,
      categoryId,
      title,
      description,
      status: ProductStatus.APPROVED,
      images: { create: images.map((url, sortOrder) => ({ url, sortOrder })) },
    },
  });
  return created.id;
}

async function main(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@marketplace.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMeAdmin123";
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const sellerHash = await bcrypt.hash("SellerPass123", 12);
  const buyerHash = await bcrypt.hash("BuyerPass123", 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash: adminHash, name: "Platform Admin", role: "ADMIN" },
  });

  const categories = [];
  for (const name of CATEGORY_NAMES) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    categories.push(
      await prisma.category.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      }),
    );
  }
  const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  for (const page of CMS) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: { title: page.title, body: page.body },
      create: page,
    });
  }

  const productIds: string[] = [];
  const sellerIds: string[] = [];

  for (let i = 1; i <= COUNT; i += 1) {
    const category = CATEGORY_NAMES[(i - 1) % CATEGORY_NAMES.length];
    const titles = PRODUCT_TITLES[category];
    const titleBase = titles[(i - 1) % titles.length];
    const title = i <= titles.length ? titleBase : `${titleBase} ${pad(i)}`;
    const [area, city] = CITIES[(i - 1) % CITIES.length];
    const name = `${FIRST[(i - 1) % FIRST.length]} ${LAST[(i - 1) % LAST.length]}`;
    const companyName =
      i === 1 ? "Rao Industrial Components" : `${LAST[(i - 1) % LAST.length]} ${category.split(" ")[0]} ${pad(i)}`;
    const email = sellerEmail(i);
    const phone = phoneFor(i, 76500000);
    const imageA = IMAGE_POOL[(i - 1) % IMAGE_POOL.length];
    const imageB = IMAGE_POOL[i % IMAGE_POOL.length];

    const sellerUser = await prisma.user.upsert({
      where: { email },
      update: { name, phone, passwordHash: sellerHash, role: "SELLER" },
      create: { email, passwordHash: sellerHash, name, phone, role: "SELLER" },
    });

    const profile = await prisma.sellerProfile.upsert({
      where: { userId: sellerUser.id },
      update: {
        companyName,
        description: `${companyName} supplies ${category.toLowerCase()} to bulk buyers across India. GST invoice and all-India dispatch on inquiry.`,
        address: `${area}, ${city}`,
        website: "https://apnamart.example",
        status: SellerStatus.APPROVED,
        emailInquiriesEnabled: true,
        showEmailPublicly: true,
        whatsappEnabled: true,
        whatsappBusiness: phone.replace(/\s+/g, ""),
        inquiryEmail: email,
      },
      create: {
        userId: sellerUser.id,
        companyName,
        description: `${companyName} supplies ${category.toLowerCase()} to bulk buyers across India. GST invoice and all-India dispatch on inquiry.`,
        address: `${area}, ${city}`,
        website: "https://apnamart.example",
        status: SellerStatus.APPROVED,
        emailInquiriesEnabled: true,
        showEmailPublicly: true,
        whatsappEnabled: true,
        whatsappBusiness: phone.replace(/\s+/g, ""),
        inquiryEmail: email,
      },
    });

    sellerIds.push(profile.id);
    const catRow = categoryByName[category];
    await prisma.sellerCategory.upsert({
      where: { sellerId_categoryId: { sellerId: profile.id, categoryId: catRow.id } },
      update: {},
      create: { sellerId: profile.id, categoryId: catRow.id },
    });

    const productId = await upsertProduct(
      profile.id,
      catRow.id,
      title,
      `${title} for industrial and wholesale buyers. MOQ, GST, and lead time are confirmed after you send a requirement on ApnaMart. Ships from ${city}.`,
      [imageA, imageB],
    );
    productIds.push(productId);
  }

  const buyerIds: string[] = [];
  for (let i = 1; i <= COUNT; i += 1) {
    const [, city] = CITIES[(i + 3) % CITIES.length];
    const name = i === 1 ? "Kiran Mehta" : `${FIRST[i % FIRST.length]} ${LAST[(i + 2) % LAST.length]}`;
    const email = buyerEmail(i);
    const phone = phoneFor(i, 76510000);
    const companyName = i === 1 ? "Mehta Fabrication" : `${LAST[i % LAST.length]} Trading ${pad(i)}`;

    const buyerUser = await prisma.user.upsert({
      where: { email },
      update: { name, phone, passwordHash: buyerHash, role: "BUYER" },
      create: { email, passwordHash: buyerHash, name, phone, role: "BUYER" },
    });
    await prisma.buyerProfile.upsert({
      where: { userId: buyerUser.id },
      update: { companyName, city, whatsapp: phone.replace(/\s+/g, "") },
      create: { userId: buyerUser.id, companyName, city, whatsapp: phone.replace(/\s+/g, "") },
    });
    buyerIds.push(buyerUser.id);
  }

  const leadCount = await prisma.lead.count();
  if (leadCount < COUNT) {
    const channels: LeadChannel[] = ["FORM", "EMAIL", "WHATSAPP"];
    const needed = COUNT - leadCount;
    for (let i = 0; i < needed; i += 1) {
      const buyerId = buyerIds[i % buyerIds.length];
      const sellerId = sellerIds[i % sellerIds.length];
      const productId = productIds[i % productIds.length];
      await prisma.lead.create({
        data: {
          buyerId,
          sellerId,
          productId,
          channel: channels[i % channels.length],
          message: `Need a bulk quote for this listing. Quantity ${50 + i * 5} units. Please share MOQ, GST, and delivery to ${CITIES[i % CITIES.length][1]}.`,
        },
      });
    }
  }

  console.info("Seed complete.");
  console.info(`Sellers ${COUNT} · Products ${COUNT} · Buyers ${COUNT} · Inquiries at least ${COUNT}`);
  console.info(`Admin: ${adminEmail} / ${adminPassword}`);
  console.info("Seller: seller@marketplace.local / SellerPass123");
  console.info("Buyer: buyer@marketplace.local / BuyerPass123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
