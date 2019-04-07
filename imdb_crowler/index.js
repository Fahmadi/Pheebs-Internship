const rp = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs");
const json_func = require("./importer");
var Promise = require("bluebird");
const options = {
  uri: `https://www.imdb.com/chart/top`,
  transform: function(body) {
    return cheerio.load(body);
  }
};

async function main() {
  try {
    var movies = [];
    const $ = await rp(options);
    const href = [];

    $(".lister-list tr").each(function(i, elem) {
      href[i] = $(this)
        .find(".titleColumn > a")
        .attr("href");

      const name = $(this)
        .find(".titleColumn > a")
        .text();

      var str = $(this)
        .find(".titleColumn > span")
        .text();
      var str = str.match(/\d+/g, "") + "";
      var year = str.split(",").join("");

      const id = $(this)
        .find(".watchlistColumn > .wlb_ribbon")
        .attr("data-tconst");
      const rating = $(this)
        .find(".ratingColumn > strong")
        .text();

      const rank = i;
      const movie = {
        name,
        id,
        rank,
        year,
        rating
      };
      movies.push(movie);
    });
    async function addDirectorAndStarsToMovie(movie) {
      var stars = [];
      var star = {};
      // create new object to crowle each movie page
      const movie_page = {
        uri: `https://www.imdb.com//title/` + movie.id,
        transform: function(body) {
          return cheerio.load(body);
        }
      };
      const mp = await rp(movie_page);

      //initialize to director_name and director_id
      const director_name = mp(".plot_summary > .credit_summary_item > a")
        .first()
        .text();
      const director_id = mp(".plot_summary > .credit_summary_item > a")
        .attr("href")
        .split("/")[2];

      const director = {
        id: director_id,
        name: director_name
      };
      //push director to movie
      movie.director = director;

      // initialize to star_name and star_id
      mp(".plot_summary > .credit_summary_item")
        .last()
        .children()
        .each(function(i, elem) {
          if (i === 0 || i > 3) {
            return;
          }
          const star_name = mp(this).text();
          const star_id = mp(this)
            .attr("href")
            .split("/")[2];
          star = {
            id: star_id,
            name: star_name
          };
          stars.push(star);
        });

      // push stars to movie
      movie.stars = stars;
      return movie;
    }

    await Promise.map(movies, addDirectorAndStarsToMovie, { concurrency: 10 });
    fs.writeFile("output.json", JSON.stringify(movies, null, 2), async function(err) {
      if (err) throw err;
      console.log("complete");
    });
  } catch (err) {
    console.log(err);
  }
}
main().then(process.exit);
