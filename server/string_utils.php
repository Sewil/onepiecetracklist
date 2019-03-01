<?php
function is_null_or_whitespace($value) {
    return (!isset($value) || trim($value) === '');
}
?>