<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('home_about', function (Blueprint $table) {
            $table->id();
            $table->string('heading');
            $table->text('intro');
            $table->longText('body');
            $table->string('mission_heading')->nullable();
            $table->text('mission_text')->nullable();
            $table->timestamps();
        });

        DB::table('home_about')->insert([
            'id' => 1,
            'heading' => 'Haqqımızda',
            'intro' => 'İmtahanVer — Azərbaycanda müəllimlərin işə qəbulu (MİQ) imtahanına hazırlıq üçün yaradılmış rəqəmsal platformadır.',
            'body' => "Platformamızda fənn proqramları və tədris metodikası üzrə real imtahan strukturuna uyğun sınaq sualları toplanıb. İstifadəçilər istədikləri fənn üzrə sınağa başlaya, nəticələrini anında görə və keçmiş cəhdlərinin tarixçəsini şəxsi kabinetlərində izləyə bilirlər.\n\nMəqsədimiz hazırlıq prosesini sadələşdirmək və hər kəs üçün əlçatan etməkdir — ona görə də platformanın bütün funksiyalarından istifadə tamamilə pulsuzdur.",
            'mission_heading' => 'Missiyamız',
            'mission_text' => 'Hər bir müəllim adayına keyfiyyətli, şəffaf və əlçatan imtahan hazırlığı təcrübəsi təqdim etmək.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('home_about');
    }
};
