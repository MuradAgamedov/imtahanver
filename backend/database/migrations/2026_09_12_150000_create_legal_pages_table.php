<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('legal_pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('heading');
            $table->longText('body');
            $table->timestamps();
        });

        $now = now();

        DB::table('legal_pages')->insert([
            [
                'slug' => 'privacy',
                'heading' => 'Məxfilik Siyasəti',
                'body' => <<<'TEXT'
## Hansı şəxsi məlumatlar toplanır

Qeydiyyat zamanı ad, soyad, email ünvanı və (əlaqə formu vasitəsilə yazdıqda) telefon nömrənizi toplayırıq. Platformadan istifadə zamanı seçdiyiniz kateqoriya, fənn, sınaq nəticələriniz və keçmiş sınaq tarixçəniz hesabınızla birlikdə saxlanılır.

## Məlumatlardan nə üçün istifadə olunur

Toplanan məlumatlar yalnız hesabınızın idarə edilməsi, sınaq funksionallığının təmin edilməsi, nəticələrinizin şəxsi kabinetinizdə saxlanması və zəruri hallarda sizinlə əlaqə saxlanması üçün istifadə olunur. Məlumatlarınız reklam məqsədilə satılmır.

## Məlumatlar necə qorunur

Şifrələr heç vaxt açıq mətn şəklində saxlanılmır. Server və verilənlər bazasına giriş yalnız səlahiyyətli şəxslərlə məhdudlaşdırılıb. Bütün əlaqə formaları və hesab əməliyyatları şifrəli (HTTPS) bağlantı üzərindən ötürülür.

## Üçüncü tərəflərlə paylaşılma halları

Məlumatlarınız, ödənişli xidmətlər aktivləşdikdə əməliyyatı emal edən ödəniş provayderi istisna olmaqla, üçüncü tərəflərlə paylaşılmır. Qanunla tələb olunan hallar istisnadır (məsələn, səlahiyyətli dövlət orqanının rəsmi sorğusu).

Bu siyasətlə bağlı sualınız varsa, "Əlaqə" səhifəsindən bizimlə əlaqə saxlaya bilərsiniz.
TEXT,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'slug' => 'terms',
                'heading' => 'İstifadə Şərtləri',
                'body' => <<<'TEXT'
## Xidmətin göstərilmə qaydası

İmtahanVer — imtahanlara hazırlıq üçün onlayn sınaq platformasıdır. Platformanın əsas funksiyaları (sınaqlara qoşulmaq, nəticələrə baxmaq) qeydiyyatdan sonra pulsuz təqdim olunur. Gələcəkdə əlavə olunacaq ödənişli xidmətlərin şərtləri müvafiq bölmədə ayrıca göstəriləcək.

## Sifariş və ödəniş şərtləri

Ödənişli xidmətdən istifadə etdikdə qiymət, ödəniş üsulu və əhatə dairəsi satın alma anında sizə aydın şəkildə göstərilir. Ödəniş yalnız təsdiqlədiyiniz məbləğ üzrə həyata keçirilir.

## Tərəflərin hüquq və məsuliyyətləri

İstifadəçi qeydiyyat zamanı düzgün məlumat verməyə, hesabını başqaları ilə paylaşmamağa borcludur. Platforma sınaq suallarının rəsmi imtahan formatına uyğunluğuna cavabdehdir, lakin nəticələrin real imtahanda konkret bal təminatı vermir — bu, hazırlıq vasitəsidir.

## Mübahisələrin həlli

Tərəflər arasında yaranan hər hansı fikir ayrılığı ilk növbədə qarşılıqlı danışıqlar yolu ilə həll olunmağa çalışılır. Razılığa gəlinmədiyi halda mübahisə Azərbaycan Respublikasının qanunvericiliyinə uyğun həll olunur.

Bu şərtlər zaman-zaman yenilənə bilər, yenilənmə halında bu səhifədə dərc olunur.
TEXT,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'slug' => 'refund',
                'heading' => 'Ödəniş və Geri Qaytarma Qaydaları',
                'body' => <<<'TEXT'
## Ödənişin növü

Ödənişli xidmətlər üçün ödəniş satın alma anında tam məbləğdə həyata keçirilir. Mərhələli (hissə-hissə) ödəniş tələb edən xidmətlər olduqda bu, həmin xidmətin təsvirində ayrıca qeyd olunur.

## Sifarişin ləğvi

Ödənişli xidmətdən istifadəyə başlamamışdan əvvəl sifarişi ləğv etmək istəyirsinizsə, "Əlaqə" səhifəsi vasitəsilə bizə müraciət edə bilərsiniz.

## Geri qaytarma (refund) qaydası

Texniki problem səbəbindən xidmətdən istifadə edə bilmədiyiniz və ya yanlış/təkrar ödəniş halında tam məbləğ geri qaytarılır. Geri qaytarma sorğuları ödənişdən sonra 7 gün ərzində qəbul olunur.

## Refund müddəti və üsulu

Təsdiqlənmiş geri qaytarma sorğuları 10 iş günü ərzində ödənişin edildiyi eyni ödəniş üsulu ilə geri qaytarılır.

## Görülmüş işin hansı hissəsinin tutulacağı

Artıq istifadə olunmuş rəqəmsal məzmun (baxılmış sınaq nəticələri, açılmış material) üzrə mütənasib hissə geri qaytarma məbləğindən çıxıla bilər. Bu, hər bir konkret sorğuya görə ayrıca qiymətləndirilir.

Sualınız olduqda "Əlaqə" səhifəsindən bizə yaza bilərsiniz.
TEXT,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_pages');
    }
};
