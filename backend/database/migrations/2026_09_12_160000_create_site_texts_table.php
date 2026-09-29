<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_texts', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value');
            $table->timestamps();
        });

        $now = now();
        $defaults = [
            'topbar.tagline' => 'Azərbaycanın rəqəmsal imtahan hazırlıq platforması',
            'brand.tagline' => 'Rəqəmsal imtahan hazırlıq platforması',

            'hero.eyebrow_left' => 'ONLAYN SINAQ',
            'hero.eyebrow_right' => 'İMTAHANLARI',
            'hero.subtitle' => 'MİQ imtahanına 16 fənn üzrə real sınaq sualları ilə 100% pulsuz hazırlaşın.',
            'hero.cta_text' => 'Pulsuz qeydiyyatdan keç',

            'trust.item1' => '100% pulsuz — heç bir ödəniş yoxdur',
            'trust.item2' => '16 fənn üzrə real sınaq sualları',
            'trust.item3' => 'Real vaxt izləmə ilə taymer',

            'steps.heading' => 'Üç addımda sınağa başlayın',
            'steps.subtitle' => 'Qeydiyyatdan tutmuş nəticəni görənədək bütün proses bir neçə dəqiqə çəkir.',
            'steps.1_title' => 'Hesab yarat',
            'steps.1_desc' => 'Email ünvanınızla saniyələr içində pulsuz qeydiyyatdan keçin.',
            'steps.2_title' => 'Sınağı seç',
            'steps.2_desc' => 'MİQ kateqoriyasından fənninizi seçin və sınağa başlayın.',
            'steps.3_title' => 'Nəticəni analiz et',
            'steps.3_desc' => 'Sınaq bitdikdə düzgün və səhv cavablarınıza baxıb öyrənin.',

            'features.heading' => 'Platformanın əsas xüsusiyyətləri',
            'features.subtitle' => 'Hər funksiya real imtahan mühitini əks etdirmək üçün qurulub.',

            'fenler.heading' => 'Fənlər',
            'fenler.subtitle' => 'MİQ kateqoriyasında Fənn proqramları və Tədris metodikası üzrə 16 fənn üzrə sınaqlar aktivdir. Digər kateqoriyalar hazırlanma mərhələsindədir.',
            'fenler.soon_heading' => 'Tezliklə gələcək kateqoriyalar',
            'soon.1_title' => 'Magistr İmtahanı',
            'soon.1_desc' => 'Magistraturaya qəbul imtahanına hazırlıq.',
            'soon.2_title' => 'Buraxılış İmtahanı',
            'soon.2_desc' => 'IX və XI sinif şagirdləri üçün dövlət buraxılış imtahanı formatında sınaqlar.',
            'soon.3_title' => 'Tələbə Sınaqları',
            'soon.3_desc' => 'Ali məktəb tələbələri üçün fənn/mövzu bilik yoxlama testləri.',

            'faq.heading' => 'Tez-tez verilən suallar',
            'faq.subtitle' => 'Aydın olmayan bir şey varsa, buradan tapa bilərsiniz.',

            'cta.heading' => 'Növbəti sınağınız sizi gözləyir',
            'cta.primary_text' => 'Pulsuz qeydiyyatdan keç',
            'cta.secondary_text' => 'Daxil ol',

            'footer.tagline' => 'Rəqəmsal imtahan hazırlıq platforması. Real sınaq sualları ilə pulsuz hazırlaşın, nəticənizi anında görün.',
            'footer.copyright' => 'İmtahanVer. Bütün hüquqlar qorunur.',

            'contact.heading' => 'Bizimlə əlaqə saxlayın',
            'contact.subtitle' => 'Sualınız, təklifiniz və ya əməkdaşlıq istəyiniz var? Formu doldurun, ya da birbaşa aşağıdakı kanallardan yazın.',
            'contact.form_heading' => 'Mesaj yazın',
        ];

        $rows = [];
        foreach ($defaults as $key => $value) {
            $rows[] = ['key' => $key, 'value' => $value, 'created_at' => $now, 'updated_at' => $now];
        }
        DB::table('site_texts')->insert($rows);
    }

    public function down(): void
    {
        Schema::dropIfExists('site_texts');
    }
};
