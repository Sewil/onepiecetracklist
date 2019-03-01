<?php
include 'db_context.php';
include_once 'logger.php';
function search($table, $title) {
    $context = new db_context();
    $title_s = "%" . str_replace("'", "\'", strtolower(trim($title))) . "%";
    $context->connect();
    $stmt = $context->prepare("select * from " . $table . " where lcase(title) like ? or lcase(title_japanese) like ?;");
    $stmt->bind_param('ss', $title_s, $title_s);
    $result = $context->execute($stmt, true);
    $data = $context->fetch($result);
    $context->disconnect();
    if(sizeof($data) > 0) {
        header('Content-Type: application/json');
        echo json_encode($data);
    } else {
        http_response_code(404);
    }
}
try {
    if(isset($_GET['song_title'])) {
        search('song', $_GET['song_title']);
    } else if(isset($_GET['album_title'])) {
        search('album', $_GET['album_title']);
    } else {
        http_response_code(400);
    }
} catch (Exception $e) {
    log_error($e->getMessage());
    http_response_code(500);
}
?>
