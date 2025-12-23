import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
// Use onboarding@resend.dev for testing (Resend's default sender for unverified domains)
const FROM_EMAIL = process.env.FROM_EMAIL || 'TradeHub <onboarding@resend.dev>'

interface OrderEmailData {
  orderNumber: string
  totalAmount: string
  items: { title: string; quantity: number; price: number }[]
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderData: OrderEmailData
): Promise<void> {
  if (!resend) {
    console.warn('Email service not configured - RESEND_API_KEY missing')
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Order Confirmation #${orderData.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .order-details { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; }
              .item { padding: 10px 0; border-bottom: 1px solid #ddd; }
              .item:last-child { border-bottom: none; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Order Confirmed!</h1>
              <p>Thank you for your order. Your order has been confirmed and is being processed.</p>
              <div class="order-details">
                <h3>Order #${orderData.orderNumber}</h3>
                <p><strong>Total:</strong> $${orderData.totalAmount}</p>
                <h4>Items:</h4>
                ${orderData.items
                  .map(
                    (item) => `
                  <div class="item">
                    <strong>${item.title}</strong><br>
                    Quantity: ${item.quantity} × $${item.price.toFixed(2)}
                  </div>
                `
                  )
                  .join('')}
              </div>
              <p>You can track your order status from your dashboard.</p>
              <div class="footer">
                <p>Questions? Contact our support team.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log(`Order confirmation email sent to ${email}`)
  } catch (error) {
    console.error(`Failed to send order confirmation email to ${email}:`, error)
    // Don't throw - order is already created
  }
}

export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Email service not configured - RESEND_API_KEY missing')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to TradeHub!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button { background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Welcome to TradeHub, ${name}!</h1>
              <p>Thank you for creating an account. You're now ready to start buying and selling on TradeHub.</p>
              <p>Here's what you can do:</p>
              <ul>
                <li>Browse products from sellers</li>
                <li>List your own items for sale</li>
                <li>Track your orders and sales</li>
              </ul>
              <p><a href="${appUrl}/products" class="button">Start Shopping</a></p>
              <div class="footer">
                <p>If you didn't create this account, please ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    console.log(`Welcome email sent to ${email}`)
    return { success: true }
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}:`, error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
