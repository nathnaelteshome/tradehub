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
      images: ['https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&h=500&fit=crop&crop=center'],
      category: 'Electronics',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
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
      images: ['https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=500&h=500&fit=crop&crop=center'],
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
      title: 'Peloton Bike+',
      description: 'Peloton Bike+ with rotating screen. Includes mat, weights, and heart rate monitor. 500 rides on it.',
      price: 1500.00,
      images: ['https://images.unsplash.com/photo-1591291621164-2c6367723315?w=500&h=500&fit=crop&crop=center'],
      category: 'Sports',
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
  console.log('✅ Products created (10 items)\n')

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
  console.log('  - 10 products across 5 categories')
  console.log('  - 4 orders (DELIVERED, SHIPPED, PENDING)')
  console.log('  - 6 order items')
  console.log('  - 6 reviews')
}

seed().catch(console.error)
