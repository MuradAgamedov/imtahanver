<?php

namespace App\Repositories\Eloquent;

use App\Models\MagistraturaSubject;
use App\Repositories\Contracts\MagistraturaSubjectRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MagistraturaSubjectRepository implements MagistraturaSubjectRepositoryInterface
{
    public function all(?string $search = null): Collection
    {
        if (empty($search)) {
            return MagistraturaSubject::orderBy('order', 'asc')->get();
        }

        try {
            $client = app(\Elastic\Elasticsearch\Client::class);

            $response = $client->search([
                'index' => 'magistratura_subjects',
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
                                        'query'          => $search,
                                        'fields'         => ['title^5', 'identify^4'],
                                        'fuzziness'      => 'AUTO',
                                        'prefix_length'  => 1,
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

            return MagistraturaSubject::whereIn('id', $ids)
                ->orderByRaw('FIELD(id, ' . implode(',', $ids) . ')')
                ->get();

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Elasticsearch magistratura_subjects search error: ' . $e->getMessage());

            return MagistraturaSubject::orderBy('order', 'asc')
                ->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                      ->orWhere('identify', 'like', '%' . $search . '%');
                })
                ->get();
        }
    }

    public function findById(int $id): ?MagistraturaSubject
    {
        return MagistraturaSubject::find($id);
    }

    public function findByIdentify(string $identify): ?MagistraturaSubject
    {
        return MagistraturaSubject::where('identify', $identify)->first();
    }

    public function create(array $data): MagistraturaSubject
    {
        return MagistraturaSubject::create($data);
    }

    public function update(MagistraturaSubject $subject, array $data): bool
    {
        return $subject->update($data);
    }

    public function delete(MagistraturaSubject $subject): bool
    {
        return $subject->delete();
    }
}
