<?php

namespace App\Repositories\Eloquent;

use App\Models\ApplicantSubject;
use App\Repositories\Contracts\ApplicantSubjectRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ApplicantSubjectRepository implements ApplicantSubjectRepositoryInterface
{
    public function all(?string $search = null): Collection
    {
        if (empty($search)) {
            return ApplicantSubject::orderBy('order', 'asc')->get();
        }

        try {
            $client = app(\Elastic\Elasticsearch\Client::class);

            $response = $client->search([
                'index' => 'applicant_subjects',
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

            return ApplicantSubject::whereIn('id', $ids)
                ->orderByRaw('FIELD(id, ' . implode(',', $ids) . ')')
                ->get();

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Elasticsearch applicant_subjects search error: ' . $e->getMessage());

            return ApplicantSubject::orderBy('order', 'asc')
                ->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                      ->orWhere('identify', 'like', '%' . $search . '%');
                })
                ->get();
        }
    }

    public function findById(int $id): ?ApplicantSubject
    {
        return ApplicantSubject::find($id);
    }

    public function findByIdentify(string $identify): ?ApplicantSubject
    {
        return ApplicantSubject::where('identify', $identify)->first();
    }

    public function create(array $data): ApplicantSubject
    {
        return ApplicantSubject::create($data);
    }

    public function update(ApplicantSubject $subject, array $data): bool
    {
        return $subject->update($data);
    }

    public function delete(ApplicantSubject $subject): bool
    {
        return $subject->delete();
    }
}
