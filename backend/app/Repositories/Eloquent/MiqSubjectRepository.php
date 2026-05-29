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
                'index' => 'miq_subjects', // index adı modelin cədvəl adı ilə eynidir
                'body'  => [
                    'query' => [
                        'multi_match' => [
                            'query'     => $search,
                            'fields'    => ['title', 'identify'],
                            'fuzziness' => 'AUTO', // Hərf səhvlərini tapmaq üçün
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
