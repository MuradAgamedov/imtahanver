<?php

namespace Database\Seeders;

use App\Models\MiqQuestion;
use App\Models\MiqQuestionOption;
use App\Models\MiqSubject;
use Illuminate\Database\Seeder;

class MiqTarixQuestionsSeeder extends Seeder
{
    public function run(): void
    {
        $subject = MiqSubject::where('identify', 'tarix')->firstOrFail();

        $questions = [
            [
                'text' => 'Proseslərin mümkün nəticələrini seçin:',
                'options' => [
                    ['text' => '1, 3, 5', 'is_true' => false],
                    ['text' => '2, 3, 4', 'is_true' => false],
                    ['text' => '3, 4, 5', 'is_true' => false],
                    ['text' => '1, 2, 4', 'is_true' => false],
                    ['text' => '1, 2, 5', 'is_true' => true],
                ],
            ],
            [
                'text' => 'Proseslərin mümkün nəticələrini seçin:',
                'options' => [
                    ['text' => '1, 3, 5', 'is_true' => false],
                    ['text' => '2, 3, 4', 'is_true' => false],
                    ['text' => '3, 4, 5', 'is_true' => false],
                    ['text' => '1, 2, 5', 'is_true' => false],
                    ['text' => '1, 2, 4', 'is_true' => true],
                ],
            ],
            [
                'text' => "Qədim Albaniya dövlətinin tarixinə aiddir:\n1. E.ə. III əsrin I yarısında hökmdar hakimiyyəti möhkəmlənmişdir\n2. Din xadimləri cəmiyyətin ən ali təbəqəsini təşkil etmişdir\n3. Roma respublikasına qarşı mübarizə aparmışdır\n4. Makedoniyalı İskəndərə qarşı mübarizə aparmışdır\n5. Əhalisi Göy, Günəş, Ay və digər tanrılara sitayiş etmişdir",
                'options' => [
                    ['text' => '1, 3, 5', 'is_true' => false],
                    ['text' => '1, 2, 3', 'is_true' => false],
                    ['text' => '2, 4, 5', 'is_true' => false],
                    ['text' => '1, 4, 5', 'is_true' => false],
                    ['text' => '2, 3, 4', 'is_true' => true],
                ],
            ],
            [
                'text' => "Mətndəki hansı cümlələrin yerini dəyişsək, məzmunun məntiqi ardıcıllığı bərpa olunar?\n1. Lullubi ölkəsində çoxlu müstəqil xırda hakimlər mövcud idi.\n2. Hökmdar Anubaninin dövründə Lullubi dövləti daha da gücləndi.\n3. Azərbaycanın cənubunda Lullubi dövlət qurumu meydana gəldi.\n4. Yazılı mənbələrdə \"padşahlar padşahı\" adlanan İmmaşqun xırda hakimləri bir mərkəzə tabe etdi.\n5. Bu dövrdə onun ərazisi şimalda Urmiya gölündən, cənubda Diyala çayınadək uzanırdı.",
                'options' => [
                    ['text' => '1 ↔ 2', 'is_true' => false],
                    ['text' => '2 ↔ 4', 'is_true' => false],
                    ['text' => '3 ↔ 5', 'is_true' => false],
                    ['text' => '1 ↔ 3', 'is_true' => false],
                    ['text' => '4 ↔ 5', 'is_true' => true],
                ],
            ],
            [
                'text' => "Sxemi tamamlayın:\na. Əkinçi və maldar tayfaların bir-birindən ayrılması\nb. Vilayətlər arasında müharibələrin başlanması\nc. Şimali Misirin Cənubi Misiri tabe etməsi\nd. Hakim sülalələrin tez-tez dəyişməsi\ne. Vahid Misir padşahlığının yaranması",
                'options' => [
                    ['text' => '2 – a, 4 – b', 'is_true' => false],
                    ['text' => '2 – c, 4 – d', 'is_true' => false],
                    ['text' => '2 – d, 4 – a', 'is_true' => false],
                    ['text' => '2 – b, 4 – c', 'is_true' => false],
                    ['text' => '2 – b, 4 – e', 'is_true' => true],
                ],
            ],
            [
                'text' => 'Daha tez baş vermişdir:',
                'options' => [
                    ['text' => 'Salarilər dövlətinin meydana gəlməsi', 'is_true' => false],
                    ['text' => 'Soyurqal adlı torpaq sahibliyinin yaranması', 'is_true' => false],
                    ['text' => 'Məzyədilərin yarımmüstəqil Bərdə əmirliyini yaratması', 'is_true' => false],
                    ['text' => 'Didqori döyüşünün baş verməsi', 'is_true' => false],
                    ['text' => 'Xəzərlərin Azərbaycan torpaqlarına yürüşlərinin başlanması', 'is_true' => true],
                ],
            ],
            [
                'text' => "Qədim Yunanıstan təqviminin 345-ci ilində Sparta ilə başlanan müharibələr 27 il sonra Afinanın məğlubiyyəti ilə sona yetdi. Lakin Elladada yaranan sakitlik uzun sürmədi. Doqquz il sonra polislər arasında yenidən müharibələr başlandı. \"Korinf müharibələri\" e.ə. 387-ci ildə başa çatdı. Sparta məğlub oldu və yunan polislərinin bir hissəsi Əhəmənilərin hakimiyyəti altına düşdü.\nMiladi təqvimlə \"Korinf müharibələri\" \"Peloponnes müharibələri\"nin başlanmasından neçə il sonra başa çatdı?",
                'options' => [
                    ['text' => '372 il', 'is_true' => true],
                    ['text' => '44 il', 'is_true' => false],
                    ['text' => '396 il', 'is_true' => false],
                    ['text' => '36 il', 'is_true' => false],
                    ['text' => '42 il', 'is_true' => false],
                ],
            ],
            [
                'text' => "Rəvvadilər dövləti Eldənizlərdən fərqli olaraq:\n1. Paytaxtı Təbrizə köçürmüşdür.\n2. Azərbaycanın cənubunda meydana gəlmişdir.\n3. Slavyanlarla mübarizə aparmışdır.\n4. Səlcuqlar tərəfindən süquta uğradılmışdır.\n5. Erkən feodalizm dövründə yaranmışdır.\n6. XII əsrin 30-cu illərində meydana gəlmişdir.",
                'options' => [
                    ['text' => '2, 4, 5', 'is_true' => false],
                    ['text' => '1, 3, 5', 'is_true' => false],
                    ['text' => '1, 2, 6', 'is_true' => false],
                    ['text' => '2, 5, 6', 'is_true' => false],
                    ['text' => '3, 4, 6', 'is_true' => true],
                ],
            ],
            [
                'text' => "Uyğunluğu müəyyən edin:\n1. Şah I Abbas\n2. Şah II Abbas\n3. Şah Sultan Hüseyn\na. Romanovlarla sərhəd münaqişəsinin baş verməsi\nb. Üsyan nəticəsində hakimiyyətdən devrilməsi\nc. Osmanlı sultanının Terek qalasının dağıdılması barədə fərmanına mane olmaması\nd. Osmanlılara qarşı \"yandırılmış torpaq\" taktikasından istifadə etməsi\ne. Mollahəsən döyüşündə Krım xanlığının məğlub edilməsi",
                'options' => [
                    ['text' => '1-c, d; 2-a; 3-b', 'is_true' => false],
                    ['text' => '1-c, e; 2-a; 3-b', 'is_true' => false],
                    ['text' => '1-d; 2-a, c; 3-b', 'is_true' => false],
                    ['text' => '1-b; 2-c, d, e; 3-a', 'is_true' => false],
                    ['text' => '1-a, c, e; 2-b; 3-d', 'is_true' => true],
                ],
            ],
            [
                'text' => "Xronoloji ardıcıllığı müəyyən edin:\n1. Şəmsəddin Eldənizin \"Böyük Atabəy\" titulu qəbul etməsi\n2. Səlcuq sərkərdəsi Qaratəkinin Şirvanşahlar üzərinə hücuma keçməsi\n3. Şeyx Üveysin Şirvana yürüş etməsi\n4. Cəlaləddinin Azərbaycanı tərk etməsi",
                'options' => [
                    ['text' => '2, 1, 3, 4', 'is_true' => false],
                    ['text' => '1, 2, 4, 3', 'is_true' => false],
                    ['text' => '2, 1, 4, 3', 'is_true' => false],
                    ['text' => '1, 2, 3, 4', 'is_true' => false],
                    ['text' => '2, 4, 1, 3', 'is_true' => true],
                ],
            ],
            [
                'text' => "Uyğunluğu müəyyən edin:\nAzərbaycan XV əsrdə\n1. Qaraqoyunlu dövləti\na. Sülalə torpaqlarının incu adlanması\nb. Teymurilərlə Herat müqaviləsinin imzalanması\nc. Muş döyüşündə qalib gəlməsi\n2. Şirvanşahlar dövləti\na. Kür çayı sahilində Teymuriləri məğlub etməsi\nb. XV əsrin 80-ci illərində Dərbəndilər sülaləsinin hakimiyyətə gəlməsi\nc. I Xəlilullahın dövründə Teymurilərlə ittifaq bağlanması",
                'options' => [
                    ['text' => '1-b; 2-a,c', 'is_true' => false],
                    ['text' => '1-b,c; 2-c', 'is_true' => false],
                    ['text' => '1-a; 2-a,c', 'is_true' => false],
                    ['text' => '1-b; 2-a,b', 'is_true' => false],
                    ['text' => '1-a,b; 2-b', 'is_true' => true],
                ],
            ],
            [
                'text' => "Cədvəldəki doğru sıranı müəyyən edin:\nSalari Mərzban ibn Məhəmməd — Şirvanşah I Mənuçöhr — Qaraqoyunlu Cahanşah\n1: Ölümündən sonra idarə etdiyi dövlət süqut etmişdir. / Bakı yaxınlığında rus qoşunları ilə vuruşmuşdur. / Şirvanşah I İbrahimi asılı hala salmışdır.\n2: Carca döyüşündə ərəbləri məğlub etmişdir. / Dövlətin paytaxtını Bakıya köçürmüşdür. / Teymurilər dövlətinə qalib gəlmişdir.\n3: Sonuncu Saci hökmdarı Deysəmi taxtdan salıb yeni dövlətin əsasını qoymuşdur. / Səlcuq sultanı Alp Arslan tərəfindən \"Şirvanşah\" titulundan məhrum edilmişdir. / Osmanlı sultanı II Mehmet tərəfindən \"Ərəb və Əcəm xaqanlarının sultanı\" adlandırılmışdır.\n4: Azərbaycan torpaqlarını vahid və müstəqil dövlətin tərkibində birləşdirmişdir. / Slavyanların Araz çayı ilə irəliləyişinin qarşısı alınmışdır. / Səfəvilərə qarşı mübarizə aparmışdır.\n5: Slavyanlarla mübarizə aparmışdır. / Səlcuqlarla dostluq əlaqələrini pozub gürcülərlə qohumluq münasibətləri yaratmışdır. / Osmanlılarla dostluq əlaqələrini pozub Ağqoyunlularla yaxınlaşmışdır.",
                'options' => [
                    ['text' => '1', 'is_true' => false],
                    ['text' => '2', 'is_true' => false],
                    ['text' => '3', 'is_true' => false],
                    ['text' => '4', 'is_true' => false],
                    ['text' => '5', 'is_true' => true],
                ],
            ],
            [
                'text' => "Xronoloji ardıcıllığı müəyyən edin:\n1. Qərbi Hun dövlətinin yaranması\n2. Xəzər xaqanlığının yaranması\n3. Ağ Hun dövlətinin süqut etməsi\n4. Suasson döyüşünün baş verməsi",
                'options' => [
                    ['text' => '1, 2, 3, 4', 'is_true' => false],
                    ['text' => '2, 4, 3, 1', 'is_true' => false],
                    ['text' => '4, 2, 1, 3', 'is_true' => false],
                    ['text' => '1, 3, 4, 2', 'is_true' => false],
                    ['text' => '1, 4, 3, 2', 'is_true' => true],
                ],
            ],
            [
                'text' => "Dehli sultanlığı ilə Teymuri imperiyasının oxşar cəhətlərinə aid deyil:",
                'options' => [
                    ['text' => 'Hökmdarın "sultan" titulu daşıması', 'is_true' => false],
                    ['text' => 'Səfəvilərlə geniş diplomatik əlaqələrin qurulması', 'is_true' => true],
                    ['text' => 'XVI əsrin birinci yarısında süqut etmələri', 'is_true' => false],
                    ['text' => 'Türk mənşəli sülalə tərəfindən idarə olunmaları', 'is_true' => false],
                    ['text' => 'Klassik feodalizm dövründə meydana gəlmələri', 'is_true' => false],
                ],
            ],
            [
                'text' => "Əcəmi Əbubəkr oğlu tərəfindən inşa edilmişdir:\n1. Qoşa minarə\n2. Əlincəçay Xanəgahı\n3. Gülüstan qalası\n4. Darülmülk\n5. Xudafərin körpüsü",
                'options' => [
                    ['text' => '1, 2', 'is_true' => false],
                    ['text' => '3, 5', 'is_true' => false],
                    ['text' => '2, 3', 'is_true' => false],
                    ['text' => '4, 5', 'is_true' => false],
                    ['text' => '1, 4', 'is_true' => true],
                ],
            ],
            [
                'text' => '1769-cu ildə müqavilə bağlayan xanlıqları müəyyən edin:',
                'options' => [
                    ['text' => '3, 5', 'is_true' => false],
                    ['text' => '1, 2', 'is_true' => false],
                    ['text' => '2, 3', 'is_true' => false],
                    ['text' => '1, 4', 'is_true' => false],
                    ['text' => '4, 5', 'is_true' => true],
                ],
            ],
            [
                'text' => "XIX əsrin ikinci yarısında Şimali Azərbaycandan fərqli olaraq, Cənubi Azərbaycana aiddir:\n1. Dövlət kəndlilərinin xəzinəyə torpaq vergisi ödəməsi\n2. \"Xalisə torpaqlarının satılması haqqında\" fərmanın verilməsi\n3. Rusiya imperiyasının əsas xammal mənbəyinə və satış bazarına çevrilməsi\n4. Tütün almaq, satmaq, emal etmək hüququnun ingilis şirkətinə verilməsi\n5. İqtisadiyyatda milli kapitalın rolunun artması",
                'options' => [
                    ['text' => '4, 5', 'is_true' => false],
                    ['text' => '1, 2', 'is_true' => false],
                    ['text' => '2, 4', 'is_true' => false],
                    ['text' => '3, 5', 'is_true' => false],
                    ['text' => '1, 3', 'is_true' => true],
                ],
            ],
            [
                'text' => "Şeyx Məhəmməd Xiyabaninin başçılığı ilə Cənubi Azərbaycanda başlamış hərəkatın iştirakçılarının əsas tələblərinə aiddir:\n1. İranın respublika elan edilməsi\n2. İşğalçıların ölkədən qovulması\n3. Konstitusiya qəbul edilməsi\n4. Cənubi Azərbaycana muxtariyyət verilməsi\n5. Əyalət əncümənlərinin yaradılması",
                'options' => [
                    ['text' => '2, 3, 5', 'is_true' => false],
                    ['text' => '1, 3, 4', 'is_true' => false],
                    ['text' => '3, 4, 5', 'is_true' => false],
                    ['text' => '1, 2, 4', 'is_true' => false],
                    ['text' => '1, 2, 5', 'is_true' => true],
                ],
            ],
            [
                'text' => "İrəvan, Gəncə və Naxçıvan xanlıqlarına aid ümumi cəhətləri müəyyən edin:\n1. Quba xanlığının tərkibində olmaları\n2. Çuxursəd bəylərbəyiliyinin ərazisində yaranmaları\n3. Qarabağ xanlığına tabe olmaları\n4. Şəki xanlığına qarşı yaranmış ittifaqa qoşulmaları\n5. Kartli-Kaxetiya çarlığının asılılığında olmaları",
                'options' => [
                    ['text' => '2, 5', 'is_true' => false],
                    ['text' => '3, 5', 'is_true' => false],
                    ['text' => '1, 2', 'is_true' => false],
                    ['text' => '2, 4', 'is_true' => false],
                    ['text' => '3, 4', 'is_true' => true],
                ],
            ],
            [
                'text' => "Xronoloji ardıcıllığı müəyyən edin:\n1. Yaponiyada burjua inqilabının başlanması\n2. Osmanlı dövlətinin konstitusiyalı monarxiyaya çevrilməsi\n3. Makedoniyada \"Gənc türklər\" üsyanının başlanması\n4. Yaponiyanın konstitusiyalı monarxiyaya çevrilməsi",
                'options' => [
                    ['text' => '1, 2, 4, 3', 'is_true' => false],
                    ['text' => '2, 3, 1, 4', 'is_true' => false],
                    ['text' => '1, 2, 3, 4', 'is_true' => false],
                    ['text' => '2, 4, 1, 3', 'is_true' => false],
                    ['text' => '4, 3, 2, 1', 'is_true' => true],
                ],
            ],
            [
                'text' => "\"İmperiyanın bölgəyə qayıtması mövcud siyasi vəziyyəti dəyişdirdi. Əslində, yeni ad altında Rusiya regionda müstəqil dövlətçilik atributlarının aradan qaldırılmasını həyata keçirirdi. Moskva rəhbərliyi bölgədəki respublikaları formal muxtariyyət hüququ ilə tərkibinə daxil edir, bu zaman \"müttəfiq respublikalar\"ın ərazisinin çox hissəsini nəzarətində saxlamağa çalışırdı. Buna görə də o, əhalisinin çoxu qeyri-müsəlmanlardan ibarət olan respublikaların ərazilərinin genişləndirilməsindən və əhalinin etnik tərkibinin dəyişdirilməsindən maraqlı idi. Odur ki \"proletar beynəlmiləlçiliyi\" və \"millətlərarası sülh\" adı altında burada mövcud olan yeganə müsəlman respublikasının ərazisinin bir hissəsinin \"mübahisəli ərazilər\" elan edilib qonşu respublikalara verilməsinə nail oldu\".\nHansı fikirlər mənbədəki məlumatları təkzib etmir?\n1. Burada Rusiyanın XIX əsrin əvvəllərində Cənubi Qafqaza təcavüzündən bəhs olunur.\n2. Bəhs olunan proseslər Birinci Dünya müharibəsi dövründə baş vermişdir.\n3. Burada Rusiyanın \"SSRİ\" adı altında imperiyanı bərpa etməsindən bəhs olunur.\n4. Bəhs olunan proseslər Azərbaycan Xalq Cümhuriyyətinin süqutundan sonraya aiddir.\n5. Sovet Rusiyası Azərbaycan SSR-in müstəqilliyini və ərazi bütövlüyünü qorumuşdur.",
                'options' => [
                    ['text' => '3, 4', 'is_true' => false],
                    ['text' => '1, 2', 'is_true' => false],
                    ['text' => '2, 5', 'is_true' => false],
                    ['text' => '1, 4', 'is_true' => false],
                    ['text' => '3, 5', 'is_true' => true],
                ],
            ],
            [
                'text' => "Osmanlı sultanları III Səlim (1) və II Əbdülhəmidin (2) fəaliyyətini Eyler-Venn diaqramında müqayisə edin:\na. İmperiyada siyasi böhranın kəskinləşdiyi dövrdə hakimiyyətə gəlmişdir.\nb. Rusiya ilə apardığı müharibədə məğlub olmuşdur.\nc. Hakimiyyəti dövründə ölkə konstitusiyalı monarxiyaya çevrilmişdir.\nd. \"Nizami-cədid\" adlanan islahatlar həyata keçirmişdir.\ne. İmperiyanın ərazisində hərbi islahatlara üstünlük verirdi.",
                'options' => [
                    ['text' => '1-d, e; 2-с; 3-a, b', 'is_true' => false],
                    ['text' => '1-a, b; 2-c, d; 3-e', 'is_true' => false],
                    ['text' => '1-b, d; 2-e; 3-a, c', 'is_true' => false],
                    ['text' => '1-a, c; 2-e; 3-b, d', 'is_true' => false],
                    ['text' => '1-c; 2-d; 3-a, b', 'is_true' => true],
                ],
            ],
            [
                'text' => "Tarixə sistemli yanaşma üsulu nəzərdə tutur:",
                'options' => [
                    ['text' => 'Tədqiq edilən eyni bir cəmiyyətə aid elementlərin həm bir-biri, həm də onları əhatə edən xarici mühitlə qarşılıqlı əlaqədə öyrənilməsini', 'is_true' => false],
                    ['text' => 'Müəyyən meyarlar əsasında müxtəlif tarixi fakt, hadisə, təzahür və proseslər arasında oxşarlıqların tapılmasını', 'is_true' => true],
                    ['text' => 'Tədqiqatçının canlı aləmdə baş verən dəyişikliklərin kəmiyyət göstəricilərini riyazi-statistik yolla təhlil etməsini', 'is_true' => false],
                    ['text' => 'Aerokosmik mənbələrdən və geofiziki kəşfiyyatlardan əldə olunan məlumatlar əsasında qədim yaşayış məskənlərinin yerinin müəyyənləşdirilməsini', 'is_true' => false],
                    ['text' => 'Cəmiyyətin daha sonrakı vəziyyətini təhlil edən tədqiqatçının oxşar hadisə və proseslər əsasında onun əvvəlki vəziyyətini anlamasını', 'is_true' => false],
                ],
            ],
            [
                'text' => "Xronoloji ardıcıllığı müəyyən edin:\n1. \"Oyl\" inhisar birliyinin yaradılması\n2. \"Mis\" sindikatının yaradılması\n3. \"Nobel qardaşları şirkəti\"nin yaradılması\n4. Qafqaz Su Müfəttişliyinin yaradılması",
                'options' => [
                    ['text' => '1, 3, 2, 4', 'is_true' => false],
                    ['text' => '2, 1, 4, 3', 'is_true' => false],
                    ['text' => '3, 4, 2, 1', 'is_true' => false],
                    ['text' => '3, 2, 4, 1', 'is_true' => false],
                    ['text' => '4, 3, 2, 1', 'is_true' => true],
                ],
            ],
            [
                'text' => "Azərbaycanın XX əsr mədəniyyətinə aid hadisələri seçib xronoloji ardıcıllığını müəyyən edin:\n1. Azərbaycan televiziyasının fəaliyyətə başlaması\n2. Milli mətbuatın əsasının qoyulması\n3. \"Koroğlu\" operasının tamaşaya qoyulması\n4. Kiril qrafikalı əlifbaya keçilməsi\n5. İlk rus-Azərbaycan məktəbinin açılması",
                'options' => [
                    ['text' => '3, 4, 1', 'is_true' => false],
                    ['text' => '5, 2, 3, 4, 1', 'is_true' => false],
                    ['text' => '3, 2, 1, 4', 'is_true' => false],
                    ['text' => '3, 2, 4', 'is_true' => false],
                    ['text' => '5, 2, 4, 3, 1', 'is_true' => true],
                ],
            ],
            [
                'text' => "Uyğunluq pozulmuşdur:",
                'options' => [
                    ['text' => 'Xıdır Mustafayev – Kiyev uğrunda gedən döyüşlərdəki igidliyinə görə Sovet İttifaqı Qəhrəmanı adı almışdır.', 'is_true' => false],
                    ['text' => 'Ziya Bünyadov – Polşa və Çexoslovakiyanın azad edilməsində iştirak etmiş Sovet İttifaqı Qəhrəmanıdır.', 'is_true' => false],
                    ['text' => 'Vilayət Hüseynov – İtaliyada Mussolinin həbs edilməsində iştirak etmiş partizandır.', 'is_true' => false],
                    ['text' => 'Adil Quliyev – Sovet İttifaqı Qəhrəmanı adına layiq görülmüş ilk azərbaycanlıdır.', 'is_true' => false],
                    ['text' => 'Yusif Sadıqov – Berlin uğrunda döyüşlərdə qəhrəmanlıq göstərmiş Sovet İttifaqı Qəhrəmanıdır.', 'is_true' => true],
                ],
            ],
            [
                'text' => 'Uyğunluğu müəyyən edin.',
                'options' => [
                    ['text' => '2, 4', 'is_true' => false],
                    ['text' => '3, 4', 'is_true' => false],
                    ['text' => '1, 3', 'is_true' => false],
                    ['text' => '2, 3', 'is_true' => false],
                    ['text' => '1, 2', 'is_true' => true],
                ],
            ],
            [
                'text' => 'Uyğunluğu müəyyən edin:',
                'options' => [
                    ['text' => '1, 4, 5', 'is_true' => false],
                    ['text' => '3, 4, 5', 'is_true' => false],
                    ['text' => '1, 2, 3', 'is_true' => false],
                    ['text' => '1, 2, 5', 'is_true' => false],
                    ['text' => '2, 3, 5', 'is_true' => true],
                ],
            ],
            [
                'text' => "Azərbaycan Respublikasının XXI əsrin ikinci onilliyi tarixinə aiddir:",
                'options' => [
                    ['text' => 'Qəbələdə ilk Musiqi Festivalının keçirilməsi', 'is_true' => false],
                    ['text' => '"Kitabi-Dədə Qorqud" dastanının 1300 illik yubileyinin qeyd edilməsi', 'is_true' => false],
                    ['text' => 'Novruz bayramının UNESCO-nun "Ümumdünya İrsi Siyahısı"na daxil edilməsi', 'is_true' => false],
                    ['text' => '"Təhsil haqqında" Qanunun qəbul edilməsi', 'is_true' => false],
                    ['text' => 'Bakıda IV İslam Həmrəyliyi oyunlarının keçirilməsi', 'is_true' => true],
                ],
            ],
            [
                'text' => "Heydər Əliyevlə (1) Mustafa Kamal (2) fəaliyyətini Eyler-Venn diaqramında müqayisə edin:\na. İşğalçılara qarşı mübarizə aparılması\nb. Ölkənin respublika elan edilməsi\nc. Konstitusiyanın qəbul edilməsi\nd. Torpaq islahatının keçirilməsi\ne. Beynəlxalq əhəmiyyətli neft müqavilələrinin imzalanması",
                'options' => [
                    ['text' => '1-b, d; 2-c; 3-a, e', 'is_true' => false],
                    ['text' => '1-a, e; 2-b; 3-d', 'is_true' => false],
                    ['text' => '1-e; 2-b; 3-a, c, d', 'is_true' => false],
                    ['text' => '1-d; 2-b; 3-c', 'is_true' => false],
                    ['text' => '1-e; 2-a; 3-b, c, d', 'is_true' => true],
                ],
            ],
            [
                'text' => 'Uyğunluq gözlənilmişdir:',
                'options' => [
                    ['text' => '3, 4', 'is_true' => false],
                    ['text' => '1, 4', 'is_true' => false],
                    ['text' => '2, 3', 'is_true' => false],
                    ['text' => '1, 3', 'is_true' => false],
                    ['text' => '2, 4', 'is_true' => true],
                ],
            ],
            [
                'text' => "Aşağıdakı hadisələrdən hansıların yerini dəyişdikdə doğru xronoloji ardıcıllıq alınır?\n1. Azərbaycanda aviasiya üçün yüksək oktanlı benzin hazırlanmışdır — Birinci Dünya müharibəsi dövründə\n2. Azərbaycan kinofilmi dünya ekranlarına çıxmışdır — \"Arşın mal alan\" filmi ilə\n3. C.Naxçıvanski adına hərbi məktəb açılmışdır — İmam Mustafayevin təklifi ilə\n4. Cənubi Azərbaycanda \"Varlıq\" jurnalı nəşr edilmişdir — Cavad Heyətin təşəbbüsü ilə",
                'options' => [
                    ['text' => '2 və 3', 'is_true' => false],
                    ['text' => '1 və 2', 'is_true' => false],
                    ['text' => '2 və 4', 'is_true' => false],
                    ['text' => '3 və 4', 'is_true' => false],
                    ['text' => '1 və 3', 'is_true' => true],
                ],
            ],
            [
                'text' => "Mənbədə ABŞ-ın hansı planından bəhs olunur?\n\"Müharibə dövründə Avropanın iqtisadiyyatı tamamilə dağılmışdır. O, önəmli miqdarda əlavə yardım almasa, iqtisadi, sosial və siyasi cəhətdən son dərəcə ağır parçalanma təhlükəsi ilə üz-üzə qalacaqdır. ABŞ-ın dünya iqtisadiyyatının sağlamlaşdırılması üçün mümkün ola bilən hər şeyi etməsi məntiqlidir. Bizim siyasətimiz hər hansı bir ölkəyə, yaxud doktrinaya deyil, aclığa, yoxsulluğa və xaosa qarşıdır...\"",
                'options' => [
                    ['text' => 'Marşal', 'is_true' => false],
                    ['text' => 'Böyük sıçrayış', 'is_true' => true],
                    ['text' => 'Yenidənqurma', 'is_true' => false],
                    ['text' => 'Reyqanomika', 'is_true' => false],
                    ['text' => 'Atlantizm', 'is_true' => false],
                ],
            ],
            [
                'text' => "Hadisə-nəticə əlaqələrinin doğru verildiyi bəndləri müəyyən edin:\n1. Batum müqaviləsinin bağlanması → Dağlılar Respublikasının müstəqilliyinin tanınması\n2. AXC ilə Qacarlar dövləti arasında dostluq müqaviləsinin bağlanması → Qacar hökumətinin Azərbaycanın müstəqilliyini de-yure tanıması\n3. Xosrov bəy Sultanovun Qarabağ general-qubernatoru təyin edilməsi → Qarabağın dağlıq hissəsində Azərbaycanın suveren hüquqlarının təmin edilməsi\n4. Nuru paşanın başçılığı ilə Osmanlı hərbi hissələrinin Gəncəyə gəlməsi → Yelizavetpolun yenidən Gəncə adlandırılması\n5. Araz-Türk Respublikasının yaranması → Naxçıvanın erməni hücumlarından qorunması",
                'options' => [
                    ['text' => '2, 4', 'is_true' => false],
                    ['text' => '1, 3', 'is_true' => false],
                    ['text' => '2, 5', 'is_true' => false],
                    ['text' => '1, 4', 'is_true' => false],
                    ['text' => '3, 5', 'is_true' => true],
                ],
            ],
            [
                'text' => "XIV əsrin II yarısı Şirvanşahlar dövləti və XV əsrin I yarısı Qaraqoyunlu dövlətinə aid oxşar cəhət:",
                'options' => [
                    ['text' => 'Qızılbaşları məğlub edərək Təbrizi tutmaları', 'is_true' => false],
                    ['text' => 'Cəlairiləri məğlub etmələri', 'is_true' => false],
                    ['text' => 'Osmanlılarla müttəfiq olmaları', 'is_true' => false],
                    ['text' => 'Teymurilərdən asılılığı qəbul etmələri', 'is_true' => false],
                    ['text' => 'Azərbaycanı vahid dövlətdə birləşdirmələri', 'is_true' => true],
                ],
            ],
            [
                'text' => 'Uyğunluğu müəyyən edin:',
                'options' => [
                    ['text' => '1-b,c; 2-a', 'is_true' => false],
                    ['text' => '1-a,b; 2-a,b', 'is_true' => false],
                    ['text' => '1-a,c; 2-c', 'is_true' => false],
                    ['text' => '1-b; 2-c', 'is_true' => false],
                    ['text' => '1-a; 2-a,b', 'is_true' => true],
                ],
            ],
            [
                'text' => "Aşağıdakı hadisələrdən hansının yerini dəyişdikdə düzgün xronoloji ardıcıllıq alınır:\n1. Tannenburq döyüşünün baş verməsi\n2. Kaporetta yaxınlığında döyüşün baş verməsi\n3. Çanaqqala döyüşlərinin başa çatması\n4. Qorlitsada rus qoşunlarının məğlub olması",
                'options' => [
                    ['text' => '2 və 4', 'is_true' => false],
                    ['text' => '1 və 2', 'is_true' => false],
                    ['text' => '3 və 4', 'is_true' => false],
                    ['text' => '4 və 5', 'is_true' => false],
                    ['text' => '1 və 3', 'is_true' => true],
                ],
            ],
            [
                'text' => "Uyğunluq pozulmuşdur:",
                'options' => [
                    ['text' => 'Əliağa Şıxlınski – Rusiya imperiyasının paytaxtının toplarla müdafiəsinə rəhbərlik etmişdir.', 'is_true' => false],
                    ['text' => 'Fərrux ağa Qayıbov – Baltik dənizi sahillərində gedən hava döyüşlərində qəhrəmancasına həlak olmuşdur.', 'is_true' => false],
                    ['text' => 'İbrahim ağa Vəkilov – general-mayor rütbəsinə layiq görülən yeganə qafqazlı hərbi topoqraf olmuşdur.', 'is_true' => true],
                    ['text' => 'Səməd bəy Mehmandarov – Böyük Britaniya, Fransa və Rumıniyanın ali hərbi mükafatları ilə təltif olunmuşdur.', 'is_true' => false],
                    ['text' => 'Hüseyn xan Naxçıvanski – "Lodz əməliyyatı" zamanı iki rus ordusunu mühasirəyə düşməkdən xilas etmişdir.', 'is_true' => false],
                ],
            ],
            [
                'text' => "Hadisə-nəticə əlaqələrinin doğru verildiyi bəndləri müəyyən edin:\n1. İkinci Dünya müharibəsinin başa çatması → ABŞ-ın \"sədçəkmə\" siyasətinin başlanması\n2. Çində Den Syaopinin hakimiyyətə gəlməsi → Çində \"Dörd modernləşmə\" islahatlarının həyata keçirilməsi\n3. Orta və yaxınmənzilli raketlərin ləğv edilməsi → Ronald Reyqan və Mixail Qorbaçov arasında silsilə görüşlərin keçirilməsi\n4. 1951-ci ildə San-Fransiskoda konfransın keçirilməsi → ABŞ-ın Yaponiyada hərbi bazalar saxlamaq hüququ əldə etməsi\n5. \"Bloklara qoşulmayanlar hərəkatı\"nın yaradılması → Bandunq konfransının keçirilməsi",
                'options' => [
                    ['text' => '2, 4', 'is_true' => false],
                    ['text' => '1, 3', 'is_true' => false],
                    ['text' => '2, 5', 'is_true' => false],
                    ['text' => '1, 4', 'is_true' => false],
                    ['text' => '3, 5', 'is_true' => true],
                ],
            ],
            [
                'text' => "Böyük Moğol imperatorluğunun Səfəvilər dövlətindən fərqi:",
                'options' => [
                    ['text' => 'Müəyyən müddət qeyri-müsəlmanlardan can vergisi alınmırdı.', 'is_true' => false],
                    ['text' => 'Şəmsiyyə sülaləsi tərəfindən idarə olunurdu.', 'is_true' => true],
                    ['text' => 'Hökmdarları şah titulu qəbul etmişdi.', 'is_true' => false],
                    ['text' => 'Osmanlı imperatorluğu ilə diplomatik əlaqələr yaratmışdı.', 'is_true' => false],
                    ['text' => 'Hörmüz limanı uğrunda Portuqaliya ilə mübarizə aparmışdı.', 'is_true' => false],
                ],
            ],
            [
                'text' => "Böyük Səlcuq və Osmanlı dövlətlərinin oxşar cəhətlərinə aiddir:\n1. Şirvan ərazisinin ələ keçirilməsi\n2. Hərbi sahədə islahatların keçirilməsi\n3. Xorasanın tutulması\n4. Suriya və İraqın tabe edilməsi\n5. Hökmdarlarının \"Müsəlmanların xəlifəsi\" titulunu daşıması",
                'options' => [
                    ['text' => '2, 3, 5', 'is_true' => false],
                    ['text' => '1, 3, 4', 'is_true' => false],
                    ['text' => '1, 2, 4', 'is_true' => false],
                    ['text' => '3, 4, 5', 'is_true' => false],
                    ['text' => '1, 2, 5', 'is_true' => true],
                ],
            ],
        ];

        foreach ($questions as $index => $qData) {
            $question = MiqQuestion::create([
                'miq_exampage_id'      => 2,
                'miq_question_type_id' => 1,
                'miq_subject_id'       => $subject->id,
                'text'                 => $qData['text'],
                'order'                => $index,
            ]);

            foreach ($qData['options'] as $order => $opt) {
                MiqQuestionOption::create([
                    'miq_question_id' => $question->id,
                    'text'            => $opt['text'],
                    'is_true'         => $opt['is_true'],
                    'order'           => $order,
                ]);
            }
        }
    }
}
