<?php

namespace App\Http\Controllers;

use App\Services\DocumentLookup;
use Illuminate\Http\Request;

class DocumentLookupController extends Controller
{
    public function __invoke(Request $request, DocumentLookup $lookup)
    {
        $data = $request->validate([
            'document_type' => ['required', 'in:DNI,RUC'],
            'document_number' => ['required', 'string', $request->input('document_type') === 'RUC' ? 'regex:/^[0-9]{11}$/' : 'regex:/^[0-9]{8}$/'],
        ]);

        return response()->json($lookup->find($data['document_type'], $data['document_number']))
            ->header('Cache-Control', 'private, no-store');
    }
}
