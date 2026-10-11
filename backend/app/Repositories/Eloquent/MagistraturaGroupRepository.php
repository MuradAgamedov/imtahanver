<?php

namespace App\Repositories\Eloquent;

use App\Models\MagistraturaGroup;
use App\Repositories\Contracts\MagistraturaGroupRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MagistraturaGroupRepository implements MagistraturaGroupRepositoryInterface
{
    public function all(?string $search = null): Collection
    {
        if (empty($search)) {
            return MagistraturaGroup::with('subjects')->orderBy('order', 'asc')->get();
        }

        try {
            $client = app(\Elastic\Elasticsearch\Client::class);

            $response = $client->search([
                'index' => 'magistratura_groups',
                'body'  => [
                    'query' => [
                        'bool' => [
                            'should' => [
                                [
                                    'multi_match' => [
                                        'query'  => $search,
                                        'fields' => ['title^10', 'identify^8'],
                                        'type'   => 'phrase',
                                    ],
                                ],
                                [
                                    'multi_match' => [
                                        'query'         => $search,
                                        'fields'        => ['title^5', 'identify^4'],
                                        'fuzziness'     => 'AUTO',
                                        'prefix_length' => 1,
                                    ],
                                ],
                                [
                                    'multi_match' => [
                                        'query'    => $search,
                                        'fields'   => ['title.autocomplete^3', 'identify.autocomplete^2'],
                                        'analyzer' => 'autocomplete_search',
                                    ],
                                ],
                                [
                                    'multi_match' => [
                                        'query'         => $search,
                                        'fields'        => ['title.autocomplete^1', 'identify.autocomplete^1'],
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

            return MagistraturaGroup::with('subjects')
                ->whereIn('id', $ids)
                ->orderByRaw('FIELD(id, ' . implode(',', $ids) . ')')
                ->get();

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Elasticsearch magistratura_groups search error: ' . $e->getMessage());

            return MagistraturaGroup::with('subjects')
                ->orderBy('order', 'asc')
                ->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                      ->orWhere('identify', 'like', '%' . $search . '%');
                })
                ->get();
        }
    }

    public function findById(int $id): ?MagistraturaGroup
    {
        return MagistraturaGroup::with('subjects')->find($id);
    }

    public function findByIdentify(string $identify): ?MagistraturaGroup
    {
        return MagistraturaGroup::where('identify', $identify)->first();
    }

    public function create(array $data): MagistraturaGroup
    {
        return MagistraturaGroup::create($data);
    }

    public function update(MagistraturaGroup $group, array $data): bool
    {
        return $group->update($data);
    }

    public function delete(MagistraturaGroup $group): bool
    {
        return $group->delete();
    }

    public function syncSubjects(MagistraturaGroup $group, array $subjectIds): void
    {
        $group->subjects()->sync($subjectIds);
    }
}
