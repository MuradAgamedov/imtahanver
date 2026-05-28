<?php

namespace App\Services\Contracts;

interface MiqQuestionTypeServiceInterface
{
    public function getOrSeedQuestionTypes(int $exampageId): array;
}
