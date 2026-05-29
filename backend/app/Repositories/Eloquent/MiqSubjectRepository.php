<?php

namespace App\Repositories\Eloquent;

use App\Models\MiqSubject;
use App\Repositories\Contracts\MiqSubjectRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MiqSubjectRepository implements MiqSubjectRepositoryInterface
{
        public function all(?string $search = null): Collection
    {
        // Əgər axtarış sözü yoxdursa, normal sıralama ilə qaytar
        if (empty($search)) {
            return MiqSubject::orderBy('order', 'asc')->get();
        }

        try {
            $client = app(\Elastic\Elasticsearch\Client::class);

            $response = $client->search([
                'index' => 'miq_subjects',
                'body'  => [
                    'query' => [
                        'bool' => [
                            'should' => [
                                // 1. Exact phrase/word match on main fields (High Boost)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['title^10', 'identify^8'],
                                        'type' => 'phrase',
                                    ]
                                ],
                                // 2. Exact match with fuzziness (Typo tolerance on main fields)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['title^5', 'identify^4'],
                                        'fuzziness' => 'AUTO',
                                        'prefix_length' => 1,
                                    ]
                                ],
                                // 3. Autocomplete prefix match via edge_ngram (Prefix Boost)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['title.autocomplete^3', 'identify.autocomplete^2'],
                                        'analyzer' => 'autocomplete_search',
                                    ]
                                ],
                                // 4. Fuzzy autocomplete prefix match (Fallback for prefix typos)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['title.autocomplete^1', 'identify.autocomplete^1'],
                                        'fuzziness' => 'AUTO',
                                        'prefix_length' => 1,
                                        'analyzer' => 'autocomplete_search',
                                    ]
                                ]
                            ],
                            'minimum_should_match' => 1,
                        ]
                    ]
                ]
            ]);

            // Elasticsearch-dən tapılan sənədlərin ID-lərini çıxarırıq
            $ids = collect($response['hits']['hits'])->pluck('_id')->toArray();

            if (empty($ids)) {
                return new Collection();
            }

            // DB-dən həmin ID-ləri Elasticsearch-ün qaytardığı uyğunluq (relevance) sırası ilə çəkirik
            return MiqSubject::whereIn('id', $ids)
                ->orderByRaw("FIELD(id, " . implode(',', $ids) . ")")
                ->get();

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Elasticsearch axtarış xətası: " . $e->getMessage());

            // Elasticsearch xəta verərsə, verilənlər bazasında SQL axtarışına keç
            return MiqSubject::orderBy('order', 'asc')
                ->where(function($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                      ->orWhere('identify', 'like', '%' . $search . '%');
                })
                ->get();
        }
    }


    public function findById(int $id): ?MiqSubject
    {
        return MiqSubject::find($id);
    }

    public function findByIdentify(string $identify): ?MiqSubject
    {
        return MiqSubject::where('identify', $identify)->first();
    }

    public function create(array $data): MiqSubject
    {
        return MiqSubject::create($data);
    }

    public function update(MiqSubject $subject, array $data): bool
    {
        return $subject->update($data);
    }

    public function delete(MiqSubject $subject): bool
    {
        return $subject->delete();
    }
}
