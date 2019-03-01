<?php
include 'db_context.php';

$context = new db_context();
$context->connect();
$rows = $context->query("select date_release, max(part) as part from episode where NOW() >= date_release;");
$context->disconnect();

header('Content-Type: application/json');
echo json_encode($rows[0]["part"]);
