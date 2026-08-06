<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when wallet balance changes (deposit approved, prize payout, entry fee).
 * Updates the UI balance counter in real-time without page refresh.
 */
class WalletBalanceUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int    $userId,
        public readonly float  $newBalance,
        public readonly float  $changeAmount,
        public readonly string $type,        // DEPOSIT | PRIZE_PAYOUT | ENTRY_FEE | WITHDRAWAL
        public readonly string $description,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('user.' . $this->userId)];
    }

    public function broadcastAs(): string
    {
        return 'wallet.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'new_balance'   => $this->newBalance,
            'change_amount' => $this->changeAmount,
            'type'          => $this->type,
            'description'   => $this->description,
            'is_credit'     => in_array($this->type, ['DEPOSIT', 'PRIZE_PAYOUT']),
        ];
    }
}
