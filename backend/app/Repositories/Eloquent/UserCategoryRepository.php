<?php

namespace App\Repositories\Eloquent;

use App\Models\UserCategory;
use App\Repositories\Contracts\UserCategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class UserCategoryRepository implements UserCategoryRepositoryInterface
{
    public function all(?string $search = null): Collection
    {
        if (empty($search)) {
            return UserCategory::orderBy('id', 'asc')->get();
        }

        try {
            $client = app(\Elastic\Elasticsearch\Client::class);

            $response = $client->search([
                'index' => 'user_categories',
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

            $ids = collect($response['hits']['hits'])->pluck('_id')->toArray();

            if (empty($ids)) {
                return new Collection();
            }

            return UserCategory::whereIn('id', $ids)
                ->orderByRaw("FIELD(id, " . implode(',', $ids) . ")")
                ->get();

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Elasticsearch user_categories search error: " . $e->getMessage());

            return UserCategory::orderBy('id', 'asc')
                ->where(function($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                      ->orWhere('identify', 'like', '%' . $search . '%');
                })
                ->get();
        }
    }

    public function findByIdentify(string $identify): ?UserCategory
    {
        return UserCategory::where('identify', $identify)->first();
    }

    public function findById(int $id): ?UserCategory
    {
        return UserCategory::find($id);
    }

    public function create(array $data): UserCategory
    {
        return UserCategory::create($data);
    }

    public function update(UserCategory $category, array $data): bool
    {
        return $category->update($data);
    }

    public function delete(UserCategory $category): bool
    {
        return $category->delete();
    }
}
