import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seed() {
  console.log('🌱 Starting database seed...\n')

  // 1. Create users
  console.log('Creating users...')
  const { error: usersError } = await supabase.from('users').upsert([
    {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'seller1@example.com',
      password_hash: '$2a$10$rQEY7xQxKqWzVxKTmJQz8eHGZZ7X6B5v3KqQz8eHGZZ7X6B5v3Kq',
      email_verified: true
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'seller2@example.com',
      password_hash: '$2a$10$rQEY7xQxKqWzVxKTmJQz8eHGZZ7X6B5v3KqQz8eHGZZ7X6B5v3Kq',
      email_verified: true
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      email: 'buyer1@example.com',
      password_hash: '$2a$10$rQEY7xQxKqWzVxKTmJQz8eHGZZ7X6B5v3KqQz8eHGZZ7X6B5v3Kq',
      email_verified: true
    }
  ], { onConflict: 'id' })

  if (usersError) {
    console.error('Error creating users:', usersError.message)
    return
  }
  console.log('✅ Users created\n')

  // 2. Create profiles
  console.log('Creating profiles...')
  const { error: profilesError } = await supabase.from('profiles').upsert([
    {
      id: 'aaaa1111-aaaa-1111-aaaa-111111111111',
      user_id: '11111111-1111-1111-1111-111111111111',
      email: 'seller1@example.com',
      name: 'Tech Store',
      role: 'USER'
    },
    {
      id: 'bbbb2222-bbbb-2222-bbbb-222222222222',
      user_id: '22222222-2222-2222-2222-222222222222',
      email: 'seller2@example.com',
      name: 'Fashion Hub',
      role: 'USER'
    },
    {
      id: 'cccc3333-cccc-3333-cccc-333333333333',
      user_id: '33333333-3333-3333-3333-333333333333',
      email: 'buyer1@example.com',
      name: 'John Buyer',
      role: 'USER'
    }
  ], { onConflict: 'id' })

  if (profilesError) {
    console.error('Error creating profiles:', profilesError.message)
    return
  }
  console.log('✅ Profiles created\n')

  // 3. Create products
  console.log('Creating products...')
  const products = [
    {
      seller_id: 'aaaa1111-aaaa-1111-aaaa-111111111111',
      title: 'iPhone 14 Pro Max',
      description: 'Excellent condition iPhone 14 Pro Max, 256GB, Deep Purple. Comes with original box and accessories. Battery health at 95%.',
      price: 899.99,
      images: ['https://picsum.photos/seed/iphone/400/400'],
      category: 'Electronics',
      condition: 'LIKE_NEW',
      quantity: 2,
      active: true
    },
    {
      seller_id: 'aaaa1111-aaaa-1111-aaaa-111111111111',
      title: 'MacBook Pro 14" M3',
      description: 'Brand new MacBook Pro 14-inch with M3 chip, 16GB RAM, 512GB SSD. Sealed in box.',
      price: 1999.00,
      images: ['https://picsum.photos/seed/macbook/400/400'],
      category: 'Electronics',
      condition: 'NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: 'aaaa1111-aaaa-1111-aaaa-111111111111',
      title: 'Sony WH-1000XM5 Headphones',
      description: 'Premium noise-canceling headphones. Lightly used for 2 months. Includes carrying case and cables.',
      price: 275.00,
      images: ['https://picsum.photos/seed/headphones/400/400'],
      category: 'Electronics',
      condition: 'GOOD',
      quantity: 3,
      active: true
    },
    {
      seller_id: 'aaaa1111-aaaa-1111-aaaa-111111111111',
      title: 'Nintendo Switch OLED',
      description: 'Nintendo Switch OLED Model - White. Includes dock, Joy-Cons, and 3 games.',
      price: 320.00,
      images: ['https://picsum.photos/seed/switch/400/400'],
      category: 'Electronics',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: 'bbbb2222-bbbb-2222-bbbb-222222222222',
      title: "Vintage Levi's 501 Jeans",
      description: "Authentic vintage Levi's 501 jeans from the 90s. Size 32x32. Great fade and character.",
      price: 85.00,
      images: ['https://picsum.photos/seed/jeans/400/400'],
      category: 'Clothing',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: 'bbbb2222-bbbb-2222-bbbb-222222222222',
      title: 'Nike Air Jordan 1 Retro High',
      description: 'Brand new Nike Air Jordan 1 Retro High OG. Size 10 US. Never worn, with original box.',
      price: 189.00,
      images: ['https://picsum.photos/seed/jordan/400/400'],
      category: 'Clothing',
      condition: 'NEW',
      quantity: 2,
      active: true
    },
    {
      seller_id: 'bbbb2222-bbbb-2222-bbbb-222222222222',
      title: 'Patagonia Fleece Jacket',
      description: 'Classic Patagonia Better Sweater fleece jacket in navy. Size Medium. Minimal wear.',
      price: 95.00,
      images: ['https://picsum.photos/seed/fleece/400/400'],
      category: 'Clothing',
      condition: 'LIKE_NEW',
      quantity: 1,
      active: true
    },
    {
      seller_id: 'aaaa1111-aaaa-1111-aaaa-111111111111',
      title: 'Herman Miller Aeron Chair',
      description: 'Size B Herman Miller Aeron chair. Fully loaded with all adjustments. Some wear on armrests.',
      price: 650.00,
      images: ['https://picsum.photos/seed/chair/400/400'],
      category: 'Home & Garden',
      condition: 'FAIR',
      quantity: 1,
      active: true
    },
    {
      seller_id: 'bbbb2222-bbbb-2222-bbbb-222222222222',
      title: 'Complete Python Programming Book Set',
      description: 'Collection of 5 Python programming books including Fluent Python, Python Crash Course, and more.',
      price: 75.00,
      images: ['https://picsum.photos/seed/books/400/400'],
      category: 'Books',
      condition: 'GOOD',
      quantity: 1,
      active: true
    },
    {
      seller_id: 'aaaa1111-aaaa-1111-aaaa-111111111111',
      title: 'Peloton Bike+',
      description: 'Peloton Bike+ with rotating screen. Includes mat, weights, and heart rate monitor. 500 rides on it.',
      price: 1500.00,
      images: ['https://picsum.photos/seed/peloton/400/400'],
      category: 'Sports',
      condition: 'GOOD',
      quantity: 1,
      active: true
    }
  ]

  const { error: productsError } = await supabase.from('products').insert(products)

  if (productsError) {
    console.error('Error creating products:', productsError.message)
    return
  }
  console.log('✅ Products created (10 items)\n')

  // 4. Create orders
  console.log('Creating orders...')
  const { error: ordersError } = await supabase.from('orders').upsert([
    {
      id: 'dddd1111-dddd-1111-dddd-111111111111',
      order_number: 'ORD-2024-001',
      status: 'DELIVERED',
      total_amount: 1174.99,
      shipping_address: { street: '123 Main St', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' },
      buyer_id: 'cccc3333-cccc-3333-cccc-333333333333',
      seller_id: 'aaaa1111-aaaa-1111-aaaa-111111111111'
    },
    {
      id: 'dddd2222-dddd-2222-dddd-222222222222',
      order_number: 'ORD-2024-002',
      status: 'SHIPPED',
      total_amount: 320.00,
      shipping_address: { street: '123 Main St', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' },
      buyer_id: 'cccc3333-cccc-3333-cccc-333333333333',
      seller_id: 'aaaa1111-aaaa-1111-aaaa-111111111111'
    },
    {
      id: 'dddd3333-dddd-3333-dddd-333333333333',
      order_number: 'ORD-2024-003',
      status: 'DELIVERED',
      total_amount: 274.00,
      shipping_address: { street: '123 Main St', city: 'San Francisco', state: 'CA', zip: '94102', country: 'USA' },
      buyer_id: 'cccc3333-cccc-3333-cccc-333333333333',
      seller_id: 'bbbb2222-bbbb-2222-bbbb-222222222222'
    },
    {
      id: 'dddd4444-dddd-4444-dddd-444444444444',
      order_number: 'ORD-2024-004',
      status: 'PENDING',
      total_amount: 1999.00,
      shipping_address: { street: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'USA' },
      buyer_id: 'cccc3333-cccc-3333-cccc-333333333333',
      seller_id: 'aaaa1111-aaaa-1111-aaaa-111111111111'
    }
  ], { onConflict: 'id' })

  if (ordersError) {
    console.error('Error creating orders:', ordersError.message)
    return
  }
  console.log('✅ Orders created (4 orders)\n')

  // 5. Create order items (need to get product IDs first)
  console.log('Creating order items...')

  const { data: allProducts } = await supabase
    .from('products')
    .select('id, title, price, seller_id')

  if (!allProducts) {
    console.error('Could not fetch products for order items')
    return
  }

  const getProduct = (title: string) => allProducts.find(p => p.title === title)

  const orderItems = [
    { order_id: 'dddd1111-dddd-1111-dddd-111111111111', product: getProduct('iPhone 14 Pro Max'), quantity: 1 },
    { order_id: 'dddd1111-dddd-1111-dddd-111111111111', product: getProduct('Sony WH-1000XM5 Headphones'), quantity: 1 },
    { order_id: 'dddd2222-dddd-2222-dddd-222222222222', product: getProduct('Nintendo Switch OLED'), quantity: 1 },
    { order_id: 'dddd3333-dddd-3333-dddd-333333333333', product: getProduct('Nike Air Jordan 1 Retro High'), quantity: 1 },
    { order_id: 'dddd3333-dddd-3333-dddd-333333333333', product: getProduct("Vintage Levi's 501 Jeans"), quantity: 1 },
    { order_id: 'dddd4444-dddd-4444-dddd-444444444444', product: getProduct('MacBook Pro 14" M3'), quantity: 1 }
  ]
    .filter(item => item.product)
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
    { product: getProduct('iPhone 14 Pro Max'), author_id: 'cccc3333-cccc-3333-cccc-333333333333', rating: 5, comment: 'Absolutely love this phone! Came exactly as described, looks brand new. Fast shipping too!' },
    { product: getProduct('Sony WH-1000XM5 Headphones'), author_id: 'cccc3333-cccc-3333-cccc-333333333333', rating: 4, comment: 'Great headphones, noise cancellation is amazing. Minor scuff on the case but works perfectly.' },
    { product: getProduct('Nike Air Jordan 1 Retro High'), author_id: 'cccc3333-cccc-3333-cccc-333333333333', rating: 5, comment: 'Perfect condition Jordans! Authentic and exactly as pictured. Will buy again from this seller.' },
    { product: getProduct("Vintage Levi's 501 Jeans"), author_id: 'cccc3333-cccc-3333-cccc-333333333333', rating: 4, comment: 'Vintage Levis are fire! Fit is perfect. Took a bit longer to ship but worth the wait.' },
    { product: getProduct('Herman Miller Aeron Chair'), author_id: 'bbbb2222-bbbb-2222-bbbb-222222222222', rating: 5, comment: 'Got this for my home office. The chair is incredibly comfortable even after 8+ hours of work.' },
    { product: getProduct('Patagonia Fleece Jacket'), author_id: 'aaaa1111-aaaa-1111-aaaa-111111111111', rating: 5, comment: 'The Patagonia quality never disappoints. Super warm and stylish!' }
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
  console.log('  - 3 users (seller1, seller2, buyer1)')
  console.log('  - 3 profiles (Tech Store, Fashion Hub, John Buyer)')
  console.log('  - 10 products across 5 categories')
  console.log('  - 4 orders (DELIVERED, SHIPPED, PENDING)')
  console.log('  - 6 order items')
  console.log('  - 6 reviews')
}

seed().catch(console.error)
