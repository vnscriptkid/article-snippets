// tweets module 
const Twit = require('twit');

var T = new Twit({
    consumer_key: 'RxB8BlALHLxY2cEBzDf41owCj',
    consumer_secret: 'pf9MS6Vdjt2hbZeqMORreNe2e33NOtbwyU7tXRVE2Tg7KKhYog',
    access_token: '2669827570-8kzW6mJnaAXCrFN48A9kn0ldaHuf4YpSJyxvHvE',
    access_token_secret: 'S6VD1J7hthKKC4WlHxcE4DU11IicH61yu1svmB1uVZ7OB',
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL: true,     // optional - requires SSL certificates to be valid.
});

let stream = T.stream('statuses/filter', { track: 'cricket' });
let isStreamStopped = false;

function getTweetObject(tweet) {
    let tweetText = (tweet.extended_tweet) ? tweet.extended_tweet.full_text : tweet.text;

    // check for retweets
    if (tweet.text.includes('RT @') && tweet.retweeted_status) {
        tweetText = (tweet.retweeted_status.extended_tweet) ? tweet.retweeted_status.extended_tweet.full_text : tweet.retweeted_status.text;
    }

    let TweetObject = {
        text: tweetText,
        user: tweet.user.name,
        location: (tweet.user.location !== null) ? tweet.user.location : '',
        followers: tweet.user.followers_count,
        userImage: tweet.user.profile_image_url,
        timestamp: tweet.timestamp_ms,
    };

    return TweetObject;
}

module.exports = (io) => {
    io.on('connection', function (socket) {
        console.log('sockets connected');

        socket.on('stop stream', () => {
            console.log('stopped streaming tweets');
            stream.stop();
            isStreamStopped = true;
        });

        socket.on('restart stream', () => {
            console.log('restarted streaming tweets');
            stream.start();
            isStreamStopped = false;
        });

        socket.on('start stream', () => {
            console.log('started streaming tweets');

            if (!isStreamStopped) {
                stream.stop();
            }

            stream.on('tweet', function (tweet) {
                console.log('tweeting');

                let TweetObject = getTweetObject(tweet);

                socket.emit('latest tweets', TweetObject);
            });

            stream.start();

            isStreamStopped = false;
        });
    });
}