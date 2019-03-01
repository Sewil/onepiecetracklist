<?php
include 'db_context.php';
include 'secure_indexer.php';

$q = $_GET['query'];
$q = strtolower($q);
$q = trim($q);
$q = str_replace("'", "\'", $q);
$q = "%" . $q . "%";

$sql = "select episode.*,".
    "ceil((select max(part) from episode) / 100) as pages,".
    "`episode2episodetimestamp`.`episode_timestamp`,".
    "`song`.`title` as `song_title`,".
    "`song`.`title_japanese` as `song_title_japanese`,".
    "`song`.`track_number` as `track_number`,".
    "`album`.`id` as `album_id`,".
    "`album`.`title` as `album_title`,".
    "`album`.`title_japanese` as `album_title_japanese`,".
    "`album`.`date_release` as `album_date_release`,".
    "`episode2episodetimestamp`.`song_timestamp`,".
    "`song`.`id` as `song_id`".
    "from `episode2episodetimestamp`".
    "left join `episode` on `episode`.`part` = `episode2episodetimestamp`.`episode_part`".
    "left join `song` on `song`.`id` = `episode2episodetimestamp`.`song_id`".
    "left join `album` on `album`.`id` = `song`.`album_id`".
    "where part like ? or lcase(song.title) like ? or lcase(album.title) like ? or lcase(album.title_japanese) like ? or lcase(song.title_japanese) like ? ".
    "order by part desc;";

$context = new db_context();
$context->connect();
$rows = $context->query($sql, array_fill(0, 5, $q), 'sssss');
$context->disconnect();

$data = [
    "pages" => $rows[0]["pages"],
    "episodes" => []
];

$episode_i = -1;
$episode = -1;

foreach($rows as $row) {
    if($episode != $row['part']) {
        $episode = $row['part'];
        $date = strtotime($row['date_release']);
        $formatted_date = date("F j, Y", $date);
        $data['episodes'][] = [
            'episode' => $episode,
            'titles' => [
                'en' => scr_value($row, 'title'),
                'ja' => scr_value($row, 'title_japanese')
            ],
            'release' => $formatted_date,
            'stamps' => []
        ];
        $episode_i++;
    }
    
    $data['episodes'][$episode_i]['stamps'][] = [
        'time' => date("i:s", strtotime(scr_value($row, 'episode_timestamp'))),
        'song' => [
            'id' => scr_value($row, 'song_id'),
            'titles' => [
                'en' => scr_value($row, 'song_title'),
                'ja' => scr_value($row, 'song_title_japanese')
            ],
            'time' => date("i:s", strtotime(scr_value($row, 'song_timestamp'))),
            'time_seconds' => strtotime(scr_value($row, 'song_timestamp')) - strtotime("today"),
            'track' => scr_value($row, 'track_number')
        ],
        'album' => [
            'titles' => [
                'en' => scr_value($row, 'album_title'),
                'ja' => scr_value($row, 'album_title_japanese')
            ],
            'release' => scr_value($row, 'album_date_release')
        ]
    ];
}

$data['episodes'] = array_values($data['episodes']);

function sortepisodes($a, $b) {
    return strnatcmp($b['episode'], $a['episode']);
}
usort($data['episodes'], "sortepisodes");

header('Content-Type: application/json');
echo json_encode($data);