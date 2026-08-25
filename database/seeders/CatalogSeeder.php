<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Categories
        $categoriesData = [
            [
                'name' => 'Fashion',
                'slug' => 'fashion',
                'image' => '/resources/js/assets/cat-fashion.jpg',
                'description' => 'Minimalist tailoring, organic cottons, and premium cashmere knitwear.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'image' => '/resources/js/assets/cat-electronics.jpg',
                'description' => 'Acoustic precision and sleek contemporary industrial design.',
                'sort_order' => 2,
            ],
            [
                'name' => 'Accessories',
                'slug' => 'accessories',
                'image' => '/resources/js/assets/cat-accessories.jpg',
                'description' => 'Handcrafted leather goods, titanium frames, and precision timepieces.',
                'sort_order' => 3,
            ],
            [
                'name' => 'Lifestyle & Home',
                'slug' => 'lifestyle',
                'image' => '/resources/js/assets/cat-home.jpg',
                'description' => 'Artisanal room scents, ambient illumination, and curated interior objects.',
                'sort_order' => 4,
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['slug']] = Category::updateOrCreate(
                ['slug' => $cat['slug']],
                $cat
            );
        }

        // 2. Products Data
        $productsData = [
            [
                'category_slug' => 'electronics',
                'name' => 'Atelier Studio Headphones',
                'slug' => 'atelier-studio-headphones',
                'sku' => 'ATL-AUD-001',
                'price' => 149.00,
                'compare_at_price' => 199.00,
                'stock_quantity' => 45,
                'is_featured' => true,
                'is_on_sale' => true,
                'tagline' => 'Ultra-low distortion studio sound with hybrid active noise cancellation.',
                'description' => 'Engineered for acoustic purists, the Atelier Studio Headphones combine bespoke 40mm beryllium drivers with advanced adaptive hybrid noise cancellation. Crafted with lightweight aircraft-grade aluminum and ultra-soft protein leather ear cushions, they deliver up to 45 hours of high-resolution playback on a single charge.',
                'highlights' => [
                    'Custom 40mm Beryllium acoustic drivers',
                    'Adaptive Hybrid Active Noise Cancellation (ANC)',
                    '45-hour continuous battery life with quick charge',
                    'Multipoint Bluetooth 5.3 with lossless aptX Adaptive',
                    'CNC-machined aluminum chassis and memory foam ear pads',
                ],
                'specs' => [
                    ['label' => 'Driver Size', 'value' => '40mm Beryllium Dynamic'],
                    ['label' => 'Frequency Response', 'value' => '10Hz – 40,000Hz'],
                    ['label' => 'Battery Life', 'value' => '45 Hours (ANC On)'],
                    ['label' => 'Connectivity', 'value' => 'Bluetooth 5.3 / 3.5mm Jack / USB-C Audio'],
                    ['label' => 'Weight', 'value' => '245 grams'],
                    ['label' => 'Warranty', 'value' => '2-Year Comprehensive Warranty'],
                ],
                'rating' => 4.90,
                'reviews_count' => 412,
                'images' => [
                    ['url' => '/resources/js/assets/p-headphones.jpg', 'is_primary' => true],
                    ['url' => '/resources/js/assets/p-lamp.jpg', 'is_primary' => false],
                ],
                'variants' => [
                    ['color_name' => 'Matte Obsidian', 'color_hex' => '#1c1c1e', 'image_url' => '/resources/js/assets/p-headphones.jpg'],
                    ['color_name' => 'Raw Aluminum', 'color_hex' => '#d1d5db', 'image_url' => '/resources/js/assets/p-watch.jpg'],
                    ['color_name' => 'Nordic Cream', 'color_hex' => '#ede8df', 'image_url' => '/resources/js/assets/p-knit.jpg'],
                ],
            ],
            [
                'category_slug' => 'accessories',
                'name' => 'Minimal Automatic Chrono Watch',
                'slug' => 'minimal-automatic-chrono-watch',
                'sku' => 'ATL-WAT-002',
                'price' => 389.00,
                'compare_at_price' => 450.00,
                'stock_quantity' => 18,
                'is_featured' => true,
                'is_on_sale' => false,
                'tagline' => 'Swiss-engineered mechanical movement encased in 316L surgical steel.',
                'description' => 'A masterclass in horological reductionism. Features a 38-hour power reserve automatic caliber visible through an anti-reflective sapphire exhibition caseback. Paired with vegetable-tanned Italian bridle leather straps.',
                'highlights' => [
                    'Japanese 24-Jewel Automatic Self-Winding Movement',
                    'Scratch-resistant domed Sapphire Crystal with triple AR coating',
                    '5 ATM / 50M Water Resistance rating',
                    'Quick-release Italian full-grain leather strap',
                ],
                'specs' => [
                    ['label' => 'Case Diameter', 'value' => '39mm'],
                    ['label' => 'Case Thickness', 'value' => '10.2mm'],
                    ['label' => 'Glass', 'value' => 'Domed Sapphire with AR Coating'],
                    ['label' => 'Lug Width', 'value' => '20mm'],
                ],
                'rating' => 4.95,
                'reviews_count' => 184,
                'images' => [
                    ['url' => '/resources/js/assets/p-watch.jpg', 'is_primary' => true],
                    ['url' => '/resources/js/assets/p-headphones.jpg', 'is_primary' => false],
                ],
                'variants' => [
                    ['color_name' => 'Surgical Silver', 'color_hex' => '#94a3b8', 'image_url' => '/resources/js/assets/p-watch.jpg'],
                    ['color_name' => 'Black PVD', 'color_hex' => '#18181b', 'image_url' => '/resources/js/assets/p-headphones.jpg'],
                ],
            ],
            [
                'category_slug' => 'fashion',
                'name' => 'Heavy Rib Cashmere Knit Sweater',
                'slug' => 'heavy-rib-cashmere-knit-sweater',
                'sku' => 'ATL-FSH-003',
                'price' => 240.00,
                'compare_at_price' => 310.00,
                'stock_quantity' => 28,
                'is_featured' => true,
                'is_on_sale' => true,
                'tagline' => '100% Grade-A Mongolian cashmere with tactile fisherman ribbing.',
                'description' => 'Spun from sustainably harvested Mongolian cashmere fleece, this relaxed-fit ribbed knit provides exceptional warmth with virtually weightless softness. Designed with raglan sleeves and substantial double-layered cuffs.',
                'highlights' => [
                    '100% Grade-A Pure Mongolian Cashmere (15.2 micron fibers)',
                    '7-Gauge chunky fisherman rib stitch',
                    'Naturally breathable and temperature-regulating',
                    'Pre-washed for zero shrinkage and ultra-soft handle',
                ],
                'specs' => [
                    ['label' => 'Material', 'value' => '100% Grade-A Mongolian Cashmere'],
                    ['label' => 'Fit', 'value' => 'Relaxed Tailored Silhouette'],
                    ['label' => 'Care', 'value' => 'Dry Clean or Hand Wash Cold'],
                ],
                'rating' => 4.88,
                'reviews_count' => 296,
                'images' => [
                    ['url' => '/resources/js/assets/p-knit.jpg', 'is_primary' => true],
                    ['url' => '/resources/js/assets/cat-fashion.jpg', 'is_primary' => false],
                ],
                'variants' => [
                    ['color_name' => 'Oatmeal Heather', 'color_hex' => '#ede8df', 'image_url' => '/resources/js/assets/p-knit.jpg'],
                    ['color_name' => 'Charcoal Heather', 'color_hex' => '#334155', 'image_url' => '/resources/js/assets/p-headphones.jpg'],
                ],
            ],
            [
                'category_slug' => 'fashion',
                'name' => 'Architectural Low-Top Sneakers',
                'slug' => 'architectural-low-top-sneakers',
                'sku' => 'ATL-FSH-004',
                'price' => 195.00,
                'compare_at_price' => 230.00,
                'stock_quantity' => 32,
                'is_featured' => true,
                'is_on_sale' => false,
                'tagline' => 'Handcrafted in Civitanova Marche with Italian nappa calfskin.',
                'description' => 'A clean silhouette crafted with supple Italian calf leather on a durable Margom vulcanized rubber cupsole. Reinforced with a cushioned antimicrobial leather insole for day-long walking comfort.',
                'highlights' => [
                    'Full-grain Italian Nappa calf leather upper',
                    'Custom Margom Italian rubber cupsole',
                    'Full calfskin lining with cushioned arch support',
                    'Waxed cotton tonal laces',
                ],
                'specs' => [
                    ['label' => 'Upper', 'value' => 'Italian Nappa Leather'],
                    ['label' => 'Sole', 'value' => '100% Vulcanized Margom Rubber'],
                    ['label' => 'Origin', 'value' => 'Handmade in Marche, Italy'],
                ],
                'rating' => 4.84,
                'reviews_count' => 320,
                'images' => [
                    ['url' => '/resources/js/assets/p-sneaker.jpg', 'is_primary' => true],
                    ['url' => '/resources/js/assets/p-bag.jpg', 'is_primary' => false],
                ],
                'variants' => [
                    ['color_name' => 'Chalk White', 'color_hex' => '#f8fafc', 'image_url' => '/resources/js/assets/p-sneaker.jpg'],
                    ['color_name' => 'Raw Suede / Tan', 'color_hex' => '#b45309', 'image_url' => '/resources/js/assets/p-bag.jpg'],
                ],
            ],
            [
                'category_slug' => 'accessories',
                'name' => 'Modular Leather Daypack',
                'slug' => 'modular-leather-daypack',
                'sku' => 'ATL-ACC-005',
                'price' => 280.00,
                'compare_at_price' => 340.00,
                'stock_quantity' => 14,
                'is_featured' => true,
                'is_on_sale' => true,
                'tagline' => 'Full-grain Tuscan leather with waterproof YKK Excella zippers.',
                'description' => 'Built for modern commutes and global transit. Features a dedicated padded 16-inch laptop chamber, magnetic quick-access passport pocket, and breathable ergonomic shoulder harness.',
                'highlights' => [
                    'Vegetable-tanned full-grain Tuscan cowhide',
                    'Dedicated padded compartment for up to 16” MacBook Pro',
                    'Weatherproof YKK Excella gunmetal zips',
                    'Hidden RFID-blocking passport pocket',
                ],
                'specs' => [
                    ['label' => 'Volume', 'value' => '18 Liters Capacity'],
                    ['label' => 'Dimensions', 'value' => '42cm x 29cm x 14cm'],
                    ['label' => 'Weight', 'value' => '1.18 kg'],
                ],
                'rating' => 4.92,
                'reviews_count' => 158,
                'images' => [
                    ['url' => '/resources/js/assets/p-bag.jpg', 'is_primary' => true],
                    ['url' => '/resources/js/assets/cat-accessories.jpg', 'is_primary' => false],
                ],
                'variants' => [
                    ['color_name' => 'Cognac Tan', 'color_hex' => '#b45309', 'image_url' => '/resources/js/assets/p-bag.jpg'],
                    ['color_name' => 'Midnight Black', 'color_hex' => '#0f172a', 'image_url' => '/resources/js/assets/p-headphones.jpg'],
                ],
            ],
            [
                'category_slug' => 'lifestyle',
                'name' => 'Sculptural Marble Desk Lamp',
                'slug' => 'sculptural-marble-desk-lamp',
                'sku' => 'ATL-HOM-006',
                'price' => 175.00,
                'compare_at_price' => 220.00,
                'stock_quantity' => 22,
                'is_featured' => false,
                'is_on_sale' => false,
                'tagline' => 'Solid Nero Marquina marble base with brushed brass dome.',
                'description' => 'Ambient lighting elevated to functional art. Uses a flicker-free 2700K warm LED warm illumination source with continuous rotary brass capacitive touch dimming.',
                'highlights' => [
                    'Solid monolithic Nero Marquina black marble base',
                    'Precision spun brushed solid brass reflector',
                    'Stepless capacitive touch dimmer switch',
                    'Integrated warm 2700K high-CRI LED engine (50,000h lifespan)',
                ],
                'specs' => [
                    ['label' => 'Color Temperature', 'value' => '2700K Warm Ambient'],
                    ['label' => 'Lumen Output', 'value' => '650 Lumens at max'],
                    ['label' => 'Power Cord', 'value' => '2.0m Braided Black Fabric Cable'],
                ],
                'rating' => 4.79,
                'reviews_count' => 94,
                'images' => [
                    ['url' => '/resources/js/assets/p-lamp.jpg', 'is_primary' => true],
                    ['url' => '/resources/js/assets/cat-home.jpg', 'is_primary' => false],
                ],
                'variants' => [
                    ['color_name' => 'Brass & Nero Marquina', 'color_hex' => '#d97706', 'image_url' => '/resources/js/assets/p-lamp.jpg'],
                ],
            ],
            [
                'category_slug' => 'lifestyle',
                'name' => 'Botanical Essence Diffuser',
                'slug' => 'botanical-essence-diffuser',
                'sku' => 'ATL-HOM-007',
                'price' => 88.00,
                'compare_at_price' => 110.00,
                'stock_quantity' => 60,
                'is_featured' => false,
                'is_on_sale' => true,
                'tagline' => 'Hand-poured Grasse essential oils with black rattan reeds.',
                'description' => 'Notes of Hinoki cypress, smoked cedarwood, and crisp bergamot. Housed in custom smoked mouth-blown glass designed to diffuse subtle fragrance for up to 5 months.',
                'highlights' => [
                    'Fragrance formulated and distilled in Grasse, France',
                    'Phthalate-free, paraben-free, 100% natural carrier oil',
                    'Hand-cut porous Japanese black rattan reeds',
                    'Up to 150 days of continuous olfactory diffusion',
                ],
                'specs' => [
                    ['label' => 'Volume', 'value' => '250ml / 8.4 fl. oz.'],
                    ['label' => 'Longevity', 'value' => '4-5 Months continuous diffusion'],
                    ['label' => 'Scent Profile', 'value' => 'Hinoki Cypress, Bergamot, Smoked Cedar'],
                ],
                'rating' => 4.91,
                'reviews_count' => 245,
                'images' => [
                    ['url' => '/resources/js/assets/p-scent.jpg', 'is_primary' => true],
                    ['url' => '/resources/js/assets/p-lamp.jpg', 'is_primary' => false],
                ],
                'variants' => [
                    ['color_name' => 'Smoked Amber', 'color_hex' => '#78350f', 'image_url' => '/resources/js/assets/p-scent.jpg'],
                ],
            ],
            [
                'category_slug' => 'accessories',
                'name' => 'Japanese Titanium Sunglasses',
                'slug' => 'japanese-titanium-sunglasses',
                'sku' => 'ATL-ACC-008',
                'price' => 260.00,
                'compare_at_price' => 310.00,
                'stock_quantity' => 25,
                'is_featured' => true,
                'is_on_sale' => false,
                'tagline' => 'Featherlight beta-titanium frames with Zeiss polarized optics.',
                'description' => 'Precision crafted in Fukui, Japan. Features ultra-lightweight hypoallergenic beta-titanium wire rim construction paired with custom Carl Zeiss CR-39 polarized optical lenses offering 100% UV400 protection.',
                'highlights' => [
                    'Handcrafted in Sabae, Fukui Prefecture, Japan',
                    'Ultra-flexible Grade-5 Beta Titanium frame construction',
                    'Custom Carl Zeiss Category 3 polarized sun lenses',
                    'Custom integrated barrel hinges with anti-loosening screws',
                ],
                'specs' => [
                    ['label' => 'Frame Material', 'value' => 'Beta Titanium Wire'],
                    ['label' => 'Lens Type', 'value' => 'Carl Zeiss Polarized CR-39'],
                    ['label' => 'UV Protection', 'value' => '100% UVA/UVB (UV400)'],
                    ['label' => 'Frame Weight', 'value' => '17.8 grams'],
                ],
                'rating' => 4.86,
                'reviews_count' => 176,
                'images' => [
                    ['url' => '/resources/js/assets/p-sunglasses.jpg', 'is_primary' => true],
                    ['url' => '/resources/js/assets/cat-accessories.jpg', 'is_primary' => false],
                ],
                'variants' => [
                    ['color_name' => 'Matte Gunmetal', 'color_hex' => '#334155', 'image_url' => '/resources/js/assets/p-sunglasses.jpg'],
                    ['color_name' => 'Champagne Gold', 'color_hex' => '#d97706', 'image_url' => '/resources/js/assets/p-watch.jpg'],
                ],
            ],
        ];

        $additionalProducts = [
            ['category_slug' => 'fashion', 'name' => 'Merino Travel Overshirt', 'slug' => 'merino-travel-overshirt', 'sku' => 'ATL-FSH-009', 'price' => 185, 'compare_at_price' => 220, 'image' => '/resources/js/assets/p-knit.jpg'],
            ['category_slug' => 'fashion', 'name' => 'Organic Cotton Poplin Shirt', 'slug' => 'organic-cotton-poplin-shirt', 'sku' => 'ATL-FSH-010', 'price' => 120, 'compare_at_price' => 150, 'image' => '/resources/js/assets/p-knit.jpg'],
            ['category_slug' => 'fashion', 'name' => 'Relaxed Linen Camp Shirt', 'slug' => 'relaxed-linen-camp-shirt', 'sku' => 'ATL-FSH-011', 'price' => 135, 'compare_at_price' => 165, 'image' => '/resources/js/assets/p-knit.jpg'],
            ['category_slug' => 'fashion', 'name' => 'Tailored Wool Trousers', 'slug' => 'tailored-wool-trousers', 'sku' => 'ATL-FSH-012', 'price' => 210, 'compare_at_price' => 250, 'image' => '/resources/js/assets/p-knit.jpg'],
            ['category_slug' => 'fashion', 'name' => 'Brushed Alpaca Cardigan', 'slug' => 'brushed-alpaca-cardigan', 'sku' => 'ATL-FSH-013', 'price' => 265, 'compare_at_price' => 310, 'image' => '/resources/js/assets/p-knit.jpg'],
            ['category_slug' => 'fashion', 'name' => 'Water-Resistant Field Jacket', 'slug' => 'water-resistant-field-jacket', 'sku' => 'ATL-FSH-014', 'price' => 295, 'compare_at_price' => 350, 'image' => '/resources/js/assets/p-knit.jpg'],
            ['category_slug' => 'fashion', 'name' => 'Merino Rib Beanie', 'slug' => 'merino-rib-beanie', 'sku' => 'ATL-FSH-015', 'price' => 58, 'compare_at_price' => 72, 'image' => '/resources/js/assets/p-knit.jpg'],
            ['category_slug' => 'fashion', 'name' => 'Cashmere Lounge Scarf', 'slug' => 'cashmere-lounge-scarf', 'sku' => 'ATL-FSH-016', 'price' => 110, 'compare_at_price' => 135, 'image' => '/resources/js/assets/p-knit.jpg'],
            ['category_slug' => 'electronics', 'name' => 'Compact Wireless Speaker', 'slug' => 'compact-wireless-speaker', 'sku' => 'ATL-AUD-009', 'price' => 129, 'compare_at_price' => 159, 'image' => '/resources/js/assets/p-headphones.jpg'],
            ['category_slug' => 'electronics', 'name' => 'Studio USB-C Microphone', 'slug' => 'studio-usb-c-microphone', 'sku' => 'ATL-AUD-010', 'price' => 175, 'compare_at_price' => 210, 'image' => '/resources/js/assets/p-headphones.jpg'],
            ['category_slug' => 'electronics', 'name' => 'Noise-Isolating Earbuds', 'slug' => 'noise-isolating-earbuds', 'sku' => 'ATL-AUD-011', 'price' => 99, 'compare_at_price' => 129, 'image' => '/resources/js/assets/p-headphones.jpg'],
            ['category_slug' => 'electronics', 'name' => 'Aluminum Laptop Stand', 'slug' => 'aluminum-laptop-stand', 'sku' => 'ATL-DSK-012', 'price' => 85, 'compare_at_price' => 105, 'image' => '/resources/js/assets/p-lamp.jpg'],
            ['category_slug' => 'electronics', 'name' => 'Braided USB-C Cable Set', 'slug' => 'braided-usb-c-cable-set', 'sku' => 'ATL-DSK-013', 'price' => 42, 'compare_at_price' => 55, 'image' => '/resources/js/assets/p-headphones.jpg'],
            ['category_slug' => 'electronics', 'name' => 'Portable E-Ink Notebook', 'slug' => 'portable-e-ink-notebook', 'sku' => 'ATL-DSK-014', 'price' => 199, 'compare_at_price' => 239, 'image' => '/resources/js/assets/p-watch.jpg'],
            ['category_slug' => 'electronics', 'name' => 'Mechanical Desk Timer', 'slug' => 'mechanical-desk-timer', 'sku' => 'ATL-DSK-015', 'price' => 64, 'compare_at_price' => 79, 'image' => '/resources/js/assets/p-watch.jpg'],
            ['category_slug' => 'electronics', 'name' => 'Ambient Light Bar', 'slug' => 'ambient-light-bar', 'sku' => 'ATL-DSK-016', 'price' => 115, 'compare_at_price' => 145, 'image' => '/resources/js/assets/p-lamp.jpg'],
            ['category_slug' => 'accessories', 'name' => 'Slim Italian Leather Wallet', 'slug' => 'slim-italian-leather-wallet', 'sku' => 'ATL-ACC-009', 'price' => 95, 'compare_at_price' => 120, 'image' => '/resources/js/assets/p-bag.jpg'],
            ['category_slug' => 'accessories', 'name' => 'Braided Leather Belt', 'slug' => 'braided-leather-belt', 'sku' => 'ATL-ACC-010', 'price' => 78, 'compare_at_price' => 98, 'image' => '/resources/js/assets/p-bag.jpg'],
            ['category_slug' => 'accessories', 'name' => 'Canvas Travel Organizer', 'slug' => 'canvas-travel-organizer', 'sku' => 'ATL-ACC-011', 'price' => 68, 'compare_at_price' => 85, 'image' => '/resources/js/assets/p-bag.jpg'],
            ['category_slug' => 'accessories', 'name' => 'Sterling Silver Signet Ring', 'slug' => 'sterling-silver-signet-ring', 'sku' => 'ATL-ACC-012', 'price' => 125, 'compare_at_price' => 150, 'image' => '/resources/js/assets/p-watch.jpg'],
            ['category_slug' => 'accessories', 'name' => 'Brushed Steel Cufflinks', 'slug' => 'brushed-steel-cufflinks', 'sku' => 'ATL-ACC-013', 'price' => 88, 'compare_at_price' => 110, 'image' => '/resources/js/assets/p-watch.jpg'],
            ['category_slug' => 'accessories', 'name' => 'Italian Leather Card Case', 'slug' => 'italian-leather-card-case', 'sku' => 'ATL-ACC-014', 'price' => 62, 'compare_at_price' => 78, 'image' => '/resources/js/assets/p-bag.jpg'],
            ['category_slug' => 'accessories', 'name' => 'Chronograph Leather Strap', 'slug' => 'chronograph-leather-strap', 'sku' => 'ATL-WAT-015', 'price' => 72, 'compare_at_price' => 90, 'image' => '/resources/js/assets/p-watch.jpg'],
            ['category_slug' => 'accessories', 'name' => 'Structured Weekender Bag', 'slug' => 'structured-weekender-bag', 'sku' => 'ATL-ACC-016', 'price' => 320, 'compare_at_price' => 390, 'image' => '/resources/js/assets/p-bag.jpg'],
            ['category_slug' => 'lifestyle', 'name' => 'Hand-Thrown Stoneware Vase', 'slug' => 'hand-thrown-stoneware-vase', 'sku' => 'ATL-HOM-009', 'price' => 92, 'compare_at_price' => 115, 'image' => '/resources/js/assets/cat-home.jpg'],
            ['category_slug' => 'lifestyle', 'name' => 'Cedar and Moss Candle', 'slug' => 'cedar-and-moss-candle', 'sku' => 'ATL-HOM-010', 'price' => 48, 'compare_at_price' => 60, 'image' => '/resources/js/assets/p-scent.jpg'],
            ['category_slug' => 'lifestyle', 'name' => 'Linen Table Runner', 'slug' => 'linen-table-runner', 'sku' => 'ATL-HOM-011', 'price' => 55, 'compare_at_price' => 70, 'image' => '/resources/js/assets/cat-home.jpg'],
            ['category_slug' => 'lifestyle', 'name' => 'Oak Serving Board', 'slug' => 'oak-serving-board', 'sku' => 'ATL-HOM-012', 'price' => 75, 'compare_at_price' => 95, 'image' => '/resources/js/assets/cat-home.jpg'],
            ['category_slug' => 'lifestyle', 'name' => 'Recycled Wool Throw', 'slug' => 'recycled-wool-throw', 'sku' => 'ATL-HOM-013', 'price' => 145, 'compare_at_price' => 175, 'image' => '/resources/js/assets/p-knit.jpg'],
            ['category_slug' => 'lifestyle', 'name' => 'Ceramic Incense Holder', 'slug' => 'ceramic-incense-holder', 'sku' => 'ATL-HOM-014', 'price' => 38, 'compare_at_price' => 48, 'image' => '/resources/js/assets/cat-home.jpg'],
            ['category_slug' => 'lifestyle', 'name' => 'Hinoki Bath Salt Soak', 'slug' => 'hinoki-bath-salt-soak', 'sku' => 'ATL-HOM-015', 'price' => 36, 'compare_at_price' => 45, 'image' => '/resources/js/assets/p-scent.jpg'],
            ['category_slug' => 'lifestyle', 'name' => 'Brass Minimalist Tray', 'slug' => 'brass-minimalist-tray', 'sku' => 'ATL-HOM-016', 'price' => 105, 'compare_at_price' => 130, 'image' => '/resources/js/assets/p-lamp.jpg'],
        ];

        $productsData = array_merge($productsData, array_map(function (array $data): array {
            return array_merge([
                'stock_quantity' => 25,
                'is_featured' => false,
                'is_on_sale' => true,
                'tagline' => 'A considered essential designed for everyday use.',
                'description' => 'Thoughtfully designed with durable materials, refined details, and a long service life in mind.',
                'highlights' => ['Purposeful design', 'Durable premium materials', 'Designed for everyday use'],
                'specs' => [['label' => 'Collection', 'value' => 'Atelier Essentials']],
                'rating' => 4.80,
                'reviews_count' => 0,
                'images' => [],
                'variants' => [],
            ], $data, [
                'images' => [
                    ['url' => $data['image'], 'is_primary' => true],
                ],
                'variants' => [
                    ['color_name' => 'Standard', 'color_hex' => '#334155', 'image_url' => $data['image']],
                ],
            ]);
        }, $additionalProducts));

        $demoUser = User::where('email', 'demo@atelier.luxury')->first();

        foreach ($productsData as $data) {
            $cat = $categories[$data['category_slug']];

            $product = Product::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'category_id' => $cat->id,
                    'name' => $data['name'],
                    'sku' => $data['sku'],
                    'price' => $data['price'],
                    'compare_at_price' => $data['compare_at_price'],
                    'original_price' => $data['compare_at_price'],
                    'image' => $data['images'][0]['url'],
                    'gallery' => array_column($data['images'], 'url'),
                    'available_colors' => array_column($data['variants'], 'color_name'),
                    'stock_quantity' => $data['stock_quantity'],
                    'is_featured' => $data['is_featured'],
                    'is_on_sale' => $data['is_on_sale'],
                    'is_active' => true,
                    'tagline' => $data['tagline'],
                    'description' => $data['description'],
                    'highlights' => $data['highlights'],
                    'specs' => $data['specs'],
                    'rating' => $data['rating'],
                    'reviews_count' => $data['reviews_count'],
                ]
            );

            // Images
            foreach ($data['images'] as $idx => $img) {
                ProductImage::firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'image_url' => $img['url'],
                    ],
                    [
                        'is_primary' => $img['is_primary'],
                        'sort_order' => $idx,
                    ]
                );
            }

            // Variants
            foreach ($data['variants'] as $var) {
                ProductVariant::firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'color_name' => $var['color_name'],
                    ],
                    [
                        'color_hex' => $var['color_hex'],
                        'image_url' => $var['image_url'],
                        'stock_quantity' => 20,
                        'additional_price' => 0.00,
                    ]
                );
            }

            // Seed sample reviews
            Review::firstOrCreate(
                [
                    'product_id' => $product->id,
                    'author_name' => 'Marcus Vance',
                ],
                [
                    'user_id' => $demoUser?->id,
                    'rating' => 5,
                    'title' => 'Exceptional craft and uncompromising quality',
                    'comment' => 'The tactile precision and materials are unmatched. Truly feels like a tailored bespoke luxury piece that is built to last decades.',
                    'is_verified_buyer' => true,
                    'status' => 'approved',
                ]
            );

            Review::firstOrCreate(
                [
                    'product_id' => $product->id,
                    'author_name' => 'Sophia Laurent',
                ],
                [
                    'user_id' => null,
                    'rating' => 5,
                    'title' => 'Beyond expectations in every dimension',
                    'comment' => 'Arrived in exquisite minimalist packaging. The attention to ergonomic detail and finish is simply superior.',
                    'is_verified_buyer' => true,
                    'status' => 'approved',
                ]
            );
        }
    }
}