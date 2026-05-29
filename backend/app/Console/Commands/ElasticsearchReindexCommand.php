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
    protected $signature = 'elasticsearch:reindex';

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

        $models = [
            \App\Models\MiqSubject::class,
            \App\Models\UserCategory::class,
            \App\Models\MiqExampage::class,
            \App\Models\User::class,
        ];

        foreach ($models as $modelClass) {
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

