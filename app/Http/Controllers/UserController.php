<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{



    public function search(Request $request)
    {
        $query = $request->input('query', '');

        $users = User::query()
            ->where('id', '<>', auth()->id()) // Exclude the current user
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get();

        return response()->json(['users' => $users]);
    }

}
