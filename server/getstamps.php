<?php
include 'db_context.php';
include 'string_utils.php';
include 'secure_indexer.php';

$selectedpage = $_GET['page'];
if(!($selectedpage > 0)) {
    $selectedpage = 1;
}

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
"subsong.timestamp as subsong_timestamp,".
"`song`.`id` as `song_id` FROM `episode2episodetimestamp`".
"left join `episode` on `episode`.`id` = `episode2episodetimestamp`.`episodeid`".
"left join `song` on `song`.`id` = `episode2episodetimestamp`.`song_id`".
"left join `subsong` on `subsong`.`id` = `episode2episodetimestamp`.`subsong_id`".
"left join `album` on `album`.`id` = `song`.`album_id`".
"where greatest(cast((select max(part) from episode) as signed)-(?*100),0) <= part && part <= (select max(part) from episode) - ((?-1)*100)".
"order by part desc;";
$context = new db_context();
$context->connect();
$rows = $context->query($sql, array_fill(0, 2, $selectedpage), 'dd');
$context->disconnect();

$data = [
    "pages" => $rows[0]["pages"],
    "episodes" => []
];

$episode = -1;
$episode_i = -1;

foreach($rows as $row) {
    $part = scr_value($row, 'part');
    if($episode != $part) {
        $episode = $part;
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
    
    $song_timestamp = scr_value($row, 'song_timestamp');
    if($song_timestamp == null) {
        $song_timestamp = scr_value($row, 'subsong_timestamp');
    }
    $song_time = strtotime($song_timestamp);
    $data['episodes'][$episode_i]['stamps'][] = [
        'time' => date("i:s", strtotime($row['episode_timestamp'])),
        'song' => [
            'id' => scr_value($row, 'song_id'),
            'titles' => [
                'en' => scr_value($row, 'song_title'),
                'ja' => scr_value($row, 'song_title_japanese')
            ],
            'time' => date("i:s", $song_time),
            'time_seconds' => $song_time - strtotime("today"),
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
