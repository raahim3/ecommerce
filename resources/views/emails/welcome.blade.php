<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Atelier</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #0f172a;
            padding: 36px 30px;
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 0.15em;
            color: #ffffff;
            text-transform: uppercase;
        }
        .logo-dot {
            color: #8b5cf6;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
        }
        h1 {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 0;
        }
        p {
            font-size: 15px;
            color: #475569;
            margin-bottom: 20px;
        }
        .promo-box {
            background-color: #f5f3ff;
            border: 1px dashed #8b5cf6;
            border-radius: 12px;
            padding: 16px 20px;
            text-align: center;
            margin: 24px 0;
        }
        .promo-title {
            font-size: 13px;
            font-weight: 700;
            color: #6d28d9;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .promo-code {
            font-size: 20px;
            font-weight: 900;
            color: #4c1d95;
            letter-spacing: 0.1em;
            margin-top: 4px;
        }
        .button {
            display: inline-block;
            background-color: #0f172a;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: 700;
            text-align: center;
            margin-top: 10px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 24px 30px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ATELIER<span class="logo-dot">.</span></div>
        </div>
        <div class="content">
            <h1>Welcome, {{ $user->name }}!</h1>
            <p>Thank you for creating an account with <strong>Atelier</strong>. Your journey into curated essentials, timeless luxury, and artisanal craftsmanship starts here.</p>
            
            <div class="promo-box">
                <div class="promo-title">Special Welcome Privilege (10% Off)</div>
                <div class="promo-code">ATELIER10</div>
            </div>

            <p>Use code <strong>ATELIER10</strong> at checkout on your first order. Explore our newly released collections curated for modern living.</p>
            
            <div style="text-align: center; margin: 30px 0 10px;">
                <a href="{{ url('/shop') }}" class="button">Explore New Arrivals &rarr;</a>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Atelier Luxury Goods. All rights reserved.<br>
            If you did not create this account, please disregard this email.
        </div>
    </div>
</body>
</html>