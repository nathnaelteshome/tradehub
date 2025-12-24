import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Real user IDs from auth.users
const USERS = {
  JOHN_WICK_GOOGLE: '9b6b2b7b-d040-41cb-92aa-0a8c5c920cb0',
  JOHN_WICK_EMAIL: 'd9ee1786-7664-42c9-8fc8-7963eef56b08',
  NATHNAEL: '4fe4b5a0-73c8-4028-9af7-4e3d7871e9ad',
}

async function seed() {
  console.log('🌱 Starting database seed...\n')

  // 1. Fetch existing profiles (created from auth.users)
  console.log('Fetching profiles...')
  const { data: existingProfiles, error: fetchError } = await supabase
    .from('profiles')
    .select('*')

  if (fetchError) {
    console.error('Error fetching profiles:', fetchError.message)
    return
  }

  // Check if profiles exist for our users
  const profiles = {
    seller1: existingProfiles?.find(p => p.user_id === USERS.JOHN_WICK_GOOGLE),
    seller2: existingProfiles?.find(p => p.user_id === USERS.JOHN_WICK_EMAIL),
    buyer: existingProfiles?.find(p => p.user_id === USERS.NATHNAEL),
  }

  if (!profiles.seller1 || !profiles.seller2 || !profiles.buyer) {
    console.error('Missing profiles. Make sure all users have signed in at least once.')
    console.log('Found profiles:', existingProfiles?.map(p => ({ id: p.id, user_id: p.user_id, name: p.name })))
    return
  }

  console.log('✅ Profiles found:')
  console.log(`   - Seller 1: ${profiles.seller1.name} (${profiles.seller1.id})`)
  console.log(`   - Seller 2: ${profiles.seller2.name} (${profiles.seller2.id})`)
  console.log(`   - Buyer: ${profiles.buyer.name} (${profiles.buyer.id})\n`)

  // 2. Clear existing data (in correct order)
  console.log('Clearing existing data...')
  await supabase.from('dispute_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('disputes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('reviews').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('✅ Existing data cleared\n')

  // 3. Create products
  console.log('Creating products...')
  const products = [
    // ===== ELECTRONICS =====
    {
      seller_id: profiles.seller1.id,
      title: 'iPhone 14 Pro Max',
      description: 'Excellent condition iPhone 14 Pro Max, 256GB, Deep Purple. Comes with original box and accessories. Battery health at 95%.',
      price: 899.99,
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop&crop=center'],
      category: 'Electronics',
      condition: 'LIKE_NEW',
      quantity: 2,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'MacBook Pro 14" M3',
      description: 'Brand new MacBook Pro 14-inch with M3 chip, 16GB RAM, 512GB SSD. Sealed in box.',
      price: 1999.00,
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop&crop=center'],
      category: 'Electronics',
      condition: 'NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Sony WH-1000XM5 Headphones',
      description: 'Premium noise-canceling headphones. Lightly used for 2 months. Includes carrying case and cables.',
      price: 275.00,
      images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&h=500&fit=crop&crop=center'],
      category: 'Electronics',
      condition: 'GOOD',
      quantity: 3,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Nintendo Switch OLED',
      description: 'Nintendo Switch OLED Model - White. Includes dock, Joy-Cons, and 3 games.',
      price: 320.00,
      images: ['https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=500&h=500&fit=crop&crop=center'],
      category: 'Electronics',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'iPad Pro 12.9" M2',
      description: 'iPad Pro 12.9-inch with M2 chip, 256GB, Space Gray. Comes with Apple Pencil 2nd gen and Magic Keyboard.',
      price: 1299.00,
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop&crop=center'],
      category: 'Electronics',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Samsung 65" OLED 4K Smart TV',
      description: 'Samsung S95B 65-inch OLED 4K Smart TV. Stunning picture quality. Wall mount included.',
      price: 1799.00,
      images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&h=500&fit=crop&crop=center'],
      category: 'Electronics',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Canon EOS R6 Mark II',
      description: 'Professional mirrorless camera body. Shutter count under 5000. Includes extra battery and 128GB SD card.',
      price: 2199.00,
      images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop&crop=center'],
      category: 'Electronics',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'DJI Mini 3 Pro Drone',
      description: 'Compact drone with 4K camera. Fly More Combo with extra batteries. Perfect for travel photography.',
      price: 759.00,
      images: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop&crop=center'],
      category: 'Electronics',
      condition: 'NEW',
      quantity: 2,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'PlayStation 5 Digital Edition',
      description: 'PS5 Digital Edition with extra DualSense controller. Includes 5 digital games.',
      price: 399.00,
      images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=500&fit=crop&crop=center'],
      category: 'Electronics',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },

    // ===== CLOTHING =====
    {
      seller_id: profiles.seller2.id,
      title: "Vintage Levi's 501 Jeans",
      description: "Authentic vintage Levi's 501 jeans from the 90s. Size 32x32. Great fade and character.",
      price: 85.00,
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop&crop=center'],
      category: 'Clothing',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Nike Air Jordan 1 Retro High',
      description: 'Brand new Nike Air Jordan 1 Retro High OG. Size 10 US. Never worn, with original box.',
      price: 189.00,
      images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&h=500&fit=crop&crop=center'],
      category: 'Clothing',
      condition: 'NEW',
      quantity: 2,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Patagonia Fleece Jacket',
      description: 'Classic Patagonia Better Sweater fleece jacket in navy. Size Medium. Minimal wear.',
      price: 95.00,
      images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop&crop=center'],
      category: 'Clothing',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Canada Goose Expedition Parka',
      description: 'Authentic Canada Goose Expedition Parka in black. Size Large. Worn one season.',
      price: 750.00,
      images: ['https://images.unsplash.com/photo-1544923246-77307dd628b5?w=500&h=500&fit=crop&crop=center'],
      category: 'Clothing',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Ray-Ban Aviator Classic',
      description: 'Authentic Ray-Ban Aviator sunglasses. Gold frame with green G-15 lenses. Includes case.',
      price: 120.00,
      images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop&crop=center'],
      category: 'Clothing',
      condition: 'LIKE_NEW',
      quantity: 3,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Rolex Submariner Homage Watch',
      description: 'High-quality automatic dive watch. Sapphire crystal, ceramic bezel. Swiss movement.',
      price: 450.00,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&crop=center'],
      category: 'Clothing',
      condition: 'NEW',
      quantity: 2,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Adidas Ultraboost 22',
      description: 'Adidas Ultraboost 22 running shoes. Core Black colorway. Size 11 US. Barely worn.',
      price: 110.00,
      images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=500&fit=crop&crop=center'],
      category: 'Clothing',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },

    // ===== HOME & GARDEN =====
    {
      seller_id: profiles.seller1.id,
      title: 'Herman Miller Aeron Chair',
      description: 'Size B Herman Miller Aeron chair. Fully loaded with all adjustments. Some wear on armrests.',
      price: 650.00,
      images: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&h=500&fit=crop&crop=center'],
      category: 'Home & Garden',
      condition: 'FAIR',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'KitchenAid Stand Mixer',
      description: 'KitchenAid Artisan 5-Quart Stand Mixer in Empire Red. Includes 3 attachments.',
      price: 299.00,
      images: ['https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=500&h=500&fit=crop&crop=center'],
      category: 'Home & Garden',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Dyson V15 Detect Vacuum',
      description: 'Dyson V15 Detect cordless vacuum with laser dust detection. All accessories included.',
      price: 549.00,
      images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500&h=500&fit=crop&crop=center'],
      category: 'Home & Garden',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Philips Hue Starter Kit',
      description: 'Philips Hue White and Color Ambiance starter kit. Includes 4 bulbs and bridge.',
      price: 159.00,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&crop=center'],
      category: 'Home & Garden',
      condition: 'NEW',
      quantity: 3,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'West Elm Mid-Century Coffee Table',
      description: 'West Elm Reeve Mid-Century coffee table in walnut. Minor surface scratches.',
      price: 350.00,
      images: ['https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500&h=500&fit=crop&crop=center'],
      category: 'Home & Garden',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Monstera Deliciosa Plant',
      description: 'Large healthy Monstera Deliciosa in 10" ceramic pot. About 3 feet tall with beautiful fenestrations.',
      price: 75.00,
      images: ['https://images.unsplash.com/photo-1614594975525-e45c8f0a14c1?w=500&h=500&fit=crop&crop=center'],
      category: 'Home & Garden',
      condition: 'NEW',
      quantity: 2,
      active: true
    },

    // ===== SPORTS =====
    {
      seller_id: profiles.seller1.id,
      title: 'Peloton Bike+',
      description: 'Peloton Bike+ with rotating screen. Includes mat, weights, and heart rate monitor. 500 rides on it.',
      price: 1500.00,
      images: ['https://images.unsplash.com/photo-1591291621164-2c6367723315?w=500&h=500&fit=crop&crop=center'],
      category: 'Sports',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'TaylorMade Stealth Driver',
      description: 'TaylorMade Stealth 2 Driver 10.5° with Ventus stiff shaft. Head cover included.',
      price: 399.00,
      images: ['https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500&h=500&fit=crop&crop=center'],
      category: 'Sports',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Yeti Tundra 65 Cooler',
      description: 'Yeti Tundra 65 hard cooler in Tan. Bear-resistant certified. Perfect for camping.',
      price: 299.00,
      images: ['https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500&h=500&fit=crop&crop=center'],
      category: 'Sports',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Specialized Sirrus X 4.0',
      description: 'Specialized Sirrus X 4.0 hybrid bike. Carbon fork, hydraulic disc brakes. Size Large.',
      price: 899.00,
      images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&h=500&fit=crop&crop=center'],
      category: 'Sports',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Bowflex SelectTech 552 Dumbbells',
      description: 'Bowflex SelectTech 552 adjustable dumbbells pair. 5-52.5 lbs each. Includes stand.',
      price: 399.00,
      images: ['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&h=500&fit=crop&crop=center'],
      category: 'Sports',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Burton Custom Snowboard',
      description: 'Burton Custom 158cm snowboard with Burton Cartel bindings. Great all-mountain board.',
      price: 450.00,
      images: ['https://images.unsplash.com/photo-1522056615691-da7b8106c665?w=500&h=500&fit=crop&crop=center'],
      category: 'Sports',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },

    // ===== BOOKS =====
    {
      seller_id: profiles.seller2.id,
      title: 'Complete Python Programming Book Set',
      description: 'Collection of 5 Python programming books including Fluent Python, Python Crash Course, and more.',
      price: 75.00,
      images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=500&fit=crop&crop=center'],
      category: 'Books',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'The Lord of the Rings Illustrated Edition',
      description: 'Deluxe illustrated edition of The Lord of the Rings by J.R.R. Tolkien. Hardcover, like new.',
      price: 55.00,
      images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop&crop=center'],
      category: 'Books',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Design Patterns: Gang of Four',
      description: 'Classic software engineering book. Design Patterns by Gamma, Helm, Johnson, Vlissides. Hardcover.',
      price: 45.00,
      images: ['https://images.unsplash.com/photo-1589998059171-988d887df646?w=500&h=500&fit=crop&crop=center'],
      category: 'Books',
      condition: 'GOOD',
      quantity: 2,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Cookbook Collection - 10 Books',
      description: 'Collection of 10 popular cookbooks including Salt Fat Acid Heat, The Food Lab, and more.',
      price: 120.00,
      images: ['https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=500&h=500&fit=crop&crop=center'],
      category: 'Books',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },

    // ===== TOYS =====
    {
      seller_id: profiles.seller1.id,
      title: 'LEGO Star Wars Millennium Falcon',
      description: 'LEGO Star Wars UCS Millennium Falcon 75192. Complete with all pieces and minifigures. Built once.',
      price: 699.00,
      images: ['https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=500&h=500&fit=crop&crop=center'],
      category: 'Toys',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Vintage Transformers G1 Optimus Prime',
      description: 'Original 1984 Transformers G1 Optimus Prime. Complete with trailer and accessories.',
      price: 350.00,
      images: ['https://images.unsplash.com/photo-1558507652-2d9626c4e67a?w=500&h=500&fit=crop&crop=center'],
      category: 'Toys',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Hot Wheels Collection - 50 Cars',
      description: 'Collection of 50 Hot Wheels cars from the 2010s-2020s. Includes carrying case.',
      price: 85.00,
      images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500&h=500&fit=crop&crop=center'],
      category: 'Toys',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Board Game Bundle - 8 Games',
      description: 'Collection of 8 popular board games: Catan, Ticket to Ride, Pandemic, Azul, and more.',
      price: 150.00,
      images: ['https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=500&h=500&fit=crop&crop=center'],
      category: 'Toys',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },

    // ===== AUTOMOTIVE =====
    {
      seller_id: profiles.seller1.id,
      title: 'WeatherTech Floor Mats - Tesla Model 3',
      description: 'WeatherTech FloorLiner set for Tesla Model 3. Front and rear mats. Black color.',
      price: 175.00,
      images: ['https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=500&h=500&fit=crop&crop=center'],
      category: 'Automotive',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Thule Roof Rack System',
      description: 'Thule WingBar Evo roof rack system. Fits most vehicles with raised rails. Very quiet.',
      price: 350.00,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&crop=center'],
      category: 'Automotive',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Michelin Pilot Sport 4S Tires',
      description: 'Set of 4 Michelin Pilot Sport 4S tires. Size 245/40R18. About 70% tread remaining.',
      price: 450.00,
      images: ['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&h=500&fit=crop&crop=center'],
      category: 'Automotive',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'NOCO Boost Pro Jump Starter',
      description: 'NOCO Boost Pro GB150 3000 Amp jump starter. Can start any gas or diesel engine up to 10L.',
      price: 199.00,
      images: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&h=500&fit=crop&crop=center'],
      category: 'Automotive',
      condition: 'NEW',
      quantity: 2,
      active: true
    },

    // ===== HEALTH & BEAUTY =====
    {
      seller_id: profiles.seller2.id,
      title: 'Dyson Airwrap Complete',
      description: 'Dyson Airwrap Complete hair styler with all attachments. Used a few times, like new condition.',
      price: 449.00,
      images: ['https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=500&h=500&fit=crop&crop=center'],
      category: 'Health & Beauty',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Theragun Pro Massage Device',
      description: 'Theragun Pro percussive therapy device. Includes all attachments and carrying case.',
      price: 349.00,
      images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop&crop=center'],
      category: 'Health & Beauty',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Foreo Luna 3 Facial Cleanser',
      description: 'Foreo Luna 3 silicone facial cleansing device. Normal skin version. Barely used.',
      price: 149.00,
      images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop&crop=center'],
      category: 'Health & Beauty',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Vitamix A3500 Blender',
      description: 'Vitamix Ascent A3500 smart blender. Stainless steel finish. Self-cleaning, touchscreen.',
      price: 499.00,
      images: ['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&h=500&fit=crop&crop=center'],
      category: 'Health & Beauty',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },

    // ===== OTHER =====
    {
      seller_id: profiles.seller1.id,
      title: 'Vintage Polaroid SX-70 Camera',
      description: 'Classic Polaroid SX-70 instant camera in chrome/tan. Fully functional, recently serviced.',
      price: 275.00,
      images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop&crop=center'],
      category: 'Other',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Acoustic Guitar - Martin D-28',
      description: 'Martin D-28 acoustic guitar. Solid Sitka spruce top, rosewood back and sides. Beautiful tone.',
      price: 2200.00,
      images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&h=500&fit=crop&crop=center'],
      category: 'Other',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: profiles.seller1.id,
      title: 'Beginner Art Supplies Kit',
      description: 'Complete art supplies kit with acrylic paints, brushes, canvases, and easel. Great for beginners.',
      price: 89.00,
      images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=500&fit=crop&crop=center'],
      category: 'Other',
      condition: 'NEW',
      quantity: 3,
      active: true
    },
    {
      seller_id: profiles.seller2.id,
      title: 'Vintage Vinyl Record Collection',
      description: 'Collection of 25 classic rock vinyl records. Beatles, Pink Floyd, Led Zeppelin, and more.',
      price: 350.00,
      images: ['https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=500&h=500&fit=crop&crop=center'],
      category: 'Other',
      condition: 'GOOD',
      quantity: 1,
      active: true
    }
  ]

  const { data: insertedProducts, error: productsError } = await supabase
    .from('products')
    .insert(products)
    .select()

  if (productsError) {
    console.error('Error creating products:', productsError.message)
    return
  }
  console.log(`✅ Products created (${products.length} items)\n`)

  // 4. Create orders
  console.log('Creating orders...')
  const orders = [
    {
      order_number: 'ORD-2024-001',
      status: 'DELIVERED',
      total_amount: 1174.99,
      shipping_address: { street: '123 Main St', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' },
      buyer_id: profiles.buyer.id,
      seller_id: profiles.seller1.id
    },
    {
      order_number: 'ORD-2024-002',
      status: 'SHIPPED',
      total_amount: 320.00,
      shipping_address: { street: '123 Main St', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' },
      buyer_id: profiles.buyer.id,
      seller_id: profiles.seller1.id
    },
    {
      order_number: 'ORD-2024-003',
      status: 'DELIVERED',
      total_amount: 274.00,
      shipping_address: { street: '123 Main St', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' },
      buyer_id: profiles.buyer.id,
      seller_id: profiles.seller2.id
    },
    {
      order_number: 'ORD-2024-004',
      status: 'PENDING',
      total_amount: 1999.00,
      shipping_address: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA' },
      buyer_id: profiles.buyer.id,
      seller_id: profiles.seller1.id
    }
  ]

  const { data: insertedOrders, error: ordersError } = await supabase
    .from('orders')
    .insert(orders)
    .select()

  if (ordersError) {
    console.error('Error creating orders:', ordersError.message)
    return
  }
  console.log('✅ Orders created (4 orders)\n')

  // 5. Create order items
  console.log('Creating order items...')

  const getProduct = (title: string) => insertedProducts?.find(p => p.title === title)
  const getOrder = (orderNumber: string) => insertedOrders?.find(o => o.order_number === orderNumber)

  const orderItems = [
    { order_id: getOrder('ORD-2024-001')?.id, product: getProduct('iPhone 14 Pro Max'), quantity: 1 },
    { order_id: getOrder('ORD-2024-001')?.id, product: getProduct('Sony WH-1000XM5 Headphones'), quantity: 1 },
    { order_id: getOrder('ORD-2024-002')?.id, product: getProduct('Nintendo Switch OLED'), quantity: 1 },
    { order_id: getOrder('ORD-2024-003')?.id, product: getProduct('Nike Air Jordan 1 Retro High'), quantity: 1 },
    { order_id: getOrder('ORD-2024-003')?.id, product: getProduct("Vintage Levi's 501 Jeans"), quantity: 1 },
    { order_id: getOrder('ORD-2024-004')?.id, product: getProduct('MacBook Pro 14" M3'), quantity: 1 }
  ]
    .filter(item => item.product && item.order_id)
    .map(item => ({
      order_id: item.order_id,
      product_id: item.product!.id,
      quantity: item.quantity,
      price: item.product!.price
    }))

  const { error: orderItemsError } = await supabase.from('order_items').insert(orderItems)

  if (orderItemsError) {
    console.error('Error creating order items:', orderItemsError.message)
    return
  }
  console.log('✅ Order items created\n')

  // 6. Create reviews
  console.log('Creating reviews...')

  const reviews = [
    { product: getProduct('iPhone 14 Pro Max'), author_id: profiles.buyer.id, rating: 5, comment: 'Absolutely love this phone! Came exactly as described, looks brand new. Fast shipping too!' },
    { product: getProduct('Sony WH-1000XM5 Headphones'), author_id: profiles.buyer.id, rating: 4, comment: 'Great headphones, noise cancellation is amazing. Minor scuff on the case but works perfectly.' },
    { product: getProduct('Nike Air Jordan 1 Retro High'), author_id: profiles.buyer.id, rating: 5, comment: 'Perfect condition Jordans! Authentic and exactly as pictured. Will buy again from this seller.' },
    { product: getProduct("Vintage Levi's 501 Jeans"), author_id: profiles.buyer.id, rating: 4, comment: 'Vintage Levis are fire! Fit is perfect. Took a bit longer to ship but worth the wait.' },
    { product: getProduct('Herman Miller Aeron Chair'), author_id: profiles.seller2.id, rating: 5, comment: 'Got this for my home office. The chair is incredibly comfortable even after 8+ hours of work.' },
    { product: getProduct('Patagonia Fleece Jacket'), author_id: profiles.seller1.id, rating: 5, comment: 'The Patagonia quality never disappoints. Super warm and stylish!' }
  ]
    .filter(r => r.product)
    .map(r => ({
      product_id: r.product!.id,
      author_id: r.author_id,
      rating: r.rating,
      comment: r.comment
    }))

  const { error: reviewsError } = await supabase.from('reviews').insert(reviews)

  if (reviewsError) {
    console.error('Error creating reviews:', reviewsError.message)
    return
  }
  console.log('✅ Reviews created (6 reviews)\n')

  console.log('🎉 Database seeded successfully!')
  console.log('\nSummary:')
  console.log(`  - Using ${existingProfiles?.length} existing profiles from auth.users`)
  console.log(`  - ${products.length} products across 9 categories`)
  console.log('  - 4 orders (DELIVERED, SHIPPED, PENDING)')
  console.log('  - 6 order items')
  console.log('  - 6 reviews')
}

seed().catch(console.error)
