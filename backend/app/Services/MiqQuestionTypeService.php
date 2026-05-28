<?php

namespace App\Services;

use App\Repositories\Contracts\MiqQuestionTypeRepositoryInterface;
use App\Repositories\Contracts\MiqExampageRepositoryInterface;
use App\Services\Contracts\MiqQuestionTypeServiceInterface;

class MiqQuestionTypeService implements MiqQuestionTypeServiceInterface
{
    protected MiqQuestionTypeRepositoryInterface $questionTypeRepository;
    protected MiqExampageRepositoryInterface $exampageRepository;

    public function __construct(
        MiqQuestionTypeRepositoryInterface $questionTypeRepository,
        MiqExampageRepositoryInterface $exampageRepository
    ) {
        $this->questionTypeRepository = $questionTypeRepository;
        $this->exampageRepository = $exampageRepository;
    }

    public function getOrSeedQuestionTypes(int $exampageId): array
    {
        $exampage = $this->exampageRepository->findById($exampageId);
        if (!$exampage) {
            return [
                'success' => false,
                'message' => 'İmtahan vərəqi tapılmadı.',
                'status_code' => 404
            ];
        }

        $types = $this->questionTypeRepository->getByExampageId($exampageId);

        if ($types->isEmpty()) {
            $defaultTypes = [
                [
                    'title' => 'Fənn proqramları',
                    'identify' => 'fenn-proqramlari'
                ],
                [
                    'title' => 'Tədris metodikası və təlim strategiyası',
                    'identify' => 'tedris-metodikasi-ve-telim-strategiyasi'
                ]
            ];

            foreach ($defaultTypes as $dt) {
                $this->questionTypeRepository->create([
                    'miq_exampage_id' => $exampageId,
                    'title' => $dt['title'],
                    'identify' => $dt['identify']
                ]);
            }

            $types = $this->questionTypeRepository->getByExampageId($exampageId);
        }

        return [
            'success' => true,
            'exampage' => $exampage,
            'data' => $types,
            'status_code' => 200
        ];
    }
}
