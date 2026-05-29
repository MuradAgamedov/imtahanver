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
                        'multi_match' => [
                            'query'     => $search,
                            'fields'    => ['title'],
                            'fuzziness' => 'AUTO',
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
