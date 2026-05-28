<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Illuminate\Http\Request;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class JwtAuthMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'success' => false,
                'message' => 'Giriş icazəniz yoxdur. Zəhmət olmasa daxil olun.'
            ], 401);
        }

        $token = substr($authHeader, 7);

        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) {
                throw new Exception('Token formatı yanlışdır.');
            }

            [$base64UrlHeader, $base64UrlPayload, $base64UrlSignature] = $parts;

            // Verify signature
            $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, config('app.key'));
            $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

            if (!hash_equals($expectedSignature, $base64UrlSignature)) {
                throw new Exception('İmza doğrulanmadı.');
            }

            // Decode payload
            $payload = json_decode(base64_decode(str_replace(['-','_'], ['+','/'], $base64UrlPayload)), true);

            if (!$payload || !isset($payload['sub']) || !isset($payload['exp'])) {
                throw new Exception('Token məlumatları yanlışdır.');
            }

            // Check expiry
            if (time() > $payload['exp']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Giriş sessiyanızın vaxtı bitib. Yenidən daxil olun.'
                ], 401);
            }

            // Fetch user
            $user = User::find($payload['sub']);
            if (!$user) {
                throw new Exception('İstifadəçi tapılmadı.');
            }

            // Attach user to request
            $request->setUserResolver(fn () => $user);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token etibarsızdır.'
            ], 401);
        }

        return $next($request);
    }
}
