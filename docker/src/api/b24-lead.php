<?php
declare(strict_types=1);

$root = dirname(__DIR__, 2);
$envFile = $root . '/.env';


function envget(string $key, string $default = ''): string
{
  $v = getenv($key);
  if ($v !== false && $v !== '')
    return $v;
  return $_ENV[$key] ?? $default;
}

$b24Base = envget('B24_BASE', '');
$allowedOrigins = array_values(array_filter(array_map('trim', explode(',', envget('ALLOWED_ORIGINS', '')))));
$turnstileSecret = envget('TURNSTILE_SECRET', '');

$maxBody = 65536;
$timeoutSec = 15;

if ($b24Base === '') {
  respond(500, ['ok' => false, 'error' => 'B24_BASE not configured']);
}

header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Permissions-Policy: interest-cohort=()');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$isAllowedOrigin = $origin !== '' && in_array($origin, $allowedOrigins, true);


if ($isAllowedOrigin) {
  header('Access-Control-Allow-Origin: ' . $origin);
  header('Vary: Origin');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'OPTIONS') {
  http_response_code($isAllowedOrigin ? 204 : 400);
  exit;
}

if ($method !== 'POST') {
  respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

if ($origin !== '' && !$isAllowedOrigin) {
  respond(403, ['ok' => false, 'error' => 'forbidden_origin']);
}

$clen = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($clen > $maxBody) {
  respond(413, ['ok' => false, 'error' => 'payload_too_large']);
}

$ctype = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($ctype, 'application/json') === false) {
  respond(415, ['ok' => false, 'error' => 'unsupported_media_type']);
}

$raw = file_get_contents('php://input') ?: '';
$data = json_decode($raw, true);
if (!is_array($data)) {
  respond(400, ['ok' => false, 'error' => 'invalid_json']);
}

$name = trim((string) ($data['name'] ?? ''));
$phone = trim((string) ($data['phone'] ?? ''));
$message = trim((string) ($data['message'] ?? ''));
$page = trim((string) ($data['page'] ?? ''));
$utm = is_array($data['utm'] ?? null) ? $data['utm'] : [];

$honeypot = (string) ($data['company'] ?? '');
$ts = (int) ($data['ts'] ?? 0);
$token = (string) ($data['cfTurnstileToken'] ?? '');

if ($name === '' || $phone === '') {
  respond(400, ['ok' => false, 'error' => 'name_and_phone_required']);
}

if ($honeypot !== '') {
  respond(400, ['ok' => false, 'error' => 'bot_detected']);
}

if ($ts > 0 && (int) (microtime(true) * 1000) - $ts < 1200) {
  respond(400, ['ok' => false, 'error' => 'too_fast']);
}

$clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
if (tooManyRequests($clientIp, 3, 300)) {
  respond(429, ['ok' => false, 'error' => 'too_many_requests']);
}

$cap = verifyTurnstile($token, $turnstileSecret, $clientIp);
if (!$cap['ok']) {
  respond(400, ['ok' => false, 'error' => 'captcha_failed', 'raw' => $cap['raw'] ?? null]);
}

$phoneNorm = preg_replace('~[^\d\+\(\)\-\s]~u', '', $phone) ?: $phone;

$comments = $message;
if ($page !== '') {
  $comments .= ($comments ? "\n\n" : '') . 'Страница: ' . $page;
}

$payload = [
  'fields' => [
    'TITLE' => 'Заявка с сайта: ' . $name,
    'NAME' => $name,
    'PHONE' => [['VALUE' => $phoneNorm, 'VALUE_TYPE' => 'WORK']],
    'COMMENTS' => $comments,
    'SOURCE_ID' => 'WEB',
    'UTM_SOURCE' => (string) ($utm['utm_source'] ?? ''),
    'UTM_MEDIUM' => (string) ($utm['utm_medium'] ?? ''),
    'UTM_CAMPAIGN' => (string) ($utm['utm_campaign'] ?? ''),
    'UTM_TERM' => (string) ($utm['utm_term'] ?? ''),
    'UTM_CONTENT' => (string) ($utm['utm_content'] ?? ''),
  ],
  'params' => ['REGISTER_SONET_EVENT' => 'Y'],
];

$url = rtrim($b24Base, '/') . '/crm.lead.add.json';
[$httpCode, $respBody, $curlErr] = httpPostJson($url, $payload, $timeoutSec);
error_log("B24 http=$httpCode body=" . substr($respBody, 0, 1000));


if ($curlErr !== null) {
  respond(502, ['ok' => false, 'error' => 'curl_error', 'raw' => $curlErr]);
}


$b24 = json_decode($respBody, true);
if ($httpCode >= 400 || isset($b24['error'])) {
  respond(502, [
    'ok' => false,
    'error' => $b24['error_description'] ?? $b24['error'] ?? ('HTTP ' . $httpCode),
    'raw' => $b24,
  ]);
}

$leadId = $b24['result'] ?? null;
$portal = explode('/rest/', $b24Base, 2)[0];
$leadUrl = $leadId ? ($portal . '/crm/lead/details/' . $leadId . '/') : null;

respond(200, ['ok' => true, 'leadId' => $leadId, 'leadUrl' => $leadUrl]);

function respond(int $code, array $payload): void
{
  header('Content-Type: application/json; charset=utf-8');
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

function httpPostJson(string $url, array $payload, int $timeoutSec = 15): array
{
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
    CURLOPT_TIMEOUT => $timeoutSec,
  ]);
  $resp = curl_exec($ch);
  $errno = curl_errno($ch);
  $error = $errno ? curl_error($ch) : null;
  $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return [$httpCode, (string) $resp, $error];
}

function tooManyRequests(string $ip, int $limit = 3, int $windowSec = 300): bool
{
  $dir = sys_get_temp_dir() . '/itsource-rate';
  if (!is_dir($dir))
    @mkdir($dir, 0777, true);
  $file = $dir . '/' . md5($ip) . '.json';
  $now = time();
  $arr = is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
  $arr = array_values(array_filter($arr, fn($t) => $now - (int) $t < $windowSec));
  if (count($arr) >= $limit)
    return true;
  $arr[] = $now;
  file_put_contents($file, json_encode($arr));
  return false;
}

function verifyTurnstile(string $token, string $secret, string $remoteIp = ''): array
{
  if ($secret === '' || $token === '') {
    return ['ok' => false, 'reason' => 'missing_secret_or_token'];
  }
  $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
  $postFields = http_build_query([
    'secret' => $secret,
    'response' => $token,
    'remoteip' => $remoteIp,
  ]);
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $postFields,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 5,
  ]);
  $resp = curl_exec($ch);
  $err = curl_error($ch);
  curl_close($ch);

  if ($err || !$resp)
    return ['ok' => false, 'reason' => 'curl_error'];
  $data = json_decode($resp, true) ?: [];
  return ['ok' => !empty($data['success']), 'raw' => $data];
}
