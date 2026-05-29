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
            $index = $this->getTable();

            // Auto-create index if it does not exist to enforce settings and mappings
            if (!$client->indices()->exists(['index' => $index])->asBool()) {
                $client->indices()->create([
                    'index' => $index,
                    'body'  => [
                        'settings' => self::getSearchSettings(),
                        'mappings' => static::getSearchMapping()
                    ]
                ]);
            }

            $client->index([
                'index' => $index,
                'id'    => $this->getKey(),
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

    /**
     * Get default settings for professional autocomplete and Azerbaijani language analyzer.
     */
    public static function getSearchSettings(): array
    {
        return [
            'analysis' => [
                'char_filter' => [
                    'az_char_mapping' => [
                        'type' => 'mapping',
                        'mappings' => [
                            'ə => e', 'Ə => e',
                            'ı => i', 'I => i',
                            'ö => o', 'Ö => o',
                            'ü => u', 'Ü => u',
                            'ş => s', 'Ş => s',
                            'ç => c', 'Ç => c',
                            'ğ => g', 'Ğ => g'
                        ]
                    ]
                ],
                'filter' => [
                    'autocomplete_filter' => [
                        'type' => 'edge_ngram',
                        'min_gram' => 1,
                        'max_gram' => 20
                    ]
                ],
                'analyzer' => [
                    'autocomplete_index' => [
                        'type' => 'custom',
                        'char_filter' => ['az_char_mapping'],
                        'tokenizer' => 'standard',
                        'filter' => ['lowercase', 'autocomplete_filter']
                    ],
                    'autocomplete_search' => [
                        'type' => 'custom',
                        'char_filter' => ['az_char_mapping'],
                        'tokenizer' => 'standard',
                        'filter' => ['lowercase']
                    ]
                ]
            ]
        ];
    }

    /**
     * Get model-specific properties mapping. Override this in models.
     */
    public static function getSearchMapping(): array
    {
        return [
            'properties' => []
        ];
    }
}

