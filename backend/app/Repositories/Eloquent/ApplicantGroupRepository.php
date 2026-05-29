<?php

namespace App\Repositories\Eloquent;

use App\Models\ApplicantGroup;
use App\Repositories\Contracts\ApplicantGroupRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ApplicantGroupRepository implements ApplicantGroupRepositoryInterface
{
    public function all(?string $search = null): Collection
    {
        if (empty($search)) {
            return ApplicantGroup::with('subjects')->orderBy('order', 'asc')->get();
        }

        try {
            $client = app(\Elastic\Elasticsearch\Client::class);

            $response = $client->search([
                'index' => 'applicant_groups',
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

            return ApplicantGroup::with('subjects')
                ->whereIn('id', $ids)
                ->orderByRaw('FIELD(id, ' . implode(',', $ids) . ')')
                ->get();

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Elasticsearch applicant_groups search error: ' . $e->getMessage());

            return ApplicantGroup::with('subjects')
                ->orderBy('order', 'asc')
                ->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                      ->orWhere('identify', 'like', '%' . $search . '%');
                })
                ->get();
        }
    }

    public function findById(int $id): ?ApplicantGroup
    {
        return ApplicantGroup::with('subjects')->find($id);
    }

    public function findByIdentify(string $identify): ?ApplicantGroup
    {
        return ApplicantGroup::where('identify', $identify)->first();
    }

    public function create(array $data): ApplicantGroup
    {
        return ApplicantGroup::create($data);
    }

    public function update(ApplicantGroup $group, array $data): bool
    {
        return $group->update($data);
    }

    public function delete(ApplicantGroup $group): bool
    {
        return $group->delete();
    }

    public function syncSubjects(ApplicantGroup $group, array $subjectIds): void
    {
        $group->subjects()->sync($subjectIds);
    }
}
