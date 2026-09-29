<?php
$legalSlug = 'refund';
$legalFallback = [
    'heading' => 'Ödəniş və Geri Qaytarma Qaydaları',
    'body' => <<<'TEXT'
## 1. Qeydiyyat və ödəniş təsdiqi

Planlaşdırılmış rəsmi imtahana qoşulmaq üçün qeydiyyatdan keçib göstərilən məbləği ödəyirsiniz. Ödəniş təsdiqləndikdən sonra qeydiyyatınız "ödənilib" statusuna keçir və imtahanın başlama vaxtı şəxsi kabinetinizdə göstərilir.

## 2. Özünüz ləğv etmə hüququ (24 saat qaydası)

İmtahanın elan edilmiş başlama vaxtına ən azı 24 saat qaldığı müddətdə, qeydiyyatınızı şəxsi kabinetinizdəki "Qeydiyyatı ləğv et" düyməsi ilə istənilən vaxt, tam məbləğdə və dərhal ləğv edə bilərsiniz — bunun üçün ayrıca müraciət etməyinizə ehtiyac yoxdur.

## 3. 24 saatdan az qaldıqda

İmtahana 24 saatdan az qaldıqda özünüz ləğv etmə imkanı bağlanır. Bu müddətdən sonra ləğvetmə yalnız "Əlaqə" səhifəsi vasitəsilə birbaşa müraciətlə, hər bir halın ayrıca qiymətləndirilməsi ilə mümkündür.

## 4. İmtahan başladıqdan sonra

İmtahanın elan edilmiş başlama vaxtı çatdıqdan sonra (imtahana faktiki qoşulub-qoşulmamağınızdan asılı olmayaraq) qeydiyyat ləğv edilə bilməz və ödəniş geri qaytarılmır.

## 5. Texniki problem halında

Platformadan qaynaqlanan texniki problem səbəbindən imtahana qoşula bilmədiyiniz hallarda (məsələn, sistem xətası) tam məbləğ geri qaytarılır və ya sizə uyğun başqa tarixdə iştirak imkanı təklif olunur. Belə halları "Əlaqə" səhifəsi vasitəsilə, mümkün qədər tez bizə bildirin.

## 6. Yanlış/təkrar ödəniş

Səhvən edilmiş və ya təkrarlanmış ödənişlər aşkar edildikdə tam məbləğ geri qaytarılır.

## 7. Geri qaytarma üsulu və müddəti

Təsdiqlənmiş geri qaytarmalar ödənişin edildiyi eyni üsulla, adətən 10 iş günü ərzində həyata keçirilir.

## 8. Admin tərəfindən əlavə olunan qeydiyyat

Bəzi hallarda (məsələn, oflayn ödəniş) qeydiyyatınız platforma tərəfindən manual əlavə oluna bilər — bu halda da yuxarıdakı 24 saat qaydası eyni şəkildə tətbiq olunur.

Sualınız olduqda "Əlaqə" səhifəsindən bizə yaza bilərsiniz.
TEXT,
];
require __DIR__ . '/inc/legal-page-template.php';
