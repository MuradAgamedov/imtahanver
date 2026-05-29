<?php

namespace App\Repositories\Eloquent;

use App\Models\MiqExampage;
use App\Repositories\Contracts\MiqExampageRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MiqExampageRepository implements MiqExampageRepositoryInterface
{
    public function all(?string $search = null): Collection
    {
        if (empty($search)) {
            return MiqExampage::orderBy('id', 'desc')->get();
        }

        try {
            $client = app(\Elastic\Elasticsearch\Client::class);

            $response = $client->search([
                'index' => 'miq_exampages',
                'body'  => [
                    'query' => [
                        'bool' => [
                            'should' => [
                                // 1. Exact phrase/word match on main fields (High Boost)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['title^10'],
                                        'type' => 'phrase',
                                    ]
                                ],
                                // 2. Exact match with fuzziness (Typo tolerance on main fields)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['title^5'],
                                        'fuzziness' => 'AUTO',
                                        'prefix_length' => 1,
                                    ]
                                ],
                                // 3. Autocomplete prefix match via edge_ngram (Prefix Boost)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['title.autocomplete^3'],
                                        'analyzer' => 'autocomplete_search',
                                    ]
                                ],
                                // 4. Fuzzy autocomplete prefix match (Fallback for prefix typos)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['title.autocomplete^1'],
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

            $ids = collect($response['hits']['hits'])->pluck('_id')->toArray();

            if (empty($ids)) {
                return new Collection();
            }

            return MiqExampage::whereIn('id', $ids)
                ->orderByRaw("FIELD(id, " . implode(',', $ids) . ")")
                ->get();

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Elasticsearch miq_exampages search error: " . $e->getMessage());

            return MiqExampage::orderBy('id', 'desc')
                ->where('title', 'like', '%' . $search . '%')
                ->get();
        }
    }

    public function findById(int $id): ?MiqExampage
    {
        return MiqExampage::find($id);
    }

    public function create(array $data): MiqExampage
    {
        return MiqExampage::create($data);
    }

    public function update(MiqExampage $exampage, array $data): MiqExampage
    {
        $exampage->update($data);
        return $exampage->fresh();
    }

    public function delete(MiqExampage $exampage): bool
    {
        return $exampage->delete();
    }
}
