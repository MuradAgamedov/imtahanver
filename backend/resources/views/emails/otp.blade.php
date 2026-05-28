<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>İmtahanVer OTP Təsdiqləmə</title>
</head>
<body style="font-family: 'Inter', sans-serif; background-color: #f3f4f6; padding: 40px; margin: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" max-width="600px" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e5e7eb; margin: 0 auto;">
        <!-- Header -->
        <tr>
            <td style="background-color: #4f46e5; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">İmtahan<span style="color: #a78bfa;">Ver</span></h1>
            </td>
        </tr>
        <!-- Body -->
        <tr>
            <td style="padding: 40px 30px; color: #1f2937;">
                <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Salam, {{ $firstName }}!</h2>
                <p style="font-size: 15px; line-height: 24px; color: #4b5563; margin-bottom: 24px;">
                    İmtahanVer platformasına qeydiyyatdan keçdiyiniz üçün təşəkkür edirik. Hesabınızı aktivləşdirmək üçün aşağıdakı 6 rəqəmli OTP kodunu təsdiqləmə səhifəsində daxil edin:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: inline-block; background-color: #f3f4f6; border: 2px dashed #4f46e5; border-radius: 12px; padding: 16px 40px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4f46e5;">
                        {{ $otp }}
                    </div>
                </div>
                <p style="font-size: 13px; line-height: 20px; color: #9ca3af; margin-bottom: 0;">
                    Qeyd: Bu kod 10 dəqiqə ərzində etibarlıdır. Əgər bu qeydiyyatı siz etməmisinizsə, bu məktubu sadəcə görməzdən gələ bilərsiniz.
                </p>
            </td>
        </tr>
        <!-- Footer -->
        <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af;">
                © 2026 İmtahanVer. Bütün hüquqlar qorunur.
            </td>
        </tr>
    </table>
</body>
</html>
