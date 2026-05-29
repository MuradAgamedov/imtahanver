<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        return User::create([
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);
    }

    public function verifyEmail(User $user): bool
    {
        return $user->update([
            'email_verified_at' => now(),
        ]);
    }

    public function update(User $user, array $data): bool
    {
        return $user->update($data);
    }

    public function all(): \Illuminate\Database\Eloquent\Collection
    {
        return User::orderBy('id', 'desc')->get();
    }

    public function allNonAdmins(?string $search = null): \Illuminate\Database\Eloquent\Collection
    {
        if (empty($search)) {
            return User::where('is_admin', false)->orderBy('id', 'desc')->get();
        }

        try {
            $client = app(\Elastic\Elasticsearch\Client::class);

            $response = $client->search([
                'index' => 'users',
                'body'  => [
                    'query' => [
                        'bool' => [
                            'should' => [
                                // 1. Exact phrase/word match on main fields (High Boost)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['first_name^10', 'last_name^10', 'email^8'],
                                        'type' => 'phrase',
                                    ]
                                ],
                                // 2. Exact match with fuzziness (Typo tolerance on main fields)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['first_name^5', 'last_name^5', 'email^4'],
                                        'fuzziness' => 'AUTO',
                                        'prefix_length' => 1,
                                    ]
                                ],
                                // 3. Autocomplete prefix match via edge_ngram (Prefix Boost)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['first_name.autocomplete^3', 'last_name.autocomplete^3', 'email.autocomplete^2'],
                                        'analyzer' => 'autocomplete_search',
                                    ]
                                ],
                                // 4. Fuzzy autocomplete prefix match (Fallback for prefix typos)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['first_name.autocomplete^1', 'last_name.autocomplete^1', 'email.autocomplete^1'],
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
                return new \Illuminate\Database\Eloquent\Collection();
            }

            return User::where('is_admin', false)
                ->whereIn('id', $ids)
                ->orderByRaw("FIELD(id, " . implode(',', $ids) . ")")
                ->get();

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Elasticsearch users search error: " . $e->getMessage());

            return User::where('is_admin', false)
                ->where(function($q) use ($search) {
                    $q->where('first_name', 'like', '%' . $search . '%')
                      ->orWhere('last_name', 'like', '%' . $search . '%')
                      ->orWhere('email', 'like', '%' . $search . '%');
                })
                ->orderBy('id', 'desc')
                ->get();
        }
    }

    public function allAdmins(?string $search = null): \Illuminate\Database\Eloquent\Collection
    {
        if (empty($search)) {
            return User::where('is_admin', true)->orderBy('id', 'desc')->get();
        }

        try {
            $client = app(\Elastic\Elasticsearch\Client::class);

            $response = $client->search([
                'index' => 'users',
                'body'  => [
                    'query' => [
                        'bool' => [
                            'should' => [
                                // 1. Exact phrase/word match on main fields (High Boost)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['first_name^10', 'last_name^10', 'email^8'],
                                        'type' => 'phrase',
                                    ]
                                ],
                                // 2. Exact match with fuzziness (Typo tolerance on main fields)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['first_name^5', 'last_name^5', 'email^4'],
                                        'fuzziness' => 'AUTO',
                                        'prefix_length' => 1,
                                    ]
                                ],
                                // 3. Autocomplete prefix match via edge_ngram (Prefix Boost)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['first_name.autocomplete^3', 'last_name.autocomplete^3', 'email.autocomplete^2'],
                                        'analyzer' => 'autocomplete_search',
                                    ]
                                ],
                                // 4. Fuzzy autocomplete prefix match (Fallback for prefix typos)
                                [
                                    'multi_match' => [
                                        'query' => $search,
                                        'fields' => ['first_name.autocomplete^1', 'last_name.autocomplete^1', 'email.autocomplete^1'],
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
                return new \Illuminate\Database\Eloquent\Collection();
            }

            return User::where('is_admin', true)
                ->whereIn('id', $ids)
                ->orderByRaw("FIELD(id, " . implode(',', $ids) . ")")
                ->get();

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Elasticsearch admins search error: " . $e->getMessage());

            return User::where('is_admin', true)
                ->where(function($q) use ($search) {
                    $q->where('first_name', 'like', '%' . $search . '%')
                      ->orWhere('last_name', 'like', '%' . $search . '%')
                      ->orWhere('email', 'like', '%' . $search . '%');
                })
                ->orderBy('id', 'desc')
                ->get();
        }
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }
}
