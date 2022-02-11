const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    _id: {
        type: String,
    },
    moviePosterUrl: {
        type: String
    },
    ownerRate: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const watchedMovieSchema = new Schema({
    _id: {
        type: String,
        ref: 'User',
    },
    movieList: [
        MovieSchema
    ]
});

/*watchedTvSchema.pre('addMovie', async function (next) {
    watchedTvList.p
});*/

const WatchedMovie = mongoose.model('watchedmovie', watchedMovieSchema);
const WatchedTv = mongoose.model('watchedtv', watchedMovieSchema);
const WatchlistMovie = mongoose.model('watchlistmovie', watchedMovieSchema);
const WatchlistTv = mongoose.model('watchlisttv', watchedMovieSchema);
module.exports = { WatchlistTv: WatchlistTv, WatchlistMovie: WatchlistMovie, WatchedTv: WatchedTv, WatchedMovie: WatchedMovie };
