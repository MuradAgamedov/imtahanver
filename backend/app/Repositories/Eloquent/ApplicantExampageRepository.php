<?php

namespace App\Repositories\Eloquent;

use App\Models\ApplicantExampage;
use App\Repositories\Contracts\ApplicantExampageRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ApplicantExampageRepository implements ApplicantExampageRepositoryInterface
{
    public function all(?string $search = null): Collection
    {
        if (empty($search)) {
            return ApplicantExampage::orderBy('id', 'desc')->get();
        }

        try {
            $client = app(\Elastic\Elasticsearch\Client::class);

            $response = $client->search([
                'index' => 'applicant_exampages',
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

            return ApplicantExampage::whereIn('id', $ids)
                ->orderByRaw('FIELD(id, ' . implode(',', $ids) . ')')
                ->get();

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Elasticsearch applicant_exampages search error: ' . $e->getMessage());

            return ApplicantExampage::orderBy('id', 'desc')
                ->where('title', 'like', '%' . $search . '%')
                ->get();
        }
    }

    public function findById(int $id): ?ApplicantExampage
    {
        return ApplicantExampage::find($id);
    }

    public function create(array $data): ApplicantExampage
    {
        return ApplicantExampage::create($data);
    }

    public function update(ApplicantExampage $exampage, array $data): ApplicantExampage
    {
        $exampage->update($data);
        return $exampage->fresh();
    }

    public function delete(ApplicantExampage $exampage): bool
    {
        return $exampage->delete();
    }
}
