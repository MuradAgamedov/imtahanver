<?php
$legalSlug = 'privacy';
$legalFallback = [
    'heading' => 'Məxfilik Siyasəti',
    'body' => <<<'TEXT'
## 1. Hansı şəxsi məlumatlar toplanır

Qeydiyyat zamanı ad, soyad və email ünvanınızı toplayırıq (Google ilə daxil olduqda bu məlumatlar Google hesabınızdan avtomatik götürülür). Əlaqə formu vasitəsilə yazdıqda mesajınız və (qeyd etdiyiniz halda) telefon nömrəniz saxlanılır. Platformadan istifadə zamanı seçdiyiniz kateqoriya, fənn, sınaq cavablarınız, nəticələriniz və keçmiş sınaq tarixçəniz hesabınızla birlikdə saxlanılır. Pullu imtahana qeydiyyatdan keçdikdə qeydiyyat tarixi, ödəniş statusu və məbləğ qeydə alınır — kart və ya bank məlumatlarınız birbaşa bizim sistemimizdə saxlanılmır.

## 2. Məlumatlardan nə üçün istifadə olunur

Toplanan məlumatlar yalnız hesabınızın idarə edilməsi, sınaq funksionallığının təmin edilməsi, nəticələrinizin şəxsi kabinetinizdə saxlanması, pullu imtahanlara qeydiyyatınızın idarə olunması və zəruri hallarda sizinlə əlaqə saxlanması üçün istifadə olunur. Məlumatlarınız reklam məqsədilə satılmır və ya icarəyə verilmir.

## 3. Cookie və sessiya məlumatları

Platforma sizi sistemə daxil olmuş vəziyyətdə saxlamaq üçün zəruri sessiya cookie-lərindən istifadə edir. Bu cookie-lər izləmə/reklam məqsədi daşımır — yalnız hesabınıza təhlükəsiz girişi təmin etmək üçündür.

## 4. Məlumatların saxlanma müddəti

Hesab məlumatlarınız hesabınız aktiv olduğu müddətcə saxlanılır. Hesabınızın silinməsini tələb etdikdə, qanuni saxlama öhdəliyi olmadığı təqdirdə, məlumatlarınız ağlabatan müddət ərzində silinir.

## 5. Sizin hüquqlarınız

Şəxsi məlumatlarınıza dair aşağıdakı hüquqlara maliksiniz: məlumatlarınızın surətini tələb etmək, səhv məlumatın düzəldilməsini istəmək, hesabınızın və əlaqəli məlumatların silinməsini tələb etmək. Bu hüquqlardan istifadə üçün "Əlaqə" səhifəsindən bizə müraciət edə bilərsiniz.

## 6. Məlumatlar necə qorunur

Şifrələr heç vaxt açıq mətn şəklində saxlanılmır — bütün şifrələr geri döndürülməz şəkildə hash olunur. Server və verilənlər bazasına giriş yalnız səlahiyyətli şəxslərlə məhdudlaşdırılıb. Bütün əlaqə formaları, giriş və hesab əməliyyatları şifrəli (HTTPS) bağlantı üzərindən ötürülür.

## 7. Üçüncü tərəflərlə paylaşılma halları

Google ilə giriş seçdikdə Google-dan yalnız ad, soyad və email ünvanınız alınır — başqa heç bir məlumat paylaşılmır. Pullu imtahana ödəniş etdikdə əməliyyatı emal edən ödəniş provayderi istisna olmaqla, məlumatlarınız üçüncü tərəflərlə paylaşılmır. Qanunla tələb olunan hallar istisnadır (məsələn, səlahiyyətli dövlət orqanının rəsmi sorğusu).

## 8. Siyasətdə dəyişikliklər

Bu Məxfilik Siyasəti zaman-zaman yenilənə bilər. Əhəmiyyətli dəyişikliklər bu səhifədə dərc olunur.

Bu siyasətlə bağlı sualınız varsa, "Əlaqə" səhifəsindən bizimlə əlaqə saxlaya bilərsiniz.
TEXT,
];
require __DIR__ . '/inc/legal-page-template.php';
