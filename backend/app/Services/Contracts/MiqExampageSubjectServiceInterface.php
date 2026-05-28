<?php

namespace App\Services\Contracts;

interface MiqExampageSubjectServiceInterface
{
    public function listAssociatedSubjects(int $exampageId): array;
    public function associateSubject(int $exampageId, int $subjectId): array;
    public function dissociateSubject(int $exampageId, int $subjectId): array;
}
