<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search', '');

        $users = User::query()
            ->when($search, fn($q) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            }))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn($u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'email'         => $u->email,
                'role'          => $u->role,
                'token_balance' => $u->token_balance ?? 0,
                'wallet_balance'=> round($u->wallet_balance ?? 0, 0),
                'exam_goal'     => $u->exam_goal,
                'has_fcm'       => !is_null($u->fcm_token),
                'avatar'        => $u->avatar,
                'created_at'    => $u->created_at?->diffForHumans(),
            ]);

        return Inertia::render('Admin/Users', [
            'users'  => $users,
            'search' => $search,
            'stats'  => [
                'total'   => User::count(),
                'admins'  => User::where('role', 'ADMIN')->count(),
                'fcm'     => User::whereNotNull('fcm_token')->count(),
            ],
        ]);
    }

    public function updateRole(Request $request, User $user)
    {
        $request->validate(['role' => 'required|in:STUDENT,ADMIN']);
        $user->update(['role' => $request->role]);
        return back()->with('success', "Role আপডেট হয়েছে।");
    }

    public function updateTokens(Request $request, User $user)
    {
        $request->validate(['tokens' => 'required|integer|min:0|max:99999']);
        $user->update(['token_balance' => $request->tokens]);
        return back()->with('success', "Token আপডেট হয়েছে।");
    }

    public function destroy(User $user)
    {
        if ($user->role === 'ADMIN') {
            return back()->with('error', 'Admin account মুছে ফেলা যাবে না।');
        }
        $user->delete();
        return back()->with('success', 'User মুছে ফেলা হয়েছে।');
    }
}
