<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('user_code', 6)->nullable()->unique()->after('id');
        });

        $existingCodes = DB::table('users')->whereNotNull('user_code')->pluck('user_code')->all();
        $used = array_flip($existingCodes);

        $generate = function () use (&$used) {
            do {
                $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            } while (isset($used[$code]));
            $used[$code] = true;
            return $code;
        };

        DB::table('users')->whereNull('user_code')->orderBy('id')->select('id')->chunkById(200, function ($users) use ($generate) {
            foreach ($users as $user) {
                DB::table('users')->where('id', $user->id)->update(['user_code' => $generate()]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('user_code');
        });
    }
};
