<?php
/**
 * Exam Arena — Deploy Webhook
 * URL: https://exam-arena.nxly.online/deploy_hook.php?token=DEPLOY_TOKEN
 *
 * GitHub Actions calls this via simple curl — no SSH needed.
 */

@ignore_user_abort(true);
@set_time_limit(300);

// ── Auth ────────────────────────────────────────────────────────────────────
$TOKEN = 'nxly-deploy-2026-exam-arena';
if (($_GET['token'] ?? '') !== $TOKEN) {
    http_response_code(401);
    exit("Unauthorized\n");
}

// ── Config ───────────────────────────────────────────────────────────────────
$DIR      = '/home/lcsyxfen/exam-arena-app';
$PHP      = '/usr/local/bin/php';
$COMPOSER = '/home/lcsyxfen/bin/composer';
$NODE_BIN = '/home/lcsyxfen/node-bin/bin';

// ── Flush immediately so curl doesn't timeout ────────────────────────────────
header('Content-Type: text/plain; charset=utf-8');
header('X-Accel-Buffering: no');
ob_implicit_flush(true);
if (ob_get_level()) ob_end_flush();

function run(string $cmd): void {
    echo "$ $cmd\n";
    passthru($cmd . ' 2>&1');
    echo "\n";
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "🚀 Exam Arena — Deploy Webhook\n";
echo date('Y-m-d H:i:s') . "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

// 1. Pull code
echo "📦 Pulling latest code...\n";
run("cd $DIR && git fetch origin");
run("cd $DIR && git reset --hard origin/main");

// 2. PHP dependencies
echo "📦 PHP dependencies...\n";
run("cd $DIR && $PHP $COMPOSER install --no-dev --optimize-autoloader --no-interaction");

// 3. Node.js build (if node-bin exists)
if (is_executable("$NODE_BIN/node")) {
    echo "🔧 Building frontend assets...\n";
    $nodeEnv = "PATH=$NODE_BIN:/usr/local/bin:/usr/bin:/bin";
    run("cd $DIR && $nodeEnv npm ci 2>/dev/null || $nodeEnv npm install");
    run("cd $DIR && $nodeEnv npm run build");
} else {
    echo "⚠️  Node.js not found at $NODE_BIN — skipping frontend build.\n\n";
}

// 4. Update .env domain to new URL
echo "🌐 Updating .env domain settings...\n";
$envFile = "$DIR/.env";
if (file_exists($envFile)) {
    $envData = file_get_contents($envFile);
    $envData = preg_replace('/^APP_URL=.*$/m', 'APP_URL=https://exam-arena.nxly.online', $envData);
    $envData = preg_replace('/^GOOGLE_REDIRECT_URI=.*$/m', 'GOOGLE_REDIRECT_URI=https://exam-arena.nxly.online/auth/google/callback', $envData);
    file_put_contents($envFile, $envData);
    echo "✅ Updated APP_URL & GOOGLE_REDIRECT_URI to https://exam-arena.nxly.online\n";
}

// 5. Artisan
echo "🗄️  Migrations & cache...\n";
foreach (['config:clear', 'route:clear', 'migrate --force --no-interaction', 'config:cache', 'route:cache', 'view:cache', 'event:cache'] as $cmd) {
    run("cd $DIR && $PHP artisan $cmd");
}

// 5. Storage link & permissions
run("cd $DIR && $PHP artisan storage:link --force 2>/dev/null; true");
run("chmod -R 775 $DIR/storage $DIR/bootstrap/cache");

// 6. Maintenance OFF
run("cd $DIR && $PHP artisan up");

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "✅ Deploy complete! " . date('Y-m-d H:i:s') . "\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
