<?php

namespace App\Http\Controllers;

use App\Services\LegalDocuments;

class LegalController extends Controller
{
    public function show(string $document)
    {
        abort_unless(isset(LegalDocuments::PAGES[$document]), 404);

        return response()->view('legal.document', [
            'document' => $document, 'title' => LegalDocuments::PAGES[$document],
        ]);
    }
}
