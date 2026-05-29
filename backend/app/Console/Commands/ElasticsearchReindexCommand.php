<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ElasticsearchReindexCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'elasticsearch:reindex {--recreate : Recreate indices with custom analyzers and mappings}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reindex all searchable models into Elasticsearch';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Elasticsearch reindexing...');
        $client = app(\Elastic\Elasticsearch\Client::class);
        $recreate = $this->option('recreate');

        $models = [
            \App\Models\MiqSubject::class,
            \App\Models\UserCategory::class,
            \App\Models\MiqExampage::class,
            \App\Models\User::class,
            \App\Models\Admin::class,
        ];

        foreach ($models as $modelClass) {
            $index = (new $modelClass)->getTable();

            if ($recreate) {
                $this->info("Recreating index '{$index}'...");
                if ($client->indices()->exists(['index' => $index])->asBool()) {
                    $client->indices()->delete(['index' => $index]);
                }

                $client->indices()->create([
                    'index' => $index,
                    'body'  => [
                        'settings' => $modelClass::getSearchSettings(),
                        'mappings' => $modelClass::getSearchMapping()
                    ]
                ]);
            }

            $this->info("Indexing {$modelClass}...");
            
            $count = 0;
            $modelClass::all()->each(function ($model) use (&$count) {
                $model->indexEntity();
                $count++;
            });

            $this->info("Successfully indexed {$count} records for {$modelClass}.");
        }

        $this->info('Elasticsearch reindexing completed successfully!');
    }
}

