<?php

namespace App\Repositories\Eloquent;

use App\Models\MagistraturaExampage;
use App\Repositories\Contracts\MagistraturaExampageRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MagistraturaExampageRepository implements MagistraturaExampageRepositoryInterface
{
    public function all(?string $search = null): Collection
    {
        if (empty($search)) {
            return MagistraturaExampage::with('groups.subjects')->orderBy('id', 'desc')->get();
        }

        try {
            $client = app(\Elastic\Elasticsearch\Client::class);

            $response = $client->search([
                'index' => 'magistratura_exampages',
                'body'  => [
                    'query' => [
                        'bool' => [
                            'should' => [
                                [
                                    'multi_match' => [
                                        'query'  => $search,
                                        'fields' => ['title^10'],
                                        'type'   => 'phrase',
                                    ],
                                ],
                                [
                                    'multi_match' => [
                                        'query'         => $search,
                                        'fields'        => ['title^5'],
                                        'fuzziness'     => 'AUTO',
                                        'prefix_length' => 1,
                                    ],
                                ],
                                [
                                    'multi_match' => [
                                        'query'    => $search,
                                        'fields'   => ['title.autocomplete^3'],
                                        'analyzer' => 'autocomplete_search',
                                    ],
                                ],
                                [
                                    'multi_match' => [
                                        'query'         => $search,
                                        'fields'        => ['title.autocomplete^1'],
                                        'fuzziness'     => 'AUTO',
                                        'prefix_length' => 1,
                                        'analyzer'      => 'autocomplete_search',
                                    ],
                                ],
                            ],
                            'minimum_should_match' => 1,
                        ],
                    ],
                ],
            ]);

            $ids = collect($response['hits']['hits'])->pluck('_id')->toArray();

            if (empty($ids)) {
                return new Collection();
            }

            return MagistraturaExampage::with('groups.subjects')
                ->whereIn('id', $ids)
                ->orderByRaw('FIELD(id, ' . implode(',', $ids) . ')')
                ->get();

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Elasticsearch magistratura_exampages search error: ' . $e->getMessage());

            return MagistraturaExampage::with('groups.subjects')->orderBy('id', 'desc')
                ->where('title', 'like', '%' . $search . '%')
                ->get();
        }
    }

    public function findById(int $id): ?MagistraturaExampage
    {
        return MagistraturaExampage::with('groups.subjects')->find($id);
    }

    public function create(array $data): MagistraturaExampage
    {
        return MagistraturaExampage::create($data);
    }

    public function update(MagistraturaExampage $exampage, array $data): MagistraturaExampage
    {
        $exampage->update($data);
        return $exampage->fresh();
    }

    public function delete(MagistraturaExampage $exampage): bool
    {
        return $exampage->delete();
    }

    public function syncGroups(MagistraturaExampage $exampage, array $groupIds): void
    {
        $exampage->groups()->sync($groupIds);
    }
}
