<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('cities')) {
            Schema::create('cities', function (Blueprint $table) {
                $table->id();
                $table->string('name', 255);
                $table->unsignedBigInteger('state_id')->index();
                $table->string('state_code', 10)->nullable();
                $table->unsignedBigInteger('country_id')->default(167)->index();
                $table->string('country_code', 5)->default('PK');
                $table->decimal('latitude', 10, 8)->nullable();
                $table->decimal('longitude', 11, 8)->nullable();
                $table->timestamps();
                $table->string('flag', 10)->default('1')->nullable();
                $table->string('wikiDataId', 255)->nullable();
            });
        }

        // Seed Pakistan cities
        $pakistanCities = [
            // 3169: Islamabad
            ['state_id' => 3169, 'name' => 'Islamabad'],

            // 3175: Sindh
            ['state_id' => 3175, 'name' => 'Karachi'],
            ['state_id' => 3175, 'name' => 'Hyderabad'],
            ['state_id' => 3175, 'name' => 'Sukkur'],
            ['state_id' => 3175, 'name' => 'Larkana'],
            ['state_id' => 3175, 'name' => 'Nawabshah (Shaheed Benazirabad)'],
            ['state_id' => 3175, 'name' => 'Mirpur Khas'],
            ['state_id' => 3175, 'name' => 'Jacobabad'],
            ['state_id' => 3175, 'name' => 'Shikarpur'],
            ['state_id' => 3175, 'name' => 'Khairpur'],
            ['state_id' => 3175, 'name' => 'Dadu'],
            ['state_id' => 3175, 'name' => 'Thatta'],
            ['state_id' => 3175, 'name' => 'Badin'],
            ['state_id' => 3175, 'name' => 'Tando Adam'],
            ['state_id' => 3175, 'name' => 'Tando Allahyar'],
            ['state_id' => 3175, 'name' => 'Kotri'],
            ['state_id' => 3175, 'name' => 'Ghotki'],
            ['state_id' => 3175, 'name' => 'Kashmore'],
            ['state_id' => 3175, 'name' => 'Umerkot'],
            ['state_id' => 3175, 'name' => 'Sanghar'],
            ['state_id' => 3175, 'name' => 'Mithi'],
            ['state_id' => 3175, 'name' => 'Matiari'],

            // 3176: Punjab
            ['state_id' => 3176, 'name' => 'Lahore'],
            ['state_id' => 3176, 'name' => 'Faisalabad'],
            ['state_id' => 3176, 'name' => 'Rawalpindi'],
            ['state_id' => 3176, 'name' => 'Multan'],
            ['state_id' => 3176, 'name' => 'Gujranwala'],
            ['state_id' => 3176, 'name' => 'Sialkot'],
            ['state_id' => 3176, 'name' => 'Sargodha'],
            ['state_id' => 3176, 'name' => 'Bahawalpur'],
            ['state_id' => 3176, 'name' => 'Jhang'],
            ['state_id' => 3176, 'name' => 'Sheikhupura'],
            ['state_id' => 3176, 'name' => 'Gujrat'],
            ['state_id' => 3176, 'name' => 'Kasur'],
            ['state_id' => 3176, 'name' => 'Rahim Yar Khan'],
            ['state_id' => 3176, 'name' => 'Sahiwal'],
            ['state_id' => 3176, 'name' => 'Okara'],
            ['state_id' => 3176, 'name' => 'Wah Cantonment'],
            ['state_id' => 3176, 'name' => 'Dera Ghazi Khan'],
            ['state_id' => 3176, 'name' => 'Chakwal'],
            ['state_id' => 3176, 'name' => 'Kamoke'],
            ['state_id' => 3176, 'name' => 'Hafizabad'],
            ['state_id' => 3176, 'name' => 'Mandi Bahauddin'],
            ['state_id' => 3176, 'name' => 'Jhelum'],
            ['state_id' => 3176, 'name' => 'Khanewal'],
            ['state_id' => 3176, 'name' => 'Muzaffargarh'],
            ['state_id' => 3176, 'name' => 'Burewala'],
            ['state_id' => 3176, 'name' => 'Bahawalnagar'],
            ['state_id' => 3176, 'name' => 'Muridke'],
            ['state_id' => 3176, 'name' => 'Pakpattan'],
            ['state_id' => 3176, 'name' => 'Vehari'],
            ['state_id' => 3176, 'name' => 'Toba Tek Singh'],
            ['state_id' => 3176, 'name' => 'Attock'],
            ['state_id' => 3176, 'name' => 'Chiniot'],
            ['state_id' => 3176, 'name' => 'Mianwali'],
            ['state_id' => 3176, 'name' => 'Layyah'],
            ['state_id' => 3176, 'name' => 'Lodhran'],
            ['state_id' => 3176, 'name' => 'Bhakkar'],
            ['state_id' => 3176, 'name' => 'Khushab'],
            ['state_id' => 3176, 'name' => 'Narowal'],
            ['state_id' => 3176, 'name' => 'Nankana Sahib'],

            // 3171: Khyber Pakhtunkhwa
            ['state_id' => 3171, 'name' => 'Peshawar'],
            ['state_id' => 3171, 'name' => 'Mardan'],
            ['state_id' => 3171, 'name' => 'Mingora (Swat)'],
            ['state_id' => 3171, 'name' => 'Kohat'],
            ['state_id' => 3171, 'name' => 'Abbottabad'],
            ['state_id' => 3171, 'name' => 'Dera Ismail Khan'],
            ['state_id' => 3171, 'name' => 'Nowshera'],
            ['state_id' => 3171, 'name' => 'Mansehra'],
            ['state_id' => 3171, 'name' => 'Charsadda'],
            ['state_id' => 3171, 'name' => 'Swabi'],
            ['state_id' => 3171, 'name' => 'Haripur'],
            ['state_id' => 3171, 'name' => 'Bannu'],
            ['state_id' => 3171, 'name' => 'Batkhela'],
            ['state_id' => 3171, 'name' => 'Timergara'],
            ['state_id' => 3171, 'name' => 'Karak'],
            ['state_id' => 3171, 'name' => 'Hangu'],
            ['state_id' => 3171, 'name' => 'Chitral'],
            ['state_id' => 3171, 'name' => 'Dir'],
            ['state_id' => 3171, 'name' => 'Tank'],

            // 3174: Balochistan
            ['state_id' => 3174, 'name' => 'Quetta'],
            ['state_id' => 3174, 'name' => 'Turbat'],
            ['state_id' => 3174, 'name' => 'Khuzdar'],
            ['state_id' => 3174, 'name' => 'Hub'],
            ['state_id' => 3174, 'name' => 'Chaman'],
            ['state_id' => 3174, 'name' => 'Gwadar'],
            ['state_id' => 3174, 'name' => 'Sibi'],
            ['state_id' => 3174, 'name' => 'Zhob'],
            ['state_id' => 3174, 'name' => 'Dera Murad Jamali'],
            ['state_id' => 3174, 'name' => 'Usta Mohammad'],
            ['state_id' => 3174, 'name' => 'Loralai'],
            ['state_id' => 3174, 'name' => 'Pasni'],
            ['state_id' => 3174, 'name' => 'Kharan'],
            ['state_id' => 3174, 'name' => 'Nushki'],
            ['state_id' => 3174, 'name' => 'Kalat'],
            ['state_id' => 3174, 'name' => 'Panjgur'],
            ['state_id' => 3174, 'name' => 'Pishin'],

            // 3172: Azad Kashmir
            ['state_id' => 3172, 'name' => 'Muzaffarabad'],
            ['state_id' => 3172, 'name' => 'Mirpur'],
            ['state_id' => 3172, 'name' => 'Rawalakot'],
            ['state_id' => 3172, 'name' => 'Kotli'],
            ['state_id' => 3172, 'name' => 'Bhimber'],
            ['state_id' => 3172, 'name' => 'Bagh'],
            ['state_id' => 3172, 'name' => 'Pallandri'],
            ['state_id' => 3172, 'name' => 'Hattian Bala'],
            ['state_id' => 3172, 'name' => 'Haveli'],
            ['state_id' => 3172, 'name' => 'Athmuqam (Neelum)'],

            // 3170: Gilgit-Baltistan
            ['state_id' => 3170, 'name' => 'Gilgit'],
            ['state_id' => 3170, 'name' => 'Skardu'],
            ['state_id' => 3170, 'name' => 'Chilas'],
            ['state_id' => 3170, 'name' => 'Hunza (Karimabad)'],
            ['state_id' => 3170, 'name' => 'Ghanche (Khaplu)'],
            ['state_id' => 3170, 'name' => 'Ghizer (Gahkuch)'],
            ['state_id' => 3170, 'name' => 'Astore'],
            ['state_id' => 3170, 'name' => 'Nagar'],
            ['state_id' => 3170, 'name' => 'Shigar'],
            ['state_id' => 3170, 'name' => 'Kharmang'],
        ];

        $now = now();
        $insertData = [];
        foreach ($pakistanCities as $c) {
            $insertData[] = [
                'name' => $c['name'],
                'state_id' => $c['state_id'],
                'country_id' => 167,
                'country_code' => 'PK',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::table('cities')->insert($insertData);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
