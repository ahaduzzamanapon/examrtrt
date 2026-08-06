<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
| Private user channel: listens for wallet updates, notifications, battle invites
| Presence exam channel: live leaderboard during contest
| Presence battle channel: 1v1 real-time sync
*/

// Private channel — authenticated user only
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Presence channel — exam participants
Broadcast::channel('exam.{examId}', function ($user, $examId) {
    // Any authenticated user can subscribe (join check done in controller)
    return [
        'id'     => $user->id,
        'name'   => $user->name,
        'avatar' => $user->avatar,
    ];
});

// Presence channel — 1v1 battle participants
Broadcast::channel('battle.{battleId}', function ($user, $battleId) {
    $battle = \App\Models\BattleSession::find($battleId);
    if (!$battle) return false;

    // Only the two combatants can join
    if ($battle->challenger_id !== $user->id && $battle->opponent_id !== $user->id) {
        return false;
    }

    return [
        'id'   => $user->id,
        'name' => $user->name,
    ];
});
