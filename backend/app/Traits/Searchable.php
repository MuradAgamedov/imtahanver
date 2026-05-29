<?php

namespace App\Traits;

use Elastic\Elasticsearch\Client;
use Illuminate\Support\Facades\Log;

trait Searchable
{
    public static function bootSearchable()
    {
        // Model yadda saxlananda (create və ya update) avtomatik index-lə
        static::saved(function ($model) {
            $model->indexEntity();
        });

        // Model silinəndə Elasticsearch-dən də sil
        static::deleted(function ($model) {
            $model->deleteEntity();
        });
    }

    public function indexEntity()
    {
        try {
            $client = app(Client::class);
            $client->index([
                'index' => $this->getTable(), // Məs: 'miq_subjects' və ya 'users'
                'id'    => $this->getKey(),   // Model ID-si
                'body'  => $this->toSearchArray(),
            ]);
        } catch (\Exception $e) {
            Log::error("Elasticsearch indexing failed for " . get_class($this) . " ID " . $this->getKey() . ": " . $e->getMessage());
        }
    }

    public function deleteEntity()
    {
        try {
            $client = app(Client::class);
            $client->delete([
                'index' => $this->getTable(),
                'id'    => $this->getKey(),
            ]);
        } catch (\Exception $e) {
            Log::error("Elasticsearch deletion failed for " . get_class($this) . " ID " . $this->getKey() . ": " . $e->getMessage());
        }
    }

    // Default olaraq bütün modeli göndərir, lakin model daxilində override edilə bilər
    public function toSearchArray(): array
    {
        return $this->toArray();
    }
}
